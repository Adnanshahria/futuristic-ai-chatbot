import { invokeLLM } from "./_core/llm";

export interface StructuredResponse {
  goals: string[];
  constraints: string[];
  output: string;
  formula: string;
  process: string[];
  fullText: string;
}

export interface ThinkingStatus {
  stage: "organizing" | "formulating" | "thinking" | "processing" | "re-organizing" | "complete";
  progress: number;
}

/**
 * Decompose a user prompt into structured components
 */
export function decomposePrompt(prompt: string): {
  originalPrompt: string;
  decomposition: string;
} {
  return {
    originalPrompt: prompt,
    decomposition: `Please analyze this prompt and structure your response with:
1. GOALS: What are we trying to achieve?
2. CONSTRAINTS: What are the limitations or requirements?
3. OUTPUT: What format should the answer be in?
4. FORMULA: What's the mathematical or logical approach?
5. PROCESS: What are the step-by-step procedures?

Original prompt: "${prompt}"

Please provide a comprehensive, well-structured response.`,
  };
}

/**
 * Parse Gemini response into structured format
 */
export function parseStructuredResponse(content: string): StructuredResponse {
  const goals: string[] = [];
  const constraints: string[] = [];
  let output = "";
  let formula = "";
  const process: string[] = [];

  // Extract sections using regex patterns
  const goalsMatch = content.match(/(?:GOALS?|Goals?|goals?)[\s:]*\n([\s\S]*?)(?=\n(?:CONSTRAINTS?|Constraints?|constraints?|OUTPUT|Output|output|FORMULA|Formula|formula|PROCESS|Process|process|$))/i);
  if (goalsMatch) {
    goals.push(...goalsMatch[1].split("\n").filter((line) => line.trim()).map((line) => line.replace(/^[-•*]\s*/, "").trim()));
  }

  const constraintsMatch = content.match(/(?:CONSTRAINTS?|Constraints?|constraints?)[\s:]*\n([\s\S]*?)(?=\n(?:OUTPUT|Output|output|FORMULA|Formula|formula|PROCESS|Process|process|$))/i);
  if (constraintsMatch) {
    constraints.push(...constraintsMatch[1].split("\n").filter((line) => line.trim()).map((line) => line.replace(/^[-•*]\s*/, "").trim()));
  }

  const outputMatch = content.match(/(?:OUTPUT|Output|output)[\s:]*\n([\s\S]*?)(?=\n(?:FORMULA|Formula|formula|PROCESS|Process|process|$))/i);
  if (outputMatch) {
    output = outputMatch[1].trim();
  }

  const formulaMatch = content.match(/(?:FORMULA|Formula|formula)[\s:]*\n([\s\S]*?)(?=\n(?:PROCESS|Process|process|$))/i);
  if (formulaMatch) {
    formula = formulaMatch[1].trim();
  }

  const processMatch = content.match(/(?:PROCESS|Process|process)[\s:]*\n([\s\S]*?)$/i);
  if (processMatch) {
    process.push(...processMatch[1].split("\n").filter((line) => line.trim()).map((line) => line.replace(/^[-•*]\s*/, "").trim()));
  }

  return {
    goals: goals.length > 0 ? goals : ["Analysis in progress"],
    constraints: constraints.length > 0 ? constraints : ["Standard constraints apply"],
    output: output || content.slice(0, 200),
    formula: formula || "Logical reasoning applied",
    process: process.length > 0 ? process : ["Step 1: Analyze", "Step 2: Process", "Step 3: Conclude"],
    fullText: content,
  };
}

/**
 * Call Gemini API with structured prompt
 */
export async function callGeminiAPI(
  userPrompt: string,
  apiKey: string,
  temperature: number = 0.7,
  maxTokens: number = 2048
): Promise<StructuredResponse> {
  try {
    const { decomposition } = decomposePrompt(userPrompt);

    // Note: The actual API call would use the Gemini API directly
    // For now, we use the built-in LLM which supports structured responses
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are Aether AI, an advanced reasoning chatbot. When responding to queries, structure your answer with clear sections:

1. GOALS: What are we trying to achieve?
2. CONSTRAINTS: What are the limitations or requirements?
3. OUTPUT: What format should the answer be in?
4. FORMULA: What's the mathematical or logical approach?
5. PROCESS: What are the step-by-step procedures?

Provide detailed, well-reasoned responses with these structured sections clearly labeled.`,
        },
        {
          role: "user",
          content: decomposition,
        },
      ],
    });

    const content = typeof response.choices[0]?.message.content === "string"
      ? response.choices[0].message.content
      : "";

    return parseStructuredResponse(content);
  } catch (error) {
    console.error("[Gemini] API call failed:", error);
    throw new Error("Failed to get response from Gemini API");
  }
}

/**
 * Simulate thinking status progression
 */
export async function* generateThinkingStatus(): AsyncGenerator<ThinkingStatus> {
  const stages: Array<"organizing" | "formulating" | "thinking" | "processing" | "re-organizing"> = [
    "organizing",
    "formulating",
    "thinking",
    "processing",
    "re-organizing",
  ];

  for (let i = 0; i < stages.length; i++) {
    yield {
      stage: stages[i],
      progress: Math.round(((i + 1) / stages.length) * 100),
    };
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  yield {
    stage: "complete",
    progress: 100,
  };
}
