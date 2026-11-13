/**
 * OASIS HYDRO SUITE — Barre Latérale de Navigation Officielle
 */

import React from 'react';
import {
  LayoutDashboard,
  Map,
  CloudRain,
  Activity,
  Layers,
  CheckCircle2,
  FileSpreadsheet,
  Bot,
  Laptop,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { ActiveTab, Project } from '../../types/oasis';
import { ApiReadinessResponse } from '../../services/apiClient';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  project: Project;
  storageStatus?: ApiReadinessResponse | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  project,
  storageStatus
}) => {
  // Calcul du nombre d'anomalies de conformité
  const safeStructures = Array.isArray(project?.structures) ? project.structures : [];
  const safeWatersheds = Array.isArray(project?.watersheds) ? project.watersheds : [];

  const nonCompliantCount = safeStructures.filter(
    (s) => s.results?.status === 'NON_COMPLIANT'
  ).length;

  const warningCount = safeStructures.filter((s) => s.results?.status === 'WARNING').length;

  const menuItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Tableau de Bord',
      sublabel: 'Vue globale & indicateurs',
      icon: LayoutDashboard
    },
    {
      id: 'gis' as ActiveTab,
      label: 'SIG & Cartographie',
      sublabel: 'Bassin versant & ouvrages',
      icon: Map,
      badge: `${safeWatersheds.length} BV · ${safeStructures.length} Ouvrages`
    },

    {
      id: 'hydrology' as ActiveTab,
      label: 'Moteur Hydrologique',
      sublabel: 'Kirpich, Montana, Débits Q',
      icon: CloudRain
    },
    {
      id: 'hydraulics' as ActiveTab,
      label: 'Moteur Hydraulique',
      sublabel: 'Manning-Strickler & régimes',
      icon: Activity
    },
    {
      id: 'dimensioning' as ActiveTab,
      label: 'Dimensionnement',
      sublabel: 'Buses, dalots & catalogues',
      icon: Layers
    },
    {
      id: 'quality' as ActiveTab,
      label: 'Contrôle & Conformité',
      sublabel: 'Audit des vitesses & cotes',
      icon: CheckCircle2,
      alertCount: nonCompliantCount + warningCount,
      alertType: nonCompliantCount > 0 ? 'danger' : warningCount > 0 ? 'warning' : 'ok'
    },
    {
      id: 'reporting' as ActiveTab,
      label: 'Note de Calculs',
      sublabel: 'Génération rapport officiel',
      icon: FileSpreadsheet
    },
    {
      id: 'ai' as ActiveTab,
      label: 'Diagnostic & Audit',
      sublabel: 'Vérification cohérence',
      icon: Bot
    },
    {
      id: 'desktop' as ActiveTab,
      label: 'Application Desktop (.exe)',
      sublabel: 'Installation PC & SQLite',
      icon: Laptop,
      badge: 'v1.2.0'
    }
  ];

  const storageLabel = storageStatus
    ? storageStatus.connected
      ? storageStatus.dialect === 'sqlite'
        ? 'SQLite Local'
        : 'PostgreSQL'
      : 'Base indisponible'
    : 'Connexion...';

  return (
    <aside className="w-72 bg-[#0A3558] text-white flex flex-col justify-between border-r border-[#082842] shadow-lg shrink-0">
      {/* Liste des modules */}
      <div className="py-4 px-3 flex-1 overflow-y-auto space-y-1">
        <div className="px-3 pb-2 text-[10px] uppercase font-bold tracking-wider text-blue-300/70">
          Modules d&apos;Ingénierie
        </div>

        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left ${
                isActive
                  ? 'bg-gradient-to-r from-[#00A3E0] to-[#0E4A7B] text-white shadow-md font-semibold'
                  : 'text-slate-300 hover:bg-[#0E4A7B]/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#0E4A7B] text-cyan-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-medium leading-snug">{item.label}</div>
                  <div className="text-[10px] text-blue-200/70 truncate max-w-[130px]">
                    {item.sublabel}
                  </div>
                </div>
              </div>

              {/* Badges alertes ou statut */}
              <div className="flex items-center gap-1.5">
                {item.alertCount !== undefined && item.alertCount > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 ${
                      item.alertType === 'danger'
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-amber-400 text-slate-900'
                    }`}
                  >
                    <AlertTriangle className="w-2.5 h-2.5" />
                    {item.alertCount}
                  </span>
                )}

                {item.badge && !item.alertCount && (
                  <span className="text-[9px] bg-[#0E4A7B] text-cyan-200 px-1.5 py-0.5 rounded-md border border-cyan-800/50">
                    {item.badge}
                  </span>
                )}

                <ChevronRight
                  className={`w-3.5 h-3.5 opacity-40 transition-transform ${
                    isActive ? 'rotate-90 opacity-100 text-cyan-200' : ''
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Pied de barre latérale : État réel de la persistance et des solveurs */}
      <div className="p-3 bg-[#07243c] border-t border-[#0d4470] text-xs">
        <div className="flex items-center justify-between text-blue-200 mb-1.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">État système</span>
          <span
            className={`text-[10px] font-mono flex items-center gap-1 ${
              storageStatus?.connected === false ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                storageStatus?.connected === false ? 'bg-rose-400' : 'bg-emerald-400'
              }`}
            />
            {storageStatus?.connected === false ? 'Erreur Base' : 'Opérationnel'}
          </span>
        </div>
        <div className="p-2 bg-[#0a3558] rounded-lg border border-[#135183] text-[11px] text-blue-100">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-400">Stockage :</span>
            <span className="font-mono text-cyan-300">{storageLabel}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] mt-0.5">
            <span className="text-slate-400">Moteur :</span>
            <span className="font-mono text-cyan-300">Manning-Strickler</span>
          </div>
          <div className="flex justify-between items-center text-[10px] mt-0.5">
            <span className="text-slate-400">Export :</span>
            <span className="font-mono text-cyan-300">GeoJSON / PDF</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
