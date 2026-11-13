/**
 * OASIS HYDRO SUITE — Contrôle Qualité & Conformité Réglementaire
 * Audit exhaustif des vitesses critiques, risques d'ensablement/érosion et débordements
 */

import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  ArrowRight,
  FileCheck
} from 'lucide-react';
import { Project, HydraulicStructure, ProjectSettings } from '../../types/oasis';

interface QualityViewProps {
  project: Project;
  onUpdateSettings: (settings: ProjectSettings) => void;
  onSelectStructureForFix: (structureId: string) => void;
}

export const QualityView: React.FC<QualityViewProps> = ({
  project,
  onUpdateSettings,
  onSelectStructureForFix
}) => {
  const total = project.structures.length;
  const compliantList = project.structures.filter((s) => s.results?.status === 'COMPLIANT');
  const warningList = project.structures.filter((s) => s.results?.status === 'WARNING');
  const nonCompliantList = project.structures.filter((s) => s.results?.status === 'NON_COMPLIANT');

  const complianceRate = total > 0 ? Math.round((compliantList.length / total) * 100) : 100;

  const handleSettingChange = (field: keyof ProjectSettings, value: number) => {
    onUpdateSettings({
      ...project.settings,
      [field]: value
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full font-mono">
              Module Métier M-06
            </span>
            <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Audit Normatif Automatique
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-['Montserrat']">
            Contrôle Qualité & Conformité Hydraulique
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Vérification stricte des vitesses limites (auto-curage Vmin &ge; 0.6 m/s, anti-érosion
            Vmax &le; 4.0 m/s), des taux de remplissage et du tirant d'air de sécurité.
          </p>
        </div>

        {/* Badge Taux Global */}
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Taux de Conformité</div>
            <div className="text-xl font-bold text-slate-900">{complianceRate}%</div>
          </div>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              complianceRate === 100
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {complianceRate === 100 ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
        </div>
      </div>

      {/* Grille de 3 Statuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-emerald-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-emerald-700">Ouvrages Conformes</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{compliantList.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Critères totalement validés</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-amber-700">Avertissements</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{warningList.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Auto-curage ou tirant d'air faible
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-red-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-red-700">Non Conformes</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{nonCompliantList.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Surverse ou vitesse érosive</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Liste des anomalies et fiches correctives (8 colonnes) */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 font-['Montserrat']">
            Détail de l'Audit par Ouvrage Hydraulique
          </h3>

          <div className="space-y-3">
            {project.structures.map((struct) => {
              const res = struct.results;
              const isCompliant = res?.status === 'COMPLIANT';
              const isWarning = res?.status === 'WARNING';
              const statusBorder = isCompliant
                ? 'border-emerald-200 bg-white'
                : isWarning
                  ? 'border-amber-200 bg-amber-50/20'
                  : 'border-red-200 bg-red-50/20';

              return (
                <div
                  key={struct.id}
                  className={`p-5 rounded-2xl border shadow-sm ${statusBorder} space-y-3`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isCompliant ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                      />
                      <div>
                        <div className="font-bold text-sm text-slate-900">
                          {struct.code} — {struct.name}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          PK {Math.floor(struct.pkMeters / 1000)}+
                          {String(struct.pkMeters % 1000).padStart(3, '0')} · Q ={' '}
                          {struct.designFlowM3s.toFixed(2)} m³/s
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isCompliant
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : isWarning
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                        }`}
                      >
                        {isCompliant ? 'Conforme' : isWarning ? 'Avertissement' : 'Non Conforme'}
                      </span>
                      {!isCompliant && (
                        <button
                          onClick={() => onSelectStructureForFix(struct.id)}
                          className="text-xs font-semibold text-[#00A3E0] hover:text-[#0E4A7B] flex items-center gap-1"
                        >
                          <span>Corriger</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Indicateurs clés */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Vitesse V</span>
                      <span className="font-bold text-slate-800">
                        {res?.flowVelocityMs.toFixed(2)} m/s
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Tirant d'eau yn</span>
                      <span className="font-bold text-slate-800">
                        {res?.normalDepthM.toFixed(3)} m
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Taux Remplissage</span>
                      <span className="font-bold text-slate-800">
                        {res?.fillingRatioPercent.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Tirant d'air</span>
                      <span className="font-bold text-slate-800">
                        {res?.freeboardM.toFixed(2)} m
                      </span>
                    </div>
                  </div>

                  {/* Liste des anomalies précises */}
                  {res && res.auditIssues.length > 0 && (
                    <div className="space-y-1 pt-1 text-xs">
                      {res.auditIssues.map((issue, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-slate-700">
                          <span className="text-amber-500 font-bold shrink-0">⚠</span>
                          <span>{issue}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Paramètres de tolérances normatives éditables (4 colonnes) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <SlidersHorizontal className="w-4 h-4 text-[#00A3E0]" />
            <h3 className="text-sm font-bold text-slate-900 font-['Montserrat']">
              Seuils & Tolérances Réglementaires
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Vitesse minimale d'auto-curage Vmin (m/s)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.30"
                max="1.20"
                value={project.settings.minSelfCleaningVelocity}
                onChange={(e) =>
                  handleSettingChange('minSelfCleaningVelocity', parseFloat(e.target.value) || 0.6)
                }
                className="w-full px-3 py-1.5 border rounded-lg font-mono font-bold text-slate-800"
              />
              <span className="text-[10px] text-slate-400">Standard SETRA / Cerema : 0.60 m/s</span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Vitesse maximale béton Vmax (m/s)
              </label>
              <input
                type="number"
                step="0.25"
                min="2.00"
                max="6.00"
                value={project.settings.maxVelocityConcrete}
                onChange={(e) =>
                  handleSettingChange('maxVelocityConcrete', parseFloat(e.target.value) || 4.0)
                }
                className="w-full px-3 py-1.5 border rounded-lg font-mono font-bold text-slate-800"
              />
              <span className="text-[10px] text-slate-400">Standard anti-érosion : 4.00 m/s</span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Taux de remplissage maximal admissible (%)
              </label>
              <input
                type="number"
                step="5"
                min="50"
                max="95"
                value={Math.round(project.settings.maxFillingRatio * 100)}
                onChange={(e) =>
                  handleSettingChange('maxFillingRatio', (parseFloat(e.target.value) || 80) / 100)
                }
                className="w-full px-3 py-1.5 border rounded-lg font-mono font-bold text-slate-800"
              />
              <span className="text-[10px] text-slate-400">
                Standard de sécurité : 80% (revanche 20%)
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Tirant d'air minimal de sécurité (m)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.10"
                max="0.60"
                value={project.settings.minFreeboardM}
                onChange={(e) =>
                  handleSettingChange('minFreeboardM', parseFloat(e.target.value) || 0.25)
                }
                className="w-full px-3 py-1.5 border rounded-lg font-mono font-bold text-slate-800"
              />
              <span className="text-[10px] text-slate-400">
                Protection contre embâcles : &ge; 0.25 m
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
