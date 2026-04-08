import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE_NAME!;

const ALLOWED_FIELDS = [
  "name",
  "description",
  "condition",
  "valueLow",
  "valueHigh",
  "category",
  "disposition",
  "auctionSuitable",
  "notes",
];

export const handler = async (event: any) => {
  const { id: jobId, itemId } = event.pathParameters ?? {};
  if (!jobId || !itemId) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing jobId or itemId" }) };
  }

  const body = JSON.parse(event.body ?? "{}");
  const updates: Record<string, unknown> = {
    ...Object.fromEntries(Object.entries(body).filter(([k]) => ALLOWED_FIELDS.includes(k))),
    updatedAt: new Date().toISOString(),
  };

  const fields = Object.keys(updates);
  if (fields.length === 1) {
    // Only updatedAt — no actual fields to update
    return { statusCode: 400, body: JSON.stringify({ error: "No valid fields to update" }) };
  }

  // Alias all field names with # to safely handle DynamoDB reserved words
  const setClauses = fields.map((k) => `#${k} = :${k}`);
  const names = Object.fromEntries(fields.map((k) => [`#${k}`, k]));
  const values = Object.fromEntries(fields.map((k) => [`:${k}`, updates[k]]));

  const result = await dynamo.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { PK: `JOB#${jobId}`, SK: `ITEM#${itemId}` },
      UpdateExpression: `SET ${setClauses.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: "ALL_NEW",
    })
  );

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result.Attributes),
  };
};
