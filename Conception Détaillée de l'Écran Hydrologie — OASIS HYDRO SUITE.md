# Conception Détaillée de l'Écran Hydrologie — OASIS HYDRO SUITE

---

## Vue d'ensemble

L’écran Hydrologie est un espace de travail spécialisé, dédié aux hydrologues, combinant gestion exhaustive des données pluviométriques, stations, courbes IDF, paramètres classiques et calculs avancés, avec intégration du centre de calcul et de l’assistant IA. Ce workspace est conçu pour favoriser un workflow continu, fluide, intégrant pleinement la cohérence avec l’écran Cartographie.

---

## Disposition Générale (1920 x 1080 px)

| Zone                            | Dimensions (px)       | Position              | Description principale                                          |
|---------------------------------|----------------------|-----------------------|---------------------------------------------------------------|
| Header                          | 1920 x 70            | Haut (0,0)            | Logo, titre écran, navigation rapide                          |
| Menu latéral base (modules)     | 280 x 850            | Gauche (0,70)         | Accès aux modules (Cartographie, Hydrologie, Hydraulique...)  |
| Section principale (données)    | 1150 x 690           | Centre (280,70)       | Gestion pluies, stations, courbes IDF, calculs                 |
| Section calculs & workflow      | 1150 x 300           | Centre bas (280,760)  | Centre de calcul, état workflow, résultats synthétiques       |
| Assistant IA                   | 480 x 700            | Droite (1440,70)      | Suggestions IA, alertes, conseils interactifs                  |
| Rappel synthèse (cohérence)     | 1920 x 70            | Footer bas            | Liens navigation vers écran Cartographie, alertes critiques    |

---

## 1. Header (1920x70 px)

- Fond bleu profond (#0E4A7B)  
- Titre "Hydrologie — Gestion et Calculs" (24px, blanc)  
- Sous-titre dynamique paramètres projet actuel (ex: projet X, scénario Y)  
- Boutons rapide (accueil, aide, profil utilisateur) alignés à droite

---

## 2. Menu Latéral Base (280x850 px)

- Liste modules avec icônes vectorielles (carte, hydrologie, hydraulique, dimensionnement...)  
- Couleur de fond sombre #121824, texte clair blanc #FFFFFF, état actif cyan #00A3E0  
- Touches de navigation rapides (raccourcis clavier affichés au survol)

---

## 3. Section Principale — Données & Outils Hydrologiques (1150x690 px)

### A. Onglets de Gestion (Hauteur 40 px)

- **Pluies**  
- **Stations**  
- **Courbes IDF**  
- **Temps de concentration**  
- **Débits projet**  
- **Analyses fréquentielles**

Chaque onglet affiche un tableau ou formulaire dédié dans la zone contenu.

---

### B. Contenu par Onglet

#### Pluies

- Tableau listant pluies projet avec colonnes : ID, Durée (min), Intensité (mm/h), Fréquence (années)  
- Bouton "Ajouter pluie" bleu cyan (120x35 px) en haut  
- Formulaire d’édition à droite (responsive) avec saisie durée, intensité, fréquence  
- Import/export CSV disponible  
- Validation dynamique des valeurs

#### Stations

- Liste des stations pluviométriques avec colonnes : Nom, Localisation (numérique + coordonnée), Nb séries, Statut (actif/désactivé)  
- Carte miniature intégrée (150x150 px) affichant position sélectionnée  
- Formulaire saisie/modification station (coordonnées GPS, métadonnées, plage de données)  
- Bouton import données historiques

#### Courbes IDF

- Liste de courbes IDF paramétrées : Station associée, coefficients (a, b, c), validité (date)  
- Graphique interactif courbes IDF (pluie intensité vs durée)  
- Edition multiples modèles (Chicago, SCS, autre)  
- Ajout/édition en panneau latéral  
- Export graphique et données

#### Temps de concentration

- Sélecteur bassin ou sous-bassin (relié à cartographie)  
- Sélection de formules (Kirpich, Passini, Ventura...) via dropdown  
- Saisie variables clés (longueur L, pente S, rugosité)  
- Visualisation résultat Tc instantané  
- Analyse sensibilité rapide (modifier variables à la volée, comparer résultats)

#### Débits projet

- Formulaire calcul rationnel/SCS/CN complété par pluies sélectionnées  
- Visualisation débits Q10, Q20, Q50, Q100 dans tableau  
- Graphiques hydrogrammes unités, cumulés  
- Mise à jour calcul automatique après édition variables

#### Analyses fréquentielles

- Import série débits/pluie (fichier CSV) ou sélection base historique  
- Sélection distribution statistique (Gumbel, Log-Pearson, Weibull)  
- Résultats tests d’adéquation (Kolmogorov-Smirnov, Chi2)  
- Visualisation quantiles, intervalles confiance  
- Export résultat et rapport synthétique

---

## 4. Section Calculs & Workflow (1150x300 px)

- **Centre de Calcul** (left 600px width)  
  - Liste calculs lancés : frais, terminés, erreurs  
  - Statut dynamique avec icônes : spinner, check vert, croix rouge  
  - Bouton "Nouveau Calcul" (large, cyan) avec choix type calcul  
  - Historique résultats condensés affiché sous forme tableau scrolling  

- **État Workflow** (right 550px)  
  - Diagramme visuel éclaté des étapes : données, calculs, vérifications, rapport  
  - États étape (done/in progress/error) codés couleurs dont couleurs IA  
  - Boutons "Passer à l’étape suivante" ou "Réviser" positionnés stratégiquement  

---

## 5. Assistant IA (480x700 px)

- Panneau vertical latéral droit  
- Fond blanc avec bordure cyan claire  
- Titre "Assistant IA & Recommandations" 20px bleu foncé  
- Liste alertes, conseils techniques prioritaires, recommandations d’action  
- Boutons rapides appliquer correction ou détailler  
- Graphiques synthétiques miniaturisés (jauge conformité, score qualité)  
- Chatbot simplifié pour requêtes ciblées assistance hydrologique  
- Notifications push dynamiques lors d’alertes nouvelles

---

## 6. Footer — Cohérence & Navigation Rapide (1920x70 px)

- Barre basse fixe, fond bleu foncé #0E4A7B  
- Raccourcis vers écran Cartographie, alertes globales, documentation rapide  
- Indicateur rapidité workflow en icône  
- Mini timer synchronisation calculs/serveur

---

## Comportement et Interactions

### Desktop

- Complète avec multi-fenêtres docks (Assistant IA, Centre de Calcul détachable)  
- Navigation clavier avancée, pistes de workflow visibles  
- Fenêtres redimensionnables spontanément  

### Web

- Responsive design avec panneaux escamotables (Assistant IA, Centre de Calcul)  
- Calculs asynchrones notifiés par pop-up et badge d’alerte  
- Navigation tactile-friendly, zoom carte par pinçage  

---

## Résumé

Cet écran Hydrologie constitue un workspace central, multi-facettes, intégrant gestion complète data-pluie & stations, calculs experts, interaction IA et suivi workflow permanent, articulé en complément sans rupture avec l’environnement Cartographie.

Il offre à l’hydrologue un cockpit puissant, clair et ergonomique, tout en permettant réactivité et contrôle fine des calculs et données dans OASIS HYDRO SUITE.

---
