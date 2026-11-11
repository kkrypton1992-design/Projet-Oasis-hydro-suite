# Cahier des Charges Fonctionnel Complet — OASIS HYDRO SUITE

---

# Partie 1 : Spécifications Fonctionnelles par Module

---

## Couche 0 — Plateforme & Services Transverses

### 0.1 Gestion de Projet  
- **Objectif :** Créer, organiser et gérer les projets, études, scénarios avec métadonnées complètes.  
- **Utilisateurs :** Tous (ingénieurs, chefs projets, vérificateurs).  
- **Écrans :**  
  - Liste projets  
  - Détail projet  
  - Gestion études et scénarios  
- **Actions utilisateur :**  
  - Créer/éditer/supprimer projet, étude, scénario  
  - Définir métadonnées (client, phase, échelle, SCR, unités)  
  - Gérer versions et statuts (brouillon, validé…)  
- **Données d'entrée :** Nom projet, métadonnées, SCR, unités.  
- **Données de sortie :** Informations projet, arborescence.  
- **Règles métier :** Unicité nom projet, validation workflow.  
- **Dépendances :** Couche 1 (référentiels unités, SCR).  
- **Cas d'utilisation :** Création projet → ajout étude → création scénario → passage workflow.

---

## Couche 1 — Données d’Ingénierie & Référentiels

### 1.1 Gestion MNT/DEM  
- **Objectif :** Importer, éditer, analyser modèles numériques de terrain.  
- **Utilisateurs :** Ingénieurs, techniciens SIG.  
- **Écrans :** Import MNT, Visualisation 3D, Edition breaklines, Analyse pentes.  
- **Actions utilisateur :** Importer fichiers GeoTIFF, LAS, créer TIN, corriger erreurs, lissage.  
- **Données d'entrée :** Fichiers MNT, points topographiques, breaklines.  
- **Données de sortie :** MNT corrigé, dérivés (pente, accumulation).  
- **Règles métier :** Contrôle qualité (trous, résolution).  
- **Dépendances :** Nécessaire à Couche 2 (modélisation).  
- **Cas d'utilisation :** Import MNT → validation qualité → génération pentes.

### 1.6 Bibliothèque de normes  
- **Objectif :** Gérer référentiels normatifs et règles associées.  
- **Utilisateurs :** Ingénieurs, vérificateurs.  
- **Écrans :** Liste normes, règles détaillées, applicabilité.  
- **Actions :** Sélection norme selon pays, étude.  
- **Données :** Textes normes, coefficients, règles.  
- **Sortie :** Règles applicables au projet.  
- **Règles métier :** Version norme valide, contexte application.  
- **Dépendances :** Couche 5 (dimensionnement), 6 (contrôles).

---

## Couche 2 — Modélisation Territoire & Axe

### 2.1 Modélisation de l’Axe  
- **Objectif :** Créer et éditer axes linéaires (routes, cours d’eau) avec PK.  
- **Utilisateurs :** Ingénieurs, techniciens CAO/SIG.  
- **Écrans :** Dessin/édition axe, profils longitudinaux, gestion PK.  
- **Actions :** Import LandXML/DWG, saisie manuelle, édition points.  
- **Données entrée :** Polylignes, coordonnées, profils terrain.  
- **Données sortie :** Alignements, profils en long.  
- **Règles métier :** Cohérence géométrique, continuité PK.  
- **Dépendances :** Couche 1 (MNT), 3 & 4 (calculs).  
- **Cas d’utilisation :** Import axe→édition→validation géométrie.

---

## Couche 3 — Moteur Scientifique Hydrologique

### 3.5 Calcul des débits de projet  
- **Objectif :** Estimer débits pics et hydrogrammes.  
- **Utilisateurs :** Hydrologues, ingénieurs.  
- **Écrans :** Sélection basins, saisie pluie, CN, formules.  
- **Actions :** Entrer intensité pluie, méthode calcul, générer résultats.  
- **Données entrée :** Bassin versant, pluie projet, CN.  
- **Données sortie :** Débit pic, hydrogramme.  
- **Règles métier :** Validation paramètres, formules sélectionnées.  
- **Dépendances :** Couche 2 (bassins), 1 (pluie IDF).  
- **Cas d’usage :** Choix bassin → saisie pluie → calcul débit → sauvegarde.

