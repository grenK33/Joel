import React, { useState } from 'react';
import { Header } from './components/Header';
import { ChatInterface } from './components/ChatInterface';
import { LiveVoiceView } from './components/LiveVoiceView';
import { PerceptionAuditView } from './components/PerceptionAuditView';
import { ContactModal } from './components/ContactModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'voice' | 'document'>('chat');
  const [isVoiceLive, setIsVoiceLive] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [prefilledQuestion, setPrefilledQuestion] = useState<string | undefined>(undefined);

  const handleAskQuestion = (question: string) => {
    setPrefilledQuestion(question);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Executive Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isVoiceLive={isVoiceLive}
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden">
        {activeTab === 'chat' && (
          <ChatInterface
            onStartLiveVoice={() => setActiveTab('voice')}
            onOpenAudit={() => setActiveTab('document')}
            onOpenContact={() => setIsContactOpen(true)}
            initialQuestion={prefilledQuestion}
            clearInitialQuestion={() => setPrefilledQuestion(undefined)}
          />
        )}

        {activeTab === 'voice' && (
          <LiveVoiceView
            isVoiceActive={isVoiceLive}
            setIsVoiceActive={setIsVoiceLive}
            onSwitchToChat={(question) => {
              if (question) setPrefilledQuestion(question);
              setActiveTab('chat');
            }}
          />
        )}

        {activeTab === 'document' && (
          <PerceptionAuditView onAskQuestion={handleAskQuestion} />
        )}
      </main>

      {/* Contact Drawer / Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </div>
  );
}
