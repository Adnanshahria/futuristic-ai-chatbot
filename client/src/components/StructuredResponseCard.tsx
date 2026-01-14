import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Streamdown } from "streamdown";

interface StructuredResponseCardProps {
  goals: string[];
  constraints: string[];
  output: string;
  formula: string;
  process: string[];
}

export function StructuredResponseCard({
  goals,
  constraints,
  output,
  formula,
  process,
}: StructuredResponseCardProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    goals: true,
    constraints: true,
    output: true,
    formula: true,
    process: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const Section = ({
    title,
    icon,
    color,
    items,
    isExpanded,
    onToggle,
  }: {
    title: string;
    icon: string;
    color: string;
    items: string[];
    isExpanded: boolean;
    onToggle: () => void;
  }) => (
    <div className={`response-section response-section-${color} cursor-pointer`} onClick={onToggle}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h3 className="font-orbitron font-bold text-sm uppercase tracking-wider">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-cyan-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-cyan-400" />
        )}
      </div>

      {isExpanded && (
        <div className="space-y-2 mt-3 pl-6">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-2 text-xs text-foreground/80">
              <span className="text-cyan-400 flex-shrink-0">→</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-3 w-full">
      <Section
        title="Goals"
        icon="🎯"
        color="goals"
        items={goals}
        isExpanded={expandedSections.goals}
        onToggle={() => toggleSection("goals")}
      />

      <Section
        title="Constraints"
        icon="⚙️"
        color="constraints"
        items={constraints}
        isExpanded={expandedSections.constraints}
        onToggle={() => toggleSection("constraints")}
      />

      <div
        className="response-section response-section-output cursor-pointer"
        onClick={() => toggleSection("output")}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <h3 className="font-orbitron font-bold text-sm uppercase tracking-wider">Output</h3>
          </div>
          {expandedSections.output ? (
            <ChevronUp className="w-4 h-4 text-green-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-green-400" />
          )}
        </div>

        {expandedSections.output && (
          <div className="mt-3 pl-6 text-xs text-foreground/80">
            <Streamdown>{output}</Streamdown>
          </div>
        )}
      </div>

      <div
        className="response-section response-section-formula cursor-pointer"
        onClick={() => toggleSection("formula")}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">∑</span>
            <h3 className="font-orbitron font-bold text-sm uppercase tracking-wider">Formula</h3>
          </div>
          {expandedSections.formula ? (
            <ChevronUp className="w-4 h-4 text-pink-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-pink-400" />
          )}
        </div>

        {expandedSections.formula && (
          <div className="mt-3 pl-6 text-xs text-foreground/80 font-mono">
            <Streamdown>{formula}</Streamdown>
          </div>
        )}
      </div>

      <Section
        title="Process"
        icon="⚡"
        color="process"
        items={process}
        isExpanded={expandedSections.process}
        onToggle={() => toggleSection("process")}
      />
    </div>
  );
}
