/**
 * OASIS HYDRO SUITE — En-tête Supérieur Professionnel
 */

import React, { useState } from 'react';
import {
  Waves,
  Save,
  Download,
  FileText,
  MapPin,
  HardDrive,
  ShieldCheck,
  Share2,
  Printer,
  Compass,
  User,
  PlusCircle,
  FolderOpen,
  ChevronDown
} from 'lucide-react';
import { Project, ActiveTab, UserRole, UserProfile } from '../../types/oasis';
import { exportProjectToJson, exportProjectToGeoJson } from '../../services/storageService';

interface HeaderProps {
  project: Project;
  onSave: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isSaving: boolean;
  onOpenGuide?: () => void;
  onNewBlankProject?: () => void;
  onLoadReferenceProject?: () => void;
  currentUser: UserProfile;
  onChangeRole: (role: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  onSave,
  activeTab,
  setActiveTab,
  isSaving,
  onOpenGuide,
  onNewBlankProject,
  onLoadReferenceProject,
  currentUser,
  onChangeRole
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState<boolean>(false);
  const [showProjectMenu, setShowProjectMenu] = useState<boolean>(false);

  const availableRoles: { role: UserRole; label: string; desc: string }[] = [
    {
      role: 'CHIEF_ENGINEER',
      label: 'Ingénieur Chef de Projet',
      desc: 'Accès complet, validation et modification totale'
    },
    {
      role: 'HYDRAULIC_CALCULATOR',
      label: 'Hydraulicien Calculateur',
      desc: 'Calculs hydrologie, hydraulique et dimensionnement'
    },
    {
      role: 'AUDITOR',
      label: 'Auditeur / Contrôleur Qualité',
      desc: 'Vérification normatrice et visa technique'
    },
    {
      role: 'CLIENT_VIEWER',
      label: "Maître d'Ouvrage / Client",
      desc: 'Consultation SIG, tableau de bord et rapports'
    }
  ];

  return (
    <header className="h-16 bg-[#0E4A7B] text-white flex items-center justify-between px-6 border-b border-[#0A3558] shadow-md z-30 select-none">
      {/* Logo & Identité Produit */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00A3E0] to-[#38BDF8] flex items-center justify-center shadow-inner">
          <Waves className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg tracking-wide uppercase font-['Montserrat']">
              OASIS HYDRO SUITE
            </h1>
            <span className="bg-[#00A3E0]/30 text-[#38BDF8] text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#00A3E0]/40">
              v{project.version} · PRO
            </span>
          </div>
          <p className="text-xs text-blue-200 truncate max-w-md hidden sm:block">{project.title}</p>
        </div>
      </div>

      {/* Métadonnées du Projet & Sélecteur de Dossier */}
      <div className="hidden lg:flex items-center gap-4 text-xs text-blue-100 bg-[#0B3B63] px-3 py-1.5 rounded-xl border border-[#14568D] relative">
        <div className="relative">
          <button
            onClick={() => {
              setShowProjectMenu(!showProjectMenu);
              setShowRoleMenu(false);
            }}
            className="flex items-center gap-1.5 font-semibold text-white hover:text-cyan-300 transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono bg-[#0E4A7B] px-1.5 py-0.5 rounded text-cyan-300">
              {project?.code || 'PRJ'}
            </span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showProjectMenu && (
            <div className="absolute top-8 left-0 z-50 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-1.5 w-64 text-xs animate-fade-in font-normal">
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400">
                Gestion des Dossiers d'Étude
              </div>
              <button
                onClick={() => {
                  setShowProjectMenu(false);
                  if (onNewBlankProject) onNewBlankProject();
                }}
                className="w-full px-3 py-2 text-left hover:bg-sky-50 flex items-center gap-2 text-[#0E4A7B] font-semibold"
              >
                <PlusCircle className="w-4 h-4 text-[#00A3E0]" />
                <span>+ Nouveau Projet Vierge</span>
              </button>
              <button
                onClick={() => {
                  setShowProjectMenu(false);
                  if (onLoadReferenceProject) onLoadReferenceProject();
                }}
                className="w-full px-3 py-2 text-left hover:bg-sky-50 flex items-center gap-2 text-slate-700 font-medium border-t border-slate-100"
              >
                <FolderOpen className="w-4 h-4 text-slate-500" />
                <span>Charger Cas Réel RN1 (PK 0-25)</span>
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-blue-700/60" />
        <div className="flex items-center gap-1.5 max-w-[140px] truncate">
          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">{project?.location || 'Non spécifié'}</span>
        </div>
        <div className="w-px h-4 bg-blue-700/60" />
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-300 font-medium">
            Q{project?.settings?.returnPeriodDesignYears || 25} Ans
          </span>
        </div>
      </div>

      {/* Actions, Rôle Utilisateur & Sauvegarde */}
      <div className="flex items-center gap-2">
        {/* Bouton Guide Interactif d'Accueil (PARTIE F) */}
        {onOpenGuide && (
          <button
            onClick={onOpenGuide}
            title="Ouvrir la Visite Guidée interactive pour nouveaux utilisateurs"
            className="flex items-center gap-1.5 bg-[#0B3B63] hover:bg-[#14568D] text-cyan-200 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-[#17629F]"
          >
            <Compass className="w-4 h-4 text-cyan-300" />
            <span className="hidden sm:inline">Visite Guidée</span>
          </button>
        )}

        {/* Export SIG GeoJSON */}
        <button
          onClick={() => exportProjectToGeoJson(project)}
          title="Exporter toutes les couches géoréférencées (Bassins et Ouvrages) en GeoJSON standard pour QGIS/ArcGIS"
          className="flex items-center gap-1.5 bg-[#0B3B63] hover:bg-[#14568D] text-blue-100 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border border-[#17629F]"
        >
          <Share2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden xl:inline">Export SIG</span>
        </button>

        {/* Export JSON Projet */}
        <button
          onClick={() => exportProjectToJson(project)}
          title="Télécharger l'intégralité du projet en fichier (.oasis.json)"
          className="flex items-center gap-1.5 bg-[#0B3B63] hover:bg-[#14568D] text-blue-100 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border border-[#17629F]"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden xl:inline">JSON</span>
        </button>

        {/* Impression Rapport */}
        <button
          onClick={() => setActiveTab('reporting')}
          title="Afficher et imprimer la Note de Calculs officielle"
          className="flex items-center gap-1.5 bg-[#0B3B63] hover:bg-[#14568D] text-blue-100 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border border-[#17629F]"
        >
          <Printer className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">Note de Calcul</span>
        </button>

        {/* Sélecteur de Rôle Utilisateur (PARTIE C & E) */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowProjectMenu(false);
            }}
            className="flex items-center gap-2 bg-[#0B3B63] hover:bg-[#14568D] px-2.5 py-1 rounded-lg text-xs border border-[#17629F] transition-colors"
            title="Modifier le rôle actif pour tester les permissions réelles"
          >
            <div className="w-6 h-6 rounded-full bg-cyan-400/20 text-cyan-300 flex items-center justify-center font-bold text-[10px]">
              {currentUser.avatarInitials}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-[11px] font-bold leading-tight">{currentUser.name}</div>
              <div className="text-[9px] text-cyan-300 leading-none">{currentUser.roleLabel}</div>
            </div>
            <ChevronDown className="w-3 h-3 text-blue-300" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 top-10 z-50 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-1.5 w-72 text-xs animate-fade-in font-normal">
              <div className="px-3 py-1.5 border-b border-slate-100">
                <div className="font-bold text-slate-900">{currentUser.name}</div>
                <div className="text-[10px] text-slate-500">
                  {currentUser.email} · {currentUser.organization}
                </div>
              </div>
              <div className="px-3 pt-2 pb-1 text-[10px] uppercase font-bold text-slate-400">
                Changer de Rôle d'Ingénierie (Contrôle d'Accès)
              </div>
              {availableRoles.map((r) => (
                <button
                  key={r.role}
                  onClick={() => {
                    onChangeRole(r.role);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-left hover:bg-sky-50 transition-colors flex flex-col ${
                    currentUser.role === r.role
                      ? 'bg-sky-50/80 font-bold text-[#0E4A7B]'
                      : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{r.label}</span>
                    {currentUser.role === r.role && (
                      <span className="w-2 h-2 rounded-full bg-[#00A3E0]" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal">{r.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sauvegarder dans la base de données active (SQLite local ou PostgreSQL) */}
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 bg-[#00A3E0] hover:bg-[#0091C8] active:scale-95 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow transition-all"
        >
          <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isSaving ? 'Enregistrement...' : 'Enregistrer'}</span>
        </button>
      </div>
    </header>
  );
};
