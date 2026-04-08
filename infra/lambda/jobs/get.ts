import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE_NAME!;

export const handler = async (event: any) => {
  const jobId = event.pathParameters?.id;
  if (!jobId) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing job id" }) };
  }

  const result = await dynamo.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: { ":pk": `JOB#${jobId}` },
    })
  );

  const records = result.Items ?? [];
  const job = records.find((r) => r.SK === `JOB#${jobId}`);
  const items = records.filter((r) => r.SK.startsWith("ITEM#"));

  if (!job) {
    return { statusCode: 404, body: JSON.stringify({ error: "Job not found" }) };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...job, items }),
  };
};
