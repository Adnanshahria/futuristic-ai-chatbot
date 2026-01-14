import { useEffect, useRef, useState } from "react";
import { Send, Mic, Settings, Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { MessageBubble } from "./MessageBubble";
import { ThinkingIndicator } from "./ThinkingIndicator";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  goals?: string | string[];
  constraints?: string | string[];
  output?: string;
  formula?: string;
  process?: string | string[];
  isVoiceInput?: boolean;
  voiceTranscription?: string;
  createdAt: Date;
}

interface ChatInterfaceProps {
  conversationId: number;
  onSettingsOpen: () => void;
}

export function ChatInterface({ conversationId, onSettingsOpen }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingStage, setThinkingStage] = useState<"organizing" | "formulating" | "thinking" | "processing" | "re-organizing" | "complete">("organizing");
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Fetch conversation and messages
  const { data: conversationData } = trpc.chat.getConversation.useQuery({ conversationId });
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();

  useEffect(() => {
    if (conversationData?.messages) {
      setMessages(
        conversationData.messages.map((msg: any) => ({
          ...msg,
          goals: msg.goals ? JSON.parse(msg.goals) : undefined,
          constraints: msg.constraints ? JSON.parse(msg.constraints) : undefined,
          process: msg.process ? JSON.parse(msg.process) : undefined,
          createdAt: new Date(msg.createdAt),
        }))
      );
    }
  }, [conversationData]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Simulate thinking stages
  useEffect(() => {
    if (!isLoading) return;

    const stages: Array<"organizing" | "formulating" | "thinking" | "processing" | "re-organizing" | "complete"> = [
      "organizing",
      "formulating",
      "thinking",
      "processing",
      "re-organizing",
    ];

    let stageIndex = 0;
    const interval = setInterval(() => {
      if (stageIndex < stages.length) {
        setThinkingStage(stages[stageIndex]);
        stageIndex++;
      } else {
        setThinkingStage("complete");
        clearInterval(interval);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setInputValue("");
    setIsLoading(true);
    setThinkingStage("organizing");

    try {
      const result = await sendMessageMutation.mutateAsync({
        conversationId,
        content: userMessage,
      });

      // Add messages to state
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "user",
          content: userMessage,
          createdAt: new Date(),
        },
        {
          id: Date.now() + 1,
          role: "assistant",
          content: result.response.fullText,
          goals: result.response.goals,
          constraints: result.response.constraints,
          output: result.response.output,
          formula: result.response.formula,
          process: result.response.process,
          createdAt: new Date(),
        },
      ]);

      setThinkingStage("complete");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        // TODO: Send audio to transcription API
        toast.info("Voice recording saved. Transcription coming soon.");
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info("Recording started...");
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast.error("Failed to access microphone");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success("Recording stopped");
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="glass-dark border-b border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <h1 className="font-orbitron text-lg font-bold text-cyan-300">
            {conversationData?.conversation?.title || "New Conversation"}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              // TODO: New conversation
              toast.info("Creating new conversation...");
            }}
            className="h-8 w-8"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsOpen}
            className="h-8 w-8"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-5xl mb-4">🤖</div>
              <h2 className="font-orbitron text-xl font-bold text-cyan-300 mb-2">
                Welcome to Aether AI
              </h2>
              <p className="text-sm text-muted-foreground max-w-md">
                Ask me anything and I'll provide structured, step-by-step reasoning with
                detailed analysis and insights.
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            role={message.role}
            content={message.content}
            structured={
              message.role === "assistant" && message.goals
                ? {
                    goals: Array.isArray(message.goals) ? message.goals : JSON.parse(message.goals as any),
                    constraints: Array.isArray(message.constraints) ? message.constraints : JSON.parse(message.constraints as any),
                    output: message.output || "",
                    formula: message.formula || "",
                    process: Array.isArray(message.process) ? message.process : JSON.parse(message.process as any),
                  }
                : undefined
            }
            isVoiceInput={message.isVoiceInput}
            timestamp={message.createdAt}
          />
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-2xl">
              <ThinkingIndicator isThinking={isLoading} currentStage={thinkingStage} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="glass-dark border-t border-white/10 p-4 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask me anything... (Shift+Enter for new line)"
            className="chat-input flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            variant={isRecording ? "destructive" : "outline"}
            size="icon"
            className="h-10 w-10"
          >
            <Mic className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="h-10 px-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Powered by Gemini API • Structured reasoning • Real-time thinking status
        </p>
      </div>
    </div>
  );
}
