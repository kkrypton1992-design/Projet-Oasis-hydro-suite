/**
 * OASIS HYDRO SUITE — Moteur Hydrologique Certifié
 * Calculs de Temps de Concentration (Kirpich, Passini, Giandotti),
 * Courbes IDF Montana et Méthode Rationnelle (Q10, Q25, Q50, Q100).
 */

import React, { useState } from 'react';
import {
  CloudRain,
  Clock,
  TrendingUp,
  Calculator,
  Plus,
  Trash2,
  Save,
  HelpCircle,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { Project, Watershed } from '../../types/oasis';
import {
  calculateTimeOfConcentration,
  calculateRainfallIntensity,
  calculateRationalFlows,
  computeSlopePercent
} from '../../core/hydrologyEngine';

interface HydrologyViewProps {
  project: Project;
  onUpdateProject: (updated: Project) => void;
  selectedWatershedId?: string | null;
  onSelectWatershed?: (id: string) => void;
  onDeleteWatershed?: (id: string) => void;
}

export const HydrologyView: React.FC<HydrologyViewProps> = ({
  project,
  onUpdateProject,
  selectedWatershedId: controlledWsId,
  onSelectWatershed,
  onDeleteWatershed
}) => {
  const [internalWsId, setInternalWsId] = useState<string>(project.watersheds[0]?.id || '');
  const [showNewWsModal, setShowNewWsModal] = useState<boolean>(false);

  const selectedWsId = controlledWsId || internalWsId;
  const selectedWs = project.watersheds.find((w) => w.id === selectedWsId) || project.watersheds[0];

  const handleSelectWs = (id: string) => {
    setInternalWsId(id);
    if (onSelectWatershed) onSelectWatershed(id);
  };

  const [pendingDeleteWsId, setPendingDeleteWsId] = useState<string | null>(null);
  const [actionWarning, setActionWarning] = useState<string | null>(null);

  // Formulaire d'ajout de nouveau bassin versant
  const [newWsCode, setNewWsCode] = useState<string>('BV-04');
  const [newWsName, setNewWsName] = useState<string>('Nouveau Bassin Versant Ruisseau');
  const [newWsArea, setNewWsArea] = useState<number>(1.25);
  const [newWsLength, setNewWsLength] = useState<number>(1.8);
  const [newWsDeltaH, setNewWsDeltaH] = useState<number>(55);
  const [newWsRunoffC, setNewWsRunoffC] = useState<number>(0.6);

  // Modification directe des paramètres physiques du BV actif
  const handleUpdateActiveWsParam = <K extends keyof Watershed>(field: K, val: Watershed[K]) => {
    if (!selectedWs) return;
    const updatedWs: Watershed = {
      ...selectedWs,
      [field]: val
    };
    if (field === 'deltaH' || field === 'lengthKm') {
      const l = field === 'lengthKm' ? Number(val) : selectedWs.lengthKm;
      const h = field === 'deltaH' ? Number(val) : selectedWs.deltaH;
      if (l > 0) {
        updatedWs.slopePercent = computeSlopePercent(h, l);
      }
    }
    const updatedWatersheds = project.watersheds.map((w) =>
      w.id === selectedWs.id ? updatedWs : w
    );
    onUpdateProject({
      ...project,
      watersheds: updatedWatersheds
    });
  };

  const handleRequestDeleteActiveWs = () => {
    if (!selectedWs) return;
    if (project.watersheds.length <= 1) {
      setActionWarning('Le projet doit comporter au moins un bassin versant.');
      return;
    }
    setActionWarning(null);
    setPendingDeleteWsId(selectedWs.id);
  };

  const handleConfirmDeleteActiveWs = () => {
    if (!selectedWs || pendingDeleteWsId !== selectedWs.id) return;
    setPendingDeleteWsId(null);
    const remaining = project.watersheds.filter((w) => w.id !== selectedWs.id);
    if (onDeleteWatershed) {
      onDeleteWatershed(selectedWs.id);
    } else {
      onUpdateProject({
        ...project,
        watersheds: remaining
      });
    }
    if (remaining.length > 0) {
      handleSelectWs(remaining[0].id);
    }
  };

  // Calculs hydrologiques en direct sur le bassin versant sélectionné
  const tcResults = selectedWs
    ? calculateTimeOfConcentration(selectedWs.areaKm2, selectedWs.lengthKm, selectedWs.deltaH)
    : null;

  // Mise à jour de la méthode Tc choisie pour le BV actif
  const handleSelectTcMethod = (
    method: 'KIRPICH' | 'PASSINI' | 'GIANDOTTI' | 'BRANSBY_WILLIAMS'
  ) => {
    if (!selectedWs || !tcResults) return;

    let chosenVal = tcResults.kirpichMin;
    if (method === 'PASSINI') chosenVal = tcResults.passiniMin;
    if (method === 'GIANDOTTI') chosenVal = tcResults.giandottiMin;
    if (method === 'BRANSBY_WILLIAMS') chosenVal = tcResults.bransbyWilliamsMin;

    const updatedWatersheds = project.watersheds.map((w) => {
      if (w.id === selectedWs.id) {
        return {
          ...w,
          calculatedTc: {
            ...tcResults,
            chosenMethod: method,
            chosenValueMin: chosenVal
          }
        };
      }
      return w;
    });

    onUpdateProject({
      ...project,
      watersheds: updatedWatersheds
    });
  };

  // Mise à jour des paramètres Montana
  const handleUpdateMontana = (period: number, field: 'a' | 'b', value: number) => {
    const updatedMontana = project.settings.montanaParams.map((p) => {
      if (p.periodReturnYears === period) {
        return { ...p, [field]: value };
      }
      return p;
    });

    onUpdateProject({
      ...project,
      settings: {
        ...project.settings,
        montanaParams: updatedMontana
      }
    });
  };

  // Ajout d'un nouveau bassin versant réel
  const handleAddWatershed = () => {
    const slopePct = computeSlopePercent(newWsDeltaH, newWsLength);
    const newWs: Watershed = {
      id: `bv-${Date.now()}`,
      code: newWsCode,
      name: newWsName,
      areaKm2: Number(newWsArea),
      lengthKm: Number(newWsLength),
      deltaH: Number(newWsDeltaH),
      slopePercent: slopePct,
      runoffCoefficient: Number(newWsRunoffC),
      soilType: 'Sol limoneux modéré',
      vegetation: 'Zones cultivées et friches',
      color: '#eab308',
      coordinates: [
        { lat: 43.65, lng: 1.55 },
        { lat: 43.66, lng: 1.565 },
        { lat: 43.655, lng: 1.58 },
        { lat: 43.645, lng: 1.56 },
        { lat: 43.65, lng: 1.55 }
      ]
    };

    onUpdateProject({
      ...project,
      watersheds: [...project.watersheds, newWs]
    });

    handleSelectWs(newWs.id);
    setShowNewWsModal(false);
  };

  // Génération des points pour le graphe IDF (Intensité Montana)
  // Durées de 5 min à 120 min
  const idfTimes = [5, 10, 15, 20, 30, 45, 60, 90, 120];
  const maxIntensity = 180; // mm/h pour l'échelle SVG

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* En-tête du module Hydrologique */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2.5 py-0.5 rounded-full font-mono">
              Module Métier M-03
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Formules Physiques Certifiées
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-['Montserrat']">
            Calculs Hydrologiques & Débits de Projet
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Calcul physique du Temps de Concentration (Tc), loi pluviométrique de Montana et
            application de la Méthode Rationnelle universelle.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {project.watersheds.length > 1 && (
            <button
              onClick={handleRequestDeleteActiveWs}
              className="px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold transition-all shrink-0"
              title="Supprimer ce bassin versant"
            >
              Supprimer {selectedWs?.code}
            </button>
          )}

          <button
            onClick={() => setShowNewWsModal(true)}
            className="flex items-center gap-2 bg-[#0E4A7B] hover:bg-[#0b3a61] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all shrink-0"
          >
            <Plus className="w-4 h-4 text-cyan-300" />
            <span>Nouveau Bassin Versant</span>
          </button>
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

      {pendingDeleteWsId && selectedWs && pendingDeleteWsId === selectedWs.id && (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 px-4 py-3 rounded-xl text-xs flex flex-wrap items-center justify-between gap-3">
          <span>
            Confirmer la suppression définitive du bassin versant <strong>{selectedWs.code}</strong>{' '}
            ({selectedWs.name}) ?
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPendingDeleteWsId(null)}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg font-semibold text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirmDeleteActiveWs}
              className="px-3 py-1 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700"
            >
              Confirmer la suppression
            </button>
          </div>
        </div>
      )}

      {/* Sélecteur de Bassin Versant */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {project.watersheds.map((ws) => {
          const isSelected = ws.id === selectedWs?.id;
          return (
            <button
              key={ws.id}
              onClick={() => handleSelectWs(ws.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-[#0E4A7B] text-white border-[#0E4A7B] shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: ws.color || '#00A3E0' }}
              />
              <span className="font-mono">{ws.code}</span>
              <span className="font-normal opacity-80">({ws.areaKm2} km²)</span>
            </button>
          );
        })}
      </div>

      {/* Barre d'édition rapide des paramètres physiques du bassin versant actif */}
      {selectedWs && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#0E4A7B] text-sm font-mono">{selectedWs.code}</span>
            <input
              type="text"
              value={selectedWs.name}
              onChange={(e) => handleUpdateActiveWsParam('name', e.target.value)}
              className="px-2.5 py-1 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 w-64"
              title="Nom descriptif du bassin"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">Surface A :</span>
              <input
                type="number"
                step="0.05"
                min="0.01"
                value={selectedWs.areaKm2}
                onChange={(e) =>
                  handleUpdateActiveWsParam('areaKm2', parseFloat(e.target.value) || 0.1)
                }
                className="w-16 px-2 py-1 border rounded text-right font-mono font-bold text-slate-800"
              />
              <span className="text-slate-400 font-mono">km²</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">Thalweg L :</span>
              <input
                type="number"
                step="0.05"
                min="0.01"
                value={selectedWs.lengthKm}
                onChange={(e) =>
                  handleUpdateActiveWsParam('lengthKm', parseFloat(e.target.value) || 0.1)
                }
                className="w-16 px-2 py-1 border rounded text-right font-mono font-bold text-slate-800"
              />
              <span className="text-slate-400 font-mono">km</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">Dénivelée ΔH :</span>
              <input
                type="number"
                step="1"
                min="1"
                value={selectedWs.deltaH}
                onChange={(e) =>
                  handleUpdateActiveWsParam('deltaH', parseFloat(e.target.value) || 1)
                }
                className="w-16 px-2 py-1 border rounded text-right font-mono font-bold text-slate-800"
              />
              <span className="text-slate-400 font-mono">m</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">Pente S :</span>
              <span className="font-mono font-bold text-slate-700">{selectedWs.slopePercent}%</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">Coeff. C :</span>
              <input
                type="number"
                step="0.02"
                min="0.05"
                max="1.00"
                value={selectedWs.runoffCoefficient}
                onChange={(e) =>
                  handleUpdateActiveWsParam('runoffCoefficient', parseFloat(e.target.value) || 0.5)
                }
                className="w-16 px-2 py-1 border rounded text-right font-mono font-bold text-[#0E4A7B]"
              />
            </div>
          </div>
        </div>
      )}

      {selectedWs && tcResults && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Bloc 1 : Comparatif des 4 Formules de Temps de Concentration Tc (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-['Montserrat'] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#00A3E0]" />
                  <span>Temps de Concentration (Tc)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Comparatif des 4 formules physiques standardisées
                </p>
              </div>
              <span className="text-[10px] font-mono bg-sky-50 text-sky-800 px-2 py-0.5 rounded border border-sky-200 font-semibold">
                S = {selectedWs.slopePercent}%
              </span>
            </div>

            {/* Cartouches des 4 formules */}
            <div className="space-y-2.5">
              {/* Formule de Kirpich */}
              <div
                onClick={() => handleSelectTcMethod('KIRPICH')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedWs.calculatedTc?.chosenMethod === 'KIRPICH'
                    ? 'border-[#00A3E0] bg-sky-50/70 ring-2 ring-[#00A3E0]/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <span>Formule de Kirpich (1940)</span>
                      {tcResults.recommendedMethod === 'KIRPICH' && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                          Recommandée
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Tc = 0.0195 · L⁰·⁷⁷ · S⁻⁰·³⁸⁵ (Pente marquée & rurale)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold font-mono text-[#0E4A7B]">
                      {tcResults.kirpichMin} <span className="text-xs font-normal">min</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {(tcResults.kirpichMin / 60).toFixed(2)} h
                    </div>
                  </div>
                </div>
              </div>

              {/* Formule de Passini */}
              <div
                onClick={() => handleSelectTcMethod('PASSINI')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedWs.calculatedTc?.chosenMethod === 'PASSINI'
                    ? 'border-[#00A3E0] bg-sky-50/70 ring-2 ring-[#00A3E0]/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <span>Formule de Passini</span>
                      {tcResults.recommendedMethod === 'PASSINI' && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                          Recommandée
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Tc = 0.108 · (A·L)¹/³ / √S (Bassin moyen 3 à 10 km²)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold font-mono text-[#0E4A7B]">
                      {tcResults.passiniMin} <span className="text-xs font-normal">min</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {(tcResults.passiniMin / 60).toFixed(2)} h
                    </div>
                  </div>
                </div>
              </div>

              {/* Formule de Giandotti */}
              <div
                onClick={() => handleSelectTcMethod('GIANDOTTI')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedWs.calculatedTc?.chosenMethod === 'GIANDOTTI'
                    ? 'border-[#00A3E0] bg-sky-50/70 ring-2 ring-[#00A3E0]/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <span>Formule de Giandotti</span>
                      {tcResults.recommendedMethod === 'GIANDOTTI' && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                          Recommandée
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Tc = (4√A + 1.5L) / (0.8√ΔH) (Grands bassins &gt; 10 km²)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold font-mono text-[#0E4A7B]">
                      {tcResults.giandottiMin} <span className="text-xs font-normal">min</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {(tcResults.giandottiMin / 60).toFixed(2)} h
                    </div>
                  </div>
                </div>
              </div>

              {/* Formule de Bransby-Williams */}
              <div
                onClick={() => handleSelectTcMethod('BRANSBY_WILLIAMS')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedWs.calculatedTc?.chosenMethod === 'BRANSBY_WILLIAMS'
                    ? 'border-[#00A3E0] bg-sky-50/70 ring-2 ring-[#00A3E0]/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900">
                      Formule de Bransby-Williams
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Tc = 58.5 · L / (A⁰·¹ · S⁰·²) (Relief ondulé)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold font-mono text-[#0E4A7B]">
                      {tcResults.bransbyWilliamsMin}{' '}
                      <span className="text-xs font-normal">min</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {(tcResults.bransbyWilliamsMin / 60).toFixed(2)} h
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Valeur retenue pour les débits */}
            <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs">
              <div>
                <div className="text-[10px] text-cyan-300 uppercase font-bold">
                  Tc retenu pour les calculs de débits
                </div>
                <div className="text-slate-300 font-medium">
                  Méthode : {selectedWs.calculatedTc?.chosenMethod || tcResults.recommendedMethod}
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-xl font-bold text-cyan-400">
                  {selectedWs.calculatedTc?.chosenValueMin || tcResults.recommendedMin}
                </span>{' '}
                <span className="text-xs text-slate-300">minutes</span>
              </div>
            </div>
          </div>

          {/* Bloc 2 : Courbes IDF Montana & Débits Rationnels (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-['Montserrat'] flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#00A3E0]" />
                  <span>Courbes IDF Pluviométriques (Loi de Montana)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Intensité I(t) = a · t⁻ᵇ [mm/h] selon la durée et le temps de retour
                </p>
              </div>
            </div>

            {/* Tracé SVG réel des Courbes IDF */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="h-48 w-full relative">
                <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
                  {/* Grille de fond */}
                  <line x1="40" y1="20" x2="490" y2="20" stroke="#E2E8F0" strokeWidth="1" />
                  <line x1="40" y1="60" x2="490" y2="60" stroke="#E2E8F0" strokeWidth="1" />
                  <line x1="40" y1="100" x2="490" y2="100" stroke="#E2E8F0" strokeWidth="1" />
                  <line x1="40" y1="140" x2="490" y2="140" stroke="#E2E8F0" strokeWidth="1" />

                  {/* Axes */}
                  <line x1="40" y1="10" x2="40" y2="155" stroke="#94A3B8" strokeWidth="1.5" />
                  <line x1="40" y1="155" x2="490" y2="155" stroke="#94A3B8" strokeWidth="1.5" />

                  {/* Étiquettes Y (mm/h) */}
                  <text
                    x="35"
                    y="25"
                    textAnchor="end"
                    fontSize="9"
                    fill="#64748B"
                    fontFamily="monospace"
                  >
                    150
                  </text>
                  <text
                    x="35"
                    y="65"
                    textAnchor="end"
                    fontSize="9"
                    fill="#64748B"
                    fontFamily="monospace"
                  >
                    100
                  </text>
                  <text
                    x="35"
                    y="105"
                    textAnchor="end"
                    fontSize="9"
                    fill="#64748B"
                    fontFamily="monospace"
                  >
                    50
                  </text>
                  <text
                    x="35"
                    y="145"
                    textAnchor="end"
                    fontSize="9"
                    fill="#64748B"
                    fontFamily="monospace"
                  >
                    10
                  </text>

                  {/* Courbes pour T = 10, 25, 50, 100 */}
                  {project.settings.montanaParams.map((param) => {
                    const color =
                      param.periodReturnYears === 10
                        ? '#38BDF8'
                        : param.periodReturnYears === 25
                          ? '#0284C7'
                          : param.periodReturnYears === 50
                            ? '#D97706'
                            : '#DC2626';

                    const points = idfTimes
                      .map((t) => {
                        const intensity = calculateRainfallIntensity(t, param.a, param.b);
                        const x = 40 + ((t - 5) / (120 - 5)) * 440;
                        const y = 155 - (intensity / maxIntensity) * 135;
                        return `${x.toFixed(1)},${y.toFixed(1)}`;
                      })
                      .join(' ');

                    return (
                      <polyline
                        key={param.periodReturnYears}
                        fill="none"
                        stroke={color}
                        strokeWidth="2.5"
                        points={points}
                      />
                    );
                  })}

                  {/* Ligne verticale marquant le Tc du bassin versant sélectionné */}
                  {selectedWs.calculatedTc && (
                    <g>
                      {(() => {
                        const tcVal = selectedWs.calculatedTc.chosenValueMin;
                        const clampedTc = Math.min(120, Math.max(5, tcVal));
                        const xTc = 40 + ((clampedTc - 5) / (120 - 5)) * 440;
                        return (
                          <>
                            <line
                              x1={xTc}
                              y1="15"
                              x2={xTc}
                              y2="155"
                              stroke="#0E4A7B"
                              strokeWidth="2"
                              strokeDasharray="4, 4"
                            />
                            <text
                              x={xTc}
                              y="12"
                              textAnchor="middle"
                              fontSize="9"
                              fontWeight="bold"
                              fill="#0E4A7B"
                            >
                              Tc = {tcVal} min
                            </text>
                          </>
                        );
                      })()}
                    </g>
                  )}
                </svg>
              </div>

              {/* Légende interactive des courbes et paramètres a, b éditables */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-200 text-xs">
                {project.settings.montanaParams.map((p) => {
                  const colorClass =
                    p.periodReturnYears === 10
                      ? 'text-sky-500'
                      : p.periodReturnYears === 25
                        ? 'text-blue-700'
                        : p.periodReturnYears === 50
                          ? 'text-amber-600'
                          : 'text-red-600';

                  return (
                    <div
                      key={p.periodReturnYears}
                      className="bg-white p-2 rounded-lg border border-slate-200"
                    >
                      <div className={`font-bold flex items-center gap-1.5 ${colorClass}`}>
                        <span className="w-2.5 h-2.5 rounded-full bg-current" />
                        <span>T = {p.periodReturnYears} ans</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-[11px] font-mono">
                        <span className="text-slate-400">a:</span>
                        <input
                          type="number"
                          step="0.05"
                          value={p.a}
                          onChange={(e) =>
                            handleUpdateMontana(
                              p.periodReturnYears,
                              'a',
                              parseFloat(e.target.value) || 1
                            )
                          }
                          className="w-12 px-1 py-0.5 border rounded text-right font-bold text-slate-800"
                        />
                        <span className="text-slate-400">b:</span>
                        <input
                          type="number"
                          step="0.01"
                          value={p.b}
                          onChange={(e) =>
                            handleUpdateMontana(
                              p.periodReturnYears,
                              'b',
                              parseFloat(e.target.value) || 0.5
                            )
                          }
                          className="w-12 px-1 py-0.5 border rounded text-right font-bold text-slate-800"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Résultats de la Méthode Rationnelle pour le BV actif */}
            {selectedWs.calculatedFlows && (
              <div className="p-4 bg-gradient-to-r from-[#0E4A7B] to-[#0A3558] text-white rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs uppercase font-bold text-cyan-300 tracking-wider">
                    Débits de Pointe Calculés — Formule Rationnelle Q = (C · I · A) / 3.6
                  </div>
                  <div className="text-[11px] font-mono text-blue-200">
                    C = {selectedWs.runoffCoefficient} · A = {selectedWs.areaKm2} km²
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-white/10 rounded-lg p-2.5 border border-white/10">
                    <div className="text-[10px] text-blue-200 uppercase font-semibold">
                      Q10 (Décennal)
                    </div>
                    <div className="text-lg font-bold font-mono text-cyan-300 mt-0.5">
                      {selectedWs.calculatedFlows.q10}{' '}
                      <span className="text-xs font-normal">m³/s</span>
                    </div>
                  </div>
                  <div className="bg-cyan-500/20 rounded-lg p-2.5 border border-cyan-400/30 ring-1 ring-cyan-400/40">
                    <div className="text-[10px] text-cyan-200 uppercase font-bold">
                      Q25 (Projet)
                    </div>
                    <div className="text-xl font-bold font-mono text-white mt-0.5">
                      {selectedWs.calculatedFlows.q25}{' '}
                      <span className="text-xs font-normal">m³/s</span>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2.5 border border-white/10">
                    <div className="text-[10px] text-amber-200 uppercase font-semibold">
                      Q50 (Fréquentiel)
                    </div>
                    <div className="text-lg font-bold font-mono text-amber-300 mt-0.5">
                      {selectedWs.calculatedFlows.q50}{' '}
                      <span className="text-xs font-normal">m³/s</span>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2.5 border border-white/10">
                    <div className="text-[10px] text-red-200 uppercase font-semibold">
                      Q100 (Centennal)
                    </div>
                    <div className="text-lg font-bold font-mono text-red-300 mt-0.5">
                      {selectedWs.calculatedFlows.q100}{' '}
                      <span className="text-xs font-normal">m³/s</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Ajout de Bassin Versant */}
      {showNewWsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 font-['Montserrat']">
                Créer un Nouveau Bassin Versant
              </h3>
              <button
                onClick={() => setShowNewWsModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Code du BV</label>
                  <input
                    type="text"
                    value={newWsCode}
                    onChange={(e) => setNewWsCode(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nom descriptif</label>
                  <input
                    type="text"
                    value={newWsName}
                    onChange={(e) => setNewWsName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Surface (km²)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={newWsArea}
                    onChange={(e) => setNewWsArea(parseFloat(e.target.value) || 0.1)}
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Thalweg L (km)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={newWsLength}
                    onChange={(e) => setNewWsLength(parseFloat(e.target.value) || 0.1)}
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Dénivelée ΔH (m)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={newWsDeltaH}
                    onChange={(e) => setNewWsDeltaH(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Coefficient de Ruissellement C (0.10 à 0.95)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.10"
                    max="0.95"
                    step="0.05"
                    value={newWsRunoffC}
                    onChange={(e) => setNewWsRunoffC(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="font-mono font-bold text-sm text-[#0E4A7B] w-12 text-right">
                    {newWsRunoffC.toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  0.30 (boisé/sable) · 0.55 (agricole mixte) · 0.80 (rocheux/fortement urbanisé)
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowNewWsModal(false)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={handleAddWatershed}
                className="px-4 py-2 bg-[#00A3E0] hover:bg-[#008fca] text-white rounded-xl text-xs font-semibold shadow-sm"
              >
                Ajouter le Bassin Versant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
