/**
 * OASIS HYDRO SUITE — Module de Dimensionnement Automatique & Catalogue Normé
 * Recherche de la section optimale d'ouvrage (Buses, Dalots simples & multiples)
 */

import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Check,
  ArrowRight,
  HelpCircle,
  ShieldCheck,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { HydraulicStructure, Project } from '../../types/oasis';
import { recommendOptimalStructure } from '../../core/hydraulicEngine';

interface DimensioningViewProps {
  project: Project;
  onApplyDimensioning: (structureId: string, updates: Partial<HydraulicStructure>) => void;
  selectedStructureId?: string;
  onSelectStructure?: (id: string) => void;
}

export const DimensioningView: React.FC<DimensioningViewProps> = ({
  project,
  onApplyDimensioning,
  selectedStructureId: controlledStructureId,
  onSelectStructure
}) => {
  const [internalStructureId, setInternalStructureId] = useState<string>(
    project.structures[0]?.id || ''
  );
  const selectedStructureId = controlledStructureId || internalStructureId;
  const setSelectedStructureId = onSelectStructure || setInternalStructureId;
  const [targetType, setTargetType] = useState<'CIRCULAR_PIPE' | 'BOX_CULVERT'>('BOX_CULVERT');

  const activeStructure =
    project.structures.find((s) => s.id === selectedStructureId) || project.structures[0];

  // Calcul de la proposition optimale par le moteur expert
  const recommendation = activeStructure
    ? recommendOptimalStructure(
        targetType,
        activeStructure.designFlowM3s,
        activeStructure.bedSlopeMPerM,
        project.settings
      )
    : null;

  const handleApply = () => {
    if (!activeStructure || !recommendation) return;

    if (targetType === 'CIRCULAR_PIPE' && recommendation.recommendedDiameterM) {
      onApplyDimensioning(activeStructure.id, {
        type: 'CIRCULAR_PIPE',
        diameterM: recommendation.recommendedDiameterM,
        cellsCount: recommendation.recommendedCells,
        widthM: undefined,
        heightM: undefined
      });
    } else if (
      targetType === 'BOX_CULVERT' &&
      recommendation.recommendedWidthM &&
      recommendation.recommendedHeightM
    ) {
      onApplyDimensioning(activeStructure.id, {
        type: 'BOX_CULVERT',
        widthM: recommendation.recommendedWidthM,
        heightM: recommendation.recommendedHeightM,
        cellsCount: recommendation.recommendedCells,
        diameterM: undefined
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-0.5 rounded-full font-mono">
              Module Métier M-05
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" /> Optimisation Catalogue Normatif
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-['Montserrat']">
            Dimensionnement & Sélection des Ouvrages
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Détermination automatique de la géométrie minimale garantissant un taux de remplissage
            &le; 80%, la vitesse d'auto-curage et le tirant d'air réglementaire.
          </p>
        </div>

        {/* Sélecteur d'ouvrage à dimensionner */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Ouvrage cible :</label>
          <select
            value={selectedStructureId}
            onChange={(e) => setSelectedStructureId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
          >
            {project.structures.map((st) => (
              <option key={st.id} value={st.id}>
                {st.code} — Q = {st.designFlowM3s.toFixed(2)} m³/s (Pente:{' '}
                {(st.bedSlopeMPerM * 100).toFixed(2)}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeStructure && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Fiche Technique Actuelle (4 colonnes) */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 font-['Montserrat']">
              État Actuel de l'Ouvrage
            </h3>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Identifiant :</span>
                <span className="font-bold text-slate-800 font-mono">{activeStructure.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Localisation :</span>
                <span className="font-mono text-slate-800">
                  PK {Math.floor(activeStructure.pkMeters / 1000)}+
                  {String(activeStructure.pkMeters % 1000).padStart(3, '0')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Débit de calcul Q :</span>
                <span className="font-mono font-bold text-[#0E4A7B]">
                  {activeStructure.designFlowM3s.toFixed(2)} m³/s
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pente du radier S₀ :</span>
                <span className="font-mono text-slate-800">
                  {(activeStructure.bedSlopeMPerM * 100).toFixed(2)} %
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Section existante :</span>
                <span className="font-semibold text-slate-800">
                  {activeStructure.type === 'CIRCULAR_PIPE' &&
                    `Buse Ø${Math.round((activeStructure.diameterM || 1) * 1000)} mm`}
                  {activeStructure.type === 'BOX_CULVERT' &&
                    `Dalot ${activeStructure.cellsCount > 1 ? `${activeStructure.cellsCount}x ` : ''}${activeStructure.widthM?.toFixed(2)}x${activeStructure.heightM?.toFixed(2)} m`}
                  {activeStructure.type === 'DITCH' && 'Fossé trapézoïdal'}
                </span>
              </div>
            </div>

            {activeStructure.results && (
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs space-y-1">
                <div className="text-[10px] text-[#0E4A7B] uppercase font-bold">
                  Performances hydrauliques actuelles :
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Vitesse réelle V :</span>
                  <span className="font-mono font-bold text-slate-900">
                    {activeStructure.results.flowVelocityMs.toFixed(2)} m/s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Taux de remplissage :</span>
                  <span className="font-mono font-bold text-slate-900">
                    {activeStructure.results.fillingRatioPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tirant d'air :</span>
                  <span className="font-mono font-bold text-slate-900">
                    {activeStructure.results.freeboardM.toFixed(2)} m
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Proposition Optimale & Catalogue (8 colonnes) */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-['Montserrat']">
                  Moteur d'Optimisation Normative
                </h3>
                <p className="text-xs text-slate-500">
                  Choisissez la famille technique recherchée pour calculer la section optimale
                </p>
              </div>

              {/* Commutateur Buse vs Dalot */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setTargetType('BOX_CULVERT')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    targetType === 'BOX_CULVERT'
                      ? 'bg-[#0E4A7B] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dalot Cadre Rectangulaire
                </button>
                <button
                  onClick={() => setTargetType('CIRCULAR_PIPE')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    targetType === 'CIRCULAR_PIPE'
                      ? 'bg-[#0E4A7B] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Buse Circulaire
                </button>
              </div>
            </div>

            {/* Cartouche de la Recommandation Optimale */}
            {recommendation && (
              <div className="bg-gradient-to-br from-slate-900 to-[#0A3558] text-white p-6 rounded-2xl shadow-md border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs text-cyan-300 font-bold uppercase tracking-wider">
                        Dimensionnement Optimisé Recommandé
                      </div>
                      <div className="text-lg font-bold font-['Montserrat']">
                        {targetType === 'CIRCULAR_PIPE'
                          ? `${recommendation.recommendedCells > 1 ? `${recommendation.recommendedCells}x ` : ''}Buse Circulaire Ø${Math.round((recommendation.recommendedDiameterM || 1) * 1000)} mm`
                          : `${recommendation.recommendedCells > 1 ? `${recommendation.recommendedCells}x ` : ''}Dalot Cadre ${recommendation.recommendedWidthM?.toFixed(2)} m x ${recommendation.recommendedHeightM?.toFixed(2)} m`}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleApply}
                    className="flex items-center gap-2 bg-[#00A3E0] hover:bg-[#008fca] active:scale-95 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Appliquer à l'Ouvrage</span>
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
                  {recommendation.explanation}
                </p>

                {/* Justifications techniques normatives */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Taux de remplissage &le; 80%</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Auto-curage (V &ge; 0.6 m/s)</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Tirant d'air de sécurité &ge; 0.25 m</span>
                  </div>
                </div>
              </div>
            )}

            {/* Catalogue standard des sections normalisées du génie civil */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Catalogue Industriel des Éléments Préfabriqués Normalisés
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {targetType === 'CIRCULAR_PIPE'
                  ? [0.6, 0.8, 1.0, 1.2, 1.4, 1.5, 1.8, 2.0].map((dia) => (
                      <div
                        key={dia}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-center transition-colors"
                      >
                        <div className="font-bold text-slate-800 font-mono">
                          Ø {Math.round(dia * 1000)} mm
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Section : {((Math.PI * dia * dia) / 4).toFixed(2)} m²
                        </div>
                      </div>
                    ))
                  : [
                      '1.00 x 1.00 m',
                      '1.50 x 1.00 m',
                      '1.50 x 1.50 m',
                      '2.00 x 1.50 m',
                      '2.00 x 2.00 m',
                      '2.50 x 1.50 m',
                      '3.00 x 2.00 m',
                      '4.00 x 2.50 m'
                    ].map((dim) => (
                      <div
                        key={dim}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-center transition-colors"
                      >
                        <div className="font-bold text-slate-800 font-mono">{dim}</div>
                        <div className="text-[10px] text-slate-400">Béton armé C35/45</div>
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
