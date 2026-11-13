# Schéma Complet de Navigation et Flux Fonctionnels — OASIS HYDRO SUITE

---

## 1. Vue Générale de la Navigation
Dashboard ↓ Cartographie ↓ Hydrologie ↓ Hydraulique ↓ Dimensionnement ↓ Contrôle Qualité ↓ Rapport


---

## 2. Description des Flux et Transitions

---

### Entre Dashboard et Cartographie

- **Navigation** : clic sur projet → ouverture automatique Cartographie avec projet/scénario chargé  
- **Données transmises** :  
  - Projet actif avec métadonnées  
  - Scénario hydraulique sélectionné  
  - Données géospatiales (MNT, bassins, ouvrages) reliées au projet  
- **Flux retours** :  
  - Sélections utilisateurs zoom/couche mise à jour sauvegardées dans contexte projet  
  - Résultats de départ (ex. délimit bassins) affichés sur carte

---

### Cartographie → Hydrologie

- **Navigation via bouton/onglet** : "Analyser hydrologie"  
- **Données transmises** :  
  - Bassins versants sélectionnés en cartographie  
  - Stations pluviométriques associées (localisation, séries)  
  - Paramètres pluies projet (IDF, hyétogrammes) liés au bassin/scénario  
- **Flux retours** :  
  - Calculs pluies/temps concentration/débits mis à jour  
  - Mise à jour éléments visibles sur carte selon modélisation hydrologique

---

### Hydrologie → Hydraulique

- **Mode opératoire** : bouton “Passer hydraulique”, sélection ouvrages  
- **Données transmises** :  
  - Paramètres hydrologiques validés (débits Q10...Q100)  
  - Bassins versants et sous-bassins d’intérêt  
  - Positionnement ouvrages hydrauliques reliés  
- **Flux retours** :  
  - Résultats calculs hydrauliques (vitesses, charges)  
  - État ouvrages mis à jour + alertes visualisées dans Cartographie

---

### Hydraulique → Dimensionnement

- **Navigation par contexte :** sélections ouvrages -> "Dimensionner"  
- **Données transmises** :  
  - Paramètres hydrauliques mesurés/simulés (débit, vitesse)  
  - Contraintes normatives associées  
- **Flux retours** :  
  - Résultats dimensionnement et suggestions catalogue  
  - Mise à jour attributs ouvrages sur Cartographie & Hydraulique

---

### Dimensionnement → Contrôle Qualité

- **Passage automatique ou manuel via onglet**  
- **Données transmises** :  
  - Ensemble paramètres hydrauliques, dimensionnement, scénarios associés  
- **Flux retours** :  
  - États conformité, alertes, scores de qualité mis à jour et disponibles partout  
  - Recommandations intégrées (IA)

---

### Contrôle Qualité → Rapport

- **Navigation via bouton "Générer rapport"**  
- **Données transmises** :  
  - Données validées issues des modules précédents  
  - Hypothèses projet, notes méthodologiques, résultats calculs, alertes/validations  
- **Flux retours** :  
  - Rapport professionnel généré (PDF, DOCX...)  
  - Historique rapports disponible dans projet

---

## 3. Synthèse des Flux Fonctionnels Inter-Écrans

- **Données géospatiales** (MNT, bassins, ouvrages) → partagées entre Cartographie, Hydrologie, Hydraulique  
- **Paramètres hydrologiques** → alimentent calculs hydrauliques et dimensionnement  
- **Résultats calculs** → circulent vers Contrôle Qualité et affichages pancartes  
- **Alertes & recommandations IA** → accessibles depuis Hydraulique, Contrôle Qualité et Cartographie  
- **Modifications & versions** → maintenues synchronisées via gestion versioning centralisée  

---

## 4. Visualisation Simplifiée
[Dashboard] ↓ (Sélection projet) [Cartographie] ←→ (Mise à jour bassins, ouvrages) ↓ (Sélection bassins, stations) [Hydrologie] ←→ (Calcul pluies, débits) ↓ [Hydraulique] ←→ (Simulation câblée ouvrages) ↓ [Dimensionnement] ←→ (Calcul dimensionnel, catalogue) ↓ [Contrôle Qualité] ←→ (Vérification normes, alertes) ↓ [Rapport] (Génération et archivage)



---

## 5. Interaction en mode Workflow

- L’utilisateur peut revenir en arrière à tout moment :  
  - Modifier bassin → recalcul hydrologie → mise à jour hydraulique  
  - Modifier ouvrage → rerun dimensionnement → relancer contrôles  
- Chaque étape sauvegarde état, permettant comparaisons variantes persistantes.  
- Notifications temps réel synchronisent écran Cartographie avec résultats calcul.

---

## Conclusion

Ce schéma de navigation et flux fonctionnels garantit un parcours utilisateur fluide, contextuel, intégré, et conforme aux besoins métier, tout en assurant la cohérence des données dans OASIS HYDRO SUITE.

Il sert d’ossature fonctionnelle claire pour le développement, la formation et la documentation.

---





