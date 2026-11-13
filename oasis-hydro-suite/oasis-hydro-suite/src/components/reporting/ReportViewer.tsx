/**
 * OASIS HYDRO SUITE — Générateur de Rapport & Note de Calculs Officielle
 * Mise en page normée pour impression et export PDF haute fidélité
 */

import React, { useEffect, useState } from 'react';
import {
  Printer,
  FileDown,
  CheckCircle2,
  ShieldCheck,
  Waves,
  Calendar,
  Building,
  User,
  MapPin,
  Archive
} from 'lucide-react';
import { Project } from '../../types/oasis';
import { ApiClient, StoredReportItem } from '../../services/apiClient';
import { exportProjectToJson } from '../../services/storageService';

interface ReportViewerProps {
  project: Project;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({ project }) => {
  const [archivedReports, setArchivedReports] = useState<StoredReportItem[]>([]);
  const [archiveFeedback, setArchiveFeedback] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    ApiClient.getReports(project.id)
      .then((rows) => {
        if (mounted) setArchivedReports(rows);
      })
      .catch(() => {
        if (mounted) setArchivedReports([]);
      });
    return () => {
      mounted = false;
    };
  }, [project.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleArchiveReport = async () => {
    setIsArchiving(true);
    setArchiveFeedback(null);
    try {
      const nonCompliantCount = project.structures.filter(
        (s) => s.results?.status === 'NON_COMPLIANT'
      ).length;
      const saved = await ApiClient.saveReport(project.id, {
        code: `NC-${project.code}-${archivedReports.length + 1}`,
        title: `Note de Calculs — ${project.title}`,
        type: 'HYDRAULIC_CALCULATION_NOTE',
        status: nonCompliantCount === 0 ? 'VALIDATED' : 'DRAFT',
        content: {
          projectCode: project.code,
          watershedsCount: project.watersheds.length,
          structuresCount: project.structures.length,
          nonCompliantCount,
          generatedAt: new Date().toISOString()
        }
      });
      setArchivedReports((prev) => [saved, ...prev]);
      setArchiveFeedback(`Note archivée en base (${saved.code}).`);
    } catch (err) {
      setArchiveFeedback(
        err instanceof Error ? err.message : "Échec de l'archivage en base de données."
      );
    } finally {
      setIsArchiving(false);
    }
  };

  const todayStr = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Barre d'action supérieure (cachée à l'impression) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-['Montserrat']">
            Note de Calculs Hydrauliques & Hydrologiques Officielle
          </h2>
          <p className="text-xs text-slate-500">
            Document technique certifié prêt pour soumission réglementaire, archivage et impression
            PDF ({archivedReports.length} note(s) archivée(s)).
          </p>
          {archiveFeedback && (
            <p className="text-[11px] font-semibold text-[#0E4A7B] mt-1">{archiveFeedback}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleArchiveReport}
            disabled={isArchiving}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            <Archive className="w-4 h-4 text-emerald-600" />
            <span>{isArchiving ? 'Archivage...' : 'Archiver en Base'}</span>
          </button>

          <button
            onClick={() => exportProjectToJson(project)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <FileDown className="w-4 h-4 text-slate-500" />
            <span>Télécharger Données (.oasis.json)</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[#0E4A7B] hover:bg-[#093558] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Printer className="w-4 h-4 text-cyan-300" />
            <span>Imprimer / Exporter PDF</span>
          </button>
        </div>
      </div>

      {/* DOCUMENT IMPRIMABLE OFFICIEL (Feuille A4 Blanche) */}
      <div className="bg-white p-10 md:p-14 shadow-lg rounded-2xl border border-slate-200 print:border-none print:shadow-none print:p-0 print:rounded-none text-slate-900 space-y-8">
        {/* En-tête officiel avec Logos & Cartouche */}
        <div className="border-b-2 border-[#0E4A7B] pb-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0E4A7B] flex items-center justify-center text-white shadow-md">
              <Waves className="w-8 h-8 text-[#00A3E0]" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#00A3E0]">
                OASIS HYDRO SUITE · INGENIERIE INDUSTRIELLE
              </div>
              <h1 className="text-2xl font-black text-[#0E4A7B] font-['Montserrat']">
                NOTE DE CALCULS HYDRAULIQUES
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Rétablissement des Écoulements Naturels & Dimensionnement des Ouvrages de
                Franchissement
              </p>
            </div>
          </div>

          <div className="text-right text-xs">
            <div className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded inline-block">
              {project.code}
            </div>
            <div className="text-slate-500 mt-1">Date d'édition : {todayStr}</div>
            <div className="text-slate-500">Version certifiée : v{project.version}</div>
          </div>
        </div>

        {/* Fiche signalétique du projet */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-slate-400 font-semibold mb-0.5">Projet :</div>
            <div className="font-bold text-slate-900 text-sm">{project.title}</div>
            <div className="text-slate-600 mt-1">{project.description}</div>
          </div>
          <div className="space-y-1.5 pl-4 border-l border-slate-200">
            <div>
              <span className="text-slate-400">Maître d'Ouvrage :</span>{' '}
              <span className="font-semibold text-slate-800">{project.client}</span>
            </div>
            <div>
              <span className="text-slate-400">Bureau d'Études :</span>{' '}
              <span className="font-semibold text-slate-800">{project.engineer}</span>
            </div>
            <div>
              <span className="text-slate-400">Localisation géographique :</span>{' '}
              <span className="font-semibold text-slate-800">{project.location}</span>
            </div>
            <div>
              <span className="text-slate-400">Norme & Récurrence de dimensionnement :</span>{' '}
              <span className="font-mono font-bold text-[#0E4A7B]">
                Q{project.settings.returnPeriodDesignYears} ans (Vérification Q
                {project.settings.returnPeriodCheckYears} ans)
              </span>
            </div>
          </div>
        </div>

        {/* 1. SYNTHÈSE HYDROLOGIQUE */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-[#0E4A7B] font-['Montserrat'] border-b border-slate-200 pb-1.5 flex items-center gap-2">
            <span>1. Synthèse Hydrologique & Débits de Pointe (Méthode Rationnelle)</span>
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Les débits de crue ont été déterminés selon la Méthode Rationnelle universelle :{' '}
            <span className="font-mono font-bold">Q = (C · I · A) / 3.6</span> avec l'intensité
            pluviométrique <span className="font-mono font-bold">I(Tc) = a · Tc⁻ᵇ</span> déduite de
            la loi de Montana régionale et du temps de concentration physique (formules de Kirpich,
            Passini et Giandotti).
          </p>

          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-[#0E4A7B] text-white">
              <tr>
                <th className="py-2 px-3">Bassin Versant</th>
                <th className="py-2 px-3">Surface A (km²)</th>
                <th className="py-2 px-3">Thalweg L (km)</th>
                <th className="py-2 px-3">Pente (%)</th>
                <th className="py-2 px-3">Coeff. C</th>
                <th className="py-2 px-3">Tc (min)</th>
                <th className="py-2 px-3">Q10 (m³/s)</th>
                <th className="py-2 px-3">Q25 (m³/s)</th>
                <th className="py-2 px-3">Q100 (m³/s)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {project.watersheds.map((ws) => (
                <tr key={ws.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-bold">{ws.code}</td>
                  <td className="py-2 px-3 font-mono">{ws.areaKm2.toFixed(2)}</td>
                  <td className="py-2 px-3 font-mono">{ws.lengthKm.toFixed(2)}</td>
                  <td className="py-2 px-3 font-mono">{ws.slopePercent.toFixed(1)}%</td>
                  <td className="py-2 px-3 font-mono">{ws.runoffCoefficient}</td>
                  <td className="py-2 px-3 font-mono font-bold text-[#0E4A7B]">
                    {ws.calculatedTc?.chosenValueMin || '-'}
                  </td>
                  <td className="py-2 px-3 font-mono">{ws.calculatedFlows?.q10 || '-'}</td>
                  <td className="py-2 px-3 font-mono font-bold text-sky-700">
                    {ws.calculatedFlows?.q25 || '-'}
                  </td>
                  <td className="py-2 px-3 font-mono font-bold text-red-700">
                    {ws.calculatedFlows?.q100 || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 2. TABLEAU DE DIMENSIONNEMENT HYDRAULIQUE */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-[#0E4A7B] font-['Montserrat'] border-b border-slate-200 pb-1.5 flex items-center gap-2">
            <span>2. Dimensionnement & Résultats d'Écoulement Manning-Strickler</span>
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Écoulement uniforme calculé selon la relation de Manning-Strickler :{' '}
            <span className="font-mono font-bold">V = K · Rh^(2/3) · √S₀</span> et{' '}
            <span className="font-mono font-bold">Q = V · Sm</span>. Résolution numérique de la
            hauteur normale (yn) et contrôle du tirant d'air.
          </p>

          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-[#0E4A7B] text-white">
              <tr>
                <th className="py-2 px-3">Ouvrage</th>
                <th className="py-2 px-3">PK</th>
                <th className="py-2 px-3">Section retenue</th>
                <th className="py-2 px-3">Pente S₀</th>
                <th className="py-2 px-3">Q projet</th>
                <th className="py-2 px-3">Tirant d'eau yn</th>
                <th className="py-2 px-3">Vitesse V</th>
                <th className="py-2 px-3">Remplissage</th>
                <th className="py-2 px-3">Tirant d'air</th>
                <th className="py-2 px-3 text-right">Avis Conformité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {project.structures.map((st) => {
                const res = st.results;
                return (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-[#0E4A7B]">{st.code}</td>
                    <td className="py-2.5 px-3 font-mono">
                      PK {Math.floor(st.pkMeters / 1000)}+
                      {String(st.pkMeters % 1000).padStart(3, '0')}
                    </td>
                    <td className="py-2.5 px-3 font-medium">
                      {st.type === 'CIRCULAR_PIPE' &&
                        `Buse Ø${Math.round((st.diameterM || 1) * 1000)} mm`}
                      {st.type === 'BOX_CULVERT' &&
                        `Dalot ${st.cellsCount > 1 ? `${st.cellsCount}x ` : ''}${st.widthM?.toFixed(2)}x${st.heightM?.toFixed(2)} m`}
                      {st.type === 'DITCH' && `Fossé b=${st.widthM?.toFixed(2)}m`}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {(st.bedSlopeMPerM * 100).toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold">
                      {st.designFlowM3s.toFixed(2)} m³/s
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {res ? `${res.normalDepthM.toFixed(3)} m` : '-'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold">
                      {res ? `${res.flowVelocityMs.toFixed(2)} m/s` : '-'}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {res ? `${res.fillingRatioPercent.toFixed(1)}%` : '-'}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {res ? `${res.freeboardM.toFixed(2)} m` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] ${
                          res?.status === 'COMPLIANT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : res?.status === 'WARNING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {res?.status === 'COMPLIANT'
                          ? 'VALIDÉ'
                          : res?.status === 'WARNING'
                            ? 'AVERTISSEMENT'
                            : 'NON CONFORME'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 3. CONCLUSION TECHNIQUE & VISA */}
        {(() => {
          const nonCompliant = project.structures.filter(
            (s) => s.results?.status === 'NON_COMPLIANT'
          );
          const warnings = project.structures.filter((s) => s.results?.status === 'WARNING');
          const isFullyCompliant = nonCompliant.length === 0 && warnings.length === 0;

          return (
            <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-2 gap-8 text-xs">
              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wide mb-2">
                  Conclusion de l'Ingénieur en Chef
                </h3>
                {isFullyCompliant ? (
                  <p className="text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200 leading-relaxed text-[11px]">
                    <strong>VALIDATION TECHNIQUE :</strong> L'ensemble des{' '}
                    {project.structures.length} ouvrages hydrauliques respecte scrupuleusement les
                    critères normatifs de vitesse d'auto-curage (V &ge;{' '}
                    {project.settings.minSelfCleaningVelocity} m/s), de vitesse limite anti-érosion
                    et de tirant d'air de sécurité (&ge; {project.settings.minFreeboardM} m). Le
                    dossier est validé pour exécution.
                  </p>
                ) : nonCompliant.length > 0 ? (
                  <p className="text-red-800 bg-red-50 p-3 rounded-xl border border-red-200 leading-relaxed text-[11px]">
                    <strong>RÉSERVES TECHNIQUES MAJEURES :</strong> Le projet comporte{' '}
                    {nonCompliant.length} ouvrage(s) non conforme(s) (
                    {nonCompliant.map((s) => s.code).join(', ')}). Des risques de surverse ou
                    d'érosion critique du radier ont été identifiés. Un redimensionnement ou
                    l'aménagement de bassins de dissipation est indispensable avant tout visa
                    définitif.
                  </p>
                ) : (
                  <p className="text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200 leading-relaxed text-[11px]">
                    <strong>AVIS AVEC RECOMMANDATIONS :</strong> Le projet comporte{' '}
                    {warnings.length} avertissement(s) ({warnings.map((s) => s.code).join(', ')})
                    portant sur des vitesses faibles à risque d'ensablement ou un tirant d'air
                    réduit. Une surveillance périodique et des curages préventifs sont prescrits.
                  </p>
                )}
              </div>

              <div className="border border-slate-300 rounded-xl p-4 bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-slate-800 uppercase text-[11px]">
                    Visa & Cachet Professionnel du Bureau d'Études
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Responsable du dimensionnement hydraulique : {project.engineer}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Statut du visa :{' '}
                    {isFullyCompliant
                      ? 'APPROUVÉ SANS RÉSERVE'
                      : nonCompliant.length > 0
                        ? 'REFUSÉ / EN COURS DE REPRISE'
                        : 'APPROUVÉ AVEC OBSERVATIONS'}
                  </div>
                </div>

                <div className="pt-6 border-t border-dashed border-slate-300 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Visa électronique vérifié</span>
                  <span>OASIS HYDRO SUITE v{project.version}</span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
