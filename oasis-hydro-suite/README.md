# OASIS HYDRO SUITE

**Suite d'ingénierie hydrologique, hydraulique routière et cartographie SIG (Web SaaS & Desktop Electron)**

---

## 1. Périmètre Fonctionnel

### Utilisateurs cibles

- **LEAD_ENGINEER (Ingénieur Hydraulicien Chef)** : création/modification complète des études, calibration pluviométrique Montana, dimensionnement et validation des ouvrages.
- **HYDRAULICS_ENGINEER (Ingénieur d'Études)** : saisie des bassins versants, calculs de temps de concentration ($T_c$), résolution hydraulique Manning-Strickler et contrôle qualité.
- **CLIENT_VIEWER (Maître d'Ouvrage / Lecteur)** : consultation en lecture seule du tableau de bord, des cartes SIG et des notes de calcul.

### Workflow métier complet

1. **Paramétrage Projet (`DashboardView`)** : métadonnées contractuelles, périodes de retour de projet ($Q_{10}/Q_{25}/Q_{50}/Q_{100}$) et de vérification.
2. **Cartographie SIG (`GisMap`)** : visualisation Leaflet (OSM / Esri Satellite), gestion géographique des bassins versants et des ouvrages de franchissement par PK, export GeoJSON.
3. **Hydrologie (`HydrologyView`)** : calcul du temps de concentration ($T_c$ : Kirpich, Passini, Giandotti, Bransby-Williams), loi IDF de Montana $I(t)=a \cdot t^{-b}$, méthode Rationnelle $Q=\frac{C \cdot I \cdot A}{3.6}$.
4. **Hydraulique (`HydraulicsView`)** : solveur Manning-Strickler par dichotomie ($y_n$, $y_c$, $F_r$, vitesse, taux de remplissage, revanche) pour buses circulaires, dalots cadres et fossés trapézoïdaux + coupes SVG transversale et longitudinale.
5. **Dimensionnement Automatique (`DimensioningView`)** : sélection de section normalisée respectant remplissage admissible, $V_{\min}$, $V_{\max}$ et tirant d'air minimal.
6. **Contrôle Qualité (`QualityView`) & Diagnostic (`HydroAIAssistant`)** : audit normatif déterministe des ouvrages et indicateurs KPI.
7. **Reporting (`ReportViewer`)** : génération, archivage en base et export imprimable/PDF de la note de calcul officielle.

### Socle principal & mode autonome sans configuration

- **Mode Desktop / Local Autonome (par défaut)** : base de données **SQLite locale embarquée** (`oasis-hydro.sqlite` via WebAssembly `sql.js` + Drizzle ORM), créée et migrée automatiquement au premier lancement. **Aucun serveur PostgreSQL, aucun identifiant SQL et aucune configuration manuelle requis.**
- **Mode Backend Avancé (optionnel)** : compatibilité **PostgreSQL / PostGIS** via l'abstraction `DatabaseProvider` lorsque `DB_PROVIDER=postgres` ou `APP_MODE=remote` avec des identifiants `SQL_*`.
- **Optionnel** : intégration Gemini AI via `GEMINI_API_KEY` (si activée dans l'environnement serveur), build installateur Windows NSIS/Portable sur poste ou runner Windows.

---

## 2. Architecture du Projet

```text
├── config/
│   └── default.json           # Paramétrage par défaut sans secret (mode local SQLite)
├── electron/
│   ├── main.cjs               # Processus desktop CommonJS, lancement du backend embarqué
│   ├── preload.cjs            # Pont sécurisé contextBridge (menus, stockage local)
│   └── resources/             # Icônes .png / .ico
├── scripts/
│   └── build-electron-backend.mjs # Compile src/electron/desktopBackend.ts -> electron/dist/
├── src/
│   ├── config/                # Chargement & validation des modes (local | dev | prod | remote)
│   ├── core/                  # Domaines & calculs purs (Kirpich, Montana, Manning-Strickler, Audit)
│   ├── shared/validation/     # Schémas Zod partagés API / Domaine
│   ├── db/
│   │   ├── provider.ts        # Interface d'abstraction DatabaseProvider
│   │   ├── providerFactory.ts # Sélection automatique SQLite (défaut) ou PostgreSQL (optionnel)
│   │   ├── sqlite/            # Schéma Drizzle SQLite, migrations versionnées (_schema_migrations) & provider
│   │   ├── postgres/          # Schéma Drizzle PostgreSQL & provider optionnel
│   │   └── repositories/      # Repositories métier découplés du moteur SQL
│   ├── electron/              # Serveur Express embarqué pour l'exécutable Desktop
│   ├── services/              # Logique applicative & client HTTP /api/*
│   ├── server/                # App Express, logger JSON, erreurs typées, RBAC, routes REST
│   ├── components/            # Vues React modulaires par domaine
│   └── data/                  # Projet de référence (RN1)
├── tests/                     # Suite Vitest (core, persistance SQLite/migrations, backend Supertest, UI)
└── server.ts                  # Point d'entrée serveur Node/Express + Vite dev / dist prod
```

---

## 3. Guide d'Installation Utilisateur Final (Zéro Configuration)

1. **Installation Windows** :
   - Double-cliquez sur `OASIS HYDRO SUITE Setup 1.2.0.exe` (installateur NSIS avec raccourci Bureau) ou lancez directement la version portable (`oasis-hydro-suite.exe`).
   - Aucune installation de PostgreSQL, aucun fichier `.env` et aucun mot de passe ne sont demandés.
2. **Premier lancement automatique** :
   - Au démarrage, le logiciel crée automatiquement le répertoire de données locales (`%APPDATA%/OASIS HYDRO SUITE/data/` pour l'installateur ou `./data/` à côté de l'exécutable portable).
   - Le fichier `oasis-hydro.sqlite` est initialisé avec le schéma versionné et un jeu de données de référence prêt à l'emploi.
3. **Sauvegarde & transfert** :
   - Vos projets, bassins versants, ouvrages hydrauliques, workflow et notes de calcul sont enregistrés localement sur le disque (`Fichier > Ouvrir le Dossier des Données Locales` ou export `.oasis.json`).

---

## 4. Modes d'Environnement & Configuration Avancée

Le logiciel fonctionne sans `.env` grâce à `config/default.json`. Variables supportées :

| Variable                      | Description                                                            | Défaut                      |
| ----------------------------- | ---------------------------------------------------------------------- | --------------------------- |
| `APP_MODE`                    | `local` (SQLite autonome), `dev`, `prod`, `remote` (PostgreSQL requis) | `local`                     |
| `DB_PROVIDER`                 | `auto`, `sqlite` ou `postgres`                                         | `auto`                      |
| `SQLITE_DB_PATH`              | Chemin personnalisé du fichier `.sqlite`                               | `./data/oasis-hydro.sqlite` |
| `PORT`                        | Port HTTP Express                                                      | `3000`                      |
| `ENFORCE_RBAC`                | Exige `x-user-role` sur les écritures API (`true`/`false`)             | `false`                     |
| `SQL_HOST` / `SQL_USER` / ... | **Optionnel** : requis uniquement en `DB_PROVIDER=postgres` / `remote` | Non requis en local/desktop |

> **Fiabilité** : le serveur ne masque jamais les erreurs disque/SQL par un fallback silencieux. `/api/health` vérifie la disponibilité HTTP et `/api/ready` exécute un contrôle réel (`PRAGMA quick_check` sous SQLite ou `SELECT 1` sous PostgreSQL), renvoyant `503` en cas d'anomalie.

---

## 5. Commandes Développeur, Tests & Packaging

```bash
# 1. Installation des dépendances
npm install

# 2. Démarrage local autonome (SQLite embarqué, aucune config externe)
npm run dev:local

# 3. Démarrage développement standard (auto: SQLite local si SQL_* absent)
npm run dev

# 4. Qualité du code (TypeScript strict + ESLint + Prettier)
npm run typecheck
npm run lint
npm run format:check

# 5. Tests automatisés (Moteurs, Persistance & Migrations SQLite, API REST, Composants UI)
npm test
npm run test:coverage

# 6. Build production Web
npm run build
APP_MODE=local NODE_ENV=production npm start

# 7. Test & Packaging Desktop Electron (.exe NSIS + Portable)
npm run build:electron
npm run electron:start
npm run package:win

# 8. Vérification complète type CI
npm run ci:verify
```
