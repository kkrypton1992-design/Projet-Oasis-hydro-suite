# Schéma Directeur Officiel d’OASIS HYDRO SUITE

---

## 1. Introduction

Le présent document d’architecture constitue la référence officielle pour la conception, le développement et la maintenance d’OASIS HYDRO SUITE, plateforme professionnelle d’études hydrologiques et hydrauliques. Il s’appuie sur l’architecture métier V2 validée, intégrant les exigences scientifiques, géospatiales, normatives et métier des bureaux d’études et entreprises de génie civil.

---

## 2. Composants du système

### Couche 0 — Plateforme & Services transverses (Socle)  
- **Gestion de projets, études, scénarios**  
- **Gestion utilisateurs & rôles, workflow validation**  
- **Versioning, traçabilité, audit**  
- **Gestion unités et systèmes de coordonnées (SCR)**  
- **API métier & connecteurs externes**  
- **Gestion licences et modes déploiement**

### Couche 1 — Données d’ingénierie & référentiels  
- **Gestion MNT/DEM (import, édition, analyses topographiques)**  
- **SIG d’ingénierie (couches spatiales, opérations SIG)**  
- **Import / Export CAO (DWG, DXF, LandXML, IFC)**  
- **Bibliothèque de normes**  
- **Catalogue normé d’ouvrages et matériaux**  
- **Bases nationales (données historiques, stations, IDF)**  
- **Gestion documentaire (données, rapports, références)**

### Couche 2 — Modélisation du territoire & axe  
- **Modélisation de l’axe d’infrastructure (alignements, profils)**  
- **Réseau hydrographique (extraction, édition, topologie)**  
- **Délimitation des bassins versants interfacés à l’axe**  
- **Profils en long et profils en travers (automatisation & édition manuelle)**  
- **Réseau de drainage (nœuds, liens, équipements)**  
- **Occupation du sol, pédologie, croisement hydrologique**  
- **Zones inondables et analyse d’aléa**

### Couche 3 — Moteur scientifique hydrologique  
- **Modèles pluies (IDF, hyétogrammes avancés)**  
- **Temps de concentration (multiples formules et analyse sensibilité)**  
- **Perte de pluie & ruissellement (CN, Horton, Green-Ampt)**  
- **Débits de projet (rationnelle, SCS, hydrogrammes)**  
- **Analyse fréquentielle (distributions, tests, intervalles confiance)**  
- **Routage hydrologique (réservoirs, rivière, réseau)**  
- **Analyse incertitude & sensibilité statistique**

### Couche 4 — Moteur scientifique hydraulique  
- **Hydraulique permanente filaire (Manning, Chezy, remous)**  
- **Hydraulique transitoire 1D (équations Saint-Venant, schémas numériques)**  
- **Hydraulique 2D optionnelle (shallow water, maillage TIN/grille)**  
- **Ouvrages standards : buses, dalots, fossés, caniveaux**  
- **Ouvrages avancés : ponts, bassins de rétention, affouillement, transport sédiments**  
- **Conditions limites, réseaux sous pression/gravity (SWMM-like)**

### Couche 5 — Dimensionnement & catalogue d’ouvrages  
- **Dimensionnement normé et optimisation multi-critères**  
- **Sélection catalogue normé (filtres, familles, fournisseurs)**

### Couche 6 — Vérifications, contrôles qualité & conformité  
- **Vérification vitesses, érosion, conformité normes, réglementaires**  
- **Contrôle qualité automatique (cohérence, plausibilité, unités)**  
- **Contrôles croisés hydrologie/hydraulique/dimensionnement**  
- **Traçabilité scientifique & audit complet**  
- **Regulatory compliance et checklists**

### Couche 7 — Production documentaire & plans  
- **Rapports techniques paramétrables**  
- **Notes de calcul détaillées et exportables**  
- **Plans automatiques (profils, coupes, réseaux, ouvrages)**  
- **Nomenclatures, métrés, export multi-format (PDF, DWG, IFC, ...) **  
- **Bibliothèque modèles documentaires**

### Couche 8 — Aide à la décision & recommandations  
- **Moteur de recommandations automatiques**  
- **Gestion scénarios, comparaison variantes, analyse de sensibilité**  
- **Aide multi-critères (MCDA) et optimisation paramétrique**  
- **Diagnostic ouvrages existants et propositions de réhabilitation**

---

## 3. Dépendances entre modules

