export type Citation = {
  id: string;
  label: string;
  preview: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
};
