# Cahier des Charges Fonctionnel Complémentaire — OASIS HYDRO SUITE  

---

# Partie 3 : Parcours Métiers Complémentaires

---

## 6. Étude de Barrage Hydraulique

### Objectifs  
- Modéliser le comportement hydrologique et hydraulique du barrage dans son bassin versant.  
- Calculer le régime permanent et transitoire dans la retenue et à l’aval.  
- Estimer débits, hauteurs d’eau, capacités de vidange, impact sur réseau aval.  
- Vérifier conformité normatives et contraintes de sécurité hydraulique.

### Données d’entrée  
- MNT du site, bassin versant complet.  
- Données pluviométriques et hydrométriques.  
- Caractéristiques géométriques du barrage (altitude, déversoir, vannes).  
- Paramètres matériaux, rugosité, capacités réservoir.  
- Conditions de fonctionnement (niveaux, seuils, modes d’ouverture).

### Données de sortie  
- Profils en long du cours d’eau amont/aval.  
- Courbes des hauteurs d’eau, pressions hydrauliques dans la retenue.  
- Hydrogrammes transitoires (crues, vidanges).  
- Estimations des débordements, plans d’eau.  
- Rapports conformité, analyses de risques.

### Calculs nécessaires  
- Hydrologie bassin complet (précipitations, ruissellement).  
- Routage hydrologique et hydraulique (couche 3, 4.1 et 4.2).  
- Calcul hydraulique permanent + transitoire (équations Saint-Venant, remous).  
- Simulation comportement barrage (volumes, débits seuils).  

### Modules utilisés  
- Couche 1 : gestion MNT, données pluies et bassins.  
- Couche 2 : modélisation axe, profils en long, bassins.  
- Couche 3 : hydrologie complète et routage.  
- Couche 4 : hydraulique permanente et transitoire 1D.  
- Couche 6 : contrôles conformité.  
- Couche 7 : rapports et plans.

### Règles métier  
- Respect des normes nationales/internationales de barrage.  
- Limites de sécurité hydraulique (surverses, pressions).  
- Contrôle des vitesses d’érosion et sédimentation.  
- Gestion des scénarios extrêmes (crues centennales).  

### Documents générés  
- Rapport d’étude hydraulique détaillée.  
- Plans profils en long et coupes.  
- Fiches synthèses sécurité hydraulique.  

### Écrans nécessaires  
- Interface projet + bassins versants.  
- Visualisation MNT + bassin, délimitation bassin.  
- Paramétrage barrage (géométrie, fonctionnement).  
- Résultats hydrauliques (profils, limites, alertes).  
- Rapport & export.

---

## 7. Étude de Barrage Hydroélectrique

### Objectifs  
- Intégrer calculs hydrologiques, hydrauliques et paramètres énergétiques spécifiques.  
- Dimensionner ouvrages barrages, conduites forcées, turbines, prises d’eau.  
- Simuler régime permanent et transitoire pour opérations énergétiques.  
- Évaluer production potentielle, impacts hydrauliques et environnementaux.  

### Données d’entrée  
- Données barrages (MNT, géométrie précise).  
- Données hydrologiques détaillées (pluie, débits, fréquences).  
- Caractéristiques équipements hydro (capacités turbines, conduites).  
- Normes électriques et environnementales.  

### Données de sortie  
- Débits et hauteurs d’eau aux points clés.  
- Courbes puissance générée & rendement.  
- Profils hydraulique du canal d’amenée à la prise d’eau.  
- Rapports dimensionnement et simulation énergétique.  

### Calculs nécessaires  
- Calcul hydrologique complet (couche 3).  
- Modélisation hydraulique 1D filaire + transitoire barrage.  
- Calculs énergétiques (pertes charge, puissance, débit turbine).  
- Analyse fréquence et scénarios débits.  

### Modules utilisés  
- Couche 1 : données de base, normes.  
- Couche 2 : modélisation axe, réseau eau, profils.  
- Couche 3 : hydrologie (débits, hydrogrammes).  
- Couche 4 : hydraulique permanente et transitoire.  
- Couche 5 : dimensionnement ouvrages + équipements.  
- Couche 6 : vérifications conformité et sécurité.  
- Couche 7 : documentation technique.  

### Règles métier  
- Respect normes hydroélectriques et sécurité barrage.  
- Limites de pression, vitesse, charge sur ouvrages et turbines.  
- Intégration contraintes environnementales (changements de niveaux).  
- Respect conditions de maintenance et exploitation.  

### Documents générés  
- Rapport technique complet (hydrologie, hydraulique, énergétique).  
- Plans profils en long, détails ouvrages et équipements.  
- Fiches de conformité, analyse risques.  

### Écrans nécessaires  
- Projet + bassins + modélisation axe.  
- Paramétrage barrage et équipements hydro (turbine, prise).  
- Visualisation simulation hydraulique et énergétique.  
- Résultats analyses, alertes sécurité.  
- Génération rapports.

---

# Fin du Complément au Cahier des Charges Fonctionnel  

Ce document finalise la définition fonctionnelle des parcours métiers associés aux barrages, complétant la couverture complète d’OASIS HYDRO SUITE pour la gestion des infrastructures hydrologiques et hydrauliques complexes.  
Il sert de référence absolue pour le développement, la validation, la formation et la documentation associée.

---
