"use client";

import { motion } from "framer-motion";
import type { Citation } from "@/lib/mock-data";

type SourceCardProps = {
  citation: Citation;
};

export function SourceCard({ citation }: SourceCardProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.995 }}
      className="group relative rounded-full border border-indigo-400/30 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-200 backdrop-blur-md transition-colors hover:border-indigo-300/60 hover:bg-slate-900/80"
    >
      {citation.label}
      <div className="pointer-events-none absolute bottom-[120%] left-1/2 z-20 hidden w-72 -translate-x-1/2 rounded-xl border border-slate-700/80 bg-zinc-950/95 p-3 text-left text-xs leading-relaxed text-slate-200 shadow-2xl shadow-indigo-900/30 group-hover:block">
        <div className="mb-1 text-[10px] uppercase tracking-[0.16em] text-indigo-300">
          Source Preview
        </div>
        {citation.preview}
      </div>
    </motion.button>
  );
}
