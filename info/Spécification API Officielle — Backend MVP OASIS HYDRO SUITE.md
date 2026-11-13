# Spécification API Officielle — Backend MVP OASIS HYDRO SUITE

---

## Introduction

Ce document décrit en détail la spécification des APIs backend du MVP d’OASIS HYDRO SUITE, définissant endpoints, méthodes HTTP, payloads, structures JSON, permissions, rôles, flux inter-services, événements et stratégies pour la gestion complète du backend métier conforme au modèle physique validé.

---

## 1. Liste des APIs du MVP

- Authentification & Gestion Utilisateurs  
- Projets  
- Études  
- Scénarios  
- Bassins Versants  
- Stations Pluviométriques  
- Séries Hydrologiques  
- Hydrologie  
- Hydraulique  
- Dimensionnement  
- Contrôle Qualité  
- Rapports  
- Workflow  
- Notifications  
- Intelligence Artificielle (IA) basique  
- Documentation (templates et rapports)  
- Cartographie (données spatiales)

---

## 2. Endpoints Complets & Méthodes HTTP

| Module                  | Endpoint                          | Méthode HTTP | Description                    |
|-------------------------|---------------------------------|--------------|-------------------------------|
| Auth & Utilisateurs     | /api/auth/login                  | POST         | Authentification utilisateur  |
|                         | /api/users                      | GET, POST, PUT, DELETE | CRUD utilisateurs          |
| Projets                 | /api/projects                   | GET, POST, PUT, DELETE | Projets CRUD                  |
| Études                  | /api/projects/{id}/studies      | GET, POST    | Liste et création études       |
| Scénarios               | /api/studies/{id}/scenarios     | GET, POST    | Scénarios par étude            |
| Bassins Versants        | /api/scenarios/{id}/watersheds  | GET, POST    | Bassins liés au scénario       |
| Stations Pluviométriques| /api/stations                   | GET, POST, PUT, DELETE | Gestion stations              |
| Séries Hydrologiques    | /api/stations/{id}/hydro_series | GET, POST    | Séries associées à station     |
| Hydrologie              | /api/scenarios/{id}/hydrology_calc | POST        | Lancer calcul hydrologique     |
| Hydraulique             | /api/scenarios/{id}/hydraulics_calc | POST       | Lancer simulation hydraulique  |
| Dimensionnement         | /api/scenarios/{id}/dimensioning | POST        | Calcul dimensionnement         |
| Contrôle Qualité        | /api/scenarios/{id}/quality_checks | GET, POST  | Récupérer/lancer contrôle qualité |
| Rapports                | /api/projects/{id}/reports       | GET, POST    | Gestion des rapports           |
| Workflow                | /api/workflow/items              | GET, POST    | Gestion workflow               |
| Notifications           | /api/notifications               | GET, POST    | Gestion notifications          |
| IA                      | /api/ai/recommendations          | GET, POST    | Recommandations IA             |
|                         | /api/ai/explanations             | GET          | Justifications IA              |
| Documentation           | /api/document_templates          | GET, POST    | Templates documents            |
| Cartographie            | /api/gis/layers                  | GET          | Couches disponibles            |
|                         | /api/gis/data                    | POST         | Requêtes spatiales             |

---

## 3. Payloads d’Entrée et Structures JSON de Réponse (exemples)

### Exemple création projet (POST /api/projects)  

