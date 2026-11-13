# Data Model Officiel — OASIS HYDRO SUITE (MVP)

---

## 1. Tables MVP Principales

| Table                     | Description                                |
|---------------------------|--------------------------------------------|
| users                     | Utilisateurs de la plateforme               |
| roles                     | Rôles et permissions                        |
| projects                  | Projets hydrologiques/hydrauliques          |
| studies                   | Études spécifiques dans un projet           |
| scenarios                 | Variantes/scénarios au sein d’une étude     |
| versions                  | Versions d’études/scénarios                   |
| dem_tiles                 | Tuiles MNT stockées                          |
| watersheds                | Bassins versants                              |
| streams                   | Cours d’eau/réseaux hydrographiques          |
| culverts                  | Buses/ouvrages linéaires                     |
| box_culverts              | Dalots                                        |
| ditches                   | Fossés                                       |
| project_rainfalls         | Données pluviométriques liés aux scénarios   |
| time_concentration        | Temps de concentration calculés               |
| design_flows              | Débits projet calculés                        |
| culvert_designs           | Dimensionnements buses                        |
| box_culvert_designs       | Dimensionnements dalots                       |
| quality_checks            | Contrôles qualité réalisés                     |
| velocity_check            | Vérification vitesses admissibles              |
| report_templates          | Modèles types de rapports                      |
| report_instances          | Instances générées de rapports                 |

---

## 2. Champs et Types de Données (Extraits)

| Table               | Champ                | Type                   | Description              | Clé/Index               |
|---------------------|----------------------|------------------------|--------------------------|-------------------------|
| users               | id                   | UUID                   | Identifiant unique       | PK, Index               |
|                     | username             | VARCHAR(50)            | Nom utilisateur          | Unique, Index           |
|                     | email                | VARCHAR(100)           | Email utilisateur        | Unique                  |
| projects            | id                   | UUID                   | Projet ID                | PK                      |
|                     | name                 | TEXT                   | Nom projet               | Index                   |
|                     | client_name          | TEXT                   | Client                   |                         |
|                     | created_at           | TIMESTAMP              | Date création            |                         |
| studies             | id                   | UUID                   | Étude ID                 | PK                      |
|                     | project_id           | UUID                   | FK projet                | FK, Index               |
|                     | name                 | TEXT                   | Nom étude                |                         |
| scenarios           | id                   | UUID                   | Scénario ID              | PK                      |
|                     | study_id             | UUID                   | FK étude                 | FK, Index               |
|                     | name                 | TEXT                   | Nom scénario             |                         |
| watersheds          | id                   | UUID                   | Bassin ID                | PK                      |
|                     | scenario_id          | UUID                   | FK scénario              | FK, Index               |
|                     | geom                 | GEOMETRY (Polygon)     | Géométrie spatiale       | GiST Spatial Index      |
| project_rainfalls   | id                   | UUID                   | Pluie projet ID          | PK                      |
|                     | scenario_id          | UUID                   | FK scénario              | FK, Index               |
|                     | duration             | INTEGER                | Durée (minutes)          |                         |
|                     | intensity            | NUMERIC (5,2)          | Intensité pluie (mm/h)   |                         |
| time_concentration  | id                   | UUID                   | ID calcul                 | PK                      |
|                     | watershed_id         | UUID                   | FK bassin                 | FK, Index               |
|                     | value_minutes        | NUMERIC (5,2)          | Temps de concentration    |                         |
| design_flows        | id                   | UUID                   | ID débit projet           | PK                      |
|                     | scenario_id          | UUID                   | FK scénario               | FK, Index               |
|                     | flow_Q10             | NUMERIC (10,3)         | Débit période de retour 10 ans |                  |
| culverts            | id                   | UUID                   | Ouvrage busse ID          | PK                      |
|                     | scenario_id          | UUID                   | FK scénario               | FK                      |
|                     | diameter             | NUMERIC (5,2)          | Diamètre                  |                         |
|                     | material             | VARCHAR(50)            | Matériau ouvrages         |                         |
| culvert_designs     | id                   | UUID                   | Dimensionnement ID        | PK                      |
|                     | culvert_id           | UUID                   | FK busse                  | FK                      |
|                     | design_parameters    | JSONB                  | Paramètres dimensionnement|                         |
| quality_checks      | id                   | UUID                   | Contrôle qualité ID       | PK                      |
|                     | scenario_id          | UUID                   | FK scénario               | FK                      |
|                     | check_type           | VARCHAR(50)            | Type contrôle             |                         |
|                     | status               | VARCHAR(20)            | OK / Warning / Erreur     |                         |
| velocity_check      | id                   | UUID                   | Vérification vitesse ID   | PK                      |
|                     | culvert_id           | UUID                   | FK busse                  | FK                      |
| report_instances    | id                   | UUID                   | Rapport ID                | PK                      |
|                     | project_id           | UUID                   | FK projet                 | FK                      |
|                     | scenario_id          | UUID                   | FK scénario               | FK                      |
|                     | version              | INTEGER                | Version                   |                         |

