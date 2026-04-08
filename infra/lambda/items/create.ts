import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3 = new S3Client({});
const TABLE = process.env.TABLE_NAME!;
const BUCKET = process.env.BUCKET_NAME!;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export const handler = async (event: any) => {
  const jobId = event.pathParameters?.id;
  if (!jobId) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing job id" }) };
  }

  const body = JSON.parse(event.body ?? "{}");
  const contentLength = body.contentLength;
  if (
    typeof contentLength !== "number" ||
    !Number.isInteger(contentLength) ||
    contentLength <= 0 ||
    contentLength > MAX_UPLOAD_BYTES
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: `contentLength must be an integer between 1 and ${MAX_UPLOAD_BYTES} bytes`,
      }),
    };
  }

  const itemId = randomUUID();
  const now = new Date().toISOString();
  const photoKey = `jobs/${jobId}/items/${itemId}/photo.jpg`;

  const item = {
    PK: `JOB#${jobId}`,
    SK: `ITEM#${itemId}`,
    jobId,
    itemId,
    name: body.name ?? null,
    status: "pending_analysis",
    photoKey,
    createdAt: now,
    updatedAt: now,
  };

  await dynamo.send(new PutCommand({ TableName: TABLE, Item: item }));

  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: photoKey,
      ContentType: "image/jpeg",
      ContentLength: contentLength,
    }),
    { expiresIn: 3600 }
  );

  return {
    statusCode: 201,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...item, uploadUrl }),
  };
};
