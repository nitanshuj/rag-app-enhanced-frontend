"use client";

import { motion } from "framer-motion";
import { Menu } from "lucide-react";

type ChatHeaderProps = {
  appName: string;
  documentName: string;
  onOpenSidebar: () => void;
  isStreaming?: boolean;
};

export function ChatHeader({ appName, documentName, onOpenSidebar, isStreaming = false }: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-zinc-950/70 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            onClick={onOpenSidebar}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-700 bg-slate-900/70 text-slate-200 md:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-4 w-4" />
          </motion.button>
          <div>
            <p className="text-[10px] uppercase tracking-[0.17em] text-indigo-300">Workspace</p>
            <h2 className="text-sm font-semibold text-slate-100 sm:text-base">{appName}</h2>
          </div>
        </div>

        <div className="max-w-[56%] truncate rounded-full border border-slate-700/70 bg-slate-900/50 px-3 py-1.5 text-xs text-slate-300 sm:text-sm">
          Active: {documentName}
        </div>
      </div>
      <div className="h-1 w-full overflow-hidden bg-slate-800/80">
        {isStreaming && (
          <motion.div
            className="h-full w-1/3 bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-300"
            animate={{ x: ["-40%", "220%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>
    </header>
  );
}
