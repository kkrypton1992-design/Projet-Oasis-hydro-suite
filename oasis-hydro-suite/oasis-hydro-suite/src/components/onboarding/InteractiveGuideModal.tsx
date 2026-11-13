/**
 * OASIS HYDRO SUITE — Guide Interactif d'Accueil & Visite Guidée (Onboarding)
 * Parcours pas à pas pour les nouveaux utilisateurs avec mémorisation et réactivation
 */

import React, { useState } from 'react';
import {
  Waves,
  Map,
  CloudRain,
  Activity,
  Sliders,
  ShieldCheck,
  FileText,
  Laptop,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  X,
  Compass
} from 'lucide-react';
import { ActiveTab } from '../../types/oasis';

interface GuideStep {
  title: string;
  tab: ActiveTab;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  keyPoints: string[];
}

const GUIDE_STEPS: GuideStep[] = [
  {
    title: 'Bienvenue dans OASIS HYDRO SUITE',
    tab: 'dashboard',
    badge: 'Introduction Générale',
    icon: Waves,
    description:
      "Plateforme professionnelle d'ingénierie intégrée pour l'hydrologie, l'hydraulique à surface libre et le dimensionnement d'ouvrages d'art selon les normes internationales et françaises.",
    keyPoints: [
      'Persistance autonome en base locale SQLite (ou PostgreSQL serveur optionnel)',
      'Calculs mathématiques stricts (Kirpich, Passini, Montana, Manning-Strickler)',
      'Application Desktop Windows autonome et mode serveur Web'
    ]
  },
  {
    title: 'SIG & Cartographie Interactive',
    tab: 'gis',
    badge: 'Module M-01',
    icon: Map,
    description:
      "Visualisez les bassins versants d'apport (polygones GeoJSON WGS84) et les points kilométriques des ouvrages hydrauliques sur fonds cartographiques OpenStreetMap, Esri Satellite HD ou Topo.",
    keyPoints: [
      'Inspection directe des caractéristiques physiques au clic',
      'Outil de mesure de distance sur le terrain',
      'Bascule directe vers les solveurs hydrologiques ou hydrauliques'
    ]
  },
  {
    title: 'Moteur Hydrologique Certifié',
    tab: 'hydrology',
    badge: 'Module M-03',
    icon: CloudRain,
    description:
      'Déterminez le Temps de Concentration (Tc) par les 4 méthodes physiques normées (Kirpich, Passini, Giandotti, Bransby-Williams) et appliquez la loi pluviométrique de Montana.',
    keyPoints: [
      'Génération des courbes IDF (Intensité-Durée-Fréquence)',
      'Méthode Rationnelle exacte : Q = (C · I · A) / 3.6 pour Q10, Q25, Q50 et Q100',
      'Édition à chaud des surfaces et coefficients de ruissellement'
    ]
  },
  {
    title: 'Solveur Hydraulique Manning-Strickler',
    tab: 'hydraulics',
    badge: 'Module M-04',
    icon: Activity,
    description:
      "Résolution numérique par dichotomie (précision 10⁻⁵ m) de l'équation d'écoulement uniforme à surface libre Q = K · S · Rh^(2/3) · √S₀.",
    keyPoints: [
      'Coupes transversales géométriques en eau en temps réel (dalots, buses, fossés)',
      "Calculs des vitesses d'auto-curage Vmin et d'érosion Vmax",
      'Calcul des régimes de Froude (fluvial, critique, torrentiel) et de la revanche'
    ]
  },
  {
    title: "Dimensionnement Normalisé d'Ouvrages",
    tab: 'dimensioning',
    badge: 'Module M-05',
    icon: Sliders,
    description:
      'Balaie les catalogues industriels préfabriqués (buses béton Ø300 à Ø2000 mm, dalots cadres 1.00x1.00m à 4.00x2.50m) pour sélectionner la section optimale.',
    keyPoints: [
      'Application en 1 clic de la recommandation normative',
      "Économie matière et respect strict du tirant d'air de sécurité",
      'Persistance instantanée des modifications en base de données'
    ]
  },
  {
    title: 'Contrôle Qualité & Conformité Réglementaire',
    tab: 'quality',
    badge: 'Module M-06',
    icon: ShieldCheck,
    description:
      "Audit d'ingénierie automatique vérifiant la vitesse d'auto-curage (≥ 0.60 m/s), la vitesse maximale admissible du matériau et le taux de remplissage maximal (≤ 80%).",
    keyPoints: [
      'Tableau exhaustif de conformité avec statuts vert, orange, rouge',
      'Recommandations de remédiation technique immédiate',
      'Accès direct au dimensionnement pour corriger les écarts'
    ]
  },
  {
    title: 'Note de Calcul & Rapport Officiel',
    tab: 'reporting',
    badge: 'Module M-07',
    icon: FileText,
    description:
      "Générez la note technique complète d'exécution conforme aux exigences de soumission réglementaire, avec avis d'ingénierie conditionné par les résultats réels.",
    keyPoints: [
      'Avis technique automatisé (Favorable, Réserves Majeures ou Recommandations)',
      'Impression et export PDF haute fidélité (format A4 optimisé)',
      'Exports des données au format .oasis.json et GeoJSON standard'
    ]
  },
  {
    title: 'Application Windows Installable (.exe)',
    tab: 'desktop',
    badge: 'Distribution',
    icon: Laptop,
    description:
      "OASIS HYDRO SUITE est nativement packagé avec Electron et l'installateur NSIS pour fonctionner de manière autonome sur tout ordinateur Windows sans connexion internet.",
    keyPoints: [
      'Archive ZIP complète téléchargeable en 1 clic',
      'Fichiers electron-builder.json et scripts prêts à compiler',
      'Sauvegarde locale automatique avec synchronisation cloud différée'
    ]
  }
];

