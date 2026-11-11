# Conception Détailée de l’Écran Dimensionnement — OASIS HYDRO SUITE

---

## 1. Disposition Complète de l’Écran (1920 x 1080 px)

| Zone                           | Dimensions (px)       | Position                | Description sommaire                                      |
|--------------------------------|----------------------|-------------------------|----------------------------------------------------------|
| Header                        | 1920 x 70            | Haut (0,0)              | Logo, titre "Dimensionnement", navigation rapide          |
| Menu Latéral Modules          | 280 x 900            | Gauche (0,70)           | Navigation module + accès rapide scénarios et variantes   |
| Panneau Scénarios & Variantes | 280 x 350            | Gauche haut (0,70)      | Liste & gestion multi-scénarios/variantes                 |
| Panneau Catalogue Ouvrages    | 280 x 550            | Gauche bas (0,420)      | Catalogue normé filtrable, recherche et présélections     |
| Zone Principale Résultats     | 1150 x 700           | Centre (280,70)         | Solutions dimensionnement proposées et comparateur multi-critères |
| Centre de Calcul              | 400 x 180            | Droite haut (1430,70)   | Lancement & suivi des calculs dimensionnement              |
| Assistant IA                 | 400 x 250            | Droite milieu (1430,260)| Recommandations techniques et justifications               |
| Comparateurs Techniques & Éco | 1150 x 130           | Centre bas (280,770)    | Tableau comparatif des solutions techniques, coûts et recommandations |
| Panneau Workflow & Qualité   | 400 x 200            | Droite bas (1430,520)   | Avancement études, contrôle qualité, checklist normes      |
| Panneau Justification Technique| 1150 x 130          | Centre bas sous comparateurs (280,900) | Textes explicatifs, références normatives, résumés justifiés |

---

## 2. Description des Panneaux et Zones

---

### A. Header (1920 x 70 px)

- Fond bleu #0E4A7B  
- Titre principal à gauche, blanc, taille 24 px  
- Affichage permanent : projet actif, scénario actif, version norme utilisée  
- Boutons rapide profil, aide et notifications à droite  

---

### B. Menu Latéral Modules & Scénarios (280 x 900 px)

- **Partie haute (scénarios/variantes 280x350)**  
  - Liste hiérarchisée projets → études → scénarios → variantes  
  - Icônes statut, filtre recherche, gestion versioning  
  - Actions : création, duplication, suppression, comparaison sélectionnée multi-variantes  
- **Partie basse (catalogue ouvrages 280x550)**  
  - Barre recherche avec filtre (type ouvrage, matériau, capacité)  
  - Liste catalogue avec icônes images papier + texte  
  - Bouton "Ajouter au projet" sélectionnable, avec quantité et détails  
  - Indicateur prix estimatif par ouvrage

---

### C. Zone Principale Résultats & Solutions (1150 x 700 px)

- **Sous-zone solutions (largeur 1150, hauteur 500 px)**  
  - Présentation par onglets pour chaque type d’ouvrage :  
    - Buses, Dalots, Fossés, Caniveaux, Ponts, Bassins de rétention  
  - Chaque onglet contient tableau solutions disponibles (min 5 par type)  
  - Colonnes tableau :  
    - Dimension (diamètre, hauteur, largeur)  
    - Performance hydraulique (débit, vitesse max)  
    - Conformité normative (statut icônes)  
    - Coût estimé (€)  
    - Score global (pondération critères)  
    - Bouton sélection/export  

- **Comparateur dynamique latéral (largeur 1150, hauteur 200 px)**  
  - Affichage multi-critères comparant 2-3 solutions sélectionnées  
  - Critères techniques (débit utile, vitesse, perte charge)  
  - Critères économiques (coût initial, coût entretien estimé)  
  - Critères environnementaux et constructibilité (gestion risques, matériau)  
  - Graphiques à barres et radars pour synthèse visuelle  
  - Boutons “Comparer” / “Adopter”  

---

### D. Centre de Calcul (400 x 180 px)

- Titre clairement visible avec icône calculateur  
- Liste file d’attente calculs dimensionnement  
- Statuts (en cours, réussi, erreur) avec indication temps estimé  
- Bouton "Lancer Calcul" avec choix mode simple ou avancé  
- Historique calculs récents + option rejouer

---

### E. Assistant IA & Recommandations (400 x 250 px)

- Panneau latéral droit avec bordure cyan  
- Liste recommandations classées (priorité haute en haut)  
- Textes courts d’explication des solutions recommandées, justifications normatives  
- Suggestions d’améliorations et risques identifiés  
- Interaction : clic pour demander plus d’explications, ou appliquer recommandation  
- Visualisation score de confiance AI (0-100%)  

---

### F. Comparateurs Techniques & Économiques (1150 x 130 px)

- Tableau synthèse multi-lignes comparant toutes solutions proposées  
- Couleurs vert / jaune / rouge pour état critiques / avantages / risques  
- Colonnes : dimension, débit, vitesse, conformité, coût initial, coût vie, score total  
- Contrôle filtre dynamique selon poids critères pondérés  
- Export PDF/Excel des résultats synthétiques

---

### G. Workflow & Contrôle Qualité (400 x 200 px)

- Visualisation graphique (barres, avancement) du processus dimensionnement  
- Liste checklist qualité avec cases à cocher : conformité normes, validation dimension, vérifications sécurité  
- Boutons fléchés pour navigation rapide vers étapes workflow  
- Indicateurs d’alerte et blocage bloquant la progression si erreurs critiques

---

### H. Justification Technique Automatique (1150 x 130 px)

- Texte dynamique lié à la solution sélectionnée  
- Résumé des normes appliquées, hypothèses retenues, calculs clés  
- Possibilité d’insérer notes manuelles utilisateur  
- Lien vers documents normatifs et guides associés  
- Export PDF inclus avec rapport

---

## 3. Outils & Interactions Clés

- **Multi-sélection solutions** avec visualisation immédiate dans comparateur  
- **Filtrage catalogue avancé** basé sur critères projet, normes, coûts  
- **Système d’aide contextuelle IA intégré** affichant conseils selon choix utilisateur  
- **Mode "Simulation rapide"** ou "Étude détaillée" pour adapter profondeur calculs  
- **Visualisation synthétique scores pondérés** guide intuitif de décision  
- **Historique complet des variantes et comparaisons persistantes**

---

## 4. Ergonomie et Design

- Utilisation de couleurs de la charte pour hiérarchiser les informations  
- Texte clair, espacement aéré, typographie adaptée pour volumes d’information élevés  
- Composants interactifs avec retours visuels instantanés  
- Compatible mode desktop et web responsive (panneaux escamotables)

---

## 5. Conclusion

L’écran Dimensionnement final est un cockpit complet, interactif et évolutif, où l’ingénieur accède à une palette puissante d’outils décisionnels et d’aide au choix.

Il permet de passer aisément des calculs modélisés aux solutions concrètes, en intégrant workflow, IA et justifications, tout en assurant visibilité complète sur les aspects techniques et économiques.

---

*Ce document constitue la référence officielle pour la conception définitive du module Dimensionnement d’OASIS HYDRO SUITE.*  
