import React, { useState } from 'react';
import { Mail, Copy, Check, ExternalLink, X, Send, Sparkles } from 'lucide-react';
import { GREN_PROFILE } from '../data/grenResumeData';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [subject, setSubject] = useState('Connecting regarding opportunity for Gren');
  const [roleType, setRoleType] = useState('Team / Project Lead Role');

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(GREN_PROFILE.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mailtoLink = `mailto:${GREN_PROFILE.email}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(
    `Hi Gren,\n\nI spoke with Joel, your AI representative, and reviewed your Perception Audit summary.\n\nI am reaching out regarding a ${roleType} opportunity that aligns with your superpowers in rapid problem solving under pressure, dependable execution, and leadership.\n\nLooking forward to speaking soon!`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Contact Gren</h3>
            <p className="text-xs text-slate-400">Direct channel to Gren for recruiters &amp; collaborators</p>
          </div>
        </div>

        {/* Email Copy Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
          <div className="truncate">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Direct Email</span>
            <p className="text-sm font-mono text-amber-300 font-semibold truncate">{GREN_PROFILE.email}</p>
          </div>
          <button
            onClick={handleCopy}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700 shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Intro Drafter */}
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          <label className="block text-xs font-semibold text-slate-300">
            Opportunity Focus:
          </label>
          <select
            value={roleType}
            onChange={(e) => setRoleType(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="Team / Project Lead Role">Team / Project Lead Role</option>
            <option value="0-to-1 Product Build / Prototyping">0-to-1 Product Build / Prototyping</option>
            <option value="High-Paced Problem Solving & Execution">High-Paced Problem Solving &amp; Execution</option>
            <option value="General Collaboration & Coffee Chat">General Collaboration &amp; Coffee Chat</option>
          </select>

          <a
            href={mailtoLink}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Open Email Draft in Default Client</span>
          </a>
        </div>
      </div>
    </div>
  );
};
