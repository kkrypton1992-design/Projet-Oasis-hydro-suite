# Dossier de Démarrage Réel du Sprint 1 — OASIS HYDRO SUITE

---

## 1. Tables Exactes à Créer Pendant Sprint 1

- users  
- roles  
- projects  
- studies  
- scenarios  
- versions  
- audit_log  
- dem_tiles  
- watersheds  

---

## 2. Migrations Exactes à Prévoir

- Création schémas `public` et `gis`  
- Tables listées ci-dessus avec :  
  - Clés primaires (UUID)  
  - Clés étrangères projet → étude → scénario  
  - Index GiST sur `watersheds.geom`  
  - Contraintes NOT NULL sur champs critiques (id, name, created_at)  
- Mise en place triggers audit sur tables critiques  
- Seed données initiales (rôles, permissions par défaut)

---

## 3. Endpoints Exacts à Développer Durant Sprint 1

- **Auth** : POST `/api/auth/login`, POST `/api/auth/logout`  
- **Users** : GET/POST/PUT/DELETE `/api/users`  
- **Projects** : GET/POST/PUT/DELETE `/api/projects`  
- **Studies** : GET/POST `/api/projects/{projectId}/studies`  
- **Scenarios** : GET/POST `/api/studies/{studyId}/scenarios`  
- **Versions** : GET `/api/scenarios/{scenarioId}/versions`  
- **DEM Tiles** : POST `/api/dem_tiles/import`, GET `/api/dem_tiles`  
- **Watersheds** : GET/POST `/api/scenarios/{scenarioId}/watersheds`  
- **Audit Log** : GET `/api/audit_log`  

---

## 4. Écrans Exacts à Développer Durant Sprint 1

- Écran de login/logout  
- Dashboard projet simplifié (liste projets récents, accès rapide)  
- Gestion projet/étude/scénario (création, édition, liste)  
- Importateur MNT (upload GeoTIFF)  
- Visualisation cartographique basique (MNT + bassins)  

---

## 5. Composants Frontend à Développer

- Formulaire login  
- Liste projets avec filtres/recherche  
- Formulaires création/édition projets, études, scénarios  
- Composant import MNT (upload + validation)  
- Carte interactive Leaflet affichage MNT et bassins  
- Message d’erreur et feedback utilisateur  
- Navigation globale entre écrans (header + menu latéral)

---

## 6. Composants Backend à Développer

- Service Auth (login/logout, gestion tokens)  
- Service gestion utilisateurs avec rôles  
- Service gestion projets, études, scénarios, versions  
- Service SIG import MNT/DEM et gestion bassins  
- Service audit log, implémentation triggers d’enregistrement  
- API Gateway configuration de routage et sécurité

---

## 7. Services à Développer

- Authentification & Autorisation  
- Gestion CRUD projets & études  
- Import MNT et traitement stockage base spatiale  
- Visualisation géospatiale basique (API restitutions données)  
- Audit et traçabilité actions utilisateurs

---

## 8. Tâches Quotidiennes Ordonnées

1. Mise en place environnement dev, repo et CI/CD  
2. Implémentation Auth + tests unitaires  
3. Setup base PostgreSQL/PostGIS + migrations initiales  
4. Service projets CRUD et relation études/scénarios  
5. Composants UI login et dashboard simplifié  
6. Importateur MNT backend + interface upload frontend  
7. Service SIG bassins et API cartographiques basiques  
8. Intégration audit logs et tests sécurité  
9. Revue code, tests intégrés, corrections bugs  
10. Documentation API et user guide initiale  

---

## 9. Ordre Exact d’Implémentation

1. Auth Service + User Management  
2. Base de données + migrations + audit  
3. CRUD projets, études, scénarios  
4. Frontend login et dashboard projet  
5. Import MNT + stockage dans base  
6. Interface cartographie simple  
7. Audit logging  
8. Tests & corrections

---

## 10. Critères de Validation Finaux

- Authentification fonctionnelle et sécurisée  
- CRUD complet et sans erreurs critiques  
- Import MNT réussi avec vue base cartographique  
- Interface fluide et responsive  
- Audit log avec traçabilité complète  
- Tests unitaires > 80%  
- Tests intégration réussite  
- Documentation API et guides disponibles

---

## 11. Definition of Done (DoD) Sprint 1

- Code implémenté et revu par au moins 2 développeurs  
- Tests unitaires et d’intégration automatisés passés  
- Fonctionnalités conformes au cahier de charges SFF  
- Déploiement automatisé en environnement dev/préprod  
- Documentation technique mise à jour  
- Validation utilisateur métier (demonstration, feedback positif)

---

## 12. Plan Pour Début Immédiat du Travail

- Cloner monorepo initial vide avec structure validée  
- Configurer environnement local + base PostgreSQL + PostGIS  
- Démarrer développement Auth Service : API et UI login  
- Parallèlement débuter définition modèles données + migration DB  
- Mise en place pipeline CI/CD basique  
- Programmer sprint planning et daily scrums  
- Synchroniser mise au point API projets CRUD

---

# Conclusion

Ce dossier sert de guide opérationnel clair, séquencé et pragmatique pour garantir le lancement immédiat, contrôlé et réussi du Sprint 1 d’OASIS HYDRO SUITE.

---

*Document officiel - base de référence pour toute l’équipe à partir du démarrage Sprint 1.*  
