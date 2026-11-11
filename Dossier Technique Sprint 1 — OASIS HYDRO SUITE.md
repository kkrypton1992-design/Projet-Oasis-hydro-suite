# Dossier Technique Sprint 1 — OASIS HYDRO SUITE

---

## 1. Objectifs Exacts du Sprint 1

- Mettre en place l’infrastructure socle du MVP pour permettre la gestion sécurisée de projets, utilisateurs et études simples.  
- Implémenter la gestion basique des projets, études, scénarios et versions.  
- Développer le module d’authentification robuste et sécurisée (login/logout, gestion sessions).  
- Implémenter un import MNT basique et la visualisation cartographique initiale.  
- Poser les bases des API REST/GraphQL pour backend/frontend.  
- Construire un socle base de données PostgreSQL/PostGIS avec les tables fondamentales et architecture initiale.

---

## 2. Fonctionnalités Incluses

- Authentification sécurisée (JWT, OAuth2) et gestion des rôles.  
- CRUD projets, études, scénarios, versions avec validation simple.  
- Import MNT en GeoTIFF  
- Visualisation cartographique basique (affichage tuiles MNT et bassins)  
- Modélisation simple des bassins versants (création, listing)  
- API Gateway initiale avec routage sécurisé  
- Versioning simple des entités projets  
- Journalisation basique des actions (audit log)

---

## 3. Fonctionnalités Excluses

- Calculs hydrologiques, hydrauliques  
- Dimensionnement  
- Contrôle qualité avancé  
- IA et recommandations  
- Rapports automatiques  
- Collaboration multi-utilisateurs avancée  
- Calculs hydrauliques transitoires et 2D

---

## 4. Microservices Concernés

- Auth Service  
- User & Project Service  
- SIG & Import Service

---

## 5. Tables Concernées

| Table              | Description                         |
|--------------------|-----------------------------------|
| users              | Utilisateurs                      |
| roles              | Rôles                            |
| projects           | Projets                          |
| studies            | Études                          |
| scenarios          | Scénarios                       |
| versions           | Versions études/scénarios        |
| audit_log          | Journal des actions              |
| dem_tiles          | Tuiles MNT                      |
| watersheds         | Bassins versants basiques        |

---

## 6. API Concernées

- Auth API : `/api/auth/login`, `/api/auth/logout`  
- User/Project API : `/api/users`, `/api/projects`, `/api/studies`, `/api/scenarios`, `/api/versions`  
- SIG API : `/api/dem_tiles`, `/api/watersheds`  
- Audit API : `/api/audit_log`

---

## 7. Écrans Concernés

- Dashboard minimaliste (liste projets récents)  
- Gestion projet/étude/scénario (création, édition, consultation simple)  
- Import MNT (upload fichier)  
- Cartographie basique (visualisation MNT, bassins)  
- Authentification login/logout

---

## 8. Tâches Backend Détaillées

- Mise en place du serveur API Gateway avec gestion des routes sécurisées  
- Implémentation service d’authentification sécurisé (JWT, sessions)  
- CRUD utilisateurs et rôles, gestion permissions  
- Service gestion projets, études, scénarios CRUD avec versioning simple  
- Service import GeoTIFF et stockage MNT tuiles PostGIS  
- API carto pour requêtes tuiles MNT et bassins  
- Configuration base PostgreSQL/PostGIS et schémas initial  
- Mécanismes audit simple sur actions utilisateurs

---

## 9. Tâches Frontend Détaillées

- Construction écran login/logout, gestion sessions  
- Dashboard projet simple, liste projets récents  
- Formulaires création/édition projets, études, scénarios  
- Interface upload GeoTIFF (import MNT)  
- Visualisation cartographie basique (Leaflet) avec couches MNT et bassins  
- Gestion navigation et routage entre écrans

---

## 10. Tâches Base de Données Détaillées

- Création tables users, roles, projects, studies, scenarios, versions, audit_log, dem_tiles, watersheds  
- Configuration index spatiaux GiST sur champs geometry  
- Implémentation contraintes PK, FK  
- Scripts de migration versionnés  
- Seed data minimal pour rôles

---

## 11. Tâches Infrastructure Détaillées

- Provision Kubernetes cluster de développement  
- Configuration déploiement Docker conteneurs backend et frontend  
- Configuration pipeline CI/CD pour build, test et déploiement automatique  
- Mise en place monitoring basique (Prometheus, Grafana)  
- Mise en place centralisation logs (ELK stack)  

---

## 12. Dépendances Techniques

- Dépendance Auth Service avant User/Project  
- Bases données disponibles avant services SIG  
- Interface frontend dépend des API Auth et Projet  
- Cartographie dépend import MNT backend  
- CI/CD opérationnel pour tests automatisés

---

## 13. Critères d’Acceptation

- Authentification opérationnelle avec gestion session  
- Projets/études/scénarios CRUD fonctionnel sans erreurs  
- Import et visualisation MNT basique testés sur jeux réels  
- API répondent selon spécifications, tests automatisés verts  
- Interface frontend usable sans bug majeur  
- Audit logging activé, test couvertures ≥ 80%

---

## 14. Tests à Réaliser

- Tests unitaires backend & frontend  
- Tests intégration API gateway & microservices  
- Tests fonctionnels UI (formulaires, cartes)  
- Tests sécurité auth (accès non autorisés)  
- Tests performance API simples

---

## 15. Livrables Attendus

- Version code frontend-desktop et web MVP  
- Microservices Auth, Projet & SIG déployés en dev  
- Bases PostgreSQL/PostGIS avec données initiales  
- Documentation API MVP  
- Rapport tests Sprint 1  
- Pipeline CI/CD automatisé fonctionnel

---

## 16. Risques

- Difficultés intégration import MNT selon format/volume  
- Synchronisation API frontend-backend en début phase  
- Complexité gestion versioning évolutive  
- Problèmes performances premières cartes/spatial queries  
- Risques retard pipeline CI/CD impactant cadence

---

## 17. Estimations de Charge (Jours-Hommes)

| Activité                  | Charge Estimée |
|---------------------------|----------------|
| Backend Auth Service      | 15             |
| Backend Projet & User     | 20             |
| Backend SIG & Import      | 25             |
| Frontend Web & Desktop    | 30             |
| Base de données & Migrations | 15          |
| Infrastructure & CI/CD   | 15             |
| Tests & Documentation     | 10             |

---

# Conclusion

Ce dossier technique Sprint 1 est la base opérationnelle pour démarrer le développement du MVP concret, assurant une construction ordonnée, ciblée et maîtrisée d’OASIS HYDRO SUITE.

---

*Document final et officiel pour pilotage équipe développement Sprint 1.*  
