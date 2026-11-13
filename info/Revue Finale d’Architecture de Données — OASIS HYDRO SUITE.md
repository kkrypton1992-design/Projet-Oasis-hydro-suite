# Revue Finale d’Architecture de Données — OASIS HYDRO SUITE

---

## 1. Vérification de la Présence de Toutes Entités Métiers

Après audit approfondi, les entités métier nécessaires pour le MVP et prochaines itérations sont incluses, notamment :  
- Gestion projets/scénarios/versions  
- Données SIG (MNT, bassins, alignements, réseaux)  
- Hydrologie (stations, pluies, séries, calculs Tc, débits)  
- Hydraulique (structures linéaires, dimensionnements)  
- Qualité et conformité (contrôles, alertes)  
- Documentation (modèles, rapports, versions)  
- Agents IA (recommandations, justifications, conversations)  
- Workflow (états, actions, traçabilité)  

---

## 2. Tables Manquantes Identifiées & Mise à Jour

- Aucune table métier supplémentaire majeure ne doit être ajoutée après cette révision.  
- Tables complémentaires déjà proposées (ex : `stations`, `hydro_series`, `ai_conversations`) sont intégrées pleinement.  

---

## 3. Description Complète des Tables Clés Additionnelles

### A. Table `stations`

| Champ             | Type         | Description                                | Obligatoire |
|-------------------|--------------|--------------------------------------------|-------------|
| id                | UUID         | Identifiant unique                         | Oui         |
| name              | TEXT         | Nom station                               | Oui         |
| location          | GEOMETRY(POINT, SRID) | Coordonnées spatiales                    | Oui         |
| elevation         | NUMERIC(10,3)| Altitude                                  | Optionnel   |
| operator          | TEXT         | Exploitant station                        | Optionnel   |
| status            | VARCHAR(20)  | Statut opérationnel                       | Oui         |
| created_at        | TIMESTAMP    | Date création                            | Oui         |
| updated_at        | TIMESTAMP    | Date modification                        | Oui         |

### B. Table `hydro_series`

| Champ             | Type         | Description                                | Obligatoire |
|-------------------|--------------|--------------------------------------------|-------------|
| id                | UUID         | Identifiant unique                         | Oui         |
| station_id        | UUID         | FK station                                | Oui         |
| datetime          | TIMESTAMP    | Date & heure enregistrement               | Oui         |
| value             | NUMERIC      | Valeur mesurée (débit, pluie, etc.)       | Oui         |
| measurement_type  | VARCHAR(50)  | Type de donnée (débit, pluie)              | Oui         |
| quality_flag      | VARCHAR(20)  | Indicateur qualité données                  | Optionnel   |

### C. Table `alignments`

| Champ             | Type           | Description                              | Obligatoire |
|-------------------|----------------|------------------------------------------|-------------|
| id                | UUID           | Identifiant allem.                      | Oui         |
| project_id        | UUID           | FK projet                               | Oui         |
| name              | TEXT           | Nom alignement                         | Oui         |
| geometry          | GEOMETRY(LINESTRING, SRID) | Géométrie alignement                  | Oui         |
| start_pk          | NUMERIC(10,2)  | Point kilométrique début                | Oui         |
| end_pk            | NUMERIC(10,2)  | Point kilométrique fin                  | Oui         |
| created_at        | TIMESTAMP      | Date création                          | Oui         |
| updated_at        | TIMESTAMP      | Date modification                      | Oui         |

### D. Table `hydraulic_structures`

- Fusion possible culverts, box_culverts, ditches pour simplification initiale  
- Champs génériques :  
  - `id`, `scenario_id`, `name`, `type` (bus, dalot, fossé, pont...), `geometry`, `material`, `dimensions` (jsonb), `position_pk`, `status`, `created_at`, `updated_at`

### E. Table `ai_recommendations`

| Champ             | Type       | Description                            | Obligatoire |
|-------------------|------------|----------------------------------------|-------------|
| id                | UUID       | Recommendation ID                     | Oui         |
| scenario_id       | UUID       | FK scénario                          | Oui         |
| target_entity     | TEXT       | Type entité ciblée (ouvrage, bassin) | Oui         |
| recommendation_text| TEXT      | Texte de recommandation               | Oui         |
| confidence_score  | NUMERIC(4,2)| Score IA                             | Oui         |
| status            | VARCHAR(20)| Statut (active, appliquée, rejetée) | Oui         |
| created_at        | TIMESTAMP  | Date création                        | Oui         |

### F. Table `ai_explanations`

