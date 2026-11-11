# Dossier Technique MVP Officiel — OASIS HYDRO SUITE

---

## 1. Périmètre Exact du MVP

- Authentification sécurisée et gestion projets/scénarios avec versioning simple  
- Import et visualisation MNT basique  
- Délimitation et gestion bassins versants simples  
- Calculs hydrologiques fondamentaux : pluies projet, temps de concentration (formule Kirpich), méthode rationnelle débits  
- Simulation hydraulique permanente filaire basique : buses, dalots, fossés adaptés  
- Dimensionnement simple de buses et dalots selon normes de base  
- Visualisation cartographique interactive avec couches bassins et ouvrages  
- Contrôle qualité simple : vérification vitesses admissibles et cohérence données  
- Génération rapports hydrologiques, hydrauliques et notes de calcul basiques (PDF)  
- Interface Web et Desktop minimaliste, opérations centralisées via API Gateway  
- Gestion workflow basique avec états projet (brouillon, validé)

---

## 2. Tables Exactes du MVP

- `users`, `roles`  
- `projects`, `studies`, `scenarios`, `versions`  
- `dem_tiles`, `watersheds`  
- `streams`, `culverts`, `box_culverts`, `ditches`  
- `project_rainfalls`, `time_concentration`, `design_flows`  
- `culvert_designs`, `box_culvert_designs`  
- `quality_checks`, `velocity_check`  
- `report_templates`, `report_instances`  

---

## 3. Schéma Relationnel Détaillé du MVP

- `projects` 1-N `studies`  
- `studies` 1-N `scenarios`  
- `scenarios` 1-N `versions`  
- `watersheds` liés à `scenarios` (relation FK)  
- `streams` liés à `watersheds`  
- `culverts`, `box_culverts`, `ditches` liés à `scenarios`  
- `design_flows` liés à `scenarios`  
- `culvert_designs` liés `culverts` et `scenarios`  
- `quality_checks` liés à `scenarios` et calculs  
- `report_instances` reliés à `versions` et `scenarios`

---

## 4. API Exactes du MVP

- Auth API : login, gestion sessions  
- Projet API : CRUD projets/études/scénarios, versioning  
- SIG API : import, requêtes bassins et ouvrages  
- Hydrologie API : calculs pluies, Tc, débits  
- Hydraulique API : calculs permanents, gestion ouvrages  
- Dimensionnement API : calculs buses, dalots  
- Qualité API : vérification vitesses, cohérence  
- Reporting API : génération et export rapports PDF  
- Notification & workflow API : états, alertes simples

---

## 5. Écrans Exactes du MVP

- Dashboard principal simplifié  
- Écran Cartographie basique (visualisation données)  
- Écran Hydrologie : pluies, Tc, débits projet  
- Écran Hydraulique simplifié (permanent, ouvrages)  
- Écran Dimensionnement basique (buses, dalots)  
- Écran Contrôle Qualité basique (cohérence, vitesse)  
- Écran Rapport (rapport hydrologique/hydraulique, notes calcul basiques)

---

## 6. Flux Exacts du MVP

- Utilisateur crée projet > importe MNT > délimite bassin  
- Définit pluies projet, calcule Tc > génère débits  
- Paramètre ouvrages > calcule hydraulique permanent  
- Lance dimensionnement bête sur ouvrages  
- Vient checker contrôle qualité  
- Génère rapport PDF final  
- Parcours linéaire guidé, avec sauvegarde automatique entre étapes

---

## 7. Calculs Hydrologiques Inclus dans le MVP

- Méthode rationnelle de calcul débit pic  
- Temps de concentration Kirpich uniquement  
- Pluies projet sur base courbes IDF entrées manuellement ou importées simples  
- Pas d’analyse fréquentielle ou pertes complexes (SCS, Horton absents)

---

## 8. Calculs Hydrauliques Inclus dans le MVP

- Hydraulique permanente filaire basique (Manning)  
- Dimensionnement des buses et dalots selon formules standard  
- Pas de modélisation transitoire, 2D, ni calculs affouillement/sédiments  
- Pas de gestion avancée ouvrages multiples

---

## 9. Fonctions Rapport Incluses dans le MVP

- Rapports hydrologiques (débits, pluies, Tc)  
- Rapports hydrauliques (dimensionnement, résultats permanents)  
- Notes de calcul simples (formules principales, résultats)  
- Rapports contrôle qualité sommaires  
- Export en PDF uniquement, modèle documentaire basique

---

## 10. Composants Exclus du MVP et Reportés en V1

- Hydraulique transitoire et 2D  
- Dimensionnement complexes (ponts, bassins de rétention)  
- Contrôle qualité avancé, vérifications normatives complètes  
- IA complète (directeur technique, mission contrôle, expert Afrique)  
- Rapports dynamiques et export multi-format (DOCX, XLSX)  
- Collaboration multi-utilisateurs avancée  
- Workflow complet et système notifications avancés

---

## 11. Composants Reportés en V2

- Moteurs IA expert régional et rédacteur professionnel  
- Hydraulique 2D avancée, affouillement, transport sédiments  
- Optimisation multi-critères et analyse de sensibilité  
- Bibliothèque institutionnelle complète et personnalisée intégrée  
- Gestion avancée multi-scénarios variétés  
- Intégration BIM/IFC poussée  
- Écosystème Cloud complet et licences flottantes

---

## 12. Dépendances Exactes du MVP

- Authentification système au socle gestion projets  
- Données SIG valides pour modélisation hydrologique  
- Résultats hydrologiques précalculés pour hydraulique  
- Dimensionnement dépendant hydraulique validé  
- Contrôle qualité fonctionnant avec données dimensionnement et calculs  
- Reporting utilisant données validées par contrôle qualité

---

## 13. Critères de Validation du MVP

- Fonctionnalités métiers principales atteintes et stables  
- Précision calculs conforme tests métier standards  
- Interface utilisateur fluide et ergonomique  
- Sécurité authentification et gestion accès opérationnelle  
- Export PDF complet et fidèle aux données  
- Synchronisation données entre modules garantissant cohérence

---

## 14. Cas de Test du MVP

- Connexion/déconnexion et restriction accès selon rôles  
- Cycle complet projet : création, import MNT, calcul Tc et débits  
- Simulation hydraulique buses/dalots simple et dimensionnement  
- Détection incohérences simples (ex: données manquantes bassins)  
- Validation checklist qualité basique  
- Génération rapport PDF final avec inclusion données dynamiques  
- Navigation UI fluide sur Web et Desktop  
- Gestion bogues et erreurs dans calculs et saisie paramètres  

---

# Conclusion

Ce dossier technique MVP officiel fixe précisément l’ensemble des composantes, données, calculs et interfaces nécessaires pour la première version opérationnelle d’OASIS HYDRO SUITE.

Il servira de guide technique, fonctionnel et organisationnel à toutes les équipes pour le démarrage rapide et maîtrisé du développement.

---

*Document officiel, stable et validé, fondement de la production en série d’OASIS HYDRO SUITE.*  
