import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, Sparkles, Bot } from "lucide-react";

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const loginMutation = trpc.auth.login.useMutation({
        onSuccess: () => {
            toast.success("Welcome back! Redirecting...");
            // Use full page navigation to ensure auth state is refreshed
            setTimeout(() => {
                window.location.href = "/";
            }, 500);
        },
        onError: (error) => {
            toast.error(error.message || "Login failed");
            setIsLoading(false);
        },
    });

    const registerMutation = trpc.auth.register.useMutation({
        onSuccess: () => {
            toast.success("Account created! Please sign in.");
            setIsLogin(true);
            setPassword("");
            setIsLoading(false);
        },
        onError: (error) => {
            toast.error(error.message || "Registration failed");
            setIsLoading(false);
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (isLogin) {
            loginMutation.mutate({ email, password });
        } else {
            registerMutation.mutate({ email, password, name });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/5 to-cyan-500/5 rounded-full blur-3xl" />
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-purple-500/10 p-8 relative overflow-hidden">
                    {/* Glow effect */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-500/30 to-cyan-500/30 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl" />

                    {/* Header */}
                    <div className="relative text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 mb-4 shadow-lg shadow-purple-500/25">
                            <Bot className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="font-orbitron text-3xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                            Aether AI
                        </h1>
                        <p className="text-slate-400 text-sm mt-2 flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4 text-cyan-400" />
                            Advanced Reasoning Chatbot
                            <Sparkles className="w-4 h-4 text-purple-400" />
                        </p>
                    </div>

                    {/* Tab switcher */}
                    <div className="relative flex bg-slate-800/50 rounded-xl p-1 mb-6">
                        <button
                            type="button"
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${isLogin
                                    ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg"
                                    : "text-slate-400 hover:text-white"
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${!isLogin
                                    ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg"
                                    : "text-slate-400 hover:text-white"
                                }`}
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm text-slate-300 flex items-center gap-2">
                                    <User className="w-4 h-4 text-purple-400" />
                                    Full Name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="bg-slate-800/50 border-slate-700 focus:border-purple-500 focus:ring-purple-500/20 h-12 rounded-xl placeholder:text-slate-500"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm text-slate-300 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-cyan-400" />
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="bg-slate-800/50 border-slate-700 focus:border-cyan-500 focus:ring-cyan-500/20 h-12 rounded-xl placeholder:text-slate-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm text-slate-300 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-purple-400" />
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="bg-slate-800/50 border-slate-700 focus:border-purple-500 focus:ring-purple-500/20 h-12 rounded-xl pr-12 placeholder:text-slate-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {isLogin ? "Signing in..." : "Creating account..."}
                                </span>
                            ) : (
                                isLogin ? "Sign In" : "Create Account"
                            )}
                        </Button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-slate-500 text-xs mt-6">
                        {isLogin ? "New to Aether AI? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                        >
                            {isLogin ? "Create an account" : "Sign in"}
                        </button>
                    </p>
                </div>

                {/* Decorative text */}
                <p className="text-center text-slate-600 text-xs mt-6">
                    Powered by Gemini API • Advanced Reasoning Engine
                </p>
            </div>
        </div>
    );
}
