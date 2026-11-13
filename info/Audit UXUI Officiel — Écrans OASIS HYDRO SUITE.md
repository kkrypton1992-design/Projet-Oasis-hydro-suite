# Audit UX/UI Officiel — Écrans OASIS HYDRO SUITE

---

## 1. Éléments Manquants dans les Écrans Existants

### Dashboard  
- Indicateurs financiers & coûts projet / études (budgets, avancements)  
- Accès rapide vers documentation et formation intégrée  
- Vue synthèse personnalisable par utilisateur/profil

### Cartographie  
- Edition directe profils en travers et en long (coupe projet)  
- Visualisation des contraintes géotechniques / occupation sol  
- Gestion de couches avancée : priorités, groupes complexes, snapshots  
- Intégration flux temporels et simulation dynamiques (crue, pluie)  
- Search avancé objets ouvrages par attributs

### Hydrologie  
- Gestion complète des pertes (Horton, Green-Ampt) et débit base  
- Visualisation synthèse historique et analyse séries temporelles  
- Edition avancée séries pluviométriques, gestion données manquantes  
- Gestion qualité données (station, séries) et alertes pré-intégrées  
- Collaboration multi-utilisateurs (commentaires, tickets)

### Hydraulique  
- Edition complète profils terrains projet, dévers, plans de remblai/deblai  
- Gestion nœuds réseaux hydrauliques avec topologie complexe  
- Simulation hydraulique 2D et gestion hydraulique transitoire intégrée  
- Analyses spécifiques (coups de bélier, affouillement, sédimentation)  
- Export CAO/BIM enrichi depuis l’écran hydraulique  
- Historique modifications et gestion scénarios variante

---

## 2. Incohérences Éventuelles Entre Écrans

- Terminologie parfois diversifiée : "Scénario" vs "Variante" non normalisé  
- Différences de styles d’affichage données similaires (ex : débits sur hydrologie vs hydraulique)  
- Absence de rappel constant des paramètres communs (normes, proj. actif) causant perte contexte  
- Workflow entre écrans pas toujours synchronisé visuellement (ex : sélection bassin hydrologie pas marquée sur carto)  

---

## 3. Accessibilité Complète des Données Nécessaires

- Données de base (projets, bassins, stations) présentes, mais données fines géotechniques absentes  
- Paramètres hydrologiques couvrant bases mais pas calculs pertes avancés ni débit base  
- Données ouvrages détaillées incomplètes (matériaux, multi-ouvertures, état technique)  
- Résultats calculs hydrauliques visibles, mais +/- transparence sur méthodologie et hypothèses

---

## 4. Couverture du Workflow Réel Ingénieur

- Du dashboard au rapport via cartographie, hydrologie, hydraulique correct en fil directeur  
- Manque intégration complète dimensionnement (entrées/sorties synchronisées)  
- Absence d’interface contrôle qualité intégrée workflow dès lors que dimensionnement fini  
- IA et recommandations absentes du workflow central, se limitent à assistant latéral  
- Gestion variantes comparaison et scénarios insuffisamment intégrée dans chainage

---

## 5. Risques Ergonomie & Surcharge Visuelle

- Multiplicité pans et panneaux risquent surcharge sur écran 1920x1080 (surtout coté droit)  
- Profils, graphes et tables disséminés complexifient concentration  
- Multiplicité boutons similaires sans hiérarchie visuelle  
- Navigation potentiellement non fluide sans indicateurs clairs d’état/scénario  
- Absence mode simplifié ou "pas à pas" pour utilisateurs novices

---

## 6. Informations à Rendre Permanentes / Visible Partout

- **Projet Actif :** nom, client, phase  
- **Scénario Actif :** titre, statut, version  
- **Version Logiciel et Normes Utilisées** (ex: SETRA 2026)  
- **État Workflow** (étapes accomplies, en cours, à valider)  
- **État des Calculs** (nombre en cours, erreurs, validés)  
- Intégrer bandeau ou barre d’état persistante en header/footer

---

## 7. Version Consolidée & Optimisée UX Globale

- **Header fixe** : intégrant projet/scénario/version, navigation rapide, état calculs/workflow  
- **Menu latéral unique** regroupant modules avec sous-menus clairs  
- **Zone centrale à 2 grands volets :**  
  - Gauche : liste objets métier (bassins, ouvrages, scénarios)  
  - Droite : visualisation principale (carte ou formulaires selon contexte)  
- **Panneaux latéraux doc/multimédia/graph interactifs** escamotables  
- **Centre de calcul et assistant IA** toujours visibles en mode popup/fenêtre flottante  
- **Workflow linéaire clair** avec indicateurs d’étapes et guidance contextuelle  
- **Mode “Ne pas déranger” ou “simplifié”** pour études rapides  
- Cohérence stylistique totale entre écrans (mêmes icônes, couleurs, typographie)

---

## 8. Liste Définitive des Écrans Principaux d’OASIS HYDRO SUITE

1. Dashboard Principal  
2. Cartographie — Cockpit Géospatial & Ouvrages  
3. Hydrologie — Gestion Pluies & Débits  
4. Hydraulique — Cockpit Calculs Hydrauliques  
5. Dimensionnement — Calculs et Catalogue Normé  
6. Contrôle Qualité & Conformité Normative  
7. Rapport — Génération & édition documents  
8. IA & Recommandations — Alertes, optimisation  
9. Administration — Utilisateurs, licences, audit

---

## 9. Ordre Logique de Conception des Écrans Restants

| Priorité | Écran              | Raisons                                  |
|----------|--------------------|-----------------------------------------|
| 1        | Dimensionnement    | Essentiel entre hydraulique et contrôle  |
| 2        | Contrôle Qualité   | Validation obligatoire avant rapports    |
| 3        | Rapport            | Synthèse finale indispensable            |
| 4        | IA                 | Assistance automatisée améliore qualité  |
| 5        | Administration     | Support utilisateurs et sécurité         |

---

# Conclusion

Les écrans existants, bien qu’avancés, nécessitent enrichissements majeurs pour permettre une étude complète routière/hydraulique professionnelle.

La consolidation proposée optimise la navigation, la cohérence, la visibilité des données critiques et couvre intégralement le workflow ingénieur.

Cet audit sert de base solide pour la poursuite sécurisée et efficace de la conception des interfaces restantes, garantissant adoption et excellence métier.

---
