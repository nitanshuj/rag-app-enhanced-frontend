const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UploadResult = {
  success: boolean;
  message: string;
  chunks_stored: number;
  metadata?: Record<string, unknown>;
};

// ─── Upload ───────────────────────────────────────────────────────────────────

export async function uploadPdf(
  file: File,
  category: string
): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);
  form.append("category", category);

  const res = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Upload failed");
  }

  return res.json() as Promise<UploadResult>;
}

// ─── Streaming chat ───────────────────────────────────────────────────────────

export async function streamChat(
  query: string,
  categoryFilter: string | null,
  onToken: (token: string) => void
): Promise<void> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, category_filter: categoryFilter }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Chat request failed");
  }

  if (!res.body) throw new Error("No response body for streaming");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onToken(decoder.decode(value, { stream: true }));
  }
}

// ─── Delete document ──────────────────────────────────────────────────────────

export async function deleteDocument(filename: string): Promise<void> {
  const res = await fetch(
    `${API_URL}/api/documents/${encodeURIComponent(filename)}`,
    { method: "DELETE" }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Delete failed");
  }
}
