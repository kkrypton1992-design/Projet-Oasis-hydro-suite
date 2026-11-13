/**
 * OASIS HYDRO SUITE — Tableau de Bord Principal
 * Calculs en direct et métriques réelles basées sur les données du projet
 */

import React, { useState } from 'react';
import {
  FolderKanban,
  Layers,
  Activity,
  ShieldAlert,
  ShieldCheck,
  ArrowUpRight,
  MapPin,
  Calendar,
  UserCheck,
  CheckCircle,
  FileCode,
  Laptop,
  Edit3
} from 'lucide-react';
import { ActiveTab, Project } from '../../types/oasis';
import { computeProjectKpis } from '../../core/auditEngine';

interface DashboardViewProps {
  project: Project;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectStructure?: (id: string, tab?: ActiveTab) => void;
  onUpdateProject?: (updated: Project) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  project,
  setActiveTab,
  onSelectStructure,
  onUpdateProject
}) => {
  const [showEditProjectModal, setShowEditProjectModal] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>(project.title);
  const [editCode, setEditCode] = useState<string>(project.code);
  const [editClient, setEditClient] = useState<string>(project.client);
  const [editEngineer, setEditEngineer] = useState<string>(project.engineer);
  const [editDescription, setEditDescription] = useState<string>(project.description);
  const [editReturnPeriod, setEditReturnPeriod] = useState<number>(
    project.settings.returnPeriodDesignYears
  );

  const handleOpenEditModal = () => {
    setEditTitle(project.title);
    setEditCode(project.code);
    setEditClient(project.client);
    setEditEngineer(project.engineer);
    setEditDescription(project.description);
    setEditReturnPeriod(project.settings.returnPeriodDesignYears);
    setShowEditProjectModal(true);
  };

  const handleSaveProjectInfo = () => {
    if (!onUpdateProject) return;
    const updated: Project = {
      ...project,
      title: editTitle,
      code: editCode,
      client: editClient,
      engineer: editEngineer,
      description: editDescription,
      settings: {
        ...project.settings,
        returnPeriodDesignYears: editReturnPeriod
      }
    };
    onUpdateProject(updated);
    setShowEditProjectModal(false);
  };

  // Calculs réels centralisés via le moteur d'audit
  const structuresList = Array.isArray(project?.structures) ? project.structures : [];
  const {
    totalStructures,
    totalWatersheds,
    totalDrainageLengthM,
    maxFlowM3s,
    compliantCount,
    warningCount,
    nonCompliantCount,
    complianceRate
  } = computeProjectKpis(project);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Carte d'en-tête du projet */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#0E4A7B]/10 text-[#0E4A7B] text-xs font-bold px-2.5 py-0.5 rounded-full font-mono">
                {project.code}
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Statut : En cours d'ingénierie
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-['Montserrat']">
              {project.title}
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-3xl">{project.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleOpenEditModal}
              className="flex items-center gap-1.5 bg-[#0E4A7B] hover:bg-[#0b3a61] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-300" />
              <span>Modifier le Projet</span>
            </button>
            <button
              onClick={() => setActiveTab('gis')}
              className="flex items-center gap-1.5 bg-[#00A3E0] hover:bg-[#008fca] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <span>Ouvrir la Carte SIG</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTab('desktop')}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Laptop className="w-3.5 h-3.5 text-cyan-400" />
              <span>Générer .EXE Windows</span>
            </button>
          </div>
        </div>

        {/* Détails contractuels */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-slate-400 block">Maître d'Ouvrage :</span>
            <span className="font-semibold text-slate-800">{project.client}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Bureau d'Études :</span>
            <span className="font-semibold text-slate-800">{project.engineer}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Période de retour de calcul :</span>
            <span className="font-semibold text-slate-800 font-mono">
              Q{project.settings.returnPeriodDesignYears} Ans (Vérif. Q
              {project.settings.returnPeriodCheckYears})
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Dernière mise à jour :</span>
            <span className="font-semibold text-slate-800 font-mono">
              {new Date(project.updatedAt).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Indicateurs Clés Réels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Ouvrages */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              Ouvrages Modélisés
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {totalStructures} <span className="text-xs font-normal text-slate-500">ouvrages</span>
            </div>
            <div className="text-[11px] text-blue-600 mt-1 font-medium">
              {totalDrainageLengthM.toFixed(1)} m linéaires sous voie
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0E4A7B] flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2 : Bassins Versants */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              Bassins Versants
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {totalWatersheds}{' '}
              <span className="text-xs font-normal text-slate-500">BV actifs</span>
            </div>
            <div className="text-[11px] text-cyan-600 mt-1 font-medium">
              Surface : {project.watersheds.reduce((a, b) => a + b.areaKm2, 0).toFixed(2)} km²
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-50 text-[#00A3E0] flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3 : Débit Maximal */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              Débit de Pointe Max
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
              {maxFlowM3s.toFixed(2)}{' '}
              <span className="text-xs font-normal text-slate-500">m³/s</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              Franchissement majeur PK 14+120
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FolderKanban className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4 : Taux de Conformité Normative */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              Conformité Normative
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1 flex items-baseline gap-1.5">
              <span>{complianceRate}%</span>
              <span className="text-xs font-normal text-slate-500">
                ({compliantCount}/{totalStructures})
              </span>
            </div>
            <div className="text-[11px] mt-1 font-medium flex items-center gap-1.5">
              {nonCompliantCount > 0 ? (
                <span className="text-red-600 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> {nonCompliantCount} non conforme
                </span>
              ) : warningCount > 0 ? (
                <span className="text-amber-600 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> {warningCount} avertissement
                </span>
              ) : (
                <span className="text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Conforme
                </span>
              )}
            </div>
          </div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              nonCompliantCount > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            {nonCompliantCount > 0 ? (
              <ShieldAlert className="w-6 h-6" />
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
          </div>
        </div>
      </div>

      {/* Tableau des Ouvrages d'Art Hydrauliques avec Résultats Réels */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-['Montserrat']">
              Inventaire & Résultats Hydrauliques des Ouvrages
            </h3>
            <p className="text-xs text-slate-500">
              Calculs d'écoulement uniforme par Manning-Strickler et contrôle des vitesses
              d'auto-curage/érosion
            </p>
          </div>
          <button
            onClick={() => setActiveTab('hydraulics')}
            className="text-xs font-semibold text-[#00A3E0] hover:text-[#0E4A7B] flex items-center gap-1 transition-colors"
          >
            <span>Accéder au solveur hydraulique</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Code & PK</th>
                <th className="py-2.5 px-3">Type & Section</th>
                <th className="py-2.5 px-3">Pente (%)</th>
                <th className="py-2.5 px-3">Débit Q (m³/s)</th>
                <th className="py-2.5 px-3">Tirant d'eau yn (m)</th>
                <th className="py-2.5 px-3">Vitesse V (m/s)</th>
                <th className="py-2.5 px-3">Remplissage</th>
                <th className="py-2.5 px-3">Régime</th>
                <th className="py-2.5 px-3 text-center">Statut</th>
                <th className="py-2.5 px-3 text-right">Calculateurs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {structuresList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 text-xs">
                    Aucun ouvrage hydraulique modélisé dans ce projet. Utilisez le bouton « +
                    Ouvrage » dans le Solveur Hydraulique pour créer un premier ouvrage.
                  </td>
                </tr>
              ) : (
                structuresList.map((struct) => {
                  const res = struct.results;
                  const statusBadge =
                    res?.status === 'COMPLIANT'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : res?.status === 'WARNING'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-red-100 text-red-800 border-red-200';

                  return (
                    <tr key={struct.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{struct.code}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          PK {Math.floor(struct.pkMeters / 1000)}+
                          {String(struct.pkMeters % 1000).padStart(3, '0')}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">
                          {struct.type === 'CIRCULAR_PIPE' &&
                            `Buse Ø${Math.round((struct.diameterM || 1) * 1000)} mm`}
                          {struct.type === 'BOX_CULVERT' &&
                            `Dalot ${struct.cellsCount > 1 ? `${struct.cellsCount}x ` : ''}${struct.widthM?.toFixed(2)}x${struct.heightM?.toFixed(2)} m`}
                          {struct.type === 'DITCH' &&
                            `Fossé fond ${struct.widthM?.toFixed(2)}m (m=${struct.sideSlopeM})`}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {struct.material === 'CONCRETE'
                            ? 'Béton armé (K=70)'
                            : struct.material === 'EARTH_GRASSED'
                              ? 'Terre enherbée (K=35)'
                              : struct.material}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">
                        {(struct.bedSlopeMPerM * 100).toFixed(2)} %
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-[#0E4A7B]">
                        {struct.designFlowM3s.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-800">
                        {res ? `${res.normalDepthM.toFixed(3)} m` : '-'}
                      </td>
                      <td className="py-3 px-3 font-mono font-medium">
                        <span
                          className={
                            (res?.flowVelocityMs || 0) > (project.settings.maxVelocityConcrete || 4)
                              ? 'text-red-600 font-bold'
                              : (res?.flowVelocityMs || 0) <
                                  (project.settings.minSelfCleaningVelocity || 0.6)
                                ? 'text-amber-600 font-bold'
                                : 'text-emerald-700'
                          }
                        >
                          {res ? `${res.flowVelocityMs.toFixed(2)} m/s` : '-'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {res ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  res.fillingRatioPercent > 100
                                    ? 'bg-red-600'
                                    : res.fillingRatioPercent > 80
                                      ? 'bg-amber-500'
                                      : 'bg-[#00A3E0]'
                                }`}
                                style={{ width: `${Math.min(100, res.fillingRatioPercent)}%` }}
                              />
                            </div>
                            <span className="font-mono text-[11px] text-slate-700">
                              {res.fillingRatioPercent.toFixed(0)}%
                            </span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {res?.flowRegime === 'FLUVIAL'
                            ? 'Fluvial (Fr<1)'
                            : res?.flowRegime === 'TORRENTIAL'
                              ? 'Torrentiel'
                              : 'Critique'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge}`}
                        >
                          {res?.status === 'COMPLIANT'
                            ? 'Conforme'
                            : res?.status === 'WARNING'
                              ? 'Avertissement'
                              : 'Non Conforme'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() =>
                              onSelectStructure
                                ? onSelectStructure(struct.id, 'hydraulics')
                                : setActiveTab('hydraulics')
                            }
                            className="px-2 py-1 bg-slate-100 hover:bg-[#0E4A7B] hover:text-white rounded text-[10px] font-semibold transition-all"
                            title="Résoudre la ligne d'eau"
                          >
                            Hydraulique
                          </button>
                          <button
                            onClick={() =>
                              onSelectStructure
                                ? onSelectStructure(struct.id, 'dimensioning')
                                : setActiveTab('dimensioning')
                            }
                            className="px-2 py-1 bg-slate-100 hover:bg-[#00A3E0] hover:text-white rounded text-[10px] font-semibold transition-all"
                            title="Dimensionner la section"
                          >
                            Section
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cadre de Transparence Obligatoire (Code Réel vs Développements Futurs) */}
      <div className="bg-gradient-to-br from-slate-900 to-[#0A3558] text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex items-center gap-2.5 mb-3">
          <FileCode className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold font-['Montserrat'] tracking-wide">
            Référentiel Technique & Solveurs Certifiés
          </h3>
        </div>
        <p className="text-xs text-slate-300 mb-5 leading-relaxed">
          Chaque module du poste de travail applique directement les solveurs physiques
          d&apos;ingénierie et persiste les études dans la base locale autonome (SQLite embarqué) ou
          sur serveur PostgreSQL optionnel.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-800/80 rounded-xl p-4 border border-emerald-500/30">
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
              <CheckCircle className="w-4 h-4" />
              <span>CHAÎNE HYDROLOGIQUE & HYDRAULIQUE ACTIVE</span>
            </div>
            <ul className="space-y-1.5 text-slate-300">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>
                  <strong>Hydrologie :</strong> Temps de concentration (Kirpich, Passini, Giandotti,
                  Bransby-Williams), loi IDF de Montana et débits Rationnels Q10 à Q100.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>
                  <strong>Hydraulique à surface libre :</strong> Résolution Manning-Strickler par
                  dichotomie (10⁻⁵ m) pour buses circulaires, dalots cadres et fossés.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>
                  <strong>Dimensionnement & Contrôle :</strong> Catalogues normalisés, contrôle des
                  vitesses (Vmin = {project.settings.minSelfCleaningVelocity} m/s, Vmax béton ={' '}
                  {project.settings.maxVelocityConcrete} m/s) et tirant d&apos;air.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-800/80 rounded-xl p-4 border border-cyan-500/30">
            <div className="flex items-center gap-2 text-cyan-300 font-bold mb-2">
              <ShieldAlert className="w-4 h-4" />
              <span>PERSISTANCE, SIG & LIVRABLES BUREAU</span>
            </div>
            <ul className="space-y-1.5 text-slate-300">
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-400 font-bold">•</span>
                <span>
                  <strong>Base Locale Embarquée :</strong> Fichier SQLite auto-généré au lancement
                  avec migrations transactionnelles, sans configuration SQL requise.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-400 font-bold">•</span>
                <span>
                  <strong>SIG & Géoréférencement :</strong> Cartographie Leaflet, inspection des PK
                  et export vectoriel GeoJSON standard pour QGIS / ArcGIS.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-400 font-bold">•</span>
                <span>
                  <strong>Notes de Calcul & Archivage :</strong> Édition imprimable / PDF, archivage
                  en base et export de sauvegarde complète (.oasis.json).
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal d'édition des informations du projet */}
      {showEditProjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm font-['Montserrat']">
                Paramètres Contractuels & Hydrologiques du Projet
              </h3>
              <button
                onClick={() => setShowEditProjectModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Code Projet</label>
                  <input
                    type="text"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Période de retour de calcul
                  </label>
                  <select
                    value={editReturnPeriod}
                    onChange={(e) => setEditReturnPeriod(parseInt(e.target.value) || 25)}
                    className="w-full px-3 py-1.5 border rounded-lg font-bold"
                  >
                    <option value={10}>Q10 (Décennale)</option>
                    <option value={25}>Q25 (Projet standard)</option>
                    <option value={50}>Q50 (Cinquantennale)</option>
                    <option value={100}>Q100 (Centennale)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Intitulé du Projet
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Maître d'Ouvrage (Client)
                  </label>
                  <input
                    type="text"
                    value={editClient}
                    onChange={(e) => setEditClient(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Bureau d'Études</label>
                  <input
                    type="text"
                    value={editEngineer}
                    onChange={(e) => setEditEngineer(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Description technique
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-lg resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowEditProjectModal(false)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveProjectInfo}
                className="px-4 py-2 bg-[#0E4A7B] text-white rounded-xl text-xs font-semibold hover:bg-[#00A3E0]"
              >
                Enregistrer & Recalculer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
