import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE_NAME!;

export const handler = async (event: any) => {
  const body = JSON.parse(event.body ?? "{}");
  const jobId = randomUUID();
  const now = new Date().toISOString();

  const item = {
    PK: `JOB#${jobId}`,
    SK: `JOB#${jobId}`,
    jobId,
    status: "open",
    workerName: body.workerName ?? null,
    address: body.address ?? null,
    createdAt: now,
    updatedAt: now,
  };

  await dynamo.send(new PutCommand({ TableName: TABLE, Item: item }));

  return {
    statusCode: 201,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  };
};
