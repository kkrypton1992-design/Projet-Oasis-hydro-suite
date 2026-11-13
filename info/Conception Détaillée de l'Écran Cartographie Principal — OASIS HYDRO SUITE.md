# Conception Détaillée de l'Écran Cartographie Principal — OASIS HYDRO SUITE

---

## 1. Disposition Complète de l'Écran (1920x1080 px)

### Zones principales :

| Zone                         | Dimensions (px)      | Position               | Description sommaire                              |
|------------------------------|---------------------|------------------------|--------------------------------------------------|
| Header                       | 1920 x 70           | Haut (0,0)             | Logo, menu rapide                                 |
| Menu latéral Gestion Couches | 280 x 900           | Gauche (0, 70)         | Gestion calques et contrôle affichage            |
| Carte centrale               | 1150 x 900          | Centre (280, 70)       | Carte interactive, cœur visuel                    |
| Panneau Bassins Versants     | 320 x 400           | Bas gauche (0, 970)    | Détails bassins versants                           |
| Panneau Ouvrages Hydrauliques| 320 x 400           | Bas droite (1500, 970) | Détails ouvrages hydrauliques                      |
| Centre de Calcul             | 320 x 180           | Droite haut (1500, 70)| Contrôle suivi calculs                             |
| Panneau IA                  | 320 x 240           | Droite milieu (1500, 260)| Recommandations IA                                |
| Panneau Alertes             | 1920 x 150          | Bas (0, 1070)          | Alertes critiques visibles en permanence          |
| Graphiques hydrologie/hydraulique | 1150 x 180     | Centre bas (280, 970)  | Courbes et visualisations clés                     |

---

## 2. Carte Centrale (1150 x 900 px)

