import { motion, AnimatePresence } from "framer-motion";
import { type ReactNode } from "react";

export function SpeechBubble({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "warn" | "success" | "error" }) {
  const toneClass =
    tone === "warn"
      ? "border-accent/60 bg-accent/10"
      : tone === "success"
      ? "border-primary/60 bg-primary/10"
      : tone === "error"
      ? "border-destructive/60 bg-destructive/10"
      : "border-border bg-card/60";
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={typeof children === "string" ? children : Math.random()}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25 }}
        className={`relative rounded-2xl border ${toneClass} px-5 py-4 backdrop-blur-sm shadow-deep`}
      >
        <div className="font-display text-xs uppercase tracking-[0.25em] text-brass mb-1">Atlas</div>
        <div className="text-sm leading-relaxed text-foreground/90">{children}</div>
      </motion.div>
    </AnimatePresence>
  );
}
