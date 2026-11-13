/**
 * OASIS HYDRO SUITE — Centre de Packaging & Distribution Desktop Windows (.exe)
 * Gestionnaire de build, installateur NSIS et configuration des futures mises à jour
 */

import React, { useState } from 'react';
import {
  Laptop,
  Terminal,
  Package,
  FolderCheck,
  Download,
  FileCode,
  CheckCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Project } from '../../types/oasis';

interface DesktopPackagingViewProps {
  project: Project;
}

export const DesktopPackagingView: React.FC<DesktopPackagingViewProps> = ({ project }) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* En-tête */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-slate-900 text-cyan-300 text-xs font-bold px-2.5 py-0.5 rounded-full font-mono">
              Mode Desktop Windows
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-600" /> Electron + NSIS x64 Prêts
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-['Montserrat']">
            Packaging Professionnel & Générateur d'Exécutable Windows (.exe)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Application autonome avec base locale SQLite embarquée et backend intégré : aucun
            serveur PostgreSQL, aucun mot de passe SQL ni connexion internet requis sur le poste
            client.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/oasis-hydro-suite.zip"
            download="oasis-hydro-suite.zip"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger l'Archive Complète (.ZIP)</span>
          </a>
          <div className="bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-xl text-xs font-mono text-[#0E4A7B] font-bold">
            Target : Windows 10 / 11 (x64)
          </div>
        </div>
      </div>

      {/* Grille de 3 Atouts de la Version Installable */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0E4A7B] flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Installateur NSIS & Portable</h3>
          <p className="text-slate-500 leading-relaxed">
            Installateur Windows complet (NSIS x64) et version portable prête à lancer, avec
            création automatique des raccourcis et association de fichiers .oasis.json.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Base SQLite Locale Embarquée</h3>
          <p className="text-slate-500 leading-relaxed">
            Création et migration automatiques du fichier oasis-hydro.sqlite au premier lancement
            dans le dossier applicatif. Aucun identifiant ni serveur SQL externe requis.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">100% Hors-Ligne & Reproductible</h3>
          <p className="text-slate-500 leading-relaxed">
            Moteurs hydrologique et hydraulique, API locale Express et persistance SQLite embarqués
            dans un seul programme autonome exploitable sur le terrain.
          </p>
        </div>
      </div>

      {/* Procédure pas à pas pour générer le .EXE depuis GitHub */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
        <h3 className="text-base font-bold text-slate-900 font-['Montserrat'] flex items-center gap-2">
          <Terminal className="w-5 h-5 text-[#00A3E0]" />
          <span>Procédure de Génération de l'Exécutable Windows (.exe)</span>
        </h3>

        <div className="space-y-4 text-xs">
          {/* Étape 1 */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-sm">
                1. Cloner le dépôt et installer les dépendances
              </span>
              <button
                onClick={() =>
                  copyToClipboard(
                    'git clone https://github.com/kkrypton1992-design/Projet-Oasis-hydro-suite.git\ncd Projet-Oasis-hydro-suite\nnpm install',
                    'cmd1'
                  )
                }
                className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCmd === 'cmd1' ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-cyan-300 rounded-lg font-mono text-xs overflow-x-auto whitespace-pre">
              {`git clone https://github.com/kkrypton1992-design/Projet-Oasis-hydro-suite.git\ncd Projet-Oasis-hydro-suite\nnpm install`}
            </pre>
          </div>

          {/* Étape 2 */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-sm">
                2. Générer le package d'installation Windows (.exe)
              </span>
              <button
                onClick={() => copyToClipboard('npm run package:win', 'cmd2')}
                className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCmd === 'cmd2' ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>
            <p className="text-slate-600">
              Cette commande compile le frontend Vite, le backend Express + SQLite dans{' '}
              <span className="font-mono font-semibold">electron/dist/desktop-backend.cjs</span>,
              puis génère l&apos;installateur NSIS et la version Portable 64-bit :
            </p>
            <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg font-mono text-xs overflow-x-auto">
              npm run package:win
            </pre>
            <p className="text-[11px] text-slate-500">
              Pour lancer directement le mode Desktop en local :{' '}
              <span className="font-mono font-bold text-slate-700">npm run electron:start</span> (ou
              en mode serveur local seul :{' '}
              <span className="font-mono font-bold text-slate-700">npm run dev:local</span>).
            </p>
          </div>

          {/* Étape 3 */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-800 text-sm">
              3. Récupérer l'exécutable dans le dossier release/
            </div>
            <p className="text-slate-600">
              Une fois le packaging terminé, l&apos;installateur autonome (utilisable directement
              par l&apos;utilisateur final sans aucune configuration) est généré dans :
            </p>
            <div className="p-3 bg-emerald-50 text-emerald-900 rounded-lg font-mono font-semibold border border-emerald-200">
              📁 release/OASIS HYDRO SUITE Setup {project.version}.exe
            </div>
          </div>
        </div>
      </div>

      {/* Arborescence des Fichiers de Distribution Créés dans le Projet */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <FolderCheck className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold font-['Montserrat'] tracking-wide">
            Fichiers de Packaging & Persistance Autonome Intégrés
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
            <div className="text-cyan-300 font-bold">electron/main.cjs & preload.cjs</div>
            <div className="text-slate-400 text-[11px]">
              Lance automatiquement le backend Express + SQLite embarqué dans userData/data ou
              PORTABLE_EXECUTABLE_DIR/data.
            </div>
          </div>

          <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
            <div className="text-cyan-300 font-bold">electron/dist/desktop-backend.cjs</div>
            <div className="text-slate-400 text-[11px]">
              Bundle autonome incluant l&apos;API REST, les moteurs métier et le provider SQLite
              WebAssembly (sql-wasm.wasm).
            </div>
          </div>

          <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
            <div className="text-emerald-400 font-bold">electron-builder.json</div>
            <div className="text-slate-400 text-[11px]">
              Configuration NSIS x64 + Portable, ressources extraResources (sql-wasm.wasm,
              default.json) et association .oasis.json.
            </div>
          </div>

          <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
            <div className="text-amber-400 font-bold">config/default.json</div>
            <div className="text-slate-400 text-[11px]">
              Paramétrage par défaut sans secret : mode local SQLite activé automatiquement sans
              configuration utilisateur.
            </div>
          </div>

          <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
            <div className="text-amber-400 font-bold">.github/workflows/ci.yml</div>
            <div className="text-slate-400 text-[11px]">
              Pipeline CI : lint TypeScript strict, tests unitaires/SQLite/API et build
              Web/Electron.
            </div>
          </div>

          <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
            <div className="text-purple-400 font-bold">npm run package:win</div>
            <div className="text-slate-400 text-[11px]">
              Compile frontend + backend embarqué et génère l&apos;exécutable Windows dans release/.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
