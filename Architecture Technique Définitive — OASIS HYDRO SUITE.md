# Architecture Technique Définitive — OASIS HYDRO SUITE

---

## 1. Architecture Générale du Logiciel

OASIS HYDRO SUITE est une plateforme modulaire, distribuée, conçue pour couvrir l’intégralité du cycle d’études hydrologiques et hydrauliques. L’architecture est basée sur une séparation nette entre le frontend (interface utilisateur), le backend (services métier, calculs, API), la base de données spatiale, et des composants évolutifs de traitement scientifique et cartographique.

Le système s’appuie sur un socle transversal de gestion projets, utilisateurs, versions, licences et audit, avec une intégration native de données géospatiales (raster et vecteur) et une bibliothèque normative. L’architecture prévoit déploiement desktop, web et cloud.

---

## 2. Frontend

### Technologies  
- **Next.js avec TypeScript** : Framework React pour UI moderne, SSR et SSG optimisés.  
- **Tailwind CSS** : design responsive, modulaire et performant.  
- **Leaflet + Mapbox GL** : visualisation SIG interactive raster/vecteur.

### Structure des écrans  
- Dashboard projet/études/scénarios  
- Éditeur géospatial (bassins, axes, profils)  
- Interface calculs hydrologiques/hydrauliques  
- Gestion dimensionnement et catalogue ouvrages  
- Contrôle qualité, recommandations  
- Module production rapports et plans  
- Administration utilisateurs & licences

### Navigation  
- Menu latéral contexte (modules et tâches)  
- Navigation tabulaire pour étapes métier par projet  
- Mode multi-onglets pour études/scénarios parallèles

### Composants  
- Cartes interactives (zoom, sélection, dessin)  
- Formulaires dynamiques (validations, dépendances)  
- Tableaux de bord (KPIs, alertes)  
- Visualiseurs profils, graphes hydrologiques  
- Visualisation résultats calculs et contrôles  
- Export données & documents

---

## 3. Backend

### Services  
- API GraphQL/REST pour gestion projets, données, calculs  
- Microservices calculs hydrologiques et hydrauliques (isolés pour montée en charge)  
- Service gestion versioning, audit, workflow validation  
- Service import/export CAO/SIG/BIM (DWG/DXF, LandXML, IFC)  
- Service génération rapports et plans  
- Service moteur de recommandations et IA

### Organisation des modules  
- Modules découplés basés sur domaines métier  
- Orchestrateur de calculs et suivi des scénarios/scientifique  
- Gestion des workflows asynchrones avec queue de messages  
- Authentification OAuth2/JWT, gestion rôles et permissions

---

## 4. Base de Données

### Technologie  
- **PostgreSQL/PostGIS** : base relationnelle avec extension spatiale riche.  

### Schéma principal  
- Tables proéminentes : projets, études, scénarios, versions  
- Tables spatiales : dem_tiles, tin_nodes/triangles, bassins (polygones), cours d’eau (lignes), ouvrages (points)  
- Tables référentiels : normes, catalogues, matériaux  
- Tables scientifiques : résultats calculs hydrologie/hydraulique, analyses fréquentielles, scénarios  
- Tables documentation et rapports

### Justification  
- PostgreSQL/PostGIS offre robustesse ACID, scalabilité verticale et horizontale  
- Très bonnes performances requêtes spatiales natives  
- Outils d’analyse spatiale (indexation GiST, raster processing)  
- Support géométrie 2D & 3D indispensable à traitements hydrauliques

---

## 5. SIG

- **Cartographie** Leaflet/Mapbox GL frontend, couplée à PostGIS backend  
- **Traitement MNT** via raster SQL et traitements spécifiques (remplissage cuvettes, pentes, orientations)  
- **Profils** générés en pipeline (profils en long et en travers) à partir données terrain intégrées  
- Gestion Raster (GeoTIFF, ASCII grid, LAS/LAZ), vecteurs géométriques (polylignes, polygones, points)  
- Reprojection dynamique selon SCR utilisateur  
- Import/export formats standards open (GeoJSON, Shapefile, LandXML) et CAO/BIM (DWG, IFC)

---

## 6. Moteur Scientifique

### Calculs Hydrologiques  
- Modélisation pluie-bassin-ruissellement avec options multiples (rationnelle, SCS, CN, pertes)  
- Analyse fréquentielle statistique avancée (Gumbel, Log-Pearson)  
- Routage hydrologique multi-bassins (Muskingum, Puls)  
- Sensibilité paramétrique et gestion incertitudes Monte-Carlo

