import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Briefcase, Clock, CheckCircle2, ExternalLink,
  TrendingUp, Search, CircleDot, Settings
} from "lucide-react";
import { Link } from "react-router-dom";

const MOCK_LISTED_JOBS = [
  { id: 1, company: "TechCorp Inc.", role: "Senior Frontend Developer", dateFound: "May 7, 2026", status: "Pending", matchScore: 92 },
  { id: 2, company: "Innovate Solutions", role: "React Engineer", dateFound: "May 6, 2026", status: "Analyzing", matchScore: 85 },
  { id: 3, company: "Global Systems", role: "Software Developer", dateFound: "May 5, 2026", status: "Pending", matchScore: 78 },
  { id: 4, company: "DevHub Labs", role: "Full Stack Engineer", dateFound: "May 4, 2026", status: "Pending", matchScore: 71 },
];

const MOCK_APPLIED_JOBS = [
  { id: 5, company: "StartupX", role: "Frontend Lead", dateApplied: "May 4, 2026", status: "Applied", url: "#" },
  { id: 6, company: "FinTech Hub", role: "UI/UX Engineer", dateApplied: "May 2, 2026", status: "Interview", url: "#" },
  { id: 7, company: "Nexus AI", role: "React Developer", dateApplied: "Apr 30, 2026", status: "Applied", url: "#" },
];

const STATS = [
  { label: "Jobs Found", value: "142", delta: "+12 today", icon: Search, color: "oklch(0.65 0.2 260)" },
  { label: "Applications Sent", value: "24", delta: "+3 this week", icon: Briefcase, color: "oklch(0.65 0.18 200)" },
  { label: "Interviews", value: "3", delta: "2 pending reply", icon: CheckCircle2, color: "oklch(0.72 0.2 145)" },
  { label: "Match Rate", value: "84%", delta: "↑ from 79%", icon: TrendingUp, color: "oklch(0.72 0.18 60)" },
];

const STATUS_CONFIG = {
  Interview: { color: "oklch(0.25 0.08 145)", textColor: "oklch(0.72 0.2 145)" },
  Applied:   { color: "oklch(0.22 0.06 260)", textColor: "oklch(0.65 0.2 260)" },
  Pending:   { color: "oklch(0.22 0.04 60)",  textColor: "oklch(0.72 0.18 60)" },
  Analyzing: { color: "oklch(0.22 0.05 300)", textColor: "oklch(0.68 0.18 300)" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: cfg.color, color: cfg.textColor }}>
      <CircleDot size={8} />
      {status}
    </span>
  );
}

function MatchBar({ score }) {
  const color = score >= 85 ? "oklch(0.72 0.2 145)" : score >= 75 ? "oklch(0.72 0.18 60)" : "oklch(0.68 0.18 300)";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold tabular-nums w-7 text-right" style={{ color }}>{score}%</span>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <Card key={i} className="relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200"
              style={{ background: "oklch(0.16 0.015 260)", border: "1px solid oklch(0.25 0.02 260)" }}>
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"
                style={{ background: stat.color }} />
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <stat.icon size={16} style={{ color: stat.color }} />
                </div>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.delta}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Agent Activity — full width */}
        <Card style={{ background: "oklch(0.16 0.015 260)", border: "1px solid oklch(0.25 0.02 260)" }}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Agent Activity</CardTitle>
                <CardDescription className="text-xs mt-1">Jobs your agent has found and applied to</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs gap-1"
                  style={{ borderColor: "oklch(0.35 0.1 145)", color: "oklch(0.72 0.2 145)", background: "oklch(0.22 0.06 145)" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  Live
                </Badge>
                <Button variant="outline" size="sm" asChild className="text-xs gap-1.5 h-8">
                  <Link to="/settings">
                    <Settings size={13} /> Configure Agent
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="applied" className="w-full">
              <TabsList className="mb-5 h-9" style={{ background: "oklch(0.13 0.01 260)" }}>
                <TabsTrigger value="applied" className="text-xs">✅ Applied ({MOCK_APPLIED_JOBS.length})</TabsTrigger>
                <TabsTrigger value="listed" className="text-xs">🔍 Discovered ({MOCK_LISTED_JOBS.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="applied">
                <div className="rounded-xl overflow-hidden border" style={{ borderColor: "oklch(0.25 0.02 260)" }}>
                  <Table>
                    <TableHeader>
                      <TableRow style={{ borderColor: "oklch(0.25 0.02 260)", background: "oklch(0.14 0.01 260)" }}>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Company</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Role</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Date Applied</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">Link</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_APPLIED_JOBS.map((job) => (
                        <TableRow key={job.id} className="transition-colors hover:bg-white/[0.02]"
                          style={{ borderColor: "oklch(0.22 0.02 260)" }}>
                          <TableCell className="font-semibold text-sm">{job.company}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{job.role}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{job.dateApplied}</TableCell>
                          <TableCell><StatusBadge status={job.status} /></TableCell>
                          <TableCell className="text-right">
                            <a href={job.url} target="_blank" rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                              <ExternalLink size={12} />
                            </a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="listed">
                <div className="rounded-xl overflow-hidden border" style={{ borderColor: "oklch(0.25 0.02 260)" }}>
                  <Table>
                    <TableHeader>
                      <TableRow style={{ borderColor: "oklch(0.25 0.02 260)", background: "oklch(0.14 0.01 260)" }}>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Company</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Role</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider w-48">Match Score</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Found</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_LISTED_JOBS.map((job) => (
                        <TableRow key={job.id} className="transition-colors hover:bg-white/[0.02]"
                          style={{ borderColor: "oklch(0.22 0.02 260)" }}>
                          <TableCell className="font-semibold text-sm">{job.company}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{job.role}</TableCell>
                          <TableCell><MatchBar score={job.matchScore} /></TableCell>
                          <TableCell className="text-xs text-muted-foreground">{job.dateFound}</TableCell>
                          <TableCell><StatusBadge status={job.status} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

      </div>
    </AppShell>
  );
}
