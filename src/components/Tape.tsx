import { useState } from "react";
import { Copy, Check } from "lucide-react";

type Props = { tape: string; total: number };

export function Tape({ tape, total }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(tape);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!tape) {
    return <div className="text-6xl md:text-8xl font-black text-zinc-900 select-none">$0</div>;
  }

  return (
    <div className="space-y-6 w-full max-w-md">
      <pre className="font-mono text-sm md:text-base whitespace-pre-wrap leading-relaxed">{tape}</pre>
      <div className="flex items-center justify-between border-t border-zinc-800 pt-6">
        <div className="text-5xl md:text-6xl font-black">${total.toLocaleString()}</div>
        <button onClick={copy} className="p-2 border border-zinc-800 hover:border-white">
          {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5 text-zinc-400" />}
        </button>
      </div>
    </div>
  );
}
