import { useState } from "react";
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
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [country, setCountry] = useState("IN");
    const [isPhoneInvalid, setIsPhoneInvalid] = useState(false);

    const handlePhoneChange = (e) => {
        const val = e.target.value;

        // Remove any characters that aren't digits, spaces, or hyphens
        // We no longer need '+' because it's handled by the country code prefix
        const sanitizedVal = val.replace(/[^0-9\s-]/g, '');

        const maxDigits = COUNTRY_DATA[country].max;
        const currentDigits = sanitizedVal.replace(/\D/g, '').length;

        // Prevent typing more digits than the country allows
        if (currentDigits > maxDigits) {
            return;
        }

        setPhone(sanitizedVal);

        // Mark as invalid if they started typing but haven't reached the required length
        if (sanitizedVal.length > 0 && currentDigits < maxDigits) {
            setIsPhoneInvalid(true);
        } else {
            setIsPhoneInvalid(false);
        }
    };

    const handleCountryChange = (val) => {
        setCountry(val);
        // Optional: clear phone when country changes, or re-validate
        setPhone("");
        setIsPhoneInvalid(false);
    };

    const handleLogin = async () => {
        // 1. Prepare the data
        const fullPhoneNumber = `${COUNTRY_DATA[country].code}${phone}`;

        // 2. Insert into the "users" table
        const { data, error } = await supabase
            .from('users')
            .insert([
                {
                    name: name,
                    email: email,
                    phone: fullPhoneNumber,
                    country: country
                },
            ])
            .select();

        if (error) {
            console.error("Error inserting data:", error.message);
            alert("Error: " + error.message);
        } else {
            console.log("Success! Data saved:", data);

            // 3. Optional: Trigger Supabase OTP Auth
            // Since your UI mentions OTP, Supabase can handle this automatically:
            const { authError } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    emailRedirectTo: 'http://localhost:5173/dashboard',
                },
            });

            if (authError) {
                console.error("Auth error:", authError.message);
                alert("Auth error: " + authError.message);
            } else {
                alert("Check your email for the login link!");
            }
        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <FieldGroup className="max-w-[400px] flex-col gap-4 p-4 rounded-xl">
                <Field>
                    <FieldLabel htmlFor="fieldgroup-name">Name</FieldLabel>
                    <Input 
                        id="fieldgroup-name" 
                        placeholder="Jordan Lee" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </Field>
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
                        We&apos;ll send otp to this address.
                    </FieldDescription>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                    <Field data-invalid={isPhoneInvalid ? "" : undefined}>
                        <FieldLabel htmlFor="form-phone">Phone</FieldLabel>
                        <div className="flex">
                            {/* The Country Code Prefix Box */}
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
                <Field orientation="horizontal">
                    <Button type="submit" onClick={handleLogin}>Register</Button>
                </Field>
            </FieldGroup>
        </div>
    )
}
