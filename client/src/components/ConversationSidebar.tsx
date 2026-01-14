import { Plus, Trash2, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ConversationSidebarProps {
  activeConversationId: number;
  onSelectConversation: (id: number) => void;
  onNewConversation: () => void;
}

export function ConversationSidebar({
  activeConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationSidebarProps) {
  const { data: conversations } = trpc.chat.getConversations.useQuery();
  const deleteConversationMutation = trpc.chat.deleteConversation.useMutation();

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteConversationMutation.mutateAsync({ conversationId: id });
      toast.success("Conversation deleted");
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      toast.error("Failed to delete conversation");
    }
  };

  return (
    <div className="w-64 glass-dark border-r border-white/10 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <Button
          onClick={onNewConversation}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 gap-2"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {conversations && conversations.length > 0 ? (
          conversations.map((conv: any) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`w-full text-left p-3 rounded-lg transition-all duration-300 group ${
                activeConversationId === conv.id
                  ? "bg-gradient-to-r from-cyan-500/30 to-purple-500/30 border border-cyan-400/50"
                  : "hover:bg-white/5 border border-transparent"
              }`}
            >
              <div className="flex items-start gap-2 min-w-0">
                <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5 text-cyan-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate text-foreground">
                    {conv.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="flex items-center justify-center h-32 text-center">
            <p className="text-xs text-muted-foreground">
              No conversations yet. Start a new chat!
            </p>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-white/10 text-xs text-muted-foreground text-center">
        <p>Aether AI v1.0</p>
        <p className="mt-1">Powered by Gemini</p>
      </div>
    </div>
  );
}
