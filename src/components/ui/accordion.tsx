"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

interface AccordionItemProps {
  value: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

function AccordionItem({ value, title, children, className }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("border-b border-border/50", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        {title}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 256 256"
          className={cn(
            "shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        >
          <path
            fill="currentColor"
            d="M213.66 101.66l-80 80a8 8 0 0 1-11.32 0l-80-80a8 8 0 0 1 11.32-11.32L128 164.69l74.34-74.35a8 8 0 0 1 11.32 11.32Z"
          />
        </svg>
      </button>
      <div
        className={cn(
          "overflow-hidden text-sm text-muted-foreground transition-all duration-300",
          isOpen ? "max-h-40 pb-4" : "max-h-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface AccordionProps {
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  children: React.ReactNode;
  className?: string;
}

function Accordion({ children, className }: AccordionProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {children}
    </div>
  );
}

export { Accordion, AccordionItem };