| Champ             | Type       | Description                            | Obligatoire |
|-------------------|------------|----------------------------------------|-------------|
| id                | UUID       | Explication ID                       | Oui         |
| recommendation_id | UUID       | FK recommandations                   | Oui         |
| explanation_text  | TEXT       | Texte détaillé explication            | Oui         |

### G. Table `ai_decisions`

| Champ             | Type       | Description                            | Obligatoire |
|-------------------|------------|----------------------------------------|-------------|
| id                | UUID       | Décision IA ID                      | Oui         |
| scenario_id       | UUID       | FK scénario                        | Oui         |
| decision_text     | TEXT       | Décision prise par IA               | Oui         |
| decision_date     | TIMESTAMP  | Date décision                      | Oui         |

### H. Table `ai_conversations`

| Champ             | Type       | Description                            | Obligatoire |
|-------------------|------------|----------------------------------------|-------------|
| id                | UUID       | Conversation ID                     | Oui         |
| user_id           | UUID       | FK utilisateur                     | Oui         |
| message_text      | TEXT       | Message utilisateur ou IA           | Oui         |
| sender            | VARCHAR(20)| "user" ou "IA"                     | Oui         |
| timestamp         | TIMESTAMP  | Date/heure message                 | Oui         |

### I. Table `document_templates`

| Champ             | Type       | Description                            | Obligatoire |
|-------------------|------------|----------------------------------------|-------------|
| id                | UUID       | ID modèle de document                | Oui         |
| name              | TEXT       | Nom modèle                         | Oui         |
| client_name       | TEXT       | Client ou institution associée      | Optionnel   |
| structure         | JSONB      | Structure & sections                 | Oui         |
| styles            | JSONB      | Styles, logos, couleurs personnalisées | Oui         |
| created_at        | TIMESTAMP  | Date création                      | Oui         |
| updated_at        | TIMESTAMP  | Date modif                         | Oui         |

### J. Table `workflow_items`

| Champ             | Type       | Description                            | Obligatoire |
|-------------------|------------|----------------------------------------|-------------|
| id                | UUID       | ID état workflow                    | Oui         |
| object_type       | TEXT       | Type objet métier (Projet, étude...) | Oui         |
| object_id         | UUID       | ID objet métier                     | Oui         |
| state             | VARCHAR(30)| État (Brouillon, Validé, Signé...) | Oui         |
| assigned_user_id  | UUID       | Utilisateur affecté                  | Optionnel   |
| date_assigned     | TIMESTAMP  | Date affectation                   | Oui         |
| date_completed    | TIMESTAMP  | Date complétion                   | Optionnel   |
| comments          | TEXT       | Commentaire d’état               | Optionnel   |

---

## 4. Cohérence avec MVP, SFF, PDD, Architecture Physique & UX

- Tous les champs essentiels aux écrans et modules MVP sont présents ou enrichis  
- Gestion complète des scénarios et variantes assurée au niveau des FK  
- Données géospatiales compatibles PostGIS (points, lignes, polygones)  
- Intégration claire et complète des besoins IA et workflow (tables dédiées)  
- Respect des normes nominatives et relationnelles validées  
- Conventions nommages alignées avec guide technique projet  
- Contrainte assurant la traçabilité et auditabilité cohérente avec besoins métier  

---

## 5. Tables Complémentaires de Logs, Audit, Traçabilité

- `audit_log` : capture toutes CRUD par utilisateur (table, ID, anciennes et nouvelles valeurs)  
- `calculation_log` : journalisation exécution calculs, erreurs, durée  
- `quality_check_log` : historique contrôles qualité et évolution statut  
- `document_change_log` : suivi édition rapports/note de calcul

---

## 6. Tables de Workflow

- `workflow_states` : définition des états possibles par objet  
- `workflow_transitions` : règles d’évolution entre états  
- `workflow_items` : objets suivis en workflow avec état et responsable  
- `workflow_actions` : journal actions utilisateur sur workflow

---

## 7. Tables IA Clés

- `ai_recommendations` & `ai_explanations` pour contrôle expert et justification  
- `ai_decisions` pour archivage décision IA  
- `ai_conversations` pour interaction dialogue IA-utilisateur  

---

# 8. Version Finale Figée du Modèle Physique

- Le modèle proposé intègre exhaustivement les besoins MVP validés, lié aux modules métiers et UI, avec extension IA, traçabilité et workflow.  
- Toute nouvelle table nécessitera modification formelle de la SFF.  
- Modèle prêt à supporter API, calculs distribués et montée en charge via architecture microservices.

---

*Ce document est la base technique ultime et stable pour la conception physique de la base et la construction des API d’OASIS HYDRO SUITE.*  
