import { useEffect, useState } from "react";

type ThinkingStage = "organizing" | "formulating" | "thinking" | "processing" | "re-organizing" | "complete";

interface ThinkingIndicatorProps {
  isThinking: boolean;
  currentStage?: ThinkingStage;
}

const stageLabels: Record<ThinkingStage, string> = {
  organizing: "Organizing",
  formulating: "Formulating",
  thinking: "Thinking",
  processing: "Processing",
  "re-organizing": "Re-organizing",
  complete: "Complete",
};

const stageEmojis: Record<ThinkingStage, string> = {
  organizing: "📋",
  formulating: "🧠",
  thinking: "💭",
  processing: "⚙️",
  "re-organizing": "🔄",
  complete: "✨",
};

const stageColors: Record<ThinkingStage, string> = {
  organizing: "from-blue-500 to-cyan-500",
  formulating: "from-purple-500 to-blue-500",
  thinking: "from-pink-500 to-purple-500",
  processing: "from-yellow-500 to-pink-500",
  "re-organizing": "from-green-500 to-yellow-500",
  complete: "from-cyan-500 to-green-500",
};

export function ThinkingIndicator({ isThinking, currentStage = "organizing" }: ThinkingIndicatorProps) {
  const [displayStage, setDisplayStage] = useState<ThinkingStage>(currentStage);

  useEffect(() => {
    if (isThinking) {
      setDisplayStage(currentStage);
    }
  }, [currentStage, isThinking]);

  if (!isThinking) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 backdrop-blur-md">
      {/* Animated dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 animate-pulse"
            style={{
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      {/* Stage emoji and label */}
      <div className="flex items-center gap-2">
        <span className="text-lg animate-bounce">{stageEmojis[displayStage]}</span>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-mono text-cyan-300 uppercase tracking-wider">
            {stageLabels[displayStage]}
          </span>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${stageColors[displayStage]} animate-pulse`}
              style={{
                width: "100%",
              }}
            />
          </div>
        </div>
      </div>

      {/* Glow effect */}
      <div className="ml-auto">
        <div className="relative w-3 h-3">
          <div className="absolute inset-0 bg-cyan-400 rounded-full animate-pulse" />
          <div className="absolute inset-0 bg-cyan-400 rounded-full opacity-50 animate-ping" />
        </div>
      </div>
    </div>
  );
}
