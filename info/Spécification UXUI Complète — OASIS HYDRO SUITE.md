# Spécification UX/UI Complète — OASIS HYDRO SUITE

---

## 1. Arborescence Complète de Navigation

- **Dashboard Principal**  
  - Projets & Études (liste, création, recherche)  
  - Notifications, alertes  
  - Accès rapide modules fréquemment utilisés

- **Projet**  
  - Détail projet (métadonnées, phases)  
  - Études & Scénarios liés  
  - Historique et versioning

- **Cartographie**  
  - Visualisation MNT, Bassins, Réseaux  
  - Outils dessin, sélection et calques  
  - Profils en long et profils en travers

- **Bassin Versant**  
  - Gestion bassin, sous-bassins  
  - Propriétés, analyses morphométriques  
  - Délimitation éditable

- **Hydrologie**  
  - Données pluie (IDF, hyétogrammes)  
  - Calcul temps de concentration, pertes  
  - Calcul débits, analyses fréquentielles

- **Hydraulique**  
  - Modélisation permanente, transitoire  
  - Paramétrage ouvrages (buses, dalots...)  
  - Simulation, résultats (profils eau, vitesses)

- **Dimensionnement**  
  - Saisie contraintes, sélection norme  
  - Calcul dimensions, optimisation  
  - Catalogue ouvrages normés

- **Rapport**  
  - Gestion et édition rapports techniques  
  - Prévisualisation export PDF/DOCX  
  - Historique versions rapports

- **IA & Recommandations**  
  - Alertes automatiques  
  - Suggestions correctives  
  - Analyse multi-critères & optimisation

- **Administration**  
  - Gestion utilisateurs, rôles  
  - Licences, audit

---

## 2. Écrans Detallés

### 2.1 Dashboard Principal

**Objectif :** Vue synthétique des projets actifs, notifications, accès rapide.

**Éléments présents :**  
- Liste projets récents / favoris  
- Tuiles statistiques KPI (ex : projets en cours, alertes QC)  
- Panel notifications système  
- Menu accès rapide modules

**Actions utilisateur :**  
- Ouvrir projet  
- Consulter alertes  
- Accéder à nouveau projet

**Disposition :**  
- Barre latérale menu vertical  
- Section centrale liste projets  
- Panneau latéral droit notifications/KPIs  

---

### 2.2 Écran Projet

**Objectif :** Détail complet d’un projet, gestion études et versions.

**Éléments :**  
- Métadonnées projet (client, SCR, statut)  
- Onglets : Études, Scénarios, Historique  
- Boutons actions (édition, duplication, suppression)

**Actions :**  
- Modifier métadonnées  
- Créer étude/scénario  
- Consulter versions

**Disposition :**  
- Header projet avec nom + statut  
- Navigation onglets sous header  
- Tableau études/scénarios en liste centrale  

---

### 2.3 Écran Cartographique

**Objectif :** Visualisation et édition interactive des données géospatiales.

**Éléments :**  
- Carte principale interactive (Leaflet/Mapbox)  
- Barres d’outils dessin, sélection, zoom  
- Panneau calques avec gestion visibilité  
- Vue profil en long/ travers sur panneau bas/droit

**Actions :**  
- Sélectionner/dessiner bassin, axe, ouvrage  
- Activer/calquer couches SIG  
- Export cartographique

**Disposition :**  
- Carte en plein écran excepté sidebar gauche (calques)  
- Toolbar horizontale ou flottante en haut  

---

### 2.4 Écran Bassin Versant

**Objectif :** Gestion des bassins versants et sous-bassins.

**Éléments :**  
- Liste bassins avec filtres  
- Carte bassin sélectionné  
- Proposition morphométrique (surface, pente)  
- Outils édition limites

**Actions :**  
- Ajouter/modifier sous-bassins  
- Calcul caractéristiques basin  
- Valider délimitation

**Disposition :**  
- Carte gauche 60%, liste et détails droite 40%  
- Barre d’outils en haut  

---

### 2.5 Écran Hydrologie

**Objectif :** Paramétrage des pluies, calculs temps de concentration, débits.

**Éléments :**  
- Formulaires saisie données pluies (IDF, hyétogrammes)  
- Liste formules temps de concentration  
- Résultats calculs débits, pertes  
- Graphiques évolution/pluviométrie  

**Actions :**  
- Sélection formules  
- Saisir paramètres  
- Lancer calculs  
- Export résultats

**Disposition :**  
- Formulaire gauche  
- Résultats et graphiques droite  
- Barre outil calcul en bas  

---

### 2.6 Écran Hydraulique

**Objectif :** Simulation hydraulique ouvrages et écoulements.

**Éléments :**  
- Arborescence ouvrages  
- Formulaire caractéristiques ouvrage  
- Visualisation résultats profils hydraulique  
- Alertes et recommandations

**Actions :**  
- Paramétrer ouvrages  
- Lancer simulations  
- Visualiser résultats  
- Corriger alertes

**Disposition :**  
- Liste ouvrages gauche  
- Visualiseur profils centre  
- Fiches info et alertes droite  

---

### 2.7 Écran Dimensionnement

**Objectif :** Calcul dimensionnel avec choix catalogue normé.

**Éléments :**  
- Fiche saisie contraintes (débit, pente, matériaux)  
- Résultats calculs dimensionnement  
- Catalogue objets normés filtrable  
- Synthèse optimisée et recommandations  

**Actions :**  
- Saisir paramètres  
- Choisir catalogue  
- Valider dimension  
- Export résultat

**Disposition :**  
- Saisie en haut  
- Résultats catalogue en bas/à droite

---

### 2.8 Écran Rapport

**Objectif :** Gérer création, visualisation et export de rapports.

**Éléments :**  
- Liste rapports avec statut  
- Éditeur sections rapport  
- Options export (PDF, DOCX)  
- Historique versions

**Actions :**  
- Créer/modifier rapport  
- Ajouter sections  
- Prévisualiser & exporter  
- Comparer versions

**Disposition :**  
- Liste à gauche  
- Éditeur central  
- Options export en barre supérieure  

---

### 2.9 Écran IA & Recommandations

**Objectif :** Visualiser alertes, conseils et analyses IA.

**Éléments :**  
- Liste alertes critiques  
- Détails recommandations techniques  
- Visualisation analyses multi-critères  
- Actions pour appliquer correctifs

**Actions :**  
- Consulter recommandations  
- Prioriser actions  
- Valider correctifs  
- Lancer scénarios optimisés

**Disposition :**  
- Liste alertes gauche  
- Détail & graphes droite  
- Barre action bas

---

## 3. Expérience Desktop vs Web

### Desktop

- Application electron avec accès complet mode offline  
- Puissance calcul locale, intégration CAO/DWG lourde  
- Synchronisation données avec cloud possible  
- Interface riche, multi-fenêtres, intégration fichiers lourds

### Web

- Interface accessible partout, responsive  
- Collaboration multi-utilisateurs  
- Limité aux interactions légères, calculs backend asynchrones  
- Mise à jour continue, intégration API externe facile

---

*Ce document servira de base pour la conception des maquettes et prototypage UX/UI, garantissant cohérence fonctionnelle et ergonomique sur toutes plateformes.*  