interface InteractiveGuideModalProps {
  isOpen: boolean;
  onClose: (dontShowAgain?: boolean) => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const InteractiveGuideModal: React.FC<InteractiveGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);

  if (!isOpen) return null;

  const step = GUIDE_STEPS[currentStep];
  const StepIcon = step.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === GUIDE_STEPS.length - 1;

  const handleNext = () => {
    if (!isLast) {
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      if (onNavigateTab) onNavigateTab(GUIDE_STEPS[nextIdx].tab);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      const prevIdx = currentStep - 1;
      setCurrentStep(prevIdx);
      if (onNavigateTab) onNavigateTab(GUIDE_STEPS[prevIdx].tab);
    }
  };

  const handleFinish = () => {
    if (dontShowAgain) {
      localStorage.setItem('oasis_has_seen_guide', 'true');
    }
    onClose(dontShowAgain);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fade-in font-['Inter',sans-serif]">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Barre supérieure avec indicateur d'étape */}
        <div className="bg-gradient-to-r from-[#0E4A7B] to-[#0A3558] text-white p-6 relative">
          <button
            onClick={() => handleFinish()}
            className="absolute top-5 right-5 text-blue-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            title="Fermer la visite guidée"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#00A3E0] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider">
              {step.badge}
            </span>
            <span className="text-xs text-blue-200 font-medium">
              Étape {currentStep + 1} sur {GUIDE_STEPS.length}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-cyan-300 shrink-0">
              <StepIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-['Montserrat'] tracking-wide text-white">
                {step.title}
              </h2>
              <p className="text-xs text-blue-100 mt-0.5">
                OASIS HYDRO SUITE — Ingénierie Hydrologique & Hydraulique
              </p>
            </div>
          </div>

          {/* Barre de progression continue */}
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-5 overflow-hidden">
            <div
              className="bg-cyan-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / GUIDE_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Corps descriptif de l'étape */}
        <div className="p-6 space-y-5 text-slate-800">
          <p className="text-sm leading-relaxed text-slate-600 font-medium">{step.description}</p>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
            <div className="text-xs font-bold text-[#0E4A7B] uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#00A3E0]" />
              <span>Fonctionnalités Clés & Raccordements :</span>
            </div>
            <ul className="space-y-2">
              {step.keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Option Ne plus afficher au démarrage */}
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-500 hover:text-slate-700">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0E4A7B] focus:ring-[#00A3E0]"
              />
              <span>Ne plus afficher automatiquement au démarrage</span>
            </label>

            <span className="text-[11px] text-slate-400">
              Réactivable à tout moment via l'icône aide du menu supérieur
            </span>
          </div>
        </div>

        {/* Pied de navigation avec boutons Précédent / Suivant */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={isFirst}
            className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isFirst
                ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400'
                : 'border-slate-300 text-slate-700 hover:bg-white shadow-sm'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Précédent</span>
          </button>

          <div className="flex items-center gap-1.5">
            {GUIDE_STEPS.map((_, idx) => (
              <span
                key={idx}
                onClick={() => {
                  setCurrentStep(idx);
                  if (onNavigateTab) onNavigateTab(GUIDE_STEPS[idx].tab);
                }}
                className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                  idx === currentStep ? 'w-6 bg-[#0E4A7B]' : 'bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 bg-[#0E4A7B] hover:bg-[#093558] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <span>{isLast ? 'Terminer la Visite' : 'Suivant'}</span>
            {!isLast && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
