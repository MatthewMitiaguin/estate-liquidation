import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.TABLE_NAME!;

export const handler = async () => {
  const result = await dynamo.send(
    new ScanCommand({
      TableName: TABLE,
      FilterExpression: "begins_with(SK, :prefix)",
      ExpressionAttributeValues: { ":prefix": "JOB#" },
    })
  );

  const jobs = result.Items ?? [];

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jobs),
  };
};
