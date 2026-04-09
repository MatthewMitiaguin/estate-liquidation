const API_URL = process.env.EXPO_PUBLIC_API_URL;
const API_TOKEN = process.env.EXPO_PUBLIC_API_TOKEN;

const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${API_TOKEN}`,
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API error: ${response.status} ${body}`);
  }

  return response.json();
}

export const api = {
  createJob: (workerName: string, address: string) =>
    request("/jobs", {
      method: "POST",
      body: JSON.stringify({ workerName, address }),
    }),

  listJobs: () =>
    request("/jobs"),

  getJob: (jobId: string) =>
    request(`/jobs/${jobId}`),

  createItem: (jobId: string, contentLength: number) =>
    request(`/jobs/${jobId}/items`, {
      method: "POST",
      body: JSON.stringify({ contentLength }),
    }),

  analyseItem: (jobId: string, itemId: string) =>
    request(`/jobs/${jobId}/items/${itemId}/analyse`, {
      method: "POST",
    }),

  updateItem: (jobId: string, itemId: string, updates: object) =>
    request(`/jobs/${jobId}/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),

  uploadPhoto: async (uploadUrl: string, photoUri: string): Promise<void> => {
    const photoResponse = await fetch(photoUri);
    const photoBlob = await photoResponse.blob();
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      body: photoBlob,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": String(photoBlob.size),
      },
    });
    if (!uploadResponse.ok) {
      const body = await uploadResponse.text();
      throw new Error(`Photo upload failed: ${uploadResponse.status} ${body}`);
    }
  },
};