import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import Anthropic from "@anthropic-ai/sdk";

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3 = new S3Client({});
const ssm = new SSMClient({});
const TABLE = process.env.TABLE_NAME!;
const BUCKET = process.env.BUCKET_NAME!;
const SSM_PARAM = process.env.ANTHROPIC_API_KEY_SSM!;

let _anthropic: Anthropic | null = null;

async function getAnthropicClient(): Promise<Anthropic> {
  if (_anthropic) return _anthropic;
  const param = await ssm.send(
    new GetParameterCommand({ Name: SSM_PARAM, WithDecryption: true })
  );
  _anthropic = new Anthropic({ apiKey: param.Parameter!.Value! });
  return _anthropic;
}

async function streamToBuffer(stream: any): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export const handler = async (event: any) => {
  const { id: jobId, itemId } = event.pathParameters ?? {};
  if (!jobId || !itemId) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing jobId or itemId" }) };
  }

  const itemResult = await dynamo.send(
    new GetCommand({ TableName: TABLE, Key: { PK: `JOB#${jobId}`, SK: `ITEM#${itemId}` } })
  );
  if (!itemResult.Item) {
    return { statusCode: 404, body: JSON.stringify({ error: "Item not found" }) };
  }

  const photoKey = itemResult.Item.photoKey as string;
  const s3Object = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: photoKey }));
  const imageBuffer = await streamToBuffer(s3Object.Body);
  const imageBase64 = imageBuffer.toString("base64");

  const anthropic = await getAnthropicClient();
  const message = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: "image/jpeg", data: imageBase64 },
          },
          {
            type: "text",
            text: `You are an estate liquidation specialist. Analyse this photo of an item and return a JSON object with these exact fields:
- name: string — concise item name
- description: string — 1-2 sentence description
- condition: "excellent" | "good" | "fair" | "poor"
- valueLow: number — estimated value in AUD (low end)
- valueHigh: number — estimated value in AUD (high end)
- category: string — one of: furniture, electronics, jewellery, art, clothing, collectibles, kitchenware, tools, other
- auctionSuitable: boolean — whether this item is suitable for auction
- notes: string — any relevant notes for the estate liquidator

Respond with ONLY valid JSON, no markdown fences, no explanation.`,
          },
        ],
      },
    ],
  });

  const rawOutput = message.content[0].type === "text" ? message.content[0].text : "";

  let analysis: Record<string, unknown> = {};
  try {
    analysis = JSON.parse(rawOutput);
  } catch {
    analysis = {};
  }

  const now = new Date().toISOString();

  const updateResult = await dynamo.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { PK: `JOB#${jobId}`, SK: `ITEM#${itemId}` },
      UpdateExpression: [
        "SET #name = :name",
        "description = :description",
        "#condition = :condition",
        "valueLow = :valueLow",
        "valueHigh = :valueHigh",
        "category = :category",
        "auctionSuitable = :auctionSuitable",
        "notes = :notes",
        "llmRawOutput = :llmRawOutput",
        "#status = :status",
        "updatedAt = :updatedAt",
      ].join(", "),
      ExpressionAttributeNames: {
        "#name": "name",
        "#condition": "condition",
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":name": analysis.name ?? null,
        ":description": analysis.description ?? null,
        ":condition": analysis.condition ?? null,
        ":valueLow": analysis.valueLow ?? null,
        ":valueHigh": analysis.valueHigh ?? null,
        ":category": analysis.category ?? null,
        ":auctionSuitable": analysis.auctionSuitable ?? null,
        ":notes": analysis.notes ?? null,
        ":llmRawOutput": rawOutput,
        ":status": "analysed",
        ":updatedAt": now,
      },
      ReturnValues: "ALL_NEW",
    })
  );

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateResult.Attributes),
  };
};
