"use client";

import { useRef, useState, useEffect, useCallback, useId } from "react";
import { AnimatePresence, animate, motion } from "framer-motion";
import { X } from "lucide-react";
import { ChatHeader } from "@/components/chat-header";
import { MessageBubble } from "@/components/message-bubble";
import { Sidebar } from "@/components/sidebar";
import { TypingSkeleton } from "@/components/typing-skeleton";
import type { ChatMessage } from "@/lib/mock-data";
import { uploadPdf, streamChat, deleteDocument } from "@/lib/api";

// ─── helpers ────────────────────────────────────────────────────────────────

function makeId() {
  return Math.random().toString(36).slice(2);
}

// ─── Shell ──────────────────────────────────────────────────────────────────

export function RagChatShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [category, setCategory] = useState("Other");
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    const animation = animate(node.scrollTop, node.scrollHeight, {
      type: "spring",
      stiffness: 120,
      damping: 20,
      onUpdate(v) { node.scrollTop = v; },
    });
    return () => animation.stop();
  }, [messages, isStreaming]);

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleUpload = useCallback(async (file: File, cat: string) => {
    setError(null);
    setIsUploading(true);
    try {
      await uploadPdf(file, cat);
      setUploadedFile(file.name);
      setCategory(cat);
      setMessages([]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`Upload failed: ${msg}`);
    } finally {
      setIsUploading(false);
    }
  }, []);

  // ── Chat ──────────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const query = input.trim();
    if (!query || isStreaming) return;

    setInput("");
    setError(null);

    const userMsg: ChatMessage = { id: makeId(), role: "user", content: query };
    const assistantId = makeId();

    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setIsStreaming(true);

    try {
      await streamChat(
        query,
        uploadedFile ? category : null,
        (token) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content + token }
                : m
            )
          );
        }
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: `\n\n*Error: ${msg}*` }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, uploadedFile, category]);

  // ── Clear session ─────────────────────────────────────────────────────────
  const handleClear = useCallback(async () => {
    setError(null);
    if (uploadedFile) {
      try {
        await deleteDocument(uploadedFile);
      } catch (_) {
        // best-effort – clear UI regardless
      }
    }
    setMessages([]);
    setUploadedFile(null);
    setCategory("Other");
  }, [uploadedFile]);

  // ── Keyboard submit ───────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Textarea auto-resize ──────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  return (
    <div className="relative min-h-screen bg-[#0f172a] text-slate-100">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-indigo-500/16 blur-3xl" />
        <div className="absolute bottom-0 right-[-8rem] h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.15)_1px,transparent_0)] bg-[length:20px_20px] opacity-20" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-[1600px]">
        {/* Desktop sidebar */}
        <div className="hidden w-80 p-4 md:block">
          <div className="fixed bottom-4 top-4 w-[18.5rem]">
            <Sidebar
              category={uploadedFile ? category : "—"}
              uploadedFileName={uploadedFile}
              isUploading={isUploading}
              onUpload={handleUpload}
              onDelete={handleClear}
            />
          </div>
        </div>

        {/* Mobile sidebar drawer */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/55 md:hidden"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Close sidebar overlay"
              />
              <motion.aside
                initial={{ x: -320, opacity: 0.92 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -320, opacity: 0.92 }}
                transition={{ type: "spring", stiffness: 220, damping: 26 }}
                className="fixed inset-y-0 left-0 z-50 w-80 md:hidden"
              >
                <div className="relative h-full">
                  <button
                    type="button"
                    className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-lg border border-slate-700 bg-slate-900/70 text-slate-200"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-label="Close sidebar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <Sidebar
                    category={uploadedFile ? category : "—"}
                    uploadedFileName={uploadedFile}
                    isUploading={isUploading}
                    onUpload={handleUpload}
                    onDelete={handleClear}
                  />
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main area */}
        <main className="flex min-h-screen flex-1 flex-col">
          <ChatHeader
            appName="RAG Research Assistant"
            documentName={uploadedFile ?? "No document loaded"}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            isStreaming={isStreaming}
          />

          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mx-4 mt-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message list */}
          <section
            ref={scrollRef}
            className="h-[calc(100vh-65px)] overflow-y-auto px-4 pb-40 pt-6 md:px-8"
          >
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
              {messages.length === 0 && !isUploading && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-20 flex flex-col items-center gap-3 text-center text-slate-400"
                >
                  <div className="grid h-16 w-16 place-items-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10">
                    <svg className="h-7 w-7 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-base font-medium text-slate-300">Upload a PDF to get started</p>
                  <p className="max-w-xs text-sm text-slate-500">Use the sidebar to upload a document, then ask anything about its contents.</p>
                </motion.div>
              )}

              {messages.map((msg) => (
                msg.role === "assistant" && msg.content === "" && isStreaming ? (
                  <MessageBubble key={msg.id} message={msg} isLoading />
                ) : (
                  <MessageBubble key={msg.id} message={msg} />
                )
              ))}
            </div>
          </section>

          {/* Input bar */}
          <div className="fixed bottom-0 left-0 right-0 md:left-80">
            <div className="mx-auto max-w-3xl px-4 pb-5 pt-3 md:px-8">
              <div className="flex items-end gap-2 rounded-2xl border border-slate-700/80 bg-zinc-950/80 p-2 shadow-2xl shadow-indigo-900/20 backdrop-blur-lg">
                <textarea
                  ref={textareaRef}
                  id="chat-input"
                  rows={1}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={isStreaming || !uploadedFile}
                  placeholder={
                    !uploadedFile
                      ? "Upload a PDF first…"
                      : isStreaming
                      ? "Waiting for response…"
                      : "Ask anything about your document…"
                  }
                  className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-slate-100 placeholder-slate-500 outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ maxHeight: "160px" }}
                />
                <motion.button
                  type="button"
                  onClick={handleSend}
                  disabled={isStreaming || !input.trim() || !uploadedFile}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-900/40 transition-colors hover:bg-indigo-400 disabled:opacity-40"
                  aria-label="Send"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </motion.button>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-slate-600">
                Press <kbd className="rounded border border-slate-700 px-1 py-0.5 font-mono">Enter</kbd> to send · <kbd className="rounded border border-slate-700 px-1 py-0.5 font-mono">Shift+Enter</kbd> for new line
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