---

## 3. Clés Primaires, Étrangères, Index

- PK généralement UUID sur toutes les tables métiers.  
- FK assurent intégrité entre projets → études → scénarios → données techniques  
- Index GiST spatiaux sur champs geometrie (watersheds, streams)  
- Index classiques sur champs souvent filtrés (status, date, nom).

---

## 4. Relations

- Un Projet → plusieurs Études  
- Une Étude → plusieurs Scénarios  
- Un Scénario → multiples Bassins, Stations, Ouvrages, Calculs, Dimensions, Qualités  
- Un Ouvrage ↔ Dimensionnements (1-N)  
- Calculs liés à scénarios (1-N)  
- Rapports liés à projets, études, scénarios.

---

## 5. Contraintes

- Unicité noms projets & études par utilisateur  
- Validité géométrique stricte sur données spatiales (polygones fermés)  
- Contrainte de présence obligatoire sur données critiques (ex : bassin lié à scénario)  
- Contraintes typos et domaines (ex : status dans set {OK, Warning, Error})

---

## 6. Entités Métiers (Résumé)

- Utilisateur, Projet, Étude, Scénario, Version  
- Bassin Versant, Station Pluviométrique  
- Ouvrage (bus, dalot, fossé)  
- Calcul Hydrologique & Hydraulique  
- Dimensionnement  
- Qualité & Contrôle  
- Rapport & Documentation  
- Données Géospatiales (MNT, profils)

---

## 7. Événements Système

- Création/Mise à jour des projets/études/scénarios  
- Modification données spatiales  
- Exécution calculs hydrologiques/hydrauliques  
- Validation dimensionnement  
- Lancement contrôle qualité  
- Versionnage/modification rapports  
- Application recommandations IA

---

## 8. Schémas PostgreSQL/PostGIS Détailés

- Partition physique en schemas métiers  
- Géométrie et raster en PostGIS (POINT, LINESTRING, POLYGON)  
- Utilisation JSONB pour stockage flexible paramétrage dimensionnement, résultats calculs  
- Fonctions PL/pgSQL pour calculs spatiaux (accumulation flux, pente), triggers audit

---

## 9. Conventions de Nommage

- Tables en snake_case, pluriel  
- Colonnes en snake_case descriptive  
- Clés primaires : `id` UUID  
- Clés étrangères : `<nom_table>_id` UUID  
- Index nommés `idx_<table>_<colonne>`  
- Triggers audit nommés `audit_<table>_trigger`

---

## 10. Tables de Logs et Audit

- `audit_log` : historique complet actions CRUD par utilisateur  
- `calculation_logs` : historique exécution calculs, erreurs  
- `quality_check_logs` : détail détection erreurs et correctifs  
- `report_change_logs` : traçabilité édition rapports  
- Triggers automatiques pour capturer changements tables critiques

---

## 11. Tables de Workflow

- `workflow_states` : définitions des états (brouillon, validé, signé)  
- `workflow_items` : liens objets métier avec états  
- `workflow_actions` : actions utilisateurs avec horodatage  
- Intégration avec audit_log pour remontée historique complète

---

# Diagramme Conceptuel (Synthèse)

[users]--(1,N)-->[projects]--(1,N)-->[studies]--(1,N)-->[scenarios]--(1,N)-->[versions] | +-->[watersheds]--(1,N)-->[streams] |
+-->[project_rainfalls] +-->[culverts]--(1,N)-->[culvert_designs] +-->[quality_checks] +-->[report_instances]


---

# Conclusion

Ce Data Model officiel décrit précisément la structure sous-jacente du MVP d’OASIS HYDRO SUITE, assurant une base robuste, extensible et conforme pour la conception et réalisation de la base de données et services liés.

Il sert de guide technique exhaustif et normé pour toute l’équipe développement et administration base données.

---


