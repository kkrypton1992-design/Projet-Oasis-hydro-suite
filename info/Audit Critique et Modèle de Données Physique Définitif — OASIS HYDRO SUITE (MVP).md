# Audit Critique et Modèle de Données Physique Définitif — OASIS HYDRO SUITE (MVP)

---

## 1. Tables Insuffisamment Détaillées & Enrichissement Proposé

### A. Table `watersheds`

| Champ              | Type         | Description                                  | Obligatoire |
|--------------------|--------------|----------------------------------------------|-------------|
| id                 | UUID         | Identifiant unique                           | Oui         |
| scenario_id        | UUID         | Référence scénario                           | Oui         |
| name               | TEXT         | Nom bassin versant                           | Oui         |
| area_km2           | NUMERIC(10,4)| Surface en km²                              | Oui         |
| perimeter_km       | NUMERIC(10,4)| Périmètre en km                             | Oui         |
| mean_slope         | NUMERIC(5,3) | Pente moyenne                               | Oui         |
| longest_flow_path  | NUMERIC(10,3)| Plus long chemin d’écoulement en km        | Oui         |
| compactness_index  | NUMERIC(5,4) | Indice de compacité (nombre sans unité)    | Oui         |
| gravelius_index    | NUMERIC(5,4) | Indice de Gravelius                         | Oui         |
| min_elevation      | NUMERIC(10,3)| Altitude minimale (m)                       | Oui         |
| max_elevation      | NUMERIC(10,3)| Altitude maximale (m)                       | Oui         |
| outlet_point       | GEOMETRY(POINT, SRID) | Point exutoire géographique          | Oui         |
| watershed_type     | VARCHAR(50)  | Type (urbain, rural, mixte)                 | Oui         |
| status             | VARCHAR(20)  | Statut (actif, brouillon, archivé...)      | Oui         |
| created_at         | TIMESTAMP    | Date de création                            | Oui         |
| updated_at         | TIMESTAMP    | Date de mise à jour                         | Oui         |
| organization_id    | UUID         | Entité responsable (client, bureau)        | Optionnel   |

**Champs supplémentaires recommandés** :  
- `land_use_classification` (JSONB) : occupation du sol détaillée  
- `roughness_coefficient` (NUMERIC) : moyenne rugosité liée  
- `soil_type` (VARCHAR) : catégorie pédologique

---

### B. Table `culverts`

| Champ                 | Type         | Description                                  | Obligatoire |
|-----------------------|--------------|----------------------------------------------|-------------|
| id                    | UUID         | Identifiant unique                           | Oui         |
| scenario_id           | UUID         | Scénario associé                            | Oui         |
| name                  | TEXT         | Nom/identifiant ouvrage                     | Oui         |
| pk                    | NUMERIC(10,2)| Point kilométrique de localisation          | Oui         |
| material              | VARCHAR(50)  | Matériau (béton, PVC, métal…)               | Oui         |
| diameter              | NUMERIC(6,2) | Diamètre en mètre                            | Oui         |
| length                | NUMERIC(6,2) | Longueur en mètre                            | Oui         |
| slope                 | NUMERIC(5,4) | Pente (m/m ou %)                            | Oui         |
| invert_upstream       | NUMERIC(10,3)| Altitude radier amont                        | Oui         |
| invert_downstream     | NUMERIC(10,3)| Altitude radier aval                         | Oui         |
| roughness             | NUMERIC(4,3) | Coefficient rugosité Manning ou équivalent  | Oui         |
| design_flow           | NUMERIC(10,3)| Débit de dimensionnement (m3/s)              | Oui         |
| calculated_velocity   | NUMERIC(6,3) | Vitesse hydraulique calculée (m/s)           | Optionnel   |
| status                | VARCHAR(20)  | Statut opérationnel, validation               | Oui         |
| created_at            | TIMESTAMP    | Date création                               | Oui         |
| updated_at            | TIMESTAMP    | Date modification                            | Oui         |
| notes                 | TEXT         | Observations spécifiques                      | Optionnel   |

**Champs supplémentaires recommandés** :  
- `number_of_pipes` (INTEGER) : pour multi-pipes  
- `cross_section_shape` (VARCHAR) : circulaire, elliptique, rectangulaire etc.

---

### C. Table `box_culverts` (dalots)