### Calculs Hydrauliques  
- Hydraulique permanente 1D (Manning, Chezy, remous)  
- Hydraulique transitoire 1D (équations Saint-Venant, schémas numériques robustes)  
- Hydro-dynamique 2D optionnelle (shallow water) pour zones inondables  
- Modules dédiés ouvrages hydrauliques complexes (ponts, barrages, bassins)

---

## 7. Génération de Rapports

- Moteur template paramétrable (report templates) en PDF, DOCX, LaTeX  
- Intégration données dynamiques, graphiques, tableaux automatiques  
- Implémentation web-service asynchrone pour traitement rapide  
- Historique versions rapports, personnalisation par client et norme

---

## 8. Génération de Plans

- Modularité plans : profils, coupes, réseaux, ouvrages  
- Export multi-formats DWG, DXF, PDF, IFC  
- Automatisation génération avec styles normés, cartouches, légendes  
- Intégration CAO légère dans interface web + possibilité desktop

---

## 9. IA & Moteur de Recommandations

- Base règles expert normatives et techniques pour alertes et conseils automatiques  
- Moteur d’inférence combiné à apprentissage supervisé (ex : retour expérience, détections anomalies)  
- Aide à la décision multi-critères (MCDA) et optimisation paramétrique guidée  
- Prise en compte scénarios et analyses de sensibilité

---

## 10. Architecture Desktop, Web et Cloud

- **Desktop** : application standalone pour calculs lourds locaux, édition avancée CAO, travail offline.  
- **Web** : interface utilisateur interactive, collaboration, consultation, édition légère.  
- **Cloud** : traitement calculs intensifs, stockage mutualisé, API services tiers, back-office administratif.

Interopérabilité entre modes via synchronisation données et API REST/GraphQL.

---

## 11. Technologies retenues

| Composant                | Technologie principale            |
|-------------------------|---------------------------------|
| Frontend                | Next.js, React, TypeScript, Tailwind CSS, Leaflet/Mapbox GL  |
| Backend                 | Node.js, TypeScript, Microservices, REST/GraphQL API          |
| Base de données         | PostgreSQL + PostGIS                                          |
| Traitement SIG          | PostGIS, GDAL en backend, Leaflet/Mapbox en frontend          |
| Moteur scientifique    | Modules calculs en Node.js, Python (optionnel), conteneurs Docker |
| Rapport & Plans        | Puppeteer, PDFKit, LibreOffice headless, DXF/DWG processing   |
| IA/Aide décisionnelle  | Python (scikit-learn, TensorFlow), règles métiers en engine dédié |

---

## 12. Justification des choix techniques

- **Next.js et React** : UI moderne, SEO-friendly, facile évolutivité.  
- **TypeScript** : rigueur typage, fiabilité code.  
- **PostgreSQL/PostGIS** : standard open-source leader SIG avec scalabilité.  
- **Microservices** : modularité, montée en charge aisée, isolation code métier/scientifique.  
- **Docker** : portabilité, environnement homogène.  
- **Outils open-source et standards ouverts** pour intégration facile avec CAO/BIM.

---

## 13. Contraintes de Performance

- Calculs hydrologiques/hydrauliques hautement parallélisables pour temps réel et batch.  
- Indexation spatiale avancée sur PostGIS pour requêtes rapides.  
- Caching des résultats pré-calculés et rapports.  
- Équilibrage charge microservices pour haute disponibilité.  
- Compression et lazy loading données cartographiques frontend.

---

## 14. Contraintes de Sécurité

- Authentification robuste OAuth2 / OpenID Connect.  
- Gestion fine des droits (RBAC) par module et données.  
- Cryptage données sensibles au repos et en transit (TLS).  
- Audit complet des actions utilisateurs.  
- Mises à jour régulières dépendances, gestion correctifs vulnérabilités.

---

## 15. Plan de Déploiement

- **Phase 1** : Installation environnement de développement, validation CI/CD.  
- **Phase 2** : Déploiement socle base données + services backend + frontend minimal.  
- **Phase 3** : Déploiement modules hydrologie, hydraulique de base.  
- **Phase 4** : Ajout modules dimensionnement, vérifications qualité, catalogue.  
- **Phase 5** : Modules avancés, IA, production documentaire complète.  
- **Phase 6** : Déploiement multi-environnements (desktop, cloud, web).  
- **Phase 7** : Mise en production progressive avec mesures performance et sécurité.

---

*Ce document constitue la référence technique complète pour la conception, le développement et le déploiement d’OASIS HYDRO SUITE.*  
