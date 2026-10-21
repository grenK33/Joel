import React, { useState } from 'react';
import {
  FileText,
  ExternalLink,
  Award,
  Zap,
  ShieldCheck,
  Flame,
  Users,
  Heart,
  Quote,
  MessageSquare,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { GREN_PROFILE } from '../data/grenResumeData';

interface PerceptionAuditViewProps {
  onAskQuestion: (question: string) => void;
}

export const PerceptionAuditView: React.FC<PerceptionAuditViewProps> = ({ onAskQuestion }) => {
  const [selectedTab, setSelectedTab] = useState<'structured' | 'pdf'>('structured');

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-10" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Source Document Verified
              </span>
              <span className="text-xs text-slate-400">{GREN_PROFILE.date}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
              {GREN_PROFILE.documentTitle}
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Conducted with five stakeholders (grandma, grandpa, mom, girlfriend, and an online peer).
              Provides rigorous, unfiltered validation of Gren&apos;s instincts, problem-solving speed under pressure, and character.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center">
              <button
                onClick={() => setSelectedTab('structured')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedTab === 'structured'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Interactive Audit
              </button>
              <button
                onClick={() => setSelectedTab('pdf')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                  selectedTab === 'pdf'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Original PDF
              </button>
            </div>

            <a
              href={GREN_PROFILE.pdfPath}
              target="_blank"
              rel="noreferrer"
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-300 rounded-xl border border-slate-700 transition-colors"
              title="Open raw PDF in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* 3 Essence Words Highlight */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {GREN_PROFILE.essenceWords.map((word, idx) => (
            <div
              key={word}
              className="bg-slate-950/60 border border-slate-800/70 rounded-xl p-3.5 flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  Essence Word 0{idx + 1}
                </span>
                <p className="text-base font-bold text-amber-400">{word}</p>
              </div>
              <Award className="w-5 h-5 text-amber-400/50" />
            </div>
          ))}
        </div>
      </div>

      {selectedTab === 'pdf' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <span className="text-xs text-slate-400">
              Viewing: <code>Perception_Audit___Summary__1__3952750c.pdf</code>
            </span>
            <a
              href={GREN_PROFILE.pdfPath}
              download
              className="text-xs text-amber-400 hover:underline flex items-center gap-1"
            >
              Download PDF file
            </a>
          </div>
          <iframe
            src={GREN_PROFILE.pdfPath}
            title="Gren Perception Audit PDF"
            className="w-full h-[750px] rounded-xl border border-slate-800 bg-slate-950"
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top 5 Patterns Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" /> Top Patterns &amp; Verified Strengths
              </h3>
              <span className="text-xs text-slate-400">Strictly extracted from document audit</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {GREN_PROFILE.patterns.map((pattern, index) => {
                const icons = [Zap, ShieldCheck, Flame, Users, Sparkles];
                const IconComponent = icons[index % icons.length];

                return (
                  <div
                    key={pattern.id}
                    className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700/80 transition-all flex flex-col justify-between group shadow-md"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                              {pattern.title}
                            </h4>
                            <span className="text-[11px] font-semibold text-emerald-400/90">
                              {pattern.consensus}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {pattern.description}
                      </p>

                      <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                        {pattern.quotes.map((q, qIdx) => (
                          <div key={qIdx} className="flex items-start gap-2 text-xs text-slate-400 italic">
                            <Quote className="w-3 h-3 text-slate-600 shrink-0 mt-0.5" />
                            <span>
                              &ldquo;{q.quote}&rdquo; — <strong className="text-slate-300 font-medium not-italic">{q.source}</strong>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-amber-400 font-medium">
                        {pattern.takeaway}
                      </span>
                      <button
                        onClick={() => onAskQuestion(`Tell me more about Gren's strength in: "${pattern.title}"`)}
                        className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" />
                        Ask Joel
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* The Surprise Card */}
              <div className="bg-gradient-to-br from-slate-900 to-rose-950/20 border border-rose-900/30 rounded-2xl p-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">
                        {GREN_PROFILE.surpriseInsight.title}
                      </h4>
                      <span className="text-[11px] font-semibold text-rose-400">
                        Emotional Intelligence Dimension
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {GREN_PROFILE.surpriseInsight.description}
                  </p>
                  <blockquote className="text-xs text-slate-300 italic border-l-2 border-rose-500/40 pl-3 py-1">
                    &ldquo;{GREN_PROFILE.surpriseInsight.quote}&rdquo;
                  </blockquote>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-rose-300/80">
                    Balances competitive drive with genuine human care
                  </span>
                  <button
                    onClick={() => onAskQuestion("What was the surprise discovery about Gren's interpersonal caring style?")}
                    className="text-[11px] text-slate-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Ask Joel
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Prompt Breakdown Table (Mirroring page 2 & 3 of the PDF) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              Document Matrix: Audit By Prompt &amp; Career Translation
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-3">Audit Prompt</th>
                    <th className="py-2.5 px-3">Common Themes</th>
                    <th className="py-2.5 px-3">Notable Quote</th>
                    <th className="py-2.5 px-3">Career Application</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="py-3 px-3 font-semibold text-amber-400">Strengths</td>
                    <td className="py-3 px-3">Determined, good at calculating, honest, considerate</td>
                    <td className="py-3 px-3 italic text-slate-400">&ldquo;Good sense of reality&rdquo; (grandma)</td>
                    <td className="py-3 px-3 text-emerald-400">Lead with judgement and reliability, not just talent</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold text-amber-400">Superpower</td>
                    <td className="py-3 px-3">Speed: reacting, calculating, solving, adapting</td>
                    <td className="py-3 px-3 italic text-slate-400">&ldquo;Adapts faster than most people&rdquo; (online friend)</td>
                    <td className="py-3 px-3 text-emerald-400">Make speed under pressure his headline strength</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold text-amber-400">Essence</td>
                    <td className="py-3 px-3">Grounded, direct, fair, competitive</td>
                    <td className="py-3 px-3 italic text-slate-400">&ldquo;Both feet on the ground&rdquo; (grandma)</td>
                    <td className="py-3 px-3 text-emerald-400">Keep messaging plain and concrete</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold text-amber-400">Comm. style</td>
                    <td className="py-3 px-3">Friendly, honest, direct, few words, humour</td>
                    <td className="py-3 px-3 italic text-slate-400">&ldquo;Less talk, more action&rdquo; (grandpa)</td>
                    <td className="py-3 px-3 text-emerald-400">Short, direct posts with a light touch</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold text-amber-400">Intro to client</td>
                    <td className="py-3 px-3">Reliable teammate, good ideas, stays calm</td>
                    <td className="py-3 px-3 italic text-slate-400">&ldquo;Gren has a fighter&apos;s spirit&rdquo; (mom)</td>
                    <td className="py-3 px-3 text-emerald-400">Use &ldquo;reliable teammate&rdquo; in professional bio</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold text-amber-400">Who benefits</td>
                    <td className="py-3 px-3">Teams building something new or needing ideas</td>
                    <td className="py-3 px-3 italic text-slate-400">&ldquo;Could lead a team very well&rdquo; (grandma)</td>
                    <td className="py-3 px-3 text-emerald-400">Look for team and project-lead roles</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Ideal Team & Project Fit */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Where Gren Creates Highest Leverage
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {GREN_PROFILE.idealRoles.map((role, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
