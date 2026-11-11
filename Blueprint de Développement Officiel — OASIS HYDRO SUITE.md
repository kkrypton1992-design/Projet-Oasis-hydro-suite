# Blueprint de Développement Officiel — OASIS HYDRO SUITE

---

## 1. Identification des Composants Logiciels Réels

- **Frontend Web** : interface utilisateur interactive (Next.js + React).  
- **Frontend Desktop** : application autonome (Electron ou similaire).  
- **Backend API Gateway** : orchestrateur services, authentification, routage API REST/GraphQL.  
- **Service Gestion Projets & Utilisateurs** : CRUD projets, gestion rôles, audit, versioning.  
- **Service Données SIG & Import/Export** : traitement MNT, import CAO/BIM, gestion SIG.  
- **Service Hydrologie** : calculs pluie, ruissellement, analyse fréquentielle.  
- **Service Hydraulique** : permanente, transitoire, 2D, ouvrages.  
- **Service Dimensionnement & Catalogue** : calculs dimensionnements, catalogues produits.  
- **Service Contrôles Qualité & Conformité** : vérification calculs, normes, qualité étude.  
- **Service Rapport & Planification** : génération rapports et plans finaux.  
- **Service IA & Recommandations** : moteur règles expert, aide à décision, apprentissage.  
- **Base de Données PostgreSQL/PostGIS** : stockage relationnel et spatial.  
- **File d’attente / Message Broker** (ex: RabbitMQ, Kafka) : orchestration tâches asynchrones.

---

## 2. Décomposition Technique en Modules

| Module                     | Description                                       | Technologies            | Principales Responsabilités                      |
|----------------------------|-------------------------------------------------|------------------------|-------------------------------------------------|
| Auth & Gestion Utilisateurs| Gestion sécurité, sessions, rôles                | Node.js, OAuth2/JWT    | Authentification, autorisation, auditing        |
| Gestion Projets            | Organisation projets/études/scénarios            | Node.js, Postgres      | CRUD projets, versioning, workflow validation   |
| Gestion SIG & Import       | MNT, CAO/BIM import/export, SIG spatial          | Node.js, GDAL, PostGIS | Import/export, traitement MNT, SIG vectoriel    |
| Hydrologie                 | Calculs pluies, ruissellement, analyse           | Node.js/Python         | Modèles pluie-débit, analyse fréquentielle      |
| Hydraulique                | Simulation hydraulique 1D & 2D                   | Node.js/Python         | Calculs écoulement, transitoire, ouvrages       |
| Dimensionnement Catalogue  | Dimensionnement normé + sélection catalogue      | Node.js                | Paramètres dimensionnement, catalogue normé     |
| Contrôle Qualité & Normes  | Vérifications conformité, qualité étude          | Node.js                | Application normes, contrôle plausibilité       |
| Rapport & Plans            | Génération document, plans, nomenclatures        | Node.js, Puppeteer     | Création rapports, export PDF/DWG/IFC           |
| IA & Recommandations       | Moteur règles, apprentissage machine              | Python                 | Recommandations techniques, analyse multicritère|

---

## 3. Dépendances Techniques & Interfaces

- Frontend ↔ API Gateway via REST/GraphQL sécurisé  
- API Gateway ↔ Microservices via HTTP + authentification JWT  
- Microservices ↔ Database (PostgreSQL/PostGIS) via ORM (ex: Prisma)  
- Microservices Hydrologie & Hydraulique ↔ file queues pour traitement asynchrone  
- Import/Export Module ↔ stockage fichiers + base pour données spatiales  
- Rapport & Plans Module ↔ accès données calculs + templates  
- IA Module ↔ communication bidirectionnelle via API REST interne

---

## 4. Tâches de Développement & Priorités

### Phase 1 (Socle indispensable)  
- Authentification & gestion utilisateurs  
- Gestion projets, études, scénarios  
- Import MNT basique, stockage, visualisation  
- Modélisation axes & bassins  
- Calculs hydrologiques de base  
- Visualisation cartes de base  

### Phase 2 (Calculs hydrauliques & dimensionnement)  
- Calcul hydraulique permanent + ouvrages types  
- Dimensionnement buses, dalots, fossés, caniveaux  
- Contrôle qualité simplifié (vitesses admissibles)  
- Rapports techniques simples  