---

## Couche 4 — Moteur Scientifique Hydraulique

### 4.4 Module Buses  
- **Objectif :** Dimensionner et simuler buses selon débit et conditions.  
- **Utilisateurs :** Ingénieurs hydrauliques, techniciens.  
- **Écrans :** Saisie caractéristiques bus, simulation débit, affichage résultats.  
- **Actions :** Définir matériaux, dimensions, conditions aval/amont.  
- **Données entrée :** Débit, pente, matériau, dimensions initiales.  
- **Données sortie :** Dimension optimum, vitesse, charge hydraulique.  
- **Règles métier :** Respect normes, vérification vitesses, remous.  
- **Dépendances :** Couche 3 (débits), 1 (catalogue matériaux).  
- **Cas d’usage :** Saisie bus → calcul → vérification conformité → sélection catalogue.

---

## Couche 6 — Vérifications & Qualité

### 6.4 Contrôle qualité des études  
- **Objectif :** Vérifier cohérence, plausibilité et conformité des études.  
- **Utilisateurs :** Vérificateurs, chefs projets.  
- **Écrans :** Tableau de bord qualité, détail alertes, historique.  
- **Actions :** Lancer contrôles automatiques, visualiser résultats, corriger.  
- **Données entrée :** Données calculées, références normes.  
- **Données sortie :** Score qualité, alertes, recommandations.  
- **Règles métier :** Listes de contraintes normatives et métier appliquées.  
- **Dépendances :** Modules hydrologie, hydraulique, normes.  
- **Cas d’usage :** Finalisation étude → lancement contrôle qualité → validation.

---

## Couche 7 — Production Documentaire & Plans

### 7.1 Rapports techniques  
- **Objectif :** Générer rapports complets, structurés et personnalisables.  
- **Utilisateurs :** Tous utilisateurs finaux.  
- **Écrans :** Sélection composants rapport, prévisualisation, export PDF/DOCX.  
- **Actions :** Choix contenu, styles, exporter documents.  
- **Données entrée :** Résultats des calculs, métadonnées projet.  
- **Données sortie :** Rapport finalisé prêt à diffusion.  
- **Règles métier :** Normes rédactionnelles standards métiers respectées.  
- **Dépendances :** Tous modules calculs et données.  
- **Cas d’usage :** Clôture étude → sélection contenus → génération/export rapport.

---

# Partie 2 : Parcours Utilisateurs Principaux

---

## 1. Étude Hydrologique Pure

- **Étapes :**  
  1. Création projet + définition SCR/unité (Couche 0)  
  2. Import MNT + définition bassin versant (C1, C2.3)  
  3. Saisie/import données pluviométriques & IDF (C1.9, C3.1, C3.2)  
  4. Calcul temps de concentration (C3.3)  
  5. Calcul pertes/pluie-ruissellement (C3.4)  
  6. Calcul débits projet et hydrogrammes (C3.5)  
  7. Analyse fréquentielle (C3.6)  
  8. Vérification cohérence et qualité (C6.4)  
  9. Génération rapport technique (C7.1)

- **Données d'entrée :** MNT, station pluviométrique, courbes IDF, paramètres bassin/sol, pluies.  
- **Modules utilisés :** 0.1, 1.1, 2.3, 3.1-3.6, 6.4, 7.1.  
- **Résultats produits :** Bassin versant validé, pluies projet, débits pics, analyses statistiques, rapport complet.  
- **Documents générés :** Rapport hydrologique PDF.

---

## 2. Étude Hydraulique Routière

