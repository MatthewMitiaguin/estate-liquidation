import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { handler as createJob } from "./jobs/create";
import { handler as getJob } from "./jobs/get";
import { handler as listJobs } from "./jobs/list";
import { handler as createItem } from "./items/create";
import { handler as analyseItem } from "./items/analyse";
import { handler as updateItem } from "./items/update";

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const { requestContext, pathParameters } = event;
  const method = requestContext.http.method;
  const path = requestContext.http.path;

  console.log(`${method} ${path}`, { pathParameters });

  try {
    // POST /jobs
    if (method === "POST" && path === "/jobs") {
      return await createJob(event);
    }

    // GET /jobs
    if (method === "GET" && path === "/jobs") {
      return await listJobs(event);
    }

    // GET /jobs/{id}
    if (method === "GET" && path.match(/^\/jobs\/[^/]+$/)) {
      return await getJob(event);
    }

    // POST /jobs/{id}/items
    if (method === "POST" && path.match(/^\/jobs\/[^/]+\/items$/)) {
      return await createItem(event);
    }

    // POST /jobs/{id}/items/{itemId}/analyse
    if (method === "POST" && path.match(/^\/jobs\/[^/]+\/items\/[^/]+\/analyse$/)) {
      return await analyseItem(event);
    }

    // PATCH /jobs/{id}/items/{itemId}
    if (method === "PATCH" && path.match(/^\/jobs\/[^/]+\/items\/[^/]+$/)) {
      return await updateItem(event);
    }

    // Route not found
    return {
      statusCode: 404,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Not Found",
        message: `Route ${method} ${path} not found`,
      }),
    };
  } catch (error) {
    console.error("Lambda error:", error);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};