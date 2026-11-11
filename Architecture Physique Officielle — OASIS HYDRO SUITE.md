# Architecture Physique Officielle — OASIS HYDRO SUITE

---

## 1. Schéma Détaillé de la Base de Données

- Base relationnelle PostgreSQL avec extension spatiale PostGIS.  
- Présence de multiples schémas métier distincts (projets, hydrologie, hydraulique, dimensionnement, contrôle qualité, rapports).  
- Utilisation de tables spatiales (geometry, geography) et raster.  
- Architecture conforme aux normes ACID avec support transactions complexes.

---

## 2. Toutes les Tables Clés (Exemple par domaines)

**Plateforme & Projet**  
- users, roles, permissions  
- projects, studies, scenarios, versions  
- audit_log, licenses, units, crs

**Données SIG & Modélisation**  
- dem_tiles, tin_nodes, tin_triangles  
- watersheds, subwatersheds, streams, stream_nodes  
- alignments, alignment_segments, vertical_profiles, cross_sections, drainage_networks, drainage_nodes, drainage_links

**Hydrologie**  
- idf_curves, idf_stations, project_rainfalls, hyetographs  
- time_concentration, loss_methods, cn_composites, design_flows  
- hydro_series, freq_analysis, distribution_fits

**Hydraulique**  
- steady_flow_runs, water_surface_profiles, transient_runs  
- culverts, box_culverts, ditches, gutters, bridges, retention_basins  
- scour_calculations, sediment_runs, rating_curves, network_runs

**Dimensionnement & Catalogue**  
- culvert_designs, box_culvert_designs, ditch_designs  
- gutter_designs, basin_designs, bridge_designs, optimization_runs, catalog_items

**Contrôle Qualité & Conformité**  
- velocity_check, erosion_checks, compliance_runs  
- quality_checks, cross_checks, result_provenance, regulatory_checklists

**Documents & Rapports**  
- report_templates, report_instances, calculation_notes  
- drawing_exports, bill_of_quantities, export_jobs

**IA et Recommandations**  
- recommendation_rules, recommendations, sensitivity_runs  
- asset_diagnostics, rehabilitation_proposals

---

## 3. Relations Entre Tables

- Relations projet→études→scénarios (1-N)  
- Bassins liés à projets/sessions (1-N)  
- Ouvrages liés nativement à scénario + position PK (1-N)  
- Calculs, analyses liés à scénarios avec références résultats (1-N)  
- Historique versionné lié à objets métiers (many-to-many par table d’audit)  
- Utilisateurs liés à actions par log d’audit

---

## 4. Schémas PostgreSQL/PostGIS

- Schémas métiers départagés par domaine fonctionnel, ex :  
  - `public` (users, auth)  
  - `gis` (données spatiales : watersheds, streams)  
  - `hydrology` (pluies, débits)  
  - `hydraulics` (runs, ouvrages)  
  - `dimensioning` (catalogue, plans)  
  - `quality` (contrôles, alertes)  
  - `reporting` (documents, rapports)  
  - `ai` (recommandations, diagnostics)

---

## 5. Services Backend Réels

- **API Gateway** : authentification, routage, orchestration  
- **User & Project Management Service**  
- **SIG Data Service** : import/export, query spatiale  
- **Hydrology Service** : calculs pluie, ruissellement, fréquence  
- **Hydraulics Service** : simulation 1D/2D, ouvrages  
- **Dimensioning Service** : calcul dimensionnel, catalogues  
- **Quality Control Service** : vérifications, conformité  
- **Reporting Service** : génération rapports, exports  
- **AI Core Service** : agents IA spécialisés  
- **Notification & Workflow Service**

---

## 6. API Nécessaires

- REST/GraphQL API standard entre frontend et backend  
- Backend interne : microservices communiquant via API REST + message broker  
- Webhooks & push notifications pour mises à jour calculs  
- API externe connecteurs (météo, bases nationales)

---

## 7. Échanges Entre Modules

- Échanges asynchrones via queue de messages (RabbitMQ/Kafka)  
- Partage données maîtres (projets, bassins) via API Gateway  
- Résultats calculs hydrologie → hydraulique → dimensionnement  
- Conformité & contrôle qualité régulièrement synchronisés  
- Données IA alimentées avec résultats et historiques calculs  
- Mise à jour rapports intelligente et réactive

---

## 8. Flux de Données Complets

- Données brutes (MNT, stations, ouvrages) → ingestion → modélisation territoriale  
- Calculs hydrologiques → résultats → paramétrage hydraulique  
- Calcul hydraulique → validation dimensionnement  
- Contrôles qualité → rapports complétés → génération document final  
- Interactions utilisateurs → IA pour recommandations et corrections  
- Export multi-format (PDF, DWG, IFC, CSV)  
- Archivage sur stockage cloud sécurisé  

---

## 9. Organisation Physique des Microservices

- Microservices déployés dans conteneurs Docker  
- Orchestrés via Kubernetes avec réplications et scalabilité automatique  
- Services isolés : hydrologie, hydraulique, dimensionnement, IA, reporting, auth  
- BDD centralisée mais partitionnée par schéma et service  
- Services de logs et monitoring (ELK stack)

---

## 10. Structure Réelle des Dépôts Git

- `/frontend-web` — UI React/Next.js  
- `/frontend-desktop` — Electron + React/Next.js  
- `/backend/api-gateway` — API & auth  
- `/backend/service-hydrology`  
- `/backend/service-hydraulics`  
- `/backend/service-dimensioning`  
- `/backend/service-quality-control`  
- `/backend/service-reporting`  
- `/backend/service-ai`  
- `/shared` — modèles types, librairies communes  
- `/infrastructure` — scripts déploiement, IaC  
- `/docs` — documentation technique, manuels

---

## 11. Organisation des Répertoires

- Chaque microservice suit pattern :  
  - `/src` : code source  
  - `/tests` : tests unitaires et d’intégration  
  - `/config` : fichiers configuration  
  - `/migrations` : scripts base données  
  - `/docs` : doc API spécifique  

- Frontend séparé par plateformes avec composants réutilisables dans `/shared`

---

## 12. Modèles de Données & Entités Métiers

- **Projet** : metadata, phases, utilisateurs  
- **Bassin** : géométrie, propriétés morphométriques  
- **Station Pluvio** : localisation, séries historiques  
- **Ouvrage Hydraulique** : caractéristiques, dimensionnements, états  
- **Calcul** : type, paramètres, résultats, statuts  
- **Rapport** : versions, contenu, états workflow  
- **Recommandation** : texte, modèle, criticité  
- **Alerte** : type, gravité, référence calcul/contrôle

---

## 13. Événements Système

- Création/modification projets, scénarios  
- Fin calcul hydrologie, hydraulique, dimensionnement  
- Nouvelle alerte générée par qualité  
- Recommandation IA générée  
- Validation rapport/signature  
- Import/export données

---

## 14. Architecture Calcul Hydrologique

- Service dédié microservice exécutant algorithmes pluie-débit  
- Exposition API calculs, simulation temps réel et batch  
- Intégration analyse fréquentielle, routage hydrologique  
- Flexibilité formules avec paramètres dynamiques

---

## 15. Architecture Calcul Hydraulique

- Microservice calcul 1D, 1D transitoire, 2D optionnel  
- Workflow modulaire, possibilité simulation multi-scénarios  
- Intégration modélisation ouvrages complexes, affouillement  
- Interface API pour intégration dimensionnement et contrôle qualité

---

## 16. Architecture Documentaire

- Service gestion modèles templates modulaires, personnalisables  
- Génération rapports dynamiques multi-format (PDF, DOCX, XLSX)  
- Intégration IA directrice documentaire  
- Versioning, archivage, signature électronique

---

## 17. Architecture IA

- Orchestrateur IA central coordonnant agents dédiés  
- Pipelines apprentissage supervisé, règles heuristiques  
- Intégration direct avec modules métier et reporting  
- Chatbot et interfaces conversationnelles multicanales

---

## 18. Composants Desktop

- Application Electron avec interface complète  
- Capacité traitement local intensif (calculs préliminaires)  
- Fonctionnalités offline + synchronisation cloud  
- Support multi-écrans/docking panneaux IA/workflow

---

## 19. Composants Web

- Frontend React/Next.js responsive  
- Collaboration temps réel, notifications push  
- Modalités calcul execution cloud backend  
- Gestion historiques et versionning partagé

---

## 20. Composants Cloud

- Backend microservices Docker/Kubernetes  
- Orchestration calculs, IA, sécurité, load balancing  
- Stockage sécurisé et sauvegardes  
- API publiques/privées sécurisées et scalables

---

## 21. Composants Obligatoires du MVP

- Authentification, gestion projets & études  
- Import MNT et visualisation cartographique basique  
- Calculs hydrologiques & hydraulique permanents simples  
- Gestion de scénarios, résultats, génération rapports basiques  
- Interface utilisateur Web/Desktop minimale viable

---

## 22. Composants de la Version 1

- Calcul hydraulique transitoire 1D  
- Dimensionnement normé, catalogue ouvrages simple  
- Contrôle qualité automatisé premier niveau  
- IA directeur technique & recommandations de base  
- Export multi-format amélioré  
- Gestion avancée versioning et workflow

---

## 23. Composants de la Version 2

- Hydraulique avancé 2D et affouillement  
- Optimisation multi-critères & analyse sensibilité IA  
- Agent IA expert Afrique & mission de contrôle  
- Rédacteur professionnel IA complet  
- Bibliothèque documentaire avancée & modèles institutionnels  
- Collaboration multi-utilisateurs complète, gestion licences flottantes

---

# Conclusion

Cette Architecture Physique officielle définit la composition complète, les interactions, la structuration technique et physique du logiciel OASIS HYDRO SUITE.

Elle servira de guide rigoureux et stable à l’équipe technique pour la conception détaillée, implémentation, tests et déploiement du projet.

---

*Document de référence final validé pour la construction effective d’OASIS HYDRO SUITE.*  
