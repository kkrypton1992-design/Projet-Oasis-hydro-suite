# Blueprint de Construction Réelle — OASIS HYDRO SUITE (MVP)

---

## 1. Organisation Complète du Monorepo Git

- Structure en monorepo avec dossiers racines distincts pour frontend, backend, shared libs, infrastructure, docs  
- Utilisation de **Nx / Lerna** ou équivalent pour gestion monorepo et dependencies inter-projets  
- Chaque microservice et front encapsulé dans un package indépendant  
- Gestion versionnée des packages partagés

---

## 2. Arborescence Complète des Dossiers

/oasis-hydro-suite │ ├── /frontend-web │ ├── /components │ ├── /pages │ ├── /styles │ └── /utils │ ├── /frontend-desktop │ ├── /electron │ ├── /components │ └── /utils │ ├── /backend │ ├── /api-gateway │ ├── /auth-service │ ├── /project-service │ ├── /sig-service │ ├── /hydrology-service │ ├── /hydraulics-service │ ├── /dimensioning-service │ ├── /quality-service │ ├── /reporting-service │ ├── /ai-service │ └── /workflow-service │ ├── /shared │ ├── /models │ ├── /constants │ ├── /utils │ ├── /types │ └── /api-clients │ ├── /infrastructure │ ├── /kubernetes │ ├── /docker │ ├── /ci-cd │ ├── /monitoring │ └── /security │ └── /docs ├── /sff ├── /api-specs ├── /architecture └── /user-guides


---

## 3. Organisation Frontend

- Basé sur **Next.js** (web) avec TypeScript  
- Composants réutilisables dans `/components` partagés desktop & web si possible  
- Pages structurées selon écrans fonctionnels : dashboard, cartographie, hydrologie, hydraulique, dimensionnement, contrôle qualité, rapports, IA  
- Gestion des états via Redux ou React Query  
- Internationalisation prévue (i18n)  
- Tests unitaires/jest + tests intégration Cypress ou Playwright

---

## 4. Organisation Backend

- Microservices Node.js (TypeScript) avec REST/GraphQL  
- Code modulable, respectant séparation business logic - data access - controllers  
- API Gateway centralisée pour routage, authentification (OAuth2/JWT)  
- Utilisation d’ORM (Prisma ou TypeORM)  
- Tests unitaires et intégration aux microservices

---

## 5. Organisation des Microservices

- Chaque service dans dossier propre sous `/backend`  
- Propre base de données ou schémas dédiés dans PostgreSQL  
- Communication interne via API REST & message broker (RabbitMQ)  
- Responsabilités claires selon architecture : auth, gestion projet, SIG, calculs, qualité, rapports, AI, workflow

---

## 6. Organisation PostgreSQL/PostGIS

- Bases ou schémas multiples par microservice  
- Index GiST pour données spatiales  
- Migrations versionnées (Liquibase ou Flyway)  
- Triggers audit intégrés  
- Vue matérialisée pour requêtes lourdes

---

## 7. Organisation Kubernetes

- Namespace dédié OASIS Hydro Suite  
- Déploiement par microservice (pods, services)  
- ConfigMaps, Secrets sécurisés  
- Autoscaling horizontal  
- Ingress contrôleur pour API Gateway  
- Monitoring (Prometheus, Grafana) déployé

---

## 8. Organisation Docker

- Image Docker par microservice  
- Multi-stage builds pour optimiser taille  
- Image Next.js optimisée pour frontend  
- Images versionnées et publiées dans registry (DockerHub/Private)

---

## 9. Organisation des Packages Partagés

- `/shared/models` : définitions types, interfaces  
- `/shared/utils` : fonctions utilitaires  
- `/shared/api-clients` : clients API internes  
- Versionnés et testés intégralement pour cohérence globale

---

## 10. Conventions de Nommage