| Champ                 | Type        | Description                                    | Obligatoire |
|-----------------------|-------------|------------------------------------------------|-------------|
| id                    | UUID        | Identifiant unique                             | Oui         |
| scenario_id           | UUID        | FK scénario                                   | Oui         |
| name                  | TEXT        | Identifiant dalot                             | Oui         |
| pk                    | NUMERIC(10,2) | Point kilométrique                            | Oui         |
| material              | VARCHAR(50) | Matériau                                      | Oui         |
| length                | NUMERIC(6,2)| Portée (m)                                    | Oui         |
| width                 | NUMERIC(6,2)| Largeur section                               | Oui         |
| height                | NUMERIC(6,2)| Hauteur section                               | Oui         |
| invert_upstream       | NUMERIC(10,3)| Altitude amont                               | Oui         |
| invert_downstream     | NUMERIC(10,3)| Altitude aval                                | Oui         |
| roughness             | NUMERIC(4,3)| Coef. rugosité                               | Oui         |
| design_flow           | NUMERIC(10,3)| Débit dimensionnement                         | Oui         |
| calculated_velocity   | NUMERIC(6,3)| Vitesse hydraulique calculée                   | Optionnel   |
| status                | VARCHAR(20) | Statut et validation                            | Oui         |
| created_at            | TIMESTAMP   | Date création                                | Oui         |
| updated_at            | TIMESTAMP   | Date mise à jour                             | Oui         |

---

### D. Table `ditches` (fossés)

| Champ                 | Type        | Description                                    | Obligatoire |
|-----------------------|-------------|------------------------------------------------|-------------|
| id                    | UUID        | Identifiant unique                             | Oui         |
| scenario_id           | UUID        | FK scénario                                   | Oui         |
| name                  | TEXT        | Nom fossé                                     | Oui         |
| geometry              | GEOMETRY(LINESTRING, SRID) | Section transversale (profil)           | Oui         |
| slope                 | NUMERIC(5,4)| Pente fossé                                   | Oui         |
| roughness             | NUMERIC(4,3)| Coef. rugosité                               | Oui         |
| design_flow           | NUMERIC(10,3)| Débit à évacuer                              | Oui         |
| calculated_velocity   | NUMERIC(6,3)| Vitesse calculée                              | Optionnel   |
| status                | VARCHAR(20) | Statut                                        | Oui         |
| created_at            | TIMESTAMP   | Date création                                | Oui         |
| updated_at            | TIMESTAMP   | Date modification                            | Oui         |

---

### E. Table `design_flows`

| Champ                 | Type         | Description                                  | Obligatoire |
|-----------------------|--------------|----------------------------------------------|-------------|
| id                    | UUID         | Identifiant                                  | Oui         |
| scenario_id           | UUID         | FK scénario                                  | Oui         |
| duration             | INTEGER      | Durée pluie (minutes)                        | Oui         |
| frequency            | NUMERIC(7,3) | Fréquence de retour en années                | Oui         |
| peak_flow            | NUMERIC(10,3)| Débit pic calculé (m3/s)                     | Oui         |
| volume               | NUMERIC(10,3)| Volume total pluie (mm)                       | Optionnel   |
| created_at           | TIMESTAMP    | Date création                               | Oui         |
| updated_at           | TIMESTAMP    | Date modification                           | Oui         |

---

### F. Table `time_concentration`

| Champ                 | Type         | Description                                 | Obligatoire |
|-----------------------|--------------|---------------------------------------------|-------------|
| id                    | UUID         | Identifiant                                | Oui         |
| watershed_id          | UUID         | FK bassin                                  | Oui         |
| formula               | VARCHAR(50)  | Formule utilisée (Kirpich, Passini, etc.) | Oui         |
| value_minutes         | NUMERIC(6,2) | Temps de concentration (minutes)           | Oui         |
| created_at            | TIMESTAMP    | Date création                             | Oui         |
| updated_at            | TIMESTAMP    | Date modification                         | Oui         |

---

### G. Table `report_instances`

