import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  User, FileText, Bot, Upload, Camera,
  Save, Sparkles, CheckCircle2,
} from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  const { session, profile, refreshProfile } = useAuth();
  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  // Profile state — pre-filled from auth context
  const [userEmail, setUserEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  // Agent config state
  const [resumeFile, setResumeFile] = useState(null);
  const [currentResumeName, setCurrentResumeName] = useState(null);
  const [jobPreferences, setJobPreferences] = useState("");
  const [platforms, setPlatforms] = useState({ linkedin: true, naukri: true, indeed: false });

  const [profileLoading, setProfileLoading] = useState(false);
  const [agentLoading, setAgentLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Populate fields from AuthContext (already fetched, no extra network call)
  useEffect(() => {
    if (session === undefined) return; // still loading
    if (!session) { navigate("/"); return; }

    setUserEmail(session.user?.email || "");

    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setCountry(profile.country || "");
      // avatar_url, job_preferences, resume_name — add these columns to your
      // Supabase users table when ready; they'll auto-populate here.
    }

    setIsFetching(false);
  }, [session, profile, navigate]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    setProfileLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setProfileLoading(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleSaveAgent = async () => {
    setAgentLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    if (resumeFile) setCurrentResumeName(resumeFile.name);
    setAgentLoading(false);
    setAgentSaved(true);
    setTimeout(() => setAgentSaved(false), 3000);
  };

  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : userEmail?.[0]?.toUpperCase() || "U";

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">

        {/* Loading skeleton */}
        {isFetching ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-40 rounded-lg bg-muted" />
            <div className="h-64 rounded-2xl bg-muted" />
            <div className="h-96 rounded-2xl bg-muted" />
          </div>
        ) : (<>

        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your profile and agent configuration</p>
        </div>

        {/* ── Section 1: Profile ── */}
        <Card style={{ background: "oklch(0.16 0.015 260)", border: "1px solid oklch(0.25 0.02 260)" }}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "oklch(0.22 0.06 260)" }}>
                <User size={14} style={{ color: "oklch(0.65 0.2 260)" }} />
              </div>
              Profile
            </CardTitle>
            <CardDescription className="text-xs">Your personal information and display preferences</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-4">
            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-2xl font-bold text-white"
                  style={{ background: "linear-gradient(135deg, oklch(0.55 0.2 260), oklch(0.5 0.22 285))" }}>
                  {avatarPreview
                    ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                    : <span>{initials}</span>
                  }
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors hover:opacity-90"
                  style={{ background: "oklch(0.55 0.2 260)", borderColor: "oklch(0.16 0.015 260)" }}>
                  <Camera size={12} className="text-white" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{name || "Set your name"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{userEmail}</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs mt-2 underline underline-offset-2 text-muted-foreground hover:text-foreground transition-colors">
                  Change photo
                </button>
              </div>
            </div>

            <Separator style={{ borderColor: "oklch(0.25 0.02 260)" }} />

            {/* Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</label>
                <Input
                  placeholder="Jordan Lee"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10"
                  style={{ background: "oklch(0.13 0.01 260)", borderColor: "oklch(0.28 0.02 260)" }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</label>
                <Input
                  value={userEmail}
                  disabled
                  className="h-10 opacity-60 cursor-not-allowed"
                  style={{ background: "oklch(0.13 0.01 260)", borderColor: "oklch(0.28 0.02 260)" }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone</label>
                <Input
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10"
                  style={{ background: "oklch(0.13 0.01 260)", borderColor: "oklch(0.28 0.02 260)" }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Country</label>
                <Input
                  placeholder="India"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="h-10"
                  style={{ background: "oklch(0.13 0.01 260)", borderColor: "oklch(0.28 0.02 260)" }}
                />
              </div>
            </div>

            <Button
              className="h-10 px-6 gap-2 text-sm font-medium"
              onClick={handleSaveProfile}
              disabled={profileLoading}
              style={{ background: profileSaved ? "oklch(0.45 0.18 145)" : "linear-gradient(135deg, oklch(0.45 0.2 260), oklch(0.4 0.22 285))" }}
            >
              {profileSaved ? <><CheckCircle2 size={15} /> Saved!</> : profileLoading ? "Saving..." : <><Save size={15} /> Save Profile</>}
            </Button>
          </CardContent>
        </Card>

        {/* ── Section 2: Agent Config ── */}
        <Card style={{ background: "oklch(0.16 0.015 260)", border: "1px solid oklch(0.25 0.02 260)" }}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "oklch(0.22 0.06 285)" }}>
                <Sparkles size={14} style={{ color: "oklch(0.65 0.2 285)" }} />
              </div>
              Agent Configuration
            </CardTitle>
            <CardDescription className="text-xs">Configure your AI agent's search and application preferences</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-4">
            {/* Resume Upload */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resume</label>
              <label
                htmlFor="resume-upload"
                className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all group"
                style={{
                  borderColor: resumeFile ? "oklch(0.5 0.2 260)" : "oklch(0.3 0.02 260)",
                  background: "oklch(0.13 0.01 260)",
                }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "oklch(0.22 0.04 260)" }}>
                  <FileText size={18} style={{ color: "oklch(0.65 0.2 260)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {resumeFile ? resumeFile.name : currentResumeName || "Upload your resume"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {resumeFile || currentResumeName ? "Click to replace · PDF or DOCX" : "PDF or DOCX · Max 5MB"}
                  </p>
                </div>
                <Upload size={16} className="text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                <input
                  id="resume-upload"
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => e.target.files?.[0] && setResumeFile(e.target.files[0])}
                  className="sr-only"
                />
              </label>
            </div>

            {/* Job Preferences */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Job Preferences</label>
              <Textarea
                placeholder="e.g. Senior React Developer, remote-first, min ₹25 LPA, prefer fintech or SaaS companies, 5+ years experience roles..."
                className="h-32 resize-none text-sm leading-relaxed"
                style={{ background: "oklch(0.13 0.01 260)", borderColor: "oklch(0.28 0.02 260)" }}
                value={jobPreferences}
                onChange={(e) => setJobPreferences(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Be as specific as possible — the AI uses this to filter and rank jobs.</p>
            </div>

            {/* Platforms */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Job Platforms</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: "linkedin", label: "LinkedIn", emoji: "💼" },
                  { key: "naukri", label: "Naukri", emoji: "🇮🇳" },
                  { key: "indeed", label: "Indeed", emoji: "🔍" },
                ].map(({ key, label, emoji }) => (
                  <button
                    key={key}
                    onClick={() => setPlatforms((p) => ({ ...p, [key]: !p[key] }))}
                    className="flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all"
                    style={{
                      background: platforms[key] ? "oklch(0.22 0.06 260)" : "oklch(0.14 0.01 260)",
                      borderColor: platforms[key] ? "oklch(0.45 0.15 260)" : "oklch(0.25 0.02 260)",
                      color: platforms[key] ? "oklch(0.8 0.05 260)" : "oklch(0.5 0.02 260)",
                    }}>
                    <span>{emoji}</span>
                    {label}
                    {platforms[key] && <CheckCircle2 size={13} className="ml-auto" style={{ color: "oklch(0.65 0.2 260)" }} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Agent Status Row */}
            <div className="flex items-center justify-between p-4 rounded-xl"
              style={{ background: "oklch(0.14 0.015 260)", border: "1px solid oklch(0.25 0.02 260)" }}>
              <div className="flex items-center gap-3">
                <Bot size={18} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Agent Status</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Last scan: 2 minutes ago · Next: in 28 min</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: "oklch(0.22 0.06 145)", color: "oklch(0.72 0.2 145)", border: "1px solid oklch(0.35 0.1 145)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                Running
              </span>
            </div>

            <Button
              className="h-10 px-6 gap-2 text-sm font-medium"
              onClick={handleSaveAgent}
              disabled={agentLoading}
              style={{ background: agentSaved ? "oklch(0.45 0.18 145)" : "linear-gradient(135deg, oklch(0.45 0.2 260), oklch(0.4 0.22 285))" }}
            >
              {agentSaved ? <><CheckCircle2 size={15} /> Saved!</> : agentLoading ? "Saving..." : <><Save size={15} /> Save Agent Config</>}
            </Button>
          </CardContent>
        </Card>

        </>)}
      </div>
    </AppShell>
  );
}