- Tables : snake_case pluriel  
- Variables/fréquences/api : camelCase  
- Composants React : PascalCase  
- Microservices : nom clair simple (ex: hydrology-service)  
- Endpoints API : RESTful standards, pluriels (ex: /projects)

---

## 11. Conventions de Développement

- TypeScript strict  
- Branches feature short-lived, pull requests obligatoires  
- Respect SOLID, bonne séparation des responsabilités  
- Revue de code obligatoire

---

## 12. Conventions API

- REST standard, statuts HTTP corrects  
- Pagination, filtre, tri standardisés  
- Auth JWT dans Headers Authorization  
- Versionning API en URL (/v1/...)

---

## 13. Conventions Base de Données

- UUID PK  
- Clés étrangères explicites, contraintes intégrées  
- Triggers audit et versioning  
- Index sur colonnes souvent requêtées

---

## 14. Conventions Git

- Branches : main, develop, feature/*, hotfix/*, release/*  
- Format commit standard (ex : Conventional Commits)  
- Pull Requests obligatoires avec revues multiples

---

## 15. Stratégie de Branches

- `main` : production stable  
- `develop` : intégration continue, pré-prod  
- `feature/*` pour développement spécifique  
- `release/*` pour préparation mises en production  

---

## 16. Stratégie CI/CD

- Pipelines automatisés pour build, test, lint, déploiement CI & CD  
- Tests unitaires + intégration requises avant merge  
- Déploiement progressif sur pré-prod puis production  
- Canary releases pour mises à jour critiques

---

## 17. Stratégie de Tests

- Tests unitaires ≥ 80% couverture  
- Tests d’intégration backend + API  
- Tests e2e frontend (Cypress/Playwright)  
- Tests de charge sur microservices critiques

---

## 18. Stratégie de Déploiement

- Automatisée via pipelines CI/CD avec rollback  
- Environnements dev, pré-prod, prod isolés  
- Monitoring actif et alertes configurées

---

## 19. Stratégie de Monitoring

- Metrics collectées via Prometheus  
- Dashboards Grafana personnalisés  
- Logs centralisés dans ELK stack  
- Alerting sur temps réponse, erreurs critiques, charge CPU/mémoire

---

## 20. Stratégie de Sauvegarde

- Backup PGSQL/PostGIS automatisé quotidien  
- Snapshots complets sur volumes cloud  
- Test régulier des restaurations

---

## 21. Stratégie de Sécurité

- Mécanismes auth OAuth2/JWT solides  
- RBAC granulaire  
- TLS pour toutes communications  
- Monitoring accès et activités suspectes  
- Chiffrement données sensibles au repos

---

## 22. Plan de Création du Dépôt

- Initialisation monorepo avec structure complète des dossiers  
- Configuration linters, formatters, tests initialisés  
- Premier commit avec README, charte code & contribution  
- Mise en place pipeline CI/CD automatisé en staging

---

## 23. Tâches Techniques Sprint 1

- Authentification backend et frontend  
- Gestion projets/scénarios minimalistes  
- Import MNT simple & visualisation carte basique  
- Mise en place base PostgreSQL + PostGIS (schemas/basics)  
- Initialisation API Gateway REST

---

## 24. Tâches Techniques Sprint 2

- Implémentation calculs hydrologiques (pluie, Tc, débit rational)  
- Développement backend Hydraulique permanent simplifié  
- UI Cartographie intégrale basique  
- Base données extension avec bases hydrologie/hydraulique

---

## 25. Tâches Techniques Sprint 3

- Module dimensionnement buses et dalots  
- Contrôle qualité basique (vitesse admissible)  
- Génération rapports PDF simples  
- Mise en place monitoring service + logging basique

---

# Conclusion

Ce blueprint de construction officielle assure une feuille de route claire, organisée et opérationnelle pour démarrer immédiatement le développement du MVP d’OASIS HYDRO SUITE, en garantissant qualité, robustesse, évolutivité et cohérence technique.

---

*Document officiel validé pour pilotage projet et coordination équipes techniques.*  