- **Position précise** : 280 px à partir du bord gauche, 70 px sous le header  
- **Layers visibles par défaut** : bassins versants, ouvrages hydrauliques différenciés par codes couleur  
- **Styles visuels** :  
  - Bassins : polygones semi-transparents (#00A3E0, opacity 0.3) avec bordure cyan vif 2px  
  - Bus, dalots, fossés, caniveaux et ponts surlignés par icônes colorées (30x30 px), éclat visible même en zoom éloigné  
- **Interactions** :  
  - Clic sur bassin ouvre panneau Bassins avec mise à jour infos  
  - Clic sur ouvrage ouvre panneau Ouvrages hydrauliques  
  - Zoom dynamique (limites min 8, max 20) avec animation fluide  
  - Layers togglables via gestionnaire couches  
- **Outils flottants sur la carte (top-right)** : zoom +/- (40x40 px), recentrer, mode plein écran  

---

## 3. Gestionnaire de Couches (280 x 900 px)

- **Disposition verticale** sous le header à gauche  
- **Titre** : "Gestionnaire de Couches" (font-size 22px, bold, couleur #0E4A7B, hauteur 50 px)  
- **Liste de couches principales** :  
  - Bassins versants (checkbox, icon polygon)  
  - Réseau bus, dalots, fossés, caniveaux (checkbox groupés, icônes multiples)  
  - Profils en long et travers (toggle)  
  - Bases météo/pluie (toggle)  
- **Chaque entrée** : icône à gauche (24x24 px), texte 18px, toggle switch à droite (50x25 px)  
- **Fonction drag & drop** pour reorder couche, avec indicateur visuel à 4px  
- **Bouton "Ajouter Couches"** : bleu cyan #00A3E0, 260x40 px fixé en bas avec ombre portée  

---

## 4. Panneau Bassins Versants (320 x 400 px)

- **Position** : Bas à gauche, entre menu latéral et bas écran  
- **Style** : fond blanc pur #FFFFFF, bord arrondi 10px, ombre portée faible  
- **Contenu** :  
  - Header : "Bassins Versants" (font 20px, semi-bold, #0E4A7B)  
  - Liste bassin (scroll vertical max 8 entrées) : éléments 40px hauteur, survol cyan clair #C5E9FA  
  - Détails bassin sélectionné sous liste (120px hauteur) :  

| Propriété      | Valeur             | Style texte              |
|----------------|--------------------|--------------------------|
| Surface        | x.xx km²           | 18px, #333333            |
| Temps de concentration (Tc) | xx min            | 18px, #333333            |
| Q10            | x.xx m³/s          | 16px, #555555            |
| Q20            | x.xx m³/s          | 16px, #555555            |
| Q50            | x.xx m³/s          | 16px, #555555            |
| Q100           | x.xx m³/s          | 16px, #555555            |

  - Boutons d’action larges (120x35px), cyan vif pour "Calculer", gris clair pour "Éditer", espacés 15px

---

## 5. Panneau Ouvrages Hydrauliques (320 x 400 px)

- **Position** : Bas droite  
- **Style** : même que panneau bassins  
- **Contenu** :  
  - Header "Ouvrages Hydrauliques" (20px, #0E4A7B)  
  - Recherche avec input 280x30 px en haut  
  - Liste ouvrages (haut max 7 visibles, 40px hauteur ligne)  
  - Ouvrages différenciés par icônes (buse, dalot, pont, etc.) 24x24 px à gauche  
  - Détails ouvrage sélectionné sous liste :  

| Élément       | Valeur             | Style texte               |
|---------------|--------------------|---------------------------|
| Nom ouvrage   | [texte]            | 18px, #333333             |
| Débit         | xx.xx m³/s         | 16px, #555555             |
| Vitesse       | x.xx m/s           | 16px, #555555             |
| Conformité    | Conforme / Non     | 16px, couleur vert/rouge  |

  - Bouton "Lancer calcul" bleu cyan 120x40 px placé en bas détails

---

## 6. Centre de Calcul (320 x 180 px)

- **Position** : Droite haut sous header  
- **Style** : fond clair blanc, bord arrondi 10px, ombre douce  
- **Contenu** :  
  - Titre "Centre de Calcul" (22px, bleu foncé)  
  - Liste calculs en cours (max 4 visibles), avec icônes statuts :  
    - Calcul en cours : spinner jaune  
    - Terminé : coche verte  
    - Erreur : croix rouge  
  - Bouton "Nouveau calcul" large 140x40 px coloré cyan vif  
  - Possibilité annulation calcul actif (icône croix bouton dans liste)

---

## 7. Panneau IA (320 x 240 px)

- **Position** : À droite, sous Centre de Calcul  
- **Style** : fond blanc avec légère bordure cyan  
- **Contenu** :  
  - Titre "Recommandations IA" (20px, #0E4A7B)  
  - Liste recommandations priorisées, 6 lignes max visibles, texte noir 16px  
  - Icônes d’alerte et bouton d’action (appliquer/consulter) à droite sur chaque ligne  
  - Indicateur synthétique aptitude globale (jauge cyan à droite)

---

## 8. Panneau Alertes (1920 x 150 px)

- **Position** : Fixe en bas, full width  
- **Fond** : Rouge clair #FFE5E5, bord supérieur arrondi 10px  
- **Contenu** :  
  - Titre : "Alertes Techniques" en rouge foncé 24px  
  - Tableau alertes avec colonnes : type, gravité, description, lien détail  
  - Lignes hauteur 40px, scroll horizontal si nécessaire  
  - Filtrage gravité en filtre slide à gauche  
- **Importante visibilité :** panneau présent en permanence, option masquable grace à bouton discret

---

## 9. Graphiques et Visualisations (1150 x 180 px)

- **Position** : En bas, sous carte centrale et à gauche du panneau bassins  
- **Style** : fond blanc, arrondis, ombres portées très légères  
- **Visualisations principales** :  
  - Pluviométrie et hydrogramme multi-durée (Q10, Q20, Q50, Q100) à gauche, 550px de large  
  - Courbe débit vs vitesse ouvrage sélectionné à droite, 550px  
- **Interactions** : zoom, tooltip sur points clés, légendes dynamiques  
- **Typographie graphique** : titres 18px, axes 14px, couleurs cohérentes palette OASIS  

---

## 10. Comportement Desktop

- Taille écran ≥ 1920x1080 px  
- Multi-fenêtres/dockables : possibilité détacher panneaux (IA, calcul, alertes)  
- Navigation rapide par raccourcis clavier  
- Support drag&drop avancé dans gestionnaire couches  
- Utilisation ressources locales pour calculs préliminaires en local

---

## 11. Comportement Web

- Responsive adaptatif ≥ 1024 px, menus hamburger sur petite largeur  
- Panneaux IA et Calculs en overlay modale si résolution réduite  
- Calculs lourds back-end asynchrones avec notifications push  
- Interaction tactile fluide (pinch zoom sur carte)  

---

# Notes finales

Cet écran représente le cockpit intégré complet des opérations d’ingénierie hydrologique et hydraulique, facilitant à la fois l’analyse, la prise de décision, le suivi et la collaboration dans OASIS HYDRO SUITE.

Il est conçu pour maximiser la visibilité, l’accessibilité et la réactivité tout en permettant une interaction fine avec des données complexes.

---
