import { describe, expect, it } from "vitest";
import { parseStructuredResponse, decomposePrompt } from "./gemini";

describe("Gemini API Integration", () => {
  describe("decomposePrompt", () => {
    it("should decompose a user prompt into structured components", () => {
      const prompt = "How do I build a web application?";
      const result = decomposePrompt(prompt);

      expect(result.originalPrompt).toBe(prompt);
      expect(result.decomposition).toContain("GOALS");
      expect(result.decomposition).toContain("CONSTRAINTS");
      expect(result.decomposition).toContain("OUTPUT");
      expect(result.decomposition).toContain("FORMULA");
      expect(result.decomposition).toContain("PROCESS");
    });

    it("should include the original prompt in the decomposition", () => {
      const prompt = "What is machine learning?";
      const result = decomposePrompt(prompt);

      expect(result.decomposition).toContain(prompt);
    });
  });

  describe("parseStructuredResponse", () => {
    it("should parse a structured response with all sections", () => {
      const content = `
GOALS:
- Understand web development fundamentals
- Learn modern frameworks
- Build practical applications

CONSTRAINTS:
- Limited time for learning
- Need practical experience
- Must use current technologies

OUTPUT:
A comprehensive guide with examples

FORMULA:
Theory + Practice = Mastery

PROCESS:
1. Learn HTML/CSS basics
2. Study JavaScript
3. Choose a framework
4. Build projects
5. Deploy applications
`;

      const result = parseStructuredResponse(content);

      expect(result.goals).toHaveLength(3);
      expect(result.goals[0]).toContain("Understand");
      expect(result.constraints).toHaveLength(3);
      expect(result.output).toContain("comprehensive");
      expect(result.formula).toContain("Theory");
      expect(result.process).toHaveLength(5);
    });

    it("should handle missing sections gracefully", () => {
      const content = "Just some regular text without structured sections";
      const result = parseStructuredResponse(content);

      expect(result.goals).toBeDefined();
      expect(result.constraints).toBeDefined();
      expect(result.output).toBeDefined();
      expect(result.formula).toBeDefined();
      expect(result.process).toBeDefined();
      expect(result.fullText).toBe(content);
    });

    it("should parse goals with various bullet point formats", () => {
      const content = `
GOALS:
- First goal
• Second goal
* Third goal
`;

      const result = parseStructuredResponse(content);

      expect(result.goals.length).toBeGreaterThan(0);
      expect(result.goals.some((g) => g.includes("First"))).toBe(true);
    });

    it("should extract output section correctly", () => {
      const content = `
OUTPUT:
This is the main output section with detailed information about the response format and expected results.
`;

      const result = parseStructuredResponse(content);

      expect(result.output).toContain("main output section");
    });

    it("should parse process steps correctly", () => {
      const content = `
PROCESS:
1. Initialize the system
2. Process the input
3. Generate response
4. Format output
5. Return results
`;

      const result = parseStructuredResponse(content);

      expect(result.process.length).toBeGreaterThan(0);
      expect(result.process.some((p) => p.includes("Initialize"))).toBe(true);
    });

    it("should handle case-insensitive section headers", () => {
      const content = `
goals:
- Test goal

constraints:
- Test constraint

output:
Test output

formula:
Test formula

process:
- Test process
`;

      const result = parseStructuredResponse(content);

      expect(result.goals.length).toBeGreaterThan(0);
      expect(result.constraints.length).toBeGreaterThan(0);
      expect(result.output).toBeTruthy();
      expect(result.formula).toBeTruthy();
      expect(result.process.length).toBeGreaterThan(0);
    });
  });
});