| Champ                 | Type         | Description                                | Obligatoire |
|-----------------------|--------------|--------------------------------------------|-------------|
| id                    | UUID         | Identifiant                               | Oui         |
| project_id            | UUID         | FK projet                                 | Oui         |
| scenario_id           | UUID         | FK scénario                               | Oui         |
| version               | INTEGER      | Version du rapport                        | Oui         |
| template_id           | UUID         | FK modèle de rapport                      | Oui         |
| status                | VARCHAR(20)  | brouillon, validé, signé, diffusé         | Oui         |
| content               | BYTEA / TEXT | Contenu binaire ou texte du rapport       | Oui         |
| created_at            | TIMESTAMP    | Date création                            | Oui         |
| updated_at            | TIMESTAMP    | Date modification                        | Oui         |

---

### H. Table `quality_checks`

| Champ                 | Type         | Description                               | Obligatoire |
|-----------------------|--------------|-------------------------------------------|-------------|
| id                    | UUID         | Identifiant                              | Oui         |
| scenario_id           | UUID         | FK scénario                             | Oui         |
| check_type            | VARCHAR(50)  | Type de vérification (vitesse, pente...)| Oui         |
| status                | VARCHAR(20)  | OK, Warning, Error                       | Oui         |
| message               | TEXT         | Description résultat                    | Oui         |
| created_at            | TIMESTAMP    | Date création                          | Oui         |

---

## 2. Champs Obligatoires (minimum)

- Identifiants (UUID) sur toutes tables  
- FK relations clés pour cohérence  
- Champs état/statut/conformité dans toutes entités critiques  
- Horodatages création/mise à jour pour audit

---

## 3. Index Recommandés

- Index GiST sur colonnes géométriques (watersheds.geom, ditches.geom)  
- Index B-Tree sur foreign keys, status, dates création  
- Index composés sur scénario_id + type de contrôle/check  
- Index texte sur noms projets, ouvrages pour recherche rapide

---

## 4. Contraintes Métier

- Unicité nom bassin par scénario  
- Coherence géométrique PostGIS (polygones valides)  
- Cohérence entre paramètres dimensionnels ouvrages et résultats calculs  
- Validation obligatoire des FK avant insertion  
- Contrôle des plages de données (ex : pente entre 0 et 1)

---

## 5. Tables Manquantes Identifiées

- `stations` (pluviométriques détaillées)  
- `hydro_series` (séries temporelles débit/pluie)  
- `material_properties` (rugosité, caractéristiques matériaux)  
- `user_comments` (commentaires et annotations collaborateurs)  
- `document_templates` (modèles documentaires institutionnels)  
- `workflow_states` (états et transitions workflow)  

---

## 6. Tables d’Audit

- `audit_log` (action, user_id, table, record_id, old_value, new_value, timestamp)  
- `calculation_log` (calcul_id, type, start_time, end_time, status, messages)  
- `quality_check_log` (quality_check_id, previous_status, new_status, timestamp)  

---

## 7. Tables de Workflow

- `workflow_items` (objet_id, objet_type, state, assigned_user, date_assigned, date_completed)  
- `workflow_actions` (item_id, action_type, user_id, timestamp, comment)  

---

## 8. Tables de Traçabilité

- `version_log` (record_type, record_id, version_number, changes_summary, timestamp)  
- `change_requests` (id, scenario_id, description, user_id, status, timestamps)  

---

## 9. Tables IA Nécessaires

- `ai_recommendations` (id, scenario_id, target_entity, recommendation_text, confidence_score, status, timestamp)  
- `ai_explanations` (recommendation_id, explanation_text)  
- `ai_models` (model_name, version, description, active)  
- `ai_user_feedback` (recommendation_id, user_id, feedback_text, rating, timestamp)  

---

# 10. Relations Résumées (à intégrer dans diagrammes relationnels finaux)

- Projet 1‑N Études, Étude 1‑N Scénarios, Scénario 1‑N Bassins/Ouvrages/Calculs  
- Bassin lié aux résultats hydrologiques, hydraulique, dimensionnement  
- Ouvrage lié à dimensionnement et calculs hydrauliques  
- Contrôles qualité liés à Scénario et Ouvrages  
- Rapports reliés à Scénario, versions validées, utilisateurs auteurs

---

# Conclusion

Ce modèle de données physique définitif sert de socle technique structurant la construction de la base PostgreSQL/PostGIS pour MVP OASIS HYDRO SUITE.

Il intègre enrichissements métiers, cohérence normative, contraintes techniques et prépare la scalabilité fonctionnelle future.

---

*Document à référencer impérativement pour la conception physique et les API métier.*  