- **Étapes :**  
  1. Modélisation axe route + profils (C2.1, 2.4, 2.5)  
  2. Délimitation bassins liés à l’axe (C2.3)  
  3. Saisie réseau drainage : fossés, buses, dalots, caniveaux (C2.6)  
  4. Hydrologie (pluies, débits) (C3)  
  5. Calcul hydraulique permanent ouvrages + fossés (C4.1, 4.4-4.7)  
  6. Dimensionnement ouvrages (C5.1-5.4)  
  7. Contrôles qualité & conformité (C6.1, 6.3)  
  8. Génération documents & plans (C7.1-7.3)

- **Données d'entrée :** MNT, axe routier, profils existants ou projetés, caractéristiques ouvrages, pluies, débits.  
- **Modules utilisés :** 0.1, 1.1, 2.1-2.6, 3, 4.1, 4.4-4.7, 5.1-5.4, 6, 7.  
- **Résultats produits :** Profils, débits, dimensionnements normes, plans, rapport synthèse.  
- **Documents générés :** Notes de calculs, plans (profils et coupes), rapport construction.

---

## 3. Étude d’un Ouvrage de Franchissement

- **Étapes :**  
  1. Modélisation axe & profil en long (C2.1, 2.4)  
  2. Import données ouvrages existants (ponts, dalots) (C1.5)  
  3. Intégration réseau drainage autour ouvrage (C2.6)  
  4. Calcul hydraulique avancé (remous, affouillement) (C4.1, 4.8, 4.10)  
  5. Dimensionnement ou vérification conformité (C5.6)  
  6. Contrôle conformité et diagnostic (C6.3, 8.6)  
  7. Rapport détaillé et propositions (C7.1, 8.6)

- **Données d'entrée :** Données géométriques ouvrage, axe, débits, normes.  
- **Modules utilisés :** 0.1, 1.1, 1.5, 2.1, 2.6, 4.1, 4.8, 4.10, 5.6, 6, 7, 8.6.  
- **Résultats produits :** Évaluation hydraulique, dimensionnements ou recommandations.  
- **Documents générés :** Rapport technique complet avec diagnostics.

---

## 4. Étude d’un Bassin de Rétention

- **Étapes :**  
  1. Délimitation bassin + collecte données pluviométriques (C2.3, C3.1)  
  2. Calcul débits pics associés (C3.5)  
  3. Dimensionnement volume bassin et dispositif vidange (C4.9, C5.5)  
  4. Simulation routage et hydrogrammes de sortie (C3.7)  
  5. Vérification conformité normes (C6.3)  
  6. Production rapport et plans (C7.1, 7.3)

- **Données d'entrée :** Bassin versant, données pluie, débits, matériaux, contraintes vidange.  
- **Modules utilisés :** 0.1, 2.3, 3, 4.9, 5.5, 6.3, 7.  
- **Résultats produits :** Volume bassin, hydrogrammes vidange, plans de construction.  
- **Documents générés :** Rapport dimensionnement bassin, plans.

---

## 5. Étude de Diagnostic d’un Ouvrage Existant

- **Étapes :**  
  1. Import données existantes (plans, mesures) (C1.5, 1.10)  
  2. Modélisation hydraulique de l’ouvrage (C4)  
  3. Contrôles conformité, érosion, vétusté (C6.1, 6.2, 8.6)  
  4. Recommandations techniques et réhabilitation (C8.1, 8.6)  
  5. Rapport diagnostic et plan d’action (C7, C8.6)

- **Données d'entrée :** Plans d’ouvrage, données terrain, débits mesurés, normes.  
- **Modules utilisés :** 0.1, 1.5, 1.10, 4, 6, 7, 8.  
- **Résultats produits :** Analyse état, risque, plan de réhabilitation.  
- **Documents générés :** Rapport diagnostic, fiches techniques recommandées.

---

# Fin du Cahier des Charges Fonctionnel

Ce document constitue la base unique de référence fonctionnelle définitive pour le développement, tests et validation du logiciel **OASIS HYDRO SUITE**.  
Il garantit la couverture complète des besoins métier, facilite la planification des développements et assure la cohérence transversale de la plateforme.

---
