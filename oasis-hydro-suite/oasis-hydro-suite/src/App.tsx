/**
 * OASIS HYDRO SUITE — Application Principale (Web & Desktop)
 * Plateforme professionnelle d'ingénierie hydrologique, hydraulique et dimensionnement d'ouvrages
 */

import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  HydraulicStructure,
  Project,
  ProjectSettings,
  UserProfile,
  UserRole
} from './types/oasis';
import {
  getStoredProject,
  createNewBlankProject,
  DEFAULT_REAL_PROJECT,
  recalculateEntireProject,
  exportProjectToGeoJson
} from './services/storageService';
import { ApiClient, ApiError, ApiReadinessResponse } from './services/apiClient';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { GisMap } from './components/gis/GisMap';
import { HydrologyView } from './components/hydrology/HydrologyView';
import { HydraulicsView } from './components/hydraulics/HydraulicsView';
import { DimensioningView } from './components/dimensioning/DimensioningView';
import { QualityView } from './components/quality/QualityView';
import { ReportViewer } from './components/reporting/ReportViewer';
import { HydroAIAssistant } from './components/ai/HydroAIAssistant';
import { DesktopPackagingView } from './components/desktop/DesktopPackagingView';
import { InteractiveGuideModal } from './components/onboarding/InteractiveGuideModal';

