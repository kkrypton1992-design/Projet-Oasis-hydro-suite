/**
 * OASIS HYDRO SUITE — Solveur Hydraulique Manning-Strickler Certifié
 * Résolution numérique exacte des équations d'écoulement à surface libre
 * et rendu SVG géométrique de la section transversale en eau.
 */

import React, { useState } from 'react';
import {
  Activity,
  Sliders,
  Layers,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { HydraulicStructure, Project, StructureType, MaterialType } from '../../types/oasis';
import {
  calculateHydraulicBehavior,
  MATERIAL_STRICKLER_DEFAULTS
} from '../../core/hydraulicEngine';

interface HydraulicsViewProps {
  project: Project;
  onUpdateStructure: (updated: HydraulicStructure) => void;
  selectedStructureId?: string | null;
  onSelectStructure?: (id: string) => void;
  onAddStructure?: (structure: HydraulicStructure) => void;
  onDeleteStructure?: (id: string) => void;
}

export const HydraulicsView: React.FC<HydraulicsViewProps> = ({
  project,
  onUpdateStructure,
  selectedStructureId: controlledStructureId,
  onSelectStructure,
  onAddStructure,
  onDeleteStructure
}) => {
  const [internalStructureId, setInternalStructureId] = useState<string>(
    project.structures[0]?.id || ''
  );
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Formulaire d'ajout
  const [newCode, setNewCode] = useState<string>('OH-05');
  const [newName, setNewName] = useState<string>('Nouvel ouvrage sous chaussée');
  const [newPk, setNewPk] = useState<number>(21500);
  const [newType, setNewType] = useState<StructureType>('CIRCULAR_PIPE');
  const [newWatershedId, setNewWatershedId] = useState<string>(project.watersheds[0]?.id || '');
  const [newDiameter, setNewDiameter] = useState<number>(1.2);
  const [newWidth, setNewWidth] = useState<number>(2.5);
  const [newHeight, setNewHeight] = useState<number>(1.5);
  const [newSlope, setNewSlope] = useState<number>(0.008);
  const [drawingMode, setDrawingMode] = useState<'transverse' | 'longitudinal'>('transverse');
  const [pendingDeleteConfirm, setPendingDeleteConfirm] = useState<boolean>(false);
  const [actionWarning, setActionWarning] = useState<string | null>(null);

  const selectedStructureId = controlledStructureId || internalStructureId;

  const activeStructure =
    project.structures.find((s) => s.id === selectedStructureId) || project.structures[0];

  const handleSelect = (id: string) => {
    setInternalStructureId(id);
    if (onSelectStructure) onSelectStructure(id);
  };

  // Calcul hydraulique en direct
  const results = activeStructure
    ? calculateHydraulicBehavior(activeStructure, project.settings)
    : null;

  // Modification atomique d'un ou plusieurs paramètres
  const handlePatchStructure = (patch: Partial<HydraulicStructure>) => {
    if (!activeStructure) return;
    const updated: HydraulicStructure = {
      ...activeStructure,
      ...patch
    };
    const newResults = calculateHydraulicBehavior(updated, project.settings);
    onUpdateStructure({
      ...updated,
      results: newResults
    });
  };

  const handleParamChange = <K extends keyof HydraulicStructure>(
    field: K,
    value: HydraulicStructure[K]
  ) => {
    handlePatchStructure({ [field]: value } as Partial<HydraulicStructure>);
  };

  const handleCreateStructure = () => {
    const matchedWs = project.watersheds.find((w) => w.id === newWatershedId);
    const flow = matchedWs?.calculatedFlows?.q25 || 2.5;

    const newStruct: HydraulicStructure = {
      id: `oh-${Date.now()}`,
      code: newCode,
      name: newName,
      pkMeters: Number(newPk),
      type: newType,
      material: 'CONCRETE',
      stricklerK: 70,
      diameterM: newType === 'CIRCULAR_PIPE' ? Number(newDiameter) : undefined,
      widthM: newType !== 'CIRCULAR_PIPE' ? Number(newWidth) : undefined,
      heightM: newType !== 'CIRCULAR_PIPE' ? Number(newHeight) : undefined,
      cellsCount: 1,
      lengthM: 25.0,
      bedSlopeMPerM: Number(newSlope),
      watershedId: newWatershedId || project.watersheds[0]?.id || '',
      designFlowM3s: Number(flow.toFixed(2)),

      checkFlowM3s: Number((flow * 1.35).toFixed(2)),
      position: {
        lat: 43.64 + (Math.random() - 0.5) * 0.05,
        lng: 1.5 + (Math.random() - 0.5) * 0.05
      }
    };

    if (onAddStructure) {
      onAddStructure(newStruct);
    }
    handleSelect(newStruct.id);
    setShowAddModal(false);
  };

  const handleDelete = () => {
    if (!activeStructure) return;
    if (project.structures.length <= 1) {
      setActionWarning('Le projet doit comporter au moins un ouvrage hydraulique.');
      return;
    }
    setActionWarning(null);
    setPendingDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (!activeStructure) return;
    setPendingDeleteConfirm(false);
    if (onDeleteStructure) {
      onDeleteStructure(activeStructure.id);
      const remaining = project.structures.filter((s) => s.id !== activeStructure.id);
      if (remaining.length > 0) {
        handleSelect(remaining[0].id);
      }
    }
  };

  const linkedWatershed = project.watersheds.find((w) => w.id === activeStructure?.watershedId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-[#0E4A7B] text-xs font-bold px-2.5 py-0.5 rounded-full font-mono">
              Module Métier M-04
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Écoulement Uniforme & Régimes de Froude
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-['Montserrat']">
            Solveur Hydraulique Manning-Strickler (Ligne d'Eau)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Résolution par dichotomie de l'équation implicite : Q = K · S · Rh^(2/3) · √S₀. Calcul
            des hauteurs normale yn, critique yc et vitesses d'écoulement.
          </p>
        </div>

        {/* Actions & Sélecteur d'ouvrage */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Ouvrage :</label>
            <select
              value={activeStructure?.id || ''}
              onChange={(e) => handleSelect(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            >
              {project.structures.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.code} — PK {Math.floor(st.pkMeters / 1000)}+
                  {String(st.pkMeters % 1000).padStart(3, '0')} ({st.name})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-[#00A3E0] hover:bg-[#008fca] text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <span>+ Ouvrage</span>
          </button>

          {project.structures.length > 1 && (
            <button
              onClick={handleDelete}
              className="px-2.5 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold transition-all"
              title="Supprimer cet ouvrage"
            >
              Supprimer
            </button>
          )}
        </div>
      </div>

      {actionWarning && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between">
          <span>{actionWarning}</span>
          <button onClick={() => setActionWarning(null)} className="font-bold underline">
            Fermer
          </button>
        </div>
      )}

      {pendingDeleteConfirm && activeStructure && (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 px-4 py-3 rounded-xl text-xs flex flex-wrap items-center justify-between gap-3">
          <span>
            Confirmer la suppression définitive de l'ouvrage <strong>{activeStructure.code}</strong>{' '}
            ({activeStructure.name}) ?
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPendingDeleteConfirm(false)}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg font-semibold text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-3 py-1 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700"
            >
              Confirmer la suppression
            </button>
          </div>
        </div>
      )}

      {activeStructure && results && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Colonne Gauche : Paramètres Géométriques & Hydrauliques (5 colonnes) */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm font-['Montserrat'] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#00A3E0]" />
                <span>Paramètres de Calcul</span>
              </h3>
              <span className="text-xs font-mono font-bold text-[#0E4A7B]">
                {activeStructure.code}
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Type de profil */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Type d'Ouvrage</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleParamChange('type', 'CIRCULAR_PIPE')}
                    className={`py-2 px-2 rounded-xl font-bold border transition-all ${
                      activeStructure.type === 'CIRCULAR_PIPE'
                        ? 'bg-[#0E4A7B] text-white border-[#0E4A7B] shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Buse Circulaire
                  </button>
                  <button
                    onClick={() => handleParamChange('type', 'BOX_CULVERT')}
                    className={`py-2 px-2 rounded-xl font-bold border transition-all ${
                      activeStructure.type === 'BOX_CULVERT'
                        ? 'bg-[#0E4A7B] text-white border-[#0E4A7B] shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Dalot Cadre
                  </button>
                  <button
                    onClick={() => handleParamChange('type', 'DITCH')}
                    className={`py-2 px-2 rounded-xl font-bold border transition-all ${
                      activeStructure.type === 'DITCH'
                        ? 'bg-[#0E4A7B] text-white border-[#0E4A7B] shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Fossé Trapézoïdal
                  </button>
                </div>
              </div>

              {/* Dimensions spécifiques selon le type */}
              {activeStructure.type === 'CIRCULAR_PIPE' && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Diamètre Intérieur D (mètres)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="0.10"
                      min="0.30"
                      max="3.00"
                      value={activeStructure.diameterM || 1.2}
                      onChange={(e) =>
                        handleParamChange('diameterM', parseFloat(e.target.value) || 1.0)
                      }
                      className="w-24 px-3 py-1.5 border rounded-lg font-mono font-bold text-slate-800"
                    />
                    <span className="text-slate-500 font-mono">
                      Ø {Math.round((activeStructure.diameterM || 1.2) * 1000)} mm
                    </span>
                  </div>
                </div>
              )}

              {activeStructure.type === 'BOX_CULVERT' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Largeur intérieure B (m)
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="0.50"
                      max="6.00"
                      value={activeStructure.widthM || 2.5}
                      onChange={(e) =>
                        handleParamChange('widthM', parseFloat(e.target.value) || 1.0)
                      }
                      className="w-full px-3 py-1.5 border rounded-lg font-mono font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Hauteur intérieure H (m)
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="0.50"
                      max="4.00"
                      value={activeStructure.heightM || 1.5}
                      onChange={(e) =>
                        handleParamChange('heightM', parseFloat(e.target.value) || 1.0)
                      }
                      className="w-full px-3 py-1.5 border rounded-lg font-mono font-bold text-slate-800"
                    />
                  </div>
                </div>
              )}

              {activeStructure.type === 'DITCH' && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Largeur fond b (m)
                    </label>
                    <input
                      type="number"
                      step="0.10"
                      min="0"
                      value={activeStructure.widthM || 0.8}
                      onChange={(e) => handleParamChange('widthM', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 border rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Fruit berge m</label>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      value={activeStructure.sideSlopeM || 1.5}
                      onChange={(e) =>
                        handleParamChange('sideSlopeM', parseFloat(e.target.value) || 1.5)
                      }
                      className="w-full px-2 py-1.5 border rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Profondeur H (m)
                    </label>
                    <input
                      type="number"
                      step="0.10"
                      min="0.3"
                      value={activeStructure.heightM || 1.2}
                      onChange={(e) =>
                        handleParamChange('heightM', parseFloat(e.target.value) || 1.0)
                      }
                      className="w-full px-2 py-1.5 border rounded-lg font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              {/* Nombre de pertuis (pour dalots ou buses multiples) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Nombre de Pertuis N
                  </label>
                  <select
                    value={activeStructure.cellsCount || 1}
                    onChange={(e) => handleParamChange('cellsCount', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 border rounded-lg font-mono font-bold"
                  >
                    <option value={1}>1 pertuis (Simple)</option>
                    <option value={2}>2 pertuis (Double)</option>
                    <option value={3}>3 pertuis (Triple)</option>
                    <option value={4}>4 pertuis (Quadruple)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Matériau de paroi
                  </label>
                  <select
                    value={activeStructure.material}
                    onChange={(e) => {
                      const mat = e.target.value as MaterialType;
                      const k = MATERIAL_STRICKLER_DEFAULTS[mat] ?? 70;
                      handlePatchStructure({ material: mat, stricklerK: k });
                    }}
                    className="w-full px-3 py-1.5 border rounded-lg font-semibold"
                  >
                    <option value="CONCRETE">Béton armé (K=70)</option>
                    <option value="HDPE">PEHD lisse (K=80)</option>
                    <option value="CORRUGATED_STEEL">Métal ondulé (K=45)</option>
                    <option value="EARTH_GRASSED">Terre enherbée (K=35)</option>
                  </select>
                </div>
              </div>

              {/* Bassin Versant d'Apport (Chaîne Hydrologie -> Hydraulique) */}
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#0E4A7B] text-xs flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Bassin Versant d'Apport</span>
                  </label>
                  <span className="text-[10px] text-blue-600 font-semibold font-mono">
                    Asservissement Hydro
                  </span>
                </div>
                <select
                  value={activeStructure.watershedId || ''}
                  onChange={(e) => {
                    const wsId = e.target.value;
                    const ws = project.watersheds.find((w) => w.id === wsId);
                    handlePatchStructure({
                      watershedId: wsId || '',
                      ...(ws && ws.calculatedFlows ? { designFlowM3s: ws.calculatedFlows.q25 } : {})
                    });
                  }}
                  className="w-full px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-semibold text-slate-800"
                >
                  <option value="">(Débit imposé manuellement / sans BV)</option>
                  {project.watersheds.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.code} — {w.name} (Q25 ={' '}
                      {w.calculatedFlows?.q25 ? `${w.calculatedFlows.q25} m³/s` : '-'})
                    </option>
                  ))}
                </select>

                {linkedWatershed && (
                  <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1">
                    <span>
                      Q25 hydrologique calculé :{' '}
                      <strong>{linkedWatershed.calculatedFlows?.q25 || '-'} m³/s</strong>
                    </span>
                    {linkedWatershed.calculatedFlows &&
                      activeStructure.designFlowM3s !== linkedWatershed.calculatedFlows.q25 && (
                        <button
                          onClick={() =>
                            handleParamChange('designFlowM3s', linkedWatershed.calculatedFlows!.q25)
                          }
                          className="text-[10px] bg-[#0E4A7B] text-white px-2 py-0.5 rounded font-semibold hover:bg-[#00A3E0]"
                        >
                          Synchroniser
                        </button>
                      )}
                  </div>
                )}
              </div>

              {/* Paramètres d'écoulement Q, Pente S0, Strickler K */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Débit de projet Q :</span>
                  <div className="flex items-center gap-1 font-mono">
                    <input
                      type="number"
                      step="0.10"
                      min="0.05"
                      value={activeStructure.designFlowM3s}
                      onChange={(e) =>
                        handleParamChange('designFlowM3s', parseFloat(e.target.value) || 0.1)
                      }
                      className="w-20 px-2 py-1 border rounded text-right font-bold text-[#0E4A7B]"
                    />
                    <span className="text-slate-500 text-xs">m³/s</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Pente du radier S₀ :</span>
                  <div className="flex items-center gap-1 font-mono">
                    <input
                      type="number"
                      step="0.001"
                      min="0.0001"
                      max="0.15"
                      value={activeStructure.bedSlopeMPerM}
                      onChange={(e) =>
                        handleParamChange('bedSlopeMPerM', parseFloat(e.target.value) || 0.005)
                      }
                      className="w-20 px-2 py-1 border rounded text-right font-bold text-slate-800"
                    />
                    <span className="text-slate-500 text-xs">
                      m/m ({(activeStructure.bedSlopeMPerM * 100).toFixed(2)}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Rugosité Strickler K :</span>
                  <div className="flex items-center gap-1 font-mono">
                    <input
                      type="number"
                      step="5"
                      min="15"
                      max="100"
                      value={activeStructure.stricklerK}
                      onChange={(e) =>
                        handleParamChange('stricklerK', parseInt(e.target.value) || 70)
                      }
                      className="w-20 px-2 py-1 border rounded text-right font-bold text-slate-800"
                    />
                    <span className="text-slate-500 text-xs">m^(1/3)/s</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne Droite : Représentation Géométrique SVG & Résultats (7 colonnes) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Visualisation graphique SVG avec bascule Profil Travers / Profil Long */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
                    <button
                      onClick={() => setDrawingMode('transverse')}
                      className={`px-3 py-1 rounded-md transition-all ${
                        drawingMode === 'transverse'
                          ? 'bg-[#0E4A7B] text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Coupe Transversale (Travers)
                    </button>
                    <button
                      onClick={() => setDrawingMode('longitudinal')}
                      className={`px-3 py-1 rounded-md transition-all ${
                        drawingMode === 'longitudinal'
                          ? 'bg-[#0E4A7B] text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Profil en Long (Écoulement & Radier)
                    </button>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-[#00A3E0]">
                  yn = {results.normalDepthM.toFixed(3)} m · yc ={' '}
                  {results.criticalDepthM.toFixed(3)} m · V = {results.flowVelocityMs.toFixed(2)}{' '}
                  m/s
                </span>
              </div>

              {/* Rendu SVG dynamique */}
              <div className="bg-slate-900 rounded-xl p-4 flex items-center justify-center h-72 border border-slate-800 relative overflow-hidden">
                {drawingMode === 'transverse' ? (
                  <svg className="w-full h-full max-w-md" viewBox="0 0 300 200">
                    <defs>
                      <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#0284C7" stopOpacity={0.9} />
                      </linearGradient>
                    </defs>

                    {/* Section Dalot Rectangulaire */}
                    {activeStructure.type === 'BOX_CULVERT' && (
                      <g transform="translate(50, 20)">
                        <rect
                          x="0"
                          y="0"
                          width="200"
                          height="150"
                          fill="#334155"
                          stroke="#94A3B8"
                          strokeWidth="4"
                        />
                        <rect
                          x="15"
                          y="15"
                          width="170"
                          height="120"
                          fill="#0F172A"
                          stroke="#CBD5E1"
                          strokeWidth="2"
                        />
                        {(() => {
                          const H = activeStructure.heightM || 1.5;
                          const waterRatio = Math.min(1.0, results.normalDepthM / H);
                          const waterH = 120 * waterRatio;
                          const waterY = 135 - waterH;
                          const critRatio = Math.min(1.0, results.criticalDepthM / H);
                          const critY = 135 - 120 * critRatio;
                          return (
                            <>
                              <rect
                                x="15"
                                y={waterY}
                                width="170"
                                height={waterH}
                                fill="url(#waterGrad)"
                              />
                              <line
                                x1="15"
                                y1={waterY}
                                x2="185"
                                y2={waterY}
                                stroke="#E0F2FE"
                                strokeWidth="2"
                              />
                              <line
                                x1="15"
                                y1={critY}
                                x2="185"
                                y2={critY}
                                stroke="#F59E0B"
                                strokeWidth="1.5"
                                strokeDasharray="4,3"
                              />
                              <text
                                x="195"
                                y={waterY + 4}
                                fill="#38BDF8"
                                fontSize="10"
                                fontFamily="monospace"
                                fontWeight="bold"
                              >
                                yn
                              </text>
                              <text
                                x="195"
                                y={critY + 4}
                                fill="#F59E0B"
                                fontSize="9"
                                fontFamily="monospace"
                              >
                                yc
                              </text>
                            </>
                          );
                        })()}
                      </g>
                    )}

                    {/* Section Buse Circulaire */}
                    {activeStructure.type === 'CIRCULAR_PIPE' && (
                      <g transform="translate(150, 100)">
                        <circle
                          cx="0"
                          cy="0"
                          r="75"
                          fill="#334155"
                          stroke="#94A3B8"
                          strokeWidth="6"
                        />
                        <circle
                          cx="0"
                          cy="0"
                          r="65"
                          fill="#0F172A"
                          stroke="#CBD5E1"
                          strokeWidth="2"
                        />
                        {(() => {
                          const D = activeStructure.diameterM || 1.2;
                          const ratio = Math.min(1.0, results.normalDepthM / D);
                          const waterY = 65 - 130 * ratio;
                          return (
                            <g>
                              <clipPath id="pipeClip">
                                <circle cx="0" cy="0" r="64" />
                              </clipPath>
                              <rect
                                x="-65"
                                y={waterY}
                                width="130"
                                height={65 - waterY}
                                fill="url(#waterGrad)"
                                clipPath="url(#pipeClip)"
                              />
                              <line
                                x1={-Math.sqrt(Math.max(0, 64 * 64 - waterY * waterY))}
                                y1={waterY}
                                x2={Math.sqrt(Math.max(0, 64 * 64 - waterY * waterY))}
                                y2={waterY}
                                stroke="#E0F2FE"
                                strokeWidth="2"
                              />
                            </g>
                          );
                        })()}
                      </g>
                    )}

                    {/* Section Fossé Trapézoïdal */}
                    {activeStructure.type === 'DITCH' && (
                      <g transform="translate(50, 30)">
                        <polygon
                          points="0,0 60,130 140,130 200,0"
                          fill="#0F172A"
                          stroke="#94A3B8"
                          strokeWidth="3"
                        />
                        {(() => {
                          const H = activeStructure.heightM || 1.2;
                          const ratio = Math.min(1.0, results.normalDepthM / H);
                          const waterH = 130 * ratio;
                          const waterY = 130 - waterH;
                          const leftX = 60 - 60 * ratio;
                          const rightX = 140 + 60 * ratio;
                          return (
                            <>
                              <polygon
                                points={`${leftX},${waterY} 60,130 140,130 ${rightX},${waterY}`}
                                fill="url(#waterGrad)"
                              />
                              <line
                                x1={leftX}
                                y1={waterY}
                                x2={rightX}
                                y2={waterY}
                                stroke="#E0F2FE"
                                strokeWidth="2"
                              />
                            </>
                          );
                        })()}
                      </g>
                    )}
                  </svg>
                ) : (
                  /* Profil en Long Hydraulique */
                  <svg className="w-full h-full max-w-lg" viewBox="0 0 450 200">
                    <defs>
                      <linearGradient id="longWaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.85} />
                        <stop offset="100%" stopColor="#0369A1" stopOpacity={0.9} />
                      </linearGradient>
                      <pattern
                        id="soilHatch"
                        width="8"
                        height="8"
                        patternTransform="rotate(45 0 0)"
                        patternUnits="userSpaceOnUse"
                      >
                        <line x1="0" y1="0" x2="0" y2="8" stroke="#334155" strokeWidth="1.5" />
                      </pattern>
                    </defs>

                    {/* Plateforme routière / remblai */}
                    <polygon
                      points="40,50 140,50 225,50 310,50 410,50 430,90 20,90"
                      fill="#1E293B"
                    />
                    <line x1="20" y1="50" x2="430" y2="50" stroke="#64748B" strokeWidth="3" />
                    <text
                      x="225"
                      y="42"
                      fill="#94A3B8"
                      fontSize="10"
                      textAnchor="middle"
                      fontFamily="sans-serif"
                    >
                      Plateforme Chaussée (RN1)
                    </text>

                    {/* Radier incliné avec la pente S0 (amont x=60, aval x=390) */}
                    {(() => {
                      const slopeDrop = Math.min(
                        30,
                        Math.max(8, activeStructure.bedSlopeMPerM * 1000)
                      );
                      const barrelH = 45;
                      const yInvertUp = 130;
                      const yInvertDown = yInvertUp + slopeDrop;
                      const yCrownUp = yInvertUp - barrelH;
                      const yCrownDown = yInvertDown - barrelH;

                      // Hauteur d'eau yn
                      const waterDrop = Math.min(
                        barrelH * 0.9,
                        (results.normalDepthM /
                          (activeStructure.heightM || activeStructure.diameterM || 1.5)) *
                          barrelH
                      );
                      const yWaterUp = yInvertUp - waterDrop;
                      const yWaterDown = yInvertDown - waterDrop;

                      // Ligne de charge d'énergie H = yn + V^2 / 2g
                      const vHead = Math.min(
                        20,
                        (Math.pow(results.flowVelocityMs, 2) / (2 * 9.81)) * 30
                      );
                      const yEnergyUp = yWaterUp - vHead;
                      const yEnergyDown = yWaterDown - vHead;

                      return (
                        <g>
                          {/* Corps de l'ouvrage en béton (radier et piédroits) */}
                          <polygon
                            points={`60,${yInvertUp + 12} 390,${yInvertDown + 12} 390,${yCrownDown - 10} 60,${yCrownUp - 10}`}
                            fill="#0F172A"
                            stroke="#475569"
                            strokeWidth="2"
                          />

                          {/* Ligne de radier */}
                          <line
                            x1="40"
                            y1={yInvertUp}
                            x2="410"
                            y2={yInvertDown}
                            stroke="#CBD5E1"
                            strokeWidth="4"
                          />
                          <line
                            x1="60"
                            y1={yCrownUp}
                            x2="390"
                            y2={yCrownDown}
                            stroke="#94A3B8"
                            strokeWidth="4"
                          />

                          {/* Écoulement d'eau */}
                          <polygon
                            points={`50,${yInvertUp} 60,${yInvertUp} 390,${yInvertDown} 400,${yInvertDown} 400,${yWaterDown} 390,${yWaterDown} 60,${yWaterUp} 50,${yWaterUp}`}
                            fill="url(#longWaterGrad)"
                          />
                          <line
                            x1="50"
                            y1={yWaterUp}
                            x2="400"
                            y2={yWaterDown}
                            stroke="#38BDF8"
                            strokeWidth="2.5"
                          />

                          {/* Ligne d'énergie H = yn + V^2/2g */}
                          <line
                            x1="60"
                            y1={yEnergyUp}
                            x2="390"
                            y2={yEnergyDown}
                            stroke="#EC4899"
                            strokeWidth="1.5"
                            strokeDasharray="5,3"
                          />

                          {/* Flèches sens d'écoulement */}
                          <path
                            d="M 210,140 L 235,140 L 230,135 M 235,140 L 230,145"
                            stroke="#38BDF8"
                            strokeWidth="2"
                            fill="none"
                          />
                          <text
                            x="225"
                            y={yWaterUp - 6}
                            fill="#38BDF8"
                            fontSize="10"
                            textAnchor="middle"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            Sens écoulement amont &rarr; aval (V ={' '}
                            {results.flowVelocityMs.toFixed(2)} m/s)
                          </text>

                          {/* Annotations */}
                          <text
                            x="55"
                            y={yInvertUp + 22}
                            fill="#94A3B8"
                            fontSize="9"
                            textAnchor="end"
                            fontFamily="monospace"
                          >
                            Radier Amont
                          </text>
                          <text
                            x="395"
                            y={yInvertDown + 22}
                            fill="#94A3B8"
                            fontSize="9"
                            textAnchor="start"
                            fontFamily="monospace"
                          >
                            Radier Aval
                          </text>
                          <text
                            x="405"
                            y={yEnergyDown - 2}
                            fill="#EC4899"
                            fontSize="9"
                            fontFamily="monospace"
                          >
                            Ligne de charge (H)
                          </text>
                          <text
                            x="405"
                            y={yWaterDown + 3}
                            fill="#38BDF8"
                            fontSize="9"
                            fontFamily="monospace"
                          >
                            Ligne d'eau (yn)
                          </text>
                        </g>
                      );
                    })()}
                  </svg>
                )}

                {/* Légende interne de la coupe */}
                <div className="absolute bottom-2 left-3 text-[10px] text-slate-400 flex items-center gap-3 font-mono">
                  <span className="flex items-center gap-1 text-cyan-300">
                    <span className="w-2.5 h-0.5 bg-cyan-300 inline-block" /> Ligne d'eau normale
                    (yn)
                  </span>
                  {drawingMode === 'transverse' ? (
                    <span className="flex items-center gap-1 text-amber-400">
                      <span className="w-2.5 h-0.5 bg-amber-400 border-dashed inline-block" /> Ligne
                      critique (yc)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-pink-400">
                      <span className="w-2.5 h-0.5 bg-pink-400 border-dashed inline-block" /> Ligne
                      de charge H (yn + V²/2g)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Matrice des Résultats Numériques Certifiés */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 font-['Montserrat']">
                  Résultats Hydrauliques Détaillés
                </h3>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    results.status === 'COMPLIANT'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : results.status === 'WARNING'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-red-100 text-red-800 border-red-200'
                  }`}
                >
                  {results.status === 'COMPLIANT'
                    ? '100% Conforme'
                    : results.status === 'WARNING'
                      ? 'Avertissement Normatif'
                      : 'Non Conforme'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Tirant d'eau yn
                  </span>
                  <span className="text-base font-bold font-mono text-[#0E4A7B] mt-0.5 block">
                    {results.normalDepthM.toFixed(3)} m
                  </span>
                  <span className="text-[10px] text-slate-500">Hauteur normale d'eau</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Hauteur critique yc
                  </span>
                  <span className="text-base font-bold font-mono text-amber-600 mt-0.5 block">
                    {results.criticalDepthM.toFixed(3)} m
                  </span>
                  <span className="text-[10px] text-slate-500">Fr = 1.0 (seuil)</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Vitesse moyenne V
                  </span>
                  <span
                    className={`text-base font-bold font-mono mt-0.5 block ${
                      results.flowVelocityMs > 4.0
                        ? 'text-red-600'
                        : results.flowVelocityMs < 0.6
                          ? 'text-amber-600'
                          : 'text-emerald-700'
                    }`}
                  >
                    {results.flowVelocityMs.toFixed(2)} m/s
                  </span>
                  <span className="text-[10px] text-slate-500">Norme : 0.60 à 4.0 m/s</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Régime d'écoulement
                  </span>
                  <span className="text-base font-bold font-mono text-slate-800 mt-0.5 block">
                    Fr = {results.froudeNumber.toFixed(2)}
                  </span>
                  <span className="text-[10px] font-semibold text-[#00A3E0] uppercase">
                    {results.flowRegime === 'FLUVIAL' ? 'Fluvial (Fr < 1)' : 'Torrentiel (Fr > 1)'}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Section mouillée Sm
                  </span>
                  <span className="text-base font-bold font-mono text-slate-800 mt-0.5 block">
                    {results.wetAreaM2.toFixed(3)} m²
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Rayon hydraulique Rh
                  </span>
                  <span className="text-base font-bold font-mono text-slate-800 mt-0.5 block">
                    {results.hydraulicRadiusM.toFixed(3)} m
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Taux de remplissage
                  </span>
                  <span className="text-base font-bold font-mono text-slate-800 mt-0.5 block">
                    {results.fillingRatioPercent.toFixed(1)} %
                  </span>
                  <span className="text-[10px] text-slate-500">Admissible &le; 80%</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Tirant d'air (Revanche)
                  </span>
                  <span className="text-base font-bold font-mono text-slate-800 mt-0.5 block">
                    {results.freeboardM.toFixed(3)} m
                  </span>
                  <span className="text-[10px] text-slate-500">Sécurité flottants</span>
                </div>
              </div>

              {/* Alertes d'anomalies détectées par l'audit */}
              {results.auditIssues.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-xs">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Points d'Attention & Recommandations Normatives :</span>
                  </div>
                  <ul className="list-disc list-inside text-amber-800 text-[11px] space-y-0.5 pl-1">
                    {results.auditIssues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!activeStructure && (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300 shadow-sm space-y-4">
          <div className="w-16 h-16 mx-auto bg-blue-50 text-[#0E4A7B] rounded-2xl flex items-center justify-center font-bold text-xl">
            OH
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Aucun ouvrage hydraulique dans ce projet
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Créez votre premier ouvrage hydraulique (buse, dalot ou fossé) ou chargez le cas
              d'étude RN1 pour explorer les calculs de dimensionnement Manning-Strickler.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#0E4A7B] text-white rounded-xl text-xs font-semibold hover:bg-[#00A3E0] shadow-sm transition-all"
          >
            + Créer un Ouvrage Hydraulique
          </button>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm font-['Montserrat']">
                Ajouter un Nouvel Ouvrage Hydraulique Réel
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Code Ouvrage</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Point Kilométrique (m)
                  </label>
                  <input
                    type="number"
                    value={newPk}
                    onChange={(e) => setNewPk(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Désignation / Nom</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Type de structure
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as StructureType)}
                    className="w-full px-3 py-1.5 border rounded-lg font-semibold"
                  >
                    <option value="CIRCULAR_PIPE">Buse Circulaire</option>
                    <option value="BOX_CULVERT">Dalot Rectangulaire</option>
                    <option value="DITCH">Fossé Trapézoïdal</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Bassin Versant d'Apport
                  </label>
                  <select
                    value={newWatershedId}
                    onChange={(e) => setNewWatershedId(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded-lg font-semibold"
                  >
                    <option value="">(Aucun BV - Manuel)</option>
                    {project.watersheds.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.code} (Q25={w.calculatedFlows?.q25 || '-'} m³/s)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {newType === 'CIRCULAR_PIPE' ? (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Diamètre D (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newDiameter}
                    onChange={(e) => setNewDiameter(parseFloat(e.target.value) || 1.0)}
                    className="w-full px-3 py-1.5 border rounded-lg font-mono font-bold"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Largeur B (m)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={newWidth}
                      onChange={(e) => setNewWidth(parseFloat(e.target.value) || 1.0)}
                      className="w-full px-3 py-1.5 border rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Hauteur H (m)</label>
                    <input
                      type="number"
                      step="0.25"
                      value={newHeight}
                      onChange={(e) => setNewHeight(parseFloat(e.target.value) || 1.0)}
                      className="w-full px-3 py-1.5 border rounded-lg font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Pente du radier S₀ (m/m)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={newSlope}
                  onChange={(e) => setNewSlope(parseFloat(e.target.value) || 0.005)}
                  className="w-full px-3 py-1.5 border rounded-lg font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateStructure}
                className="px-4 py-2 bg-[#0E4A7B] text-white rounded-xl text-xs font-semibold hover:bg-[#00A3E0]"
              >
                Créer l'Ouvrage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
