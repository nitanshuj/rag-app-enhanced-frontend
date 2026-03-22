"use client";

import { motion } from "framer-motion";

const widths = ["w-11/12", "w-10/12", "w-8/12", "w-9/12"];

export function TypingSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-700/70 bg-zinc-900/50 p-4 backdrop-blur-md">
      <div className="space-y-2">
        {widths.map((width) => (
          <motion.div
            key={width}
            className={`h-3 ${width} rounded-full bg-slate-700/60`}
            animate={{ opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
}
