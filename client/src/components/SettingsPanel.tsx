import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { Button } from "./ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [topK, setTopK] = useState(40);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [isSaving, setIsSaving] = useState(false);

  const { data: settings } = trpc.settings.getSettings.useQuery();
  const updateSettingsMutation = trpc.settings.updateSettings.useMutation();

  useEffect(() => {
    if (settings) {
      setTemperature(parseFloat(settings.temperature?.toString() || "0.7"));
      setTopP(parseFloat(settings.topP?.toString() || "0.9"));
      setTopK(settings.topK || 40);
      setMaxTokens(settings.maxOutputTokens || 2048);
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettingsMutation.mutateAsync({
        temperature,
        topP,
        topK,
        maxOutputTokens: maxTokens,
      });
      toast.success("Settings saved successfully");
      onClose();
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-purple-400/30">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <h2 className="font-orbitron text-lg font-bold text-purple-300">Settings</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Settings content */}
        <div className="p-6 space-y-6">
          {/* Temperature */}
          <div>
            <label className="block text-sm font-semibold text-cyan-300 mb-2">
              Temperature: {temperature.toFixed(2)}
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              Controls randomness. Lower values make output more deterministic.
            </p>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>

          {/* Top P */}
          <div>
            <label className="block text-sm font-semibold text-cyan-300 mb-2">
              Top P: {topP.toFixed(2)}
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              Nucleus sampling. Controls diversity of responses.
            </p>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={topP}
              onChange={(e) => setTopP(parseFloat(e.target.value))}
              className="w-full h-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Top K */}
          <div>
            <label className="block text-sm font-semibold text-cyan-300 mb-2">
              Top K: {topK}
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              Number of top tokens to consider.
            </p>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={topK}
              onChange={(e) => setTopK(parseInt(e.target.value))}
              className="w-full h-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Max Output Tokens */}
          <div>
            <label className="block text-sm font-semibold text-cyan-300 mb-2">
              Max Output Tokens: {maxTokens}
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              Maximum length of generated responses.
            </p>
            <input
              type="range"
              min="256"
              max="4096"
              step="256"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className="w-full h-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Short</span>
              <span>Long</span>
            </div>
          </div>

          {/* Info box */}
          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-400/20">
            <p className="text-xs text-cyan-300">
              💡 <strong>Tip:</strong> Higher temperature and top-p values produce more creative responses, while lower values produce more consistent outputs.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-6 border-t border-white/10 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
