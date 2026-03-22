"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { ChatMessage } from "@/lib/mock-data";
import { SourceCard } from "@/components/source-card";
import { TypingSkeleton } from "@/components/typing-skeleton";
import { cn } from "@/lib/utils";

type MessageBubbleProps = {
  message: ChatMessage;
  isLoading?: boolean;
};

export function MessageBubble({ message, isLoading = false }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, ease: "easeOut" }}
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div className={cn("max-w-[92%] sm:max-w-[84%]", isUser ? "items-end" : "items-start")}>
        {isUser ? (
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-2xl rounded-tr-sm bg-slate-900 px-4 py-3 text-sm leading-relaxed text-slate-100 shadow-lg shadow-slate-950/40"
          >
            {message.content}
          </motion.div>
        ) : (
          <div className="rounded-2xl bg-gradient-to-r from-indigo-500/30 via-indigo-300/20 to-slate-300/10 p-[1px] shadow-lg shadow-indigo-900/20">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl bg-zinc-900/70 px-4 py-3 text-sm text-slate-100 backdrop-blur-md"
            >
              {isLoading ? (
                <TypingSkeleton />
              ) : (
                <div className="markdown-body space-y-3 leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      code(props) {
                        const { className, children } = props;
                        const match = /language-(\w+)/.exec(className || "");
                        const codeText = String(children).replace(/\n$/, "");

                        if (match) {
                          return (
                            <SyntaxHighlighter
                              style={oneDark}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{
                                borderRadius: "0.75rem",
                                marginTop: "0.75rem",
                                marginBottom: "0.75rem",
                                border: "1px solid rgba(148, 163, 184, 0.24)",
                                background: "rgba(2, 6, 23, 0.75)",
                                padding: "0.9rem",
                              }}
                            >
                              {codeText}
                            </SyntaxHighlighter>
                          );
                        }

                        return <code className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[0.85em] text-indigo-200">{children}</code>;
                      },
                      table({ children }) {
                        return (
                          <div className="my-3 overflow-x-auto rounded-xl border border-slate-700/70">
                            <table className="w-full border-collapse text-left text-xs text-slate-200">{children}</table>
                          </div>
                        );
                      },
                      thead({ children }) {
                        return <thead className="bg-slate-800/70">{children}</thead>;
                      },
                      th({ children }) {
                        return <th className="border border-slate-700/70 px-3 py-2 font-semibold">{children}</th>;
                      },
                      td({ children }) {
                        return <td className="border border-slate-700/60 px-3 py-2 text-slate-300">{children}</td>;
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {!isUser && !isLoading && message.citations?.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.citations.map((citation) => (
              <SourceCard key={citation.id} citation={citation} />
            ))}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
