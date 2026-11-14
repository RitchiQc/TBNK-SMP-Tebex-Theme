"use client";

import { useState } from "react";
import { Icon } from "./icons";

export function CopyButton({
  value,
  label = "Copier",
  copiedLabel = "Copié !",
  className = "btn btn-secondary btn-sm",
  iconOnly = false
}: {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  iconOnly?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const area = document.createElement("textarea");
        area.value = value;
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        area.remove();
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      className={className}
      onClick={copy}
      aria-label={`${copied ? copiedLabel : label} : ${value}`}
      title={copied ? copiedLabel : label}
    >
      <Icon name={copied ? "check" : "copy"} size={14} />
      {iconOnly ? null : <span>{copied ? copiedLabel : label}</span>}
    </button>
  );
}
