import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/ChatInterface";
import { SettingsPanel } from "@/components/SettingsPanel";
import { ConversationSidebar } from "@/components/ConversationSidebar";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const createConversationMutation = trpc.chat.createConversation.useMutation();
  const { data: conversations } = trpc.chat.getConversations.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Initialize with first conversation or create new one
  useEffect(() => {
    if (isAuthenticated && conversations && conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    } else if (isAuthenticated && (!conversations || conversations.length === 0) && !activeConversationId) {
      handleNewConversation();
    }
  }, [isAuthenticated, conversations, activeConversationId]);

  const handleNewConversation = async () => {
    try {
      await createConversationMutation.mutateAsync({});
      toast.success("New conversation created");
    } catch (error) {
      console.error("Failed to create conversation:", error);
      toast.error("Failed to create conversation");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🤖</div>
          <p className="text-cyan-300 font-orbitron">Initializing Aether AI...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl max-w-md w-full p-8 rounded-2xl border border-purple-400/30 text-center">
          <div className="text-6xl mb-6">🤖</div>
          <h1 className="font-orbitron text-3xl font-bold text-cyan-300 mb-2">
            Aether AI
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Advanced Reasoning Chatbot with Gemini API
          </p>
          <p className="text-xs text-muted-foreground mb-8">
            Experience structured, step-by-step reasoning with real-time thinking status indicators.
          </p>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
          >
            Sign In with Manus
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="glass-dark border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-2xl">🤖</div>
          <h1 className="font-orbitron text-xl font-bold text-cyan-300">Aether AI</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="h-8 px-3 text-xs"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <ConversationSidebar
          activeConversationId={activeConversationId || 0}
          onSelectConversation={setActiveConversationId}
          onNewConversation={handleNewConversation}
        />

        {/* Chat area */}
        {activeConversationId ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <ChatInterface
              conversationId={activeConversationId}
              onSettingsOpen={() => setIsSettingsOpen(true)}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-4">💬</div>
              <p className="text-muted-foreground">Select or create a conversation to start</p>
            </div>
          </div>
        )}
      </div>

      {/* Settings panel */}
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
