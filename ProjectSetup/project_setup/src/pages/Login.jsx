import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { supabase } from "../supabaseClient";

import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const COUNTRY_DATA = {
    US: { code: "+1", max: 10 },
    UK: { code: "+44", max: 10 },
    CA: { code: "+1", max: 10 },
    IN: { code: "+91", max: 10 },
};

export default function Login() {
    // Mode State (Login vs Register)
    const [isLoginMode, setIsLoginMode] = useState(true);

    // Form State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [country, setCountry] = useState("IN");
    const [isPhoneInvalid, setIsPhoneInvalid] = useState(false);
    
    // OTP State
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    
    const navigate = useNavigate();

    const handlePhoneChange = (e) => {
        const val = e.target.value;
        const sanitizedVal = val.replace(/[^0-9\s-]/g, '');
        const maxDigits = COUNTRY_DATA[country].max;
        const currentDigits = sanitizedVal.replace(/\D/g, '').length;

        if (currentDigits > maxDigits) return;

        setPhone(sanitizedVal);

        if (sanitizedVal.length > 0 && currentDigits < maxDigits) {
            setIsPhoneInvalid(true);
        } else {
            setIsPhoneInvalid(false);
        }
    };

    const handleCountryChange = (val) => {
        setCountry(val);
        setPhone("");
        setIsPhoneInvalid(false);
    };

    const handleAuthAction = async () => {
        // If in Registration Mode, save extra data to custom users table first
        if (!isLoginMode) {
            const fullPhoneNumber = `${COUNTRY_DATA[country].code}${phone}`;
            const { error: dbError } = await supabase
                .from('users')
                .insert([
                    {
                        name: name,
                        email: email,
                        phone: fullPhoneNumber,
                        country: country
                    },
                ]);

            if (dbError) {
                console.error("Database error:", dbError.message);
                alert("Registration Error: " + dbError.message);
                return; // Stop if database insert fails
            }
        }

        // Trigger Supabase OTP Auth for BOTH Login and Registration
        const { error: authError } = await supabase.auth.signInWithOtp({
            email: email,
            options: {
                // If logging in, don't create a new user if they mistyped email
                shouldCreateUser: !isLoginMode, 
            },
        });

        if (authError) {
            console.error("Auth error:", authError.message);
            alert("Auth error: " + authError.message);
        } else {
            // Successfully sent the OTP email
            setIsOtpSent(true);
        }
    };

    const handleVerifyOtp = async () => {
        const { data, error } = await supabase.auth.verifyOtp({
            email: email,
            token: otpCode,
            type: 'email'
        });

        if (error) {
            alert("Invalid OTP: " + error.message);
        } else {
            console.log("OTP Verified successfully", data);
            navigate("/dashboard");
        }
    };

    // 1. OTP Verification Form (Shows after auth action)
    if (isOtpSent) {
        return (
            <div className="flex justify-center items-center h-screen">
                <FieldGroup className="max-w-[400px] flex-col gap-6 p-8 rounded-xl bg-card border shadow-sm w-full mx-4">
                    <div className="flex flex-col space-y-2 text-center">
                        <h3 className="font-semibold tracking-tight text-2xl">Check your email</h3>
                        <p className="text-sm text-muted-foreground">
                            We sent a 6-digit code to <br/><span className="font-medium text-foreground">{email}</span>
                        </p>
                    </div>
                    <Field>
                        <FieldLabel htmlFor="otp-code">OTP Code</FieldLabel>
                        <Input 
                            id="otp-code" 
                            placeholder="123456" 
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            maxLength={6}
                            className="text-center text-lg tracking-widest"
                        />
                    </Field>
                    <Button className="w-full mt-2" type="submit" onClick={handleVerifyOtp}>
                        Verify & Login
                    </Button>
                </FieldGroup>
            </div>
        );
    }

    // 2. Main Auth Form (Toggle between Login and Register)
    return (
        <div className="flex justify-center items-center h-screen">
            <FieldGroup className="max-w-[400px] flex-col gap-4 p-6 rounded-xl bg-card border shadow-sm w-full mx-4">
                
                {/* Header and Toggle */}
                <div className="flex flex-col space-y-1.5 text-center mb-2">
                    <h3 className="font-semibold tracking-tight text-2xl">
                        {isLoginMode ? "Welcome back" : "Create an account"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {isLoginMode ? "Enter your email to login to your dashboard." : "Enter your details to configure your AI agent."}
                    </p>
                </div>

                {/* Conditional Registration Fields */}
                {!isLoginMode && (
                    <Field>
                        <FieldLabel htmlFor="fieldgroup-name">Name</FieldLabel>
                        <Input 
                            id="fieldgroup-name" 
                            placeholder="Jordan Lee" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </Field>
                )}

                {/* Always Show Email */}
                <Field>
                    <FieldLabel htmlFor="fieldgroup-email">Email</FieldLabel>
                    <Input
                        id="fieldgroup-email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <FieldDescription>
                        We&apos;ll send a one-time passcode to this address.
                    </FieldDescription>
                </Field>

                {/* Conditional Registration Fields */}
                {!isLoginMode && (
                    <div className="grid grid-cols-2 gap-4">
                        <Field data-invalid={isPhoneInvalid ? "" : undefined}>
                            <FieldLabel htmlFor="form-phone">Phone</FieldLabel>
                            <div className="flex">
                                <span className="inline-flex items-center px-2 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm font-medium">
                                    {COUNTRY_DATA[country].code}
                                </span>
                                <Input
                                    id="form-phone"
                                    type="tel"
                                    className="rounded-l-none"
                                    placeholder="6302178015"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    aria-invalid={isPhoneInvalid}
                                />
                            </div>
                            {isPhoneInvalid && (
                                <FieldDescription className="text-destructive text-xs mt-1">
                                    Requires {COUNTRY_DATA[country].max} digits.
                                </FieldDescription>
                            )}
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="form-country">Country</FieldLabel>
                            <Select value={country} onValueChange={handleCountryChange}>
                                <SelectTrigger id="form-country">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="US">United States</SelectItem>
                                    <SelectItem value="UK">United Kingdom</SelectItem>
                                    <SelectItem value="CA">Canada</SelectItem>
                                    <SelectItem value="IN">India</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                    </div>
                )}

                <Field orientation="horizontal" className="mt-2">
                    <Button type="submit" className="w-full" onClick={handleAuthAction}>
                        {isLoginMode ? "Login with Email" : "Register"}
                    </Button>
                </Field>

                {/* Toggle Button */}
                <div className="text-center mt-2">
                    <button 
                        type="button" 
                        onClick={() => setIsLoginMode(!isLoginMode)}
                        className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
                    >
                        {isLoginMode ? "Don't have an account? Register" : "Already have an account? Login"}
                    </button>
                </div>

            </FieldGroup>
        </div>
    )
}