### Phase 3 (Normes, contrôles avancés, recommandations)  
- Bibliothèque normes intégrée  
- Contrôles qualité complets  
- Moteur recommandations auto  
- Développement catalogue d’ouvrages  

### Phase 4 (Production documentaire & plans avancés)  
- Génération plans profils, coupes, réseaux  
- Export multi-format (PDF, DWG, IFC)  
- Notes de calcul détaillées  

### Phase 5 (Extensions avancées hydrauliques & IA)  
- Hydraulique transitoire, 2D  
- Bassins de rétention, barrage, affouillement  
- Analyse sensibilité, scénarios, optimisation  
- IA intégrée et module aide à la décision  

---

## 5. Structure Complète des Dossiers et Organisation du Code

/oasis-hydro-suite ├── /frontend-web │ ├── /components │ ├── /pages │ ├── /styles │ └── /utils ├── /frontend-desktop │ └── (Electron-based app structure) ├── /backend │ ├── /api-gateway │ ├── /auth-service │ ├── /project-service │ ├── /sig-service │ ├── /hydrology-service │ ├── /hydraulics-service │ ├── /dimensioning-service │ ├── /quality-control-service │ ├── /reporting-service │ └── /ai-recommendation-service ├── /shared │ ├── /models (types, interfaces DB & API) │ ├── /utils │ └── /constants ├── /scripts (deploy, migrations, data import) └── /database ├── /migrations ├── /schemas ├── /seeders └── /functions


---

## 6. Organisation Base de Données

- Schéma **public** partitionné selon modules fonctionnels  
- Utilisation extensive de types spatiaux PostGIS (geometry, geography, raster)  
- Tables principales : projets, études, scénarios, utilisateurs, dem_tiles, tin_nodes, streams, watersheds, catalog_items, design_results, quality_checks, reports  
- Fonctions stockées SQL/PLPGSQL pour traitements critiques (MNT, agrégations)  
- Index spatiaux GiST/BRIN pour performances  
- Historique et versioning par tables dédiées (audit, logs)  

---

## 7. Interfaces Entre Modules

| De                  | Vers                | Type Interface            | Données / Fonctionnalités                        |
|---------------------|---------------------|---------------------------|-------------------------------------------------|
| Frontend            | API Gateway         | REST/GraphQL sécurisé     | Requêtes UI : CRUD, calculs, visualisation      |
| API Gateway         | Auth Service        | HTTP internal API         | Authentification, gestion sessions               |
| API Gateway         | Project Service     | HTTP internal API         | Gestion projet/études/scénarios                   |
| API Gateway         | SIG Service         | HTTP internal API         | Import/export, requêtes spatiales                 |
| API Gateway         | Hydro Service       | HTTP internal API & MQ    | Calculs hydrologie, gestion scénarios             |
| API Gateway         | Hydrolic Service    | HTTP internal API & MQ    | Calculs hydraulique, simulations                   |
| API Gateway         | Dimensioning Service| HTTP internal API         | Dimensionnements, catalogue                         |
| API Gateway         | Quality Control     | HTTP internal API         | Vérifications, conformité                          |
| API Gateway         | Reporting Service   | HTTP internal API         | Génération rapports, plans                         |
| API Gateway         | AI Recommendations  | HTTP internal API         | Recommandations, diagnostic, optimisation         |
| Microservices       | Database            | SQL/Spatial queries       | Persistante données, accès lecture/écriture       |
| Async Tasks         | MQ Broker           | Message passing           | Exécution calculs asynchrones, notification       |

---

## 8. Définition des Tâches Clés de Développement

- Mise en place environnement dev & CI/CD  
- Implémentation Authentification & sécurisation  
- Développement gestion projet + UI liste & création  
- Intégration MNT et visualisation carto  
- Implémentation premiers calculs hydrologiques  
- Mise en place API gateway et orchestration services  
- Développement hydraulique permanent & ouvrages de base  
- Dimensionnement et base catalogue normé  
- Module contrôle qualité automatique  
- Génération rapports techniques simples  
- Ajout import/export CAO/BIM et traitements satellitaires  
- Implémentation IA et recommandations techniques  
- Finalisation documentation, tests, mise en production

---

# Conclusion

Ce blueprint structure méthodiquement OASIS HYDRO SUITE en composants techniques, interfaces claires et parcours de développement en phases cohérentes. Il supportera la montée en charge projet et serve de guide d’implémentation détaillé pour l’équipe.

---