- **Couche 0** est socle fondamental, obligatoire pour tous.  
- **Couche 1** fournit données et référentiels indispensables pour Couche 2 et au-delà.  
- **Couche 2** structure le territoire et l’infrastructure, base pour les calculs hydrologiques/hydrauliques.  
- **Couche 3** utilise les données de Couche 2 et 1 pour générer flux et débits.  
- **Couche 4** s’appuie sur Couche 3 pour le calcul hydraulique détaillé.  
- **Couche 5** nécessite Couche 4 et 1 (catalogue) pour dimensionner techniquement et normativement.  
- **Couche 6** vérifie et contrôle toutes les couches précédentes.  
- **Couche 7** agrège données & résultats de toutes les couches pour produire la documentation finale.  
- **Couche 8** analyse et exploite les résultats globaux, inclut recommandations et optimisation.

---

## 4. Modules obligatoires vs optionnels

| Couche/Module                                   | Statut                  |
|------------------------------------------------|-------------------------|
| Couche 0 (tous modules)                         | Obligatoire             |
| Couche 1 : Gestion MNT/DEM, SIG, Import CAO    | Obligatoire             |
| Couche 1 : IFC, bibliothèque normes, catalogue | Optionnels (par phase)  |
| Couche 2 : Axe, réseau hydro, bassins          | Obligatoire             |
| Couche 2 : Profils en travers, zones inondables| Optionnels (phase avancée) |
| Couche 3 (Hydrologie complète)                  | Obligatoire             |
| Couche 4 (Hydraulique permanente + ouvrages de base) | Obligatoire         |
| Couche 4 (Hydraulique transitoire, 2D, avancé) | Optionnel/phase avancée |
| Couche 5 (Dimensionnement de base)              | Obligatoire             |
| Couche 5 (Optimisation, catalogue complet)     | Optionnel               |
| Couche 6 (Contrôles qualité, conformité)       | Obligatoire             |
| Couche 7 (Rapports, plans, nomenclatures)      | Obligatoire             |
| Couche 8 (Recommandations, scénarios, MCDA)    | Optionnel/phase avancée |

---

## 5. Ordre exact de développement recommandé

### Phase 1 — Socle & Modélisation territoriale  
- Couche 0.1 (projets), 0.3 (versioning), 0.4 (unités/SCR)  
- Couche 1.1 (MNT/DEM), 1.3 (DWG/DXF), 1.4 (LandXML)  
- Couche 2.1 (axe), 2.2 (réseau hydrographique), 2.3 (bassins)  
- Couche 2.4 (profils en long), 2.5 (profils en travers)

### Phase 2 — Moteur scientifique hydrologique & hydraulique de base  
- Couche 3 (calculs pluies, TC, CN, débits, fréquence)  
- Couche 4 (hydraulique permanente filaire, ouvrages de base : buses, dalots, fossés, caniveaux)  
- Couche 5 (dimensionnement buses, dalots, fossés, caniveaux)

### Phase 3 — Gestion normes, vérifications et recommandations  
- Couche 1.6 (bibliothèque normes), 1.7 (catalogue ouvrages)  
- Couche 6 (vérifications vitesse, érosion, conformité, contrôle qualité)  
- Couche 8.1 (moteur recommandations auto)

### Phase 4 — Production documentaire & plans  
- Couche 7 totalité (rapports, notes, plans, nomenclatures, exports multi-format)

### Phase 5 — Extensions avancées  
- Couche 4 hydraulique avancée : transitoire 1D, hydraulique 2D, ouvrages sophistiqués (ponts, bassins, affouillement)  
- Couche 5 : optimisation multi-critères, sélection catalogue avancée  
- Couche 8 : scénarios, analyse sensibilité et incertitude, MCDA, diagnostic ouvrages

### Phase 6 — Écosystème & services associés  
- Couche 1.5 (IFC/BIM), 1.9 (bases nationales), 1.10 (gestion documentaire)  
- Couche 0.2 (gestion utilisateurs & rôles), 0.5 (API & interopérabilité), 0.6 (licences & déploiement)

---

## 6. Synthèse & principes directeurs

- **Modularité forte** : chaque couche et module découplé via API métier pour faciliter évolutivité.  
- **Interopérabilité native** : formats standards GIS, CAO, BIM, bases nationales.  
- **Approche « plateforme »** : socle transverse pour gestion projets, versions, audits.  
- **Interopérabilité scientifique** : options choix formules, normes, scénarios.  
- **Qualité & traçabilité** : contrôle systématique, historiques complets, audit scientifique.  
- **Extensibilité prévue** : modules avancés planifiables selon besoins et budgets clients.  
- **Priorisation pragmatique** : développer socle stable puis étendre en phases cohérentes.

---

Ce schéma directeur officialise OASIS HYDRO SUITE comme une plateforme d’ingénierie hydrologique & hydraulique exhaustive, modulaire, robuste et conforme aux standards métier les plus exigeants.

---

*Document prêt pour diffusion comme base unique de gouvernance technique et fonctionnelle du projet.*
