# Master Backlog Officiel — OASIS HYDRO SUITE

---

## Objectif  
Ce backlog constitue la liste exhaustive et priorisée des fonctionnalités, modules et tâches à développer pour la construction d’OASIS HYDRO SUITE, avec dépendances, sous-tâches, critères d’acceptation et estimation complexité.

---

# 1. Liste des Modules & Ordre de Réalisation

| Ordre | Module                              | Priorité | Dépendances                         | Complexité (Estimation) |
|-------|-----------------------------------|----------|-----------------------------------|------------------------|
| 1     | Authentification & Gestion Utilisateurs | Critique | -                                 | Moyenne                |
| 2     | Gestion Projets & Études           | Critique | 1                                 | Moyenne                |
| 3     | Gestion MNT Import & Visualisation | Critique | 2                                 | Élevée                 |
| 4     | Modélisation Axe & Bassins         | Critique | 3                                 | Élevée                 |
| 5     | Calculs Hydrologiques de Base      | Critique | 4                                 | Élevée                 |
| 6     | Visualisation Cartographique       | Critique | 3                                 | Moyenne                |
| 7     | Calculs Hydrauliques Permanents    | Haute    | 5, 4                              | Élevée                 |
| 8     | Dimensionnement Ouvrages de Base   | Haute    | 7, 2                              | Moyenne à Élevée       |
| 9     | Contrôles Qualité Simplifiés       | Haute    | 5, 7                              | Moyenne                |
| 10    | Rapport Technique Basique          | Haute    | 2, 5, 7                           | Moyenne                |
| 11    | Import/Export CAO & BIM            | Moyenne  | 3                                 | Élevée                 |
| 12    | Bibliothèque Normes & Catalogues   | Moyenne  | 2                                 | Moyenne à Élevée       |
| 13    | Contrôles Qualité Avancés & Normes | Moyenne  | 9, 12                            | Élevée                 |
| 14    | IA & Moteur de Recommandations     | Moyenne  | 9, 12                            | Très élevée            |
| 15    | Hydraulique Transitoire & 2D       | Faible   | 7, 11                            | Très élevée            |
| 16    | Production Documentaire Avancée    | Faible   | 10, 11                           | Moyenne à Élevée       |
| 17    | Scénarios, Analyse Sensibilité, Optimisation | Faible | 14, 13                     | Élevée à Très élevée   |

---

# 2. Tâches Détaillées par Module

---

## 1. Authentification & Gestion Utilisateurs

- Tâche 1.1 : Implémenter login/logout, gestion sessions  
  - Sous-tâches : OAuth2 integration, JWT issuance  
  - Critères : utilisateur peut se connecter, rester authentifié, se déconnecter  
  - Complexité : Moyenne  

- Tâche 1.2 : Gestion rôles & permissions  
  - Sous-tâches : définition rôles, assignations, contrôle accès UI/API  
  - Critères : accès restreint conforme rôles  
  - Complexité : Moyenne  

- Tâche 1.3 : Audit des connexions et actions  
  - Sous-tâches : logging sécurisés, consultation logs  
  - Critères : traçabilité complète des connexions/actions  
  - Complexité : Moyenne  

---

## 2. Gestion Projets & Études

- Tâche 2.1 : CRUD projets, études, scénarios  
- Tâche 2.2 : Gestion métadonnées (SCR, unités, statut)  
- Tâche 2.3 : Versioning et verrouillage  
- Critères : projet créé avec données complètes, historique accessible, verrouillage fonctionnel  
- Complexité : Moyenne  

---

## 3. Gestion MNT Import & Visualisation

- Tâche 3.1 : Import formats GeoTIFF, LAS/LAZ  
- Tâche 3.2 : Stockage et indexation dans PostGIS  
- Tâche 3.3 : Visualisation carte et vue 3D basique  
- Tâche 3.4 : Nettoyage (remplissage, lissage)  
- Critères : import réussi sans erreur, rendus cartographiques visibles, traitement qualité ok  
- Complexité : Élevée  

---

## 4. Modélisation Axe & Bassins

- Tâche 4.1 : Création/édition axe (geométrie, PK)  
- Tâche 4.2 : Extraction/représentation bassins versants  
- Tâche 4.3 : Validation topologique  
- Critères : axe fiable visuellement, bassins associés cohérents  
- Complexité : Élevée  

