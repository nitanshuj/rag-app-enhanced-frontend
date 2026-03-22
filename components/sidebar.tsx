"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileUp, Sparkles, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarProps = {
  category: string;
  uploadedFileName: string | null;
  isUploading: boolean;
  onUpload: (file: File, category: string) => void;
  onDelete: () => void;
};

const CATEGORIES = ["Research Paper", "Receipt", "Technical Doc", "Report", "Other"];

function categoryClasses(category: string) {
  if (category.toLowerCase().includes("receipt")) {
    return "border-amber-300/40 bg-amber-400/10 text-amber-200 shadow-[0_0_24px_rgba(251,191,36,0.28)]";
  }
  if (category === "—") {
    return "border-slate-600/40 bg-slate-700/20 text-slate-400";
  }
  return "border-indigo-300/40 bg-indigo-500/10 text-indigo-100 shadow-[0_0_24px_rgba(99,102,241,0.35)]";
}

export function Sidebar({
  category,
  uploadedFileName,
  isUploading,
  onUpload,
  onDelete,
}: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCategory, setSelectedCategory] = useState("Other");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file, selectedCategory);
      // Reset file input so the same file can be re-uploaded after clearing
      e.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith(".pdf")) {
      onUpload(file, selectedCategory);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  return (
    <aside className="flex h-full w-full flex-col rounded-none border-r border-slate-700/60 bg-zinc-950/55 p-4 backdrop-blur-md md:rounded-2xl md:border md:bg-zinc-950/45">
      {/* Logo */}
      <motion.div
        className="rounded-2xl border border-slate-700/70 bg-slate-900/50 p-4"
        animate={{
          boxShadow: [
            "0 0 0 rgba(99,102,241,0.1)",
            "0 0 26px rgba(99,102,241,0.25)",
            "0 0 0 rgba(99,102,241,0.1)",
          ],
        }}
        transition={{ duration: 2.3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500/20"
            animate={{ scale: [1, 1.07, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="h-5 w-5 text-indigo-200" />
          </motion.div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-indigo-300/90">AI Workspace</p>
            <h1 className="text-base font-semibold text-slate-100">RAG PDF Assistant</h1>
          </div>
        </div>
      </motion.div>

      {/* Category selector */}
      <div className="mt-4">
        <label
          htmlFor="category-select"
          className="mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-slate-400"
        >
          Document Category
        </label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          disabled={isUploading}
          className="w-full rounded-xl border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-400/60 focus:ring-1 focus:ring-indigo-400/40 disabled:opacity-50"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c} className="bg-zinc-900">
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Drop zone / upload button */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="sr-only"
        aria-label="Upload PDF"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <motion.button
        type="button"
        whileHover={{ scale: isUploading ? 1 : 1.02 }}
        whileTap={{ scale: isUploading ? 1 : 0.99 }}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        disabled={isUploading}
        className={cn(
          "mt-4 flex min-h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-4 text-center transition-colors",
          isUploading
            ? "cursor-not-allowed border-indigo-400/40 bg-indigo-500/5 text-indigo-300"
            : uploadedFileName
            ? "border-emerald-400/40 bg-emerald-500/5 text-emerald-300 hover:border-emerald-300/60 hover:bg-emerald-500/10"
            : "border-slate-600 bg-slate-900/40 text-slate-300 hover:border-indigo-300/60 hover:bg-slate-900/70"
        )}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-indigo-300" />
            <span className="text-sm font-medium">Processing PDF…</span>
          </>
        ) : uploadedFileName ? (
          <>
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            <span className="line-clamp-2 break-all text-xs font-medium">{uploadedFileName}</span>
            <span className="text-xs text-slate-400">Click to replace</span>
          </>
        ) : (
          <>
            <FileUp className="h-5 w-5 text-indigo-200" />
            <span className="text-sm font-medium">Drag &amp; Drop PDF</span>
            <span className="text-xs text-slate-400">or click to browse local files</span>
          </>
        )}
      </motion.button>

      {/* Detected category badge */}
      <div className="mt-4 rounded-2xl border border-slate-700/70 bg-zinc-900/40 p-3">
        <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-slate-400">Detected Category</p>
        <div className="flex items-center">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
              categoryClasses(category)
            )}
          >
            {category}
          </span>
        </div>
      </div>

      {/* Clear session */}
      <div className="mt-auto pt-4">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.99 }}
          onClick={onDelete}
          disabled={isUploading}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-300/20 bg-rose-500/8 px-3 py-2.5 text-sm font-medium text-rose-200 transition-colors hover:border-rose-300/45 hover:bg-rose-500/20 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Clear Session
        </motion.button>
      </div>
    </aside>
  );
}
