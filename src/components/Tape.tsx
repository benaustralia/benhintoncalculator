import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { TRANSLATIONS, type Lang } from "@/i18n/translations";

export type TapeLine = { text: string; warn?: boolean };
type Props = { tape: TapeLine[]; total: number; lang: Lang };

export function Tape({ tape, total, lang }: Props) {
  const [copied, setCopied] = useState(false);
  const tr = TRANSLATIONS[lang];

  const copy = () => {
    navigator.clipboard.writeText(tape.filter(l => !l.warn).map(l => l.text).join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!tape.length) return null;

  return (
    <div className="space-y-6 w-full max-w-md" aria-live="polite">
      <pre className="font-mono text-sm md:text-base whitespace-pre-wrap leading-relaxed">
        {tape.map((line, i) => (
          <span key={i} className={line.warn ? "text-red-400" : undefined}>
            {line.text}{"\n"}
          </span>
        ))}
      </pre>
      <div className="flex items-center justify-between border-t border-zinc-800 pt-6">
        <div className="text-5xl md:text-6xl font-black">${total.toLocaleString()}</div>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? tr.copied : tr.copyQuote}
          className="p-2 border border-zinc-800 hover:border-white focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
        >
          {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5 text-zinc-400" />}
        </button>
        <span role="status" className="sr-only">{copied ? tr.copied : ""}</span>
      </div>
    </div>
  );
}