---

## 5. Calculs Hydrologiques de Base

- Tâche 5.1 : Implémenter calcul temps de concentration  
- Tâche 5.2 : Modèles ruissellement (Méthode rationnelle, SCS, CN)  
- Tâche 5.3 : Analyse fréquentielle (Gumbel, Log-Pearson)  
- Critères : calculs respectent formules, résultats comparables manuellement  
- Complexité : Élevée  

---

## 6. Visualisation Cartographique

- Tâche 6.1 : Intégration Leaflet/Mapbox dans UI  
- Tâche 6.2 : Couche raster MNT, vecteurs bassins et ouvrages  
- Tâche 6.3 : Interaction (sélection, édition simple)  
- Critères : carte interactive fonctionnelle et fluide  
- Complexité : Moyenne  

---

## 7. Calculs Hydrauliques Permanents

- Tâche 7.1 : Équations de Manning, Chezy  
- Tâche 7.2 : Modélisation écoulement bus, dalots, fossés  
- Tâche 7.3 : Simulation régime permanent  
- Critères : résultats cohérents, validation tests physiques  
- Complexité : Élevée  

---

## 8. Dimensionnement Ouvrages de Base

- Tâche 8.1 : Saisie paramètres physiques  
- Tâche 8.2 : Calculs dimensionnement  
- Tâche 8.3 : Sélection dans catalogue normes  
- Critères : output dimensionnement conforme calculs attendus  
- Complexité : Moyenne à Élevée  

---

## 9. Contrôles Qualité Simplifiés

- Tâche 9.1 : Validation cohérence données  
- Tâche 9.2 : Vérification vitesses admissibles  
- Critères : alertes affichées, corrections possibles  
- Complexité : Moyenne  

---

## 10. Rapport Technique Basique

- Tâche 10.1 : Modèles templates de rapport  
- Tâche 10.2 : Intégration résultats calculs  
- Critères : rapport généré complet, exportable en PDF  
- Complexité : Moyenne  

---

# 3. Interfaces entre Modules

| Source Module         | Cible Module           | Interface                | Données échangées                  |
|----------------------|-----------------------|-------------------------|----------------------------------|
| Frontend             | Auth Service          | REST/GraphQL             | Credentials, tokens               |
| Frontend             | Project Service       | REST/GraphQL             | Projet/étude CRUD                 |
| Project Service       | SIG Service           | API interne REST         | Données géospatiales projet      |
| SIG Service          | Hydrologie Service    | API interne REST         | Bassins, données terrains        |
| Hydrologie Service    | Hydraulique Service   | API interne + MQ         | Débits, hydrogrammes             |
| Hydraulique Service   | Dimensionnement       | API interne REST         | Paramètres hydraulique            |
| Dimensionnement       | Quality Control       | API interne REST         | Résultats calculés                |
| Quality Control       | Reporting Service     | API interne REST         | Validation résultats             |
| Reporting Service     | Frontend              | REST/GraphQL             | Documents générés                |
| AI Recommendation     | Frontend & Quality Control | REST interne         | Alertes, recommandations          |

---

# 4. Critères d’Acceptation Transverses

- Fonctionnalité conforme aux spécifications métier  
- Tests unitaires et d’intégration réussis  
- Réactivité interface sous seuil (ex: <300ms)  
- Sécurité respectée (auth, permissions)  
- Gestion erreurs et montée en charge validées  
- Documentation mise à jour et claire  

---

# 5. Estimation de Complexité globale

| Complexité   | Description                              |
|--------------|----------------------------------------|
| Faible       | Composants UI statiques, opérations CRUD simples.  
| Moyenne      | Intégrations API multiple, calculs métier simples.  
| Élevée      | Traitement SIG, calculs hydrauliques/scientifiques complexes, imports/exports CAO.  
| Très élevée | Moteur IA, hydraulique transitoire 2D, optimisation multi-critères complexes.  

---

Ce master backlog sert de feuille de route dynamique pour démarrer immédiatement le développement complet, en respectant la cohérence technique et métier d’OASIS HYDRO SUITE.  
