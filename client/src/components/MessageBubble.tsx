import { Copy, Download } from "lucide-react";
import { useState } from "react";
import { Streamdown } from "streamdown";
import { StructuredResponseCard } from "./StructuredResponseCard";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  structured?: {
    goals: string[];
    constraints: string[];
    output: string;
    formula: string;
    process: string[];
  };
  isVoiceInput?: boolean;
  timestamp?: Date;
}

export function MessageBubble({
  role,
  content,
  structured,
  isVoiceInput,
  timestamp,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = role === "user";

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex flex-col gap-2 max-w-2xl ${isUser ? "items-end" : "items-start"}`}>
        {/* Message header */}
        <div className="flex items-center gap-2 px-3 text-xs text-muted-foreground">
          {isUser ? (
            <>
              {isVoiceInput && <span className="text-cyan-400">🎤 Voice Input</span>}
              <span>You</span>
            </>
          ) : (
            <span className="text-purple-400">🤖 Aether AI</span>
          )}
          {timestamp && (
            <span className="text-xs opacity-50">
              {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>

        {/* Message content */}
        <div
          className={`bg-gradient-to-br backdrop-blur-xl border rounded-xl shadow-2xl p-4 ${
            isUser
              ? "from-white/10 to-white/5 border-white/15 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border-cyan-400/30"
              : "from-white/10 to-white/5 border-white/15 bg-gradient-to-br from-purple-500/20 to-pink-500/10 border-purple-400/30"
          }`}
        >
          {structured ? (
            <>
              {/* Show full text first */}
              <div className="mb-4 text-sm text-foreground/90">
                <Streamdown>{content}</Streamdown>
              </div>

              {/* Then show structured response */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <StructuredResponseCard {...structured} />
              </div>
            </>
          ) : (
            <div className="text-sm text-foreground/90">
              <Streamdown>{content}</Streamdown>
            </div>
          )}

          {/* Action buttons */}
          {!isUser && (
            <div className="flex gap-2 mt-4 pt-3 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-7 px-2 text-xs gap-1"
              >
                <Copy className="w-3 h-3" />
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs gap-1"
              >
                <Download className="w-3 h-3" />
                Export
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
