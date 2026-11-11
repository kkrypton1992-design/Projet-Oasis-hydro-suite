# Maquette Détaillée du Dashboard Principal — OASIS HYDRO SUITE

---

## Description Pixel par Pixel (Largeur 1920px x Hauteur 1080px)

---

### 1. En-tête (Header)  
- **Position :** En haut, full largeur (1920px), hauteur 80px  
- **Contexte :** Fond bleu profond #0E4A7B  
- **Éléments :**  
  - Logo OASIS HYDRO SUITE à gauche, 200px largeur, 60px hauteur, marges haut/bas 10px, gauche 20px  
  - Nom Application à droite du logo : blanc #FFFFFF, taille police 24px, interlettres 0.5px, marge gauche 15px  
  - Barre recherche centrée horizontalement (largeur 450px, hauteur 40px), fond #FFFFFF, bord arrondi 6px  
  - Icônes utilisateurs, notifications, paramètres à droite : alignées verticalement centre, espacées 25px, taille icônes 24px, couleur blanche, marges droite 20px  

---

### 2. Menu Latéral Vertical  
- **Position :** Fixe à gauche, largeur 270px, hauteur 1000px (du haut du header jusqu’en bas)  
- **Fond :** Gris très sombre #121824  
- **Éléments :**  
  - Liste verticale, hauteur item 55px, padding horizontal 20px  
  - Icones ligne gauche taille 24px, couleur cyan #00A3E0  
  - Texte menu blanc #FFFFFF, police 16px, interlignage 20px  
  - Items : Dashboard (activé - fond #0E4A7B), Projets, Cartographie, Hydrologie, Hydraulique, Dimensionnement, Rapports, IA & Recommandations, Administration  
  - Hover : arrière-plan #1F2A40  
  - Separator fin menu : ligne 1px #2A3B55  

---

### 3. Zone Principale Contenu (Largeur 1650px x Hauteur 1000px)  
**Disposition en grille 3 colonnes principales avec marge intérieure 24px**  

---

### Colonne 1 (Largeur 550px)  

1. **Carte Synthèse Projets**  
   - Dimension : 530px largeur, 300px hauteur  
   - Fond : blanc #FFFFFF, bordure arrondie 12px, ombre douce  
   - Contenu : Mini carte interactive Leaflet zoom 6-8, marqueurs projets  
   - En haut titre "Projets Récents" (texte #0E4A7B, taille 20px, semi-bold)  
   - Coin supérieur droit : bouton "Voir tout" bleu cyan, taille 14px, padding 6px 12px  

2. **Indicateur KPIs** (4 blocs 1/2 ligne chacun, côte à côte)  
   - Chaque bloc : 125px largeur x 100px hauteur  
   - Fond : #F5F7FA, bord arrondi 10px  
   - Contenu chiffres gros (28px, #0E4A7B) + description sous-jacente (12px gris foncé #374151)  
   - Indicateurs :  
     - Projets actifs  
     - Études en cours  
     - Alertes qualité  
     - Rapports générés

---

### Colonne 2 (Largeur 550px)

1. **Liste Projets Actifs**  
   - Dimension : 530px largeur x 400px hauteur  
   - Fond blanc, bord arrondi 12px, ombre légère  
   - En-tête : "Projets Actifs" en #0E4A7B, taille 20px, semi-bold  
   - Table liste : colonnes "Nom", "Client", "Date dernière mise à jour", "Statut"  
   - Ligne hauteur 50px, texte gris foncé 16px  
   - Boutons actions (édition eye icon) à droite, icône taille 20px  
   - Barre filtre/recherche au-dessus liste, champ input bord gris clair #DDD  

2. **Notifications & Alertes Récentes**  
   - Dimension : 530px x 170px  
   - Fond clair bleu très pâle #E6F2FA  
   - Titre en bleu foncé #0E4A7B, taille 20px  
   - Liste scrollable max 5 notifications, texte noir 14px  
   - Icônes type alerte (rouge si critique, jaune avertissement) à gauche notifications  

---

### Colonne 3 (Largeur 550px)  

1. **Activités Récentes**  
   - Dimension : 530px x 580px  
   - Fond blanc, bord arrondi 12px  
   - Titre "Activités Récentes" en bleu #0E4A7B, 20px  
   - Timeline verticale : icône petite ronde bleu cyan, texte détail activité  
   - Scroll vertical possible, texte 14px noir

2. **Raccourcis & Actions Rapides**  
   - Bloc 530px x 200px, fond #F5F7FA, bord arrondi 12px  
   - Boutons larges (125px x 45px) : Créer projet, Nouvelle étude, Importer MNT, Lancer calcul  
   - Icônes intégrées (plus, fichier, carte, calculatrice)  
   - Boutons alignés en grille 2x2 avec marges

---

### 4. Pied de Page  
- Hauteur 50px, pleine largeur, fond #121824  
- Texte centré blanc 12px "© 2026 OASIS Hydro Suite - Tous droits réservés"

---

## Résumé Mise en Page

| Éléments           | Dimensions (px)       | Emplacement                         |
|--------------------|----------------------|-----------------------------------|
| Header             | 1920 x 80            | Haut pleine largeur               |
| Menu latéral       | 270 x 1000           | Gauche fixe sous header           |
| Colonne 1 (Carte+KPIs) | 550 x 450+            | Centre-gauche                     |
| Colonne 2 (Liste+Notifications) | 550 x 600+            | Centre                           |
| Colonne 3 (Activités+Raccourcis) | 550 x 770+            | Centre-droite                    |
| Footer             | 1920 x 50            | Bas pleine largeur                |

---

*Cette maquette détaillée garantit une utilisation intuitive, claire, et orientée métier avec un équilibre entre visibilité globale et accès rapide aux données clés du projet.*  
