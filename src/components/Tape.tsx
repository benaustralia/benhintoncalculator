import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { TRANSLATIONS, type Lang } from "@/i18n/translations";
import { type QuoteData } from "@/lib/calculate";
import { type TapeLine } from "@/lib/formatTape";

type Props = { quote: QuoteData; tape: TapeLine[]; lang: Lang };

export function Tape({ quote, tape, lang }: Props) {
  const [copied, setCopied] = useState(false);
  const tr = TRANSLATIONS[lang];
  const total = quote.totals.payable;

  const copy = () => {
    navigator.clipboard.writeText(tape.filter(l => !l.warn).map(l => l.text).join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Machine-readable mirror of the rendered quote. */}
      <script
        type="application/json"
        id="quote-data"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quote).replace(/</g, "\\u003c") }}
      />
      {/* Kept mounted even when empty so the live region exists before it has anything
          to announce — screen readers ignore a region inserted at the same time as its
          first content. */}
      <div className="space-y-6 w-full max-w-md" aria-live="polite">
        {tape.length > 0 && (
          <>
            <div id="quote" className="font-mono text-sm md:text-base whitespace-pre-wrap leading-relaxed">
              {tape.map((line, i) => (
                <div
                  key={i}
                  data-field={line.field}
                  data-value={line.value}
                  className={line.warn ? "text-red-400" : undefined}
                >
                  {line.text === "" ? " " : line.text}
                </div>
              ))}
            </div>
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
          </>
        )}
      </div>
    </>
  );
}