export default function App() {
  const [project, setProject] = useState<Project>(() => getStoredProject());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [storageStatus, setStorageStatus] = useState<ApiReadinessResponse | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: 'info' | 'error' } | null>(null);

  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);
  const [selectedWatershedId, setSelectedWatershedId] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'usr-01',
    name: 'Ing. Johanna ISSI',
    email: 'vedeljohannaissi@gmail.com',
    role: 'CHIEF_ENGINEER',
    roleLabel: 'Ingénieur Chef de Projet',
    organization: 'Direction des Grands Ouvrages & Hydraulique',
    avatarInitials: 'JI'
  });

  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('oasis_has_seen_guide') !== 'true';
    }
    return false;
  });

  const showNotification = (message: string, tone: 'info' | 'error' = 'info') => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 4000);
  };

  const getErrorMessage = (err: unknown, fallback: string): string => {
    if (err instanceof ApiError || err instanceof Error) {
      return err.message;
    }
    return fallback;
  };

  const handleChangeRole = (role: UserRole) => {
    const roleLabels: Record<UserRole, string> = {
      ADMIN: 'Administrateur Système',
      CHIEF_ENGINEER: 'Ingénieur Chef de Projet',
      HYDRAULIC_CALCULATOR: 'Hydraulicien Calculateur',
      AUDITOR: 'Auditeur / Contrôleur Qualité',
      CLIENT_VIEWER: "Maître d'Ouvrage / Client"
    };
    setCurrentUser((prev) => ({
      ...prev,
      role,
      roleLabel: roleLabels[role]
    }));
    ApiClient.setUserRole(role);
    showNotification(`Rôle actif changé : ${roleLabels[role]}`);
  };

  const handleNewBlankProject = async () => {
    const previous = project;
    const blank = createNewBlankProject(undefined, "Nouveau Projet d'Aménagement Vierge");
    try {
      const saved = await ApiClient.saveProject(blank);
      setProject(saved);
      setSelectedStructureId(null);
      setSelectedWatershedId(null);
      showNotification('Nouveau projet vierge créé et enregistré dans la base.');
    } catch (err) {
      setProject(previous);
      showNotification(getErrorMessage(err, 'Échec de création du projet vierge.'), 'error');
    }
  };

  const handleLoadReferenceProject = async () => {
    const previous = project;
    const refProj = recalculateEntireProject(DEFAULT_REAL_PROJECT);
    try {
      const saved = await ApiClient.saveProject(refProj);
      setProject(saved);
      if (saved.structures.length > 0) setSelectedStructureId(saved.structures[0].id);
      if (saved.watersheds.length > 0) setSelectedWatershedId(saved.watersheds[0].id);
      showNotification("Dossier d'ingénierie de référence RN1 (PK 0 à 25) chargé.");
    } catch (err) {
      setProject(previous);
      showNotification(getErrorMessage(err, 'Échec de chargement du projet RN1.'), 'error');
    }
  };

  // Chargement initial réel du projet actif et de l'état base de données (/api/ready)
  useEffect(() => {
    let isMounted = true;

    ApiClient.getReadiness()
      .then((ready) => {
        if (isMounted) setStorageStatus(ready);
      })
      .catch((err) => {
        if (isMounted) {
          setStorageStatus({
            status: 'unavailable',
            dialect: 'sqlite',
            database: 'Base locale',
            storageLocation: 'Inaccessible',
            connected: false,
            latencyMs: 0,
            error: getErrorMessage(err, 'Backend inaccessible')
          });
        }
      });

    ApiClient.getActiveProject()
      .then((loaded) => {
        if (isMounted && loaded) {
          setProject(loaded);
          if (loaded.structures.length > 0) setSelectedStructureId(loaded.structures[0].id);
          if (loaded.watersheds.length > 0) setSelectedWatershedId(loaded.watersheds[0].id);
        }
      })
      .catch((err) => {
        if (isMounted) {
          showNotification(
            getErrorMessage(err, 'Impossible de charger le projet depuis la base de données.'),
            'error'
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    ApiClient.setUserRole(currentUser.role);
  }, [currentUser.role]);

  // Sauvegarde manuelle explicite en base de données
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const saved = await ApiClient.saveProject(project);
      setProject(saved);
      const dbLabel =
        storageStatus?.dialect === 'postgres' ? 'base PostgreSQL' : 'base locale SQLite';
      showNotification(`Projet enregistré avec succès dans la ${dbLabel}.`);
    } catch (err) {
      showNotification(getErrorMessage(err, "Échec d'enregistrement du projet."), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Mise à jour globale du projet
  const handleUpdateProject = async (updated: Project) => {
    const previous = project;
    setProject(updated);
    try {
      const saved = await ApiClient.saveProject(updated);
      setProject(saved);
      showNotification('Modifications enregistrées et chaîne de calcul synchronisée.');
    } catch (err) {
      setProject(previous);
      showNotification(
        getErrorMessage(err, "Erreur lors de l'enregistrement des modifications."),
        'error'
      );
    }
  };

  // Synchronisation complète avec les menus natifs Electron Desktop
  useEffect(() => {
    const desktopApi = (
      window as unknown as {
        oasisDesktop?: {
          onMenuAction: (cb: (action: string) => void) => () => void;
          onSwitchTab: (cb: (tab: ActiveTab) => void) => () => void;
          onLoadProject?: (cb: (content: string) => void) => () => void;
        };
      }
    ).oasisDesktop;
    if (!desktopApi) return undefined;

    const unsubMenu = desktopApi.onMenuAction((action: string) => {
      if (action === 'save-project') void handleSave();
      if (action === 'new-project') void handleNewBlankProject();
      if (action === 'print-report') setActiveTab('reporting');
      if (action === 'export-geojson') exportProjectToGeoJson(project);
    });

    const unsubTab = desktopApi.onSwitchTab((tab: ActiveTab) => {
      setActiveTab(tab);
    });

    const unsubLoad = desktopApi.onLoadProject?.((rawContent: string) => {
      try {
        const parsed = JSON.parse(rawContent) as Project;
        if (!parsed || typeof parsed !== 'object' || !parsed.id || !parsed.code) {
          showNotification('Le fichier .oasis.json sélectionné est invalide.', 'error');
          return;
        }
        void handleUpdateProject(recalculateEntireProject(parsed));
      } catch (err) {
        showNotification(getErrorMessage(err, "Impossible d'importer le fichier projet."), 'error');
      }
    });

    return () => {
      unsubMenu?.();
      unsubTab?.();
      unsubLoad?.();
    };
  }, [project, storageStatus]);

  // Ajout d'un ouvrage hydraulique
  const handleAddStructure = async (newStruct: HydraulicStructure) => {
    const previous = project;
    const updatedProj: Project = {
      ...project,
      structures: [...project.structures, newStruct]
    };
    setProject(updatedProj);
    setSelectedStructureId(newStruct.id);
    try {
      const saved = await ApiClient.saveProject(updatedProj);
      setProject(saved);
      showNotification(`Ouvrage ${newStruct.code} créé et modélisé.`);
    } catch (err) {
      setProject(previous);
      showNotification(getErrorMessage(err, "Échec d'ajout de l'ouvrage."), 'error');
    }
  };

  // Suppression d'un ouvrage hydraulique
  const handleDeleteStructure = async (structureId: string) => {
    const previous = project;
    try {
      const saved = await ApiClient.deleteStructure(project.id, structureId);
      setProject(saved);
      showNotification('Ouvrage supprimé de la base.');
    } catch (err) {
      setProject(previous);
      showNotification(getErrorMessage(err, "Échec de suppression de l'ouvrage."), 'error');
    }
  };

  // Suppression d'un bassin versant
  const handleDeleteWatershed = async (watershedId: string) => {
    const previous = project;
    try {
      const saved = await ApiClient.deleteWatershed(project.id, watershedId);
      setProject(saved);
      showNotification('Bassin versant supprimé de la base.');
    } catch (err) {
      setProject(previous);
      showNotification(getErrorMessage(err, 'Échec de suppression du bassin versant.'), 'error');
    }
  };

  // Mise à jour d'un ouvrage hydraulique
  const handleUpdateStructure = async (updatedStructure: HydraulicStructure) => {
    const previous = project;
    const updatedStructures = project.structures.map((s) =>
      s.id === updatedStructure.id ? updatedStructure : s
    );
    setProject({ ...project, structures: updatedStructures });
    try {
      const saved = await ApiClient.updateStructure(project.id, updatedStructure);
      setProject(saved);
    } catch (err) {
      setProject(previous);
      showNotification(getErrorMessage(err, "Échec de mise à jour de l'ouvrage."), 'error');
    }
  };

  // Application d'un dimensionnement normatif optimal
  const handleApplyDimensioning = async (
    structureId: string,
    updates: Partial<HydraulicStructure>
  ) => {
    const target = project.structures.find((s) => s.id === structureId);
    if (!target) return;

    const previous = project;
    const modified: HydraulicStructure = {
      ...target,
      ...updates
    };
    const updatedStructures = project.structures.map((s) => (s.id === modified.id ? modified : s));
    setProject({ ...project, structures: updatedStructures });

    try {
      const saved = await ApiClient.updateStructure(project.id, modified);
      setProject(saved);
      showNotification('Dimensionnement optimal appliqué et enregistré en base.');
    } catch (err) {
      setProject(previous);
      showNotification(
        getErrorMessage(err, 'Échec de sauvegarde du dimensionnement optimal.'),
        'error'
      );
    }
  };

  // Mise à jour des réglages normatifs globaux
  const handleUpdateSettings = async (settings: ProjectSettings) => {
    const previous = project;
    setProject({ ...project, settings });
    try {
      const saved = await ApiClient.updateSettings(project.id, settings);
      setProject(saved);
    } catch (err) {
      setProject(previous);
      showNotification(
        getErrorMessage(err, 'Échec de mise à jour des réglages normatifs.'),
        'error'
      );
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F5F7FA] font-['Inter',sans-serif] text-slate-800">
      {/* En-tête supérieur */}
      <Header
        project={project}
        onSave={handleSave}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSaving={isSaving}
        onOpenGuide={() => setIsGuideOpen(true)}
        onNewBlankProject={handleNewBlankProject}
        onLoadReferenceProject={handleLoadReferenceProject}
        currentUser={currentUser}
        onChangeRole={handleChangeRole}
      />

      {/* Corps principal : Barre latérale + Contenu dynamique */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          project={project}
          storageStatus={storageStatus}
        />

        {/* Zone de travail principale */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          {/* Notification toast */}
          {toast && (
            <div
              role="status"
              className={`fixed top-20 right-8 z-50 px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border ${
                toast.tone === 'error'
                  ? 'bg-rose-900 text-rose-50 border-rose-500'
                  : 'bg-[#0E4A7B] text-white border-[#00A3E0]'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  toast.tone === 'error' ? 'bg-rose-400' : 'bg-cyan-400'
                }`}
              />
              <span>{toast.message}</span>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              project={project}
              setActiveTab={setActiveTab}
              onSelectStructure={(id, tab) => {
                setSelectedStructureId(id);
                setActiveTab(tab || 'hydraulics');
              }}
              onUpdateProject={handleUpdateProject}
            />
          )}

          {activeTab === 'gis' && (
            <GisMap
              project={project}
              onSelectStructure={(st) => {
                setSelectedStructureId(st.id);
                setActiveTab('hydraulics');
              }}
              onSelectWatershed={(ws) => {
                setSelectedWatershedId(ws.id);
                setActiveTab('hydrology');
              }}
            />
          )}

          {activeTab === 'hydrology' && (
            <HydrologyView
              project={project}
              selectedWatershedId={selectedWatershedId || project.watersheds[0]?.id}
              onSelectWatershed={setSelectedWatershedId}
              onDeleteWatershed={handleDeleteWatershed}
              onUpdateProject={handleUpdateProject}
            />
          )}

          {activeTab === 'hydraulics' && (
            <HydraulicsView
              project={project}
              selectedStructureId={selectedStructureId || project.structures[0]?.id}
              onSelectStructure={setSelectedStructureId}
              onAddStructure={handleAddStructure}
              onDeleteStructure={handleDeleteStructure}
              onUpdateStructure={handleUpdateStructure}
            />
          )}

          {activeTab === 'dimensioning' && (
            <DimensioningView
              project={project}
              selectedStructureId={selectedStructureId || project.structures[0]?.id}
              onSelectStructure={setSelectedStructureId}
              onApplyDimensioning={handleApplyDimensioning}
            />
          )}

          {activeTab === 'quality' && (
            <QualityView
              project={project}
              onUpdateSettings={handleUpdateSettings}
              onSelectStructureForFix={(structId) => {
                setSelectedStructureId(structId);
                setActiveTab('dimensioning');
              }}
            />
          )}

          {activeTab === 'reporting' && <ReportViewer project={project} />}

          {activeTab === 'ai' && <HydroAIAssistant project={project} />}

          {activeTab === 'desktop' && <DesktopPackagingView project={project} />}
        </main>
      </div>

      {/* Guide Interactif d'Accueil pour nouveaux utilisateurs (PARTIE F) */}
      <InteractiveGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}
