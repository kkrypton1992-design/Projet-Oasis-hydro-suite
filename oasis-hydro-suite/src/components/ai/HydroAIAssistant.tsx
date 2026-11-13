/**
 * OASIS HYDRO SUITE — Assistant IA Métier & Audit Expert
 * Analyse de cohérence, détection de données manquantes et recommandations normatives
 */

import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  FileSearch,
  MessageSquare,
  Cpu
} from 'lucide-react';
import { Project } from '../../types/oasis';
import { runEngineeringAudit } from '../../core/auditEngine';

interface HydroAIAssistantProps {
  project: Project;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const HydroAIAssistant: React.FC<HydroAIAssistantProps> = ({ project }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Bonjour ingénieur. Je suis l'Agent IA Central d'OASIS HYDRO SUITE. J'ai audité votre projet "${project.title}".\n\nJ'ai analysé les ${project.watersheds.length} bassins versants et les ${project.structures.length} ouvrages hydrauliques. Souhaitez-vous un diagnostic de cohérence sur les vitesses d'écoulement, une vérification des temps de concentration ou une suggestion d'optimisation de section ?`,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    const newMsg: Message = {
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(true);

    // Réponse déterministe issue du moteur d'audit central
    setTimeout(() => {
      const response = runEngineeringAudit(project, userText);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsLoading(false);
    }, 450);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* En-tête */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-0.5 rounded-full font-mono">
              Module Métier M-08
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Cpu className="w-3 h-3 text-emerald-600" /> Audit Déterministe & Recommandations
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-['Montserrat']">
            Assistant IA & Diagnostic d'Ingénierie
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Agent intelligent dédié à l'ingénierie hydraulique : audit des incohérences de calcul,
            contrôle des vitesses limites et conseil normatif.
          </p>
        </div>
      </div>

      {/* Fenêtre de dialogue */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[520px]">
        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <div key={idx} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#0E4A7B] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-4 h-4 text-cyan-300" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-[#00A3E0] text-white rounded-tr-none'
                      : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  <div className="prose prose-xs max-w-none">{m.content}</div>
                  <div
                    className={`text-[10px] mt-1.5 text-right ${isUser ? 'text-sky-100' : 'text-slate-400'}`}
                  >
                    {m.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0">
                    <span className="font-bold text-[10px]">ING</span>
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#0E4A7B] text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-cyan-300 animate-spin" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none p-3 text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                <span>Analyse des équations hydrauliques en cours...</span>
              </div>
            </div>
          )}
        </div>

        {/* Raccourcis de questions rapides */}
        <div className="px-6 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-400 font-semibold whitespace-nowrap">
            Questions rapides :
          </span>
          <button
            onClick={() => setInput("Vérifie les vitesses limites et les risques d'ensablement")}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 whitespace-nowrap"
          >
            Audit des vitesses (Vmin / Vmax)
          </button>
          <button
            onClick={() => setInput('Analyse les temps de concentration Tc des bassins versants')}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 whitespace-nowrap"
          >
            Analyse Tc & Kirpich
          </button>
          <button
            onClick={() =>
              setInput('Donne-moi la synthèse de dimensionnement de tous les ouvrages')
            }
            className="px-2.5 py-1 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 whitespace-nowrap"
          >
            Synthèse dimensionnement dalots
          </button>
        </div>

        {/* Zone de saisie */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Posez une question technique ou demandez un audit sur le projet..."
            className="flex-1 px-4 py-2.5 border rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A3E0]"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-[#0E4A7B] hover:bg-[#093558] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <span>Envoyer</span>
            <Send className="w-3.5 h-3.5 text-cyan-300" />
          </button>
        </div>
      </div>
    </div>
  );
};
