import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const COUNTRY_DATA = {
    US: { code: "+1", flag: "🇺🇸", max: 10 },
    UK: { code: "+44", flag: "🇬🇧", max: 10 },
    CA: { code: "+1", flag: "🇨🇦", max: 10 },
    IN: { code: "+91", flag: "🇮🇳", max: 10 },
};

const FEATURES = [
    { icon: "🤖", title: "AI-Powered Agent", desc: "Automatically scans and applies to matching jobs 24/7" },
    { icon: "📄", title: "Resume Analysis", desc: "Tailors your application to each job's requirements" },
    { icon: "📊", title: "Live Tracking", desc: "Real-time status updates on every application" },
];

export default function Login() {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [country, setCountry] = useState("IN");
    const [isPhoneInvalid, setIsPhoneInvalid] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [otpErrorMsg, setOtpErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handlePhoneChange = (e) => {
        const val = e.target.value;
        const sanitizedVal = val.replace(/[^0-9\s-]/g, '');
        const maxDigits = COUNTRY_DATA[country].max;
        const currentDigits = sanitizedVal.replace(/\D/g, '').length;
        if (currentDigits > maxDigits) return;
        setPhone(sanitizedVal);
        setIsPhoneInvalid(sanitizedVal.length > 0 && currentDigits < maxDigits);
    };

    const handleCountryChange = (val) => {
        setCountry(val);
        setPhone("");
        setIsPhoneInvalid(false);
    };

    const handleAuthAction = async () => {
        setIsLoading(true);
        if (!isLoginMode) {
            const fullPhoneNumber = `${COUNTRY_DATA[country].code}${phone}`;
            const { error: dbError } = await supabase
                .from('users')
                .insert([{ name, email, phone: fullPhoneNumber, country }]);
            if (dbError) {
                setIsLoading(false);
                alert("Registration Error: " + dbError.message);
                return;
            }
        }
        const { error: authError } = await supabase.auth.signInWithOtp({
            email,
            options: { shouldCreateUser: !isLoginMode },
        });
        setIsLoading(false);
        if (authError) {
            alert("Auth error: " + authError.message);
        } else {
            setIsOtpSent(true);
        }
    };

    const handleVerifyOtp = async () => {
        setOtpErrorMsg("");
        setIsLoading(true);
        const trimmedToken = otpCode.trim();
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: trimmedToken,
            type: 'email'
        });
        setIsLoading(false);
        if (error) {
            setOtpErrorMsg(error.message);
        } else {
            navigate("/dashboard");
        }
    };

    return (
        <div className="min-h-screen flex bg-background">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
                style={{ background: "linear-gradient(135deg, oklch(0.18 0.02 260) 0%, oklch(0.12 0.03 280) 50%, oklch(0.10 0.04 300) 100%)" }}>

                {/* Animated orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
                        style={{ background: "radial-gradient(circle, oklch(0.65 0.2 260), transparent)" }} />
                    <div className="absolute top-1/2 -right-32 w-80 h-80 rounded-full opacity-15 blur-3xl animate-pulse"
                        style={{ background: "radial-gradient(circle, oklch(0.65 0.2 300), transparent)", animationDelay: "1.5s" }} />
                    <div className="absolute -bottom-16 left-1/3 w-64 h-64 rounded-full opacity-10 blur-3xl animate-pulse"
                        style={{ background: "radial-gradient(circle, oklch(0.75 0.15 240), transparent)", animationDelay: "3s" }} />
                    {/* Grid overlay */}
                    <div className="absolute inset-0 opacity-5"
                        style={{ backgroundImage: "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                </div>

                {/* Logo */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold shadow-lg"
                            style={{ background: "linear-gradient(135deg, oklch(0.65 0.2 260), oklch(0.55 0.2 300))" }}>
                            A
                        </div>
                        <span className="text-white text-xl font-bold tracking-tight">AutoApply</span>
                    </div>
                </div>

                {/* Main copy */}
                <div className="relative z-10 space-y-8">
                    <div>
                        <h1 className="text-5xl font-bold text-white leading-tight mb-4">
                            Your AI Career<br />
                            <span style={{ background: "linear-gradient(90deg, oklch(0.75 0.2 260), oklch(0.75 0.2 300))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                Co-Pilot
                            </span>
                        </h1>
                        <p className="text-lg" style={{ color: "oklch(0.75 0.03 260)" }}>
                            Let AI handle the applications while you focus on what matters — preparing for interviews.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {FEATURES.map((f, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 rounded-xl backdrop-blur-sm"
                                style={{ background: "oklch(1 0 0 / 0.06)", border: "1px solid oklch(1 0 0 / 0.1)" }}>
                                <span className="text-2xl flex-shrink-0">{f.icon}</span>
                                <div>
                                    <p className="text-white font-semibold text-sm">{f.title}</p>
                                    <p className="text-sm mt-0.5" style={{ color: "oklch(0.65 0.03 260)" }}>{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <p className="relative z-10 text-sm" style={{ color: "oklch(0.5 0.03 260)" }}>
                    © 2026 AutoApply · Built with AI
                </p>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-16">
                <div className="w-full max-w-md space-y-8">

                    {isOtpSent ? (
                        /* OTP Verification */
                        <div className="space-y-8">
                            <div className="text-center space-y-3">
                                <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-4"
                                    style={{ background: "linear-gradient(135deg, oklch(0.25 0.03 260), oklch(0.22 0.04 280))", border: "1px solid oklch(0.3 0.04 260)" }}>
                                    ✉️
                                </div>
                                <h2 className="text-3xl font-bold text-foreground">Check your inbox</h2>
                                <p className="text-muted-foreground">
                                    We sent a 6-digit code to<br />
                                    <span className="font-semibold text-foreground">{email}</span>
                                </p>
                            </div>

                            {/* OTP digit display */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-foreground">Verification Code</label>
                                <Input
                                    id="otp-code"
                                    placeholder="000000"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                    maxLength={6}
                                    inputMode="numeric"
                                    className="text-center text-3xl font-bold tracking-[0.5em] h-16 border-2 focus:border-primary transition-colors"
                                />
                                {otpErrorMsg && (
                                    <p className="text-sm text-destructive text-center flex items-center justify-center gap-1">
                                        <span>⚠️</span> {otpErrorMsg}
                                    </p>
                                )}
                            </div>

                            <Button
                                className="w-full h-12 text-base font-semibold"
                                style={{ background: "linear-gradient(135deg, oklch(0.55 0.2 260), oklch(0.5 0.22 285))" }}
                                onClick={handleVerifyOtp}
                                disabled={otpCode.length !== 6 || isLoading}
                            >
                                {isLoading ? "Verifying..." : "Verify & Continue →"}
                            </Button>

                            <button
                                onClick={() => { setIsOtpSent(false); setOtpCode(""); setOtpErrorMsg(""); }}
                                className="w-full text-sm text-center text-muted-foreground hover:text-foreground transition-colors"
                            >
                                ← Back to {isLoginMode ? "login" : "registration"}
                            </button>
                        </div>
                    ) : (
                        /* Auth Form */
                        <div className="space-y-8">
                            {/* Header */}
                            <div className="space-y-2">
                                <div className="lg:hidden flex items-center gap-2 mb-6">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                                        style={{ background: "linear-gradient(135deg, oklch(0.55 0.2 260), oklch(0.5 0.22 285))" }}>
                                        A
                                    </div>
                                    <span className="font-bold">AutoApply</span>
                                </div>
                                <h2 className="text-3xl font-bold text-foreground">
                                    {isLoginMode ? "Welcome back" : "Create account"}
                                </h2>
                                <p className="text-muted-foreground">
                                    {isLoginMode
                                        ? "Sign in to access your AI agent dashboard."
                                        : "Set up your AI job application agent today."}
                                </p>
                            </div>

                            {/* Form */}
                            <div className="space-y-4">
                                {!isLoginMode && (
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-foreground">Full Name</label>
                                        <Input
                                            id="fieldgroup-name"
                                            placeholder="Jordan Lee"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="h-11"
                                        />
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-foreground">Email address</label>
                                    <Input
                                        id="fieldgroup-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-11"
                                    />
                                    <p className="text-xs text-muted-foreground">We'll send a one-time passcode to this address.</p>
                                </div>

                                {!isLoginMode && (
                                    <div className="grid grid-cols-5 gap-3">
                                        <div className="col-span-3 space-y-1.5">
                                            <label className="text-sm font-medium text-foreground">Phone</label>
                                            <div className="flex">
                                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm font-mono">
                                                    {COUNTRY_DATA[country].code}
                                                </span>
                                                <Input
                                                    id="form-phone"
                                                    type="tel"
                                                    className="rounded-l-none h-11"
                                                    placeholder="9876543210"
                                                    value={phone}
                                                    onChange={handlePhoneChange}
                                                    aria-invalid={isPhoneInvalid}
                                                />
                                            </div>
                                            {isPhoneInvalid && (
                                                <p className="text-xs text-destructive">Requires {COUNTRY_DATA[country].max} digits.</p>
                                            )}
                                        </div>
                                        <div className="col-span-2 space-y-1.5">
                                            <label className="text-sm font-medium text-foreground">Country</label>
                                            <Select value={country} onValueChange={handleCountryChange}>
                                                <SelectTrigger id="form-country" className="h-11">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(COUNTRY_DATA).map(([key, val]) => (
                                                        <SelectItem key={key} value={key}>{val.flag} {key}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base font-semibold mt-2"
                                    style={{ background: "linear-gradient(135deg, oklch(0.55 0.2 260), oklch(0.5 0.22 285))" }}
                                    onClick={handleAuthAction}
                                    disabled={!email || isLoading}
                                >
                                    {isLoading
                                        ? "Sending code..."
                                        : isLoginMode ? "Continue with Email →" : "Create Account →"}
                                </Button>
                            </div>

                            {/* Toggle */}
                            <p className="text-center text-sm text-muted-foreground">
                                {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                                <button
                                    type="button"
                                    onClick={() => { setIsLoginMode(!isLoginMode); setOtpCode(""); setOtpErrorMsg(""); }}
                                    className="font-semibold text-foreground underline-offset-4 hover:underline transition-colors"
                                >
                                    {isLoginMode ? "Sign up" : "Sign in"}
                                </button>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