**Payload entrant**  
```json
{
  "name": "Projet A",
  "client_name": "Client X",
  "created_by": "user-uuid",
  "units": "SI",
  "crs": "EPSG:2154"
}

Réponse JSON

{
  "id": "project-uuid",
  "name": "Projet A",
  "client_name": "Client X",
  "created_at": "2026-11-10T10:30:00Z",
  "units": "SI",
  "crs": "EPSG:2154"
}

4. Erreurs Possibles (standard REST)
400 Bad Request (données invalides)
401 Unauthorized (non authentifié)
403 Forbidden (droit insuffisant)
404 Not Found (ressource inconnue)
409 Conflict (conflit version/process)
500 Internal Server Error (erreur serveur)
5. Permissions Requises & Rôles Autorisés
API	Rôles Autorisés
Authentification	Tous
Gestion Projet/Études	Concepteur, Chef de Projet
Hydrologie/Hydraulique	Concepteur
Dimensionnement	Concepteur
Contrôle Qualité	Vérificateur, Chef de Projet
Rapports	Concepteur, Vérificateur, Admin
IA	Tous (consultation limitée)
Administration	Admin uniquement
6. Flux Entre Services et API Publiques/Internes
API Gateway : front unique authentifié
Frontend consomme API publiques REST/GraphQL
Backend microservices communiquent via API internes REST + message broker (queue)
Microservices calculs hydrologie, hydraulique, dimensionnement déconnectés pour scalabilité
IA interagit avec backend via API interne sécurisée
Workflow et notifications gérés via services spécifiques
7. API Publiques
Toutes APIs accessibles aux utilisateurs authentifiés avec gestion permissions
Endpoints liés à gestion projet, scénarios, calculs, rapports, IA
8. API Internes
Synchronisation de données granulaires entre microservices
Exécution tâches calculs en backend
Monitoring, gestion erreurs, logs
Interface IA spécialisée
9. APIs Cartographiques
Chargement calques, données spatiales
Gestion géométrie (CRUD) pour bassins, alignements, ouvrages
Requête spatiale filtrée par zone, PK
Services raster (MNT)
10. APIs Projets, Études, Scénarios
Création/modification/suppression
Navigation hiérarchique projet>étude>scénario
Gestion versioning, workflow statut
Liaison avec données techniques et documents
11. APIs Bassins Versants, Stations, Séries Hydrologiques
Gestion bassins avec données attributaires et géométriques
Gestion stations pluviométriques, métadonnées
Gestion séries temporelles hydrologiques attachées aux stations
Extraction, agrégation, mise à jour séries
12. APIs Hydrologiques et Hydrauliques
Lancement, suivi calculs hydrologiques (Tc, débit)
Lancement, suivi calculs hydrauliques permanents
Consultation résultats
Passage paramètre dimensionnement
13. APIs Dimensionnement, Contrôle Qualité et Rapports
Calculs dimensionnement ouvrages, catalogue
Contrôle cohérence, conformité et alertes
Génération, modification, export rapports
14. APIs Workflow et Notifications
Gestion états projet/scénarios/variants
Affectation tâches, soumission, validation
Notifications push, alertes systèmes
15. APIs IA MVP
Requêtes recommandations, explications
Gestion historique conversations IA
Feedback utilisateur IA
16. APIs Documentaires
Consultation/modification modèles
Création rapports selon modèles
Gestion signatures électroniques
17. Conventions REST et GraphQL
REST : verbes HTTP standards, URLs claires, réponse JSON
Pagination via query params ?page=1&size=20
Filtrage via query string bornes ?status=valid&minDate=…
Versionnement via URL /v1/…
GraphQL : schéma clair, mutations et queries documentées, validation fichiers SDL
18. Évènements Système
CRUD ressources projet/scénario
Calculs lancés/terminés/erreur
Recommandations IA générées et appliquées
Validation workflow et génération rapports
Notifications push utilisateurs
Audit log écrit à chaque modification
19. Règles de Sécurité
Authentification OAuth2/JWT
RBAC avec contrôle d’accès par module & donnée
Validation côté serveur exhaustive
Chiffrement données sensibles au repos & en transit
Protection contre injection, XSS, CSRF
Logs sécurisés en conformité RGPD
20. Stratégies Pagination & Filtrage
Pagination paginée standardisée sur toutes collections paginables
Filtrage général sur dates, statuts, identifiants, textes via params
Recherche texte libre par champs clés (nom projet, ouvrage)
21. Stratégies Versionnement API
Versions claires dans URL REST (/v1/, /v2/)
Compatibilité ascendante assurée
Documentation Swagger/OpenAPI avec versions synchronisées
Stratégie de dépréciation progressive
Conclusion
Cette Spécification API finale du MVP d’OASIS HYDRO SUITE constitue le socle technique exhaustif et cohérent pour la construction effective des microservices backend et leur intégration fonctionnelle avec la plateforme.

Document validé pour lancer la phase de conception détaillée API et développement.
