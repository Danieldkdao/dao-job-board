import { AgentResult } from "@inngest/agent-kit";

export const getLastOutputMessage = (result: AgentResult) => {
  const lastMessage = result.output.at(-1);
  if (!lastMessage || lastMessage.type !== "text") return null;

  return typeof lastMessage.content === "string"
    ? lastMessage.content.trim()
    : lastMessage.content.join(", ").trim();
};
