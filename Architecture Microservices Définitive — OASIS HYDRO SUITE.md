# Architecture Microservices Définitive — OASIS HYDRO SUITE

---

## 1. Liste Complète des Microservices

| Microservice               | Responsabilité principale                           | Statut MVP/V1/V2  |
|---------------------------|----------------------------------------------------|-------------------|
| Auth Service              | Gestion authentication, autorisation, sessions     | MVP               |
| User & Project Service    | Gestion projets, études, scénarios, versioning      | MVP               |
| SIG & Import Service      | Import/gestion données MNT, SIG, CAO                | MVP               |
| Hydrology Service         | Calculs hydrologiques (pluies, Tc, débits)          | MVP               |
| Hydraulics Service        | Simulation hydraulique permanente                    | MVP               |
| Dimensioning Service      | Calculs et gestion catalogue ouvrages                | MVP               |
| Quality Control Service   | Vérifications qualité, conformité, alertes           | MVP               |
| Reporting Service         | Génération rapports dynamiques et export              | MVP               |
| AI Core Service           | Orchestration agents IA, recommandations, rédactions | MVP (partiel), V1 (complet), V2 (expert Afrique) |
| Workflow & Notification   | Gestion workflow, notifications utilisateurs          | MVP (base), V1 (complet) |
| Hydraulics Advanced       | Hydraulique transitoire (1D/2D), affouillement         | V1                |
| Collaboration Service     | Multi-utilisateurs, gestion commentaires              | V1                |
| BIM & IFC Service         | Intégration BIM, import/export IFC                     | V2                |

---

## 2. Dépendances Entre Services

- Auth Service → tous (authentification obligatoire)  
- User & Project Service ←→ SIG & Import Service  
- Hydrology Service dépend de User & Project + SIG & Import  
- Hydraulics Service dépend de Hydrology + User & Project  
- Dimensioning Service dépend de Hydraulics  
- Quality Control Service dépend de Hydraulics, Dimensioning  
- Reporting Service dépend de tous modules calcul et qualité  
- AI Core Service dépend de Quality Control, Dimensioning, Hydraulics, Hydrology  
- Workflow & Notification dépend de User & Project  
- Collaboration dépend de Workflow & User management  
- Hydraulics Advanced dépend de Hydraulics  
- BIM & IFC Service dépend de SIG & Import  

---

## 3. Communications Synchrones

- Frontend → API Gateway → Microservices via REST/GraphQL (auth, données, calculs)  
- Microservices Consultation inter-services REST synchrones pour données rapides et coordination  

---

## 4. Communications Asynchrones

- Calculs hydrology/hydraulics/dimensionnement via messages en queue (RabbitMQ/Kafka)  
- Notifications temporairement asynchrones (alerte calcul terminé, mise à jour)  
- IA Core utilise queue pour traitement lots volumineux, réponses différées  

---

## 5. Événements RabbitMQ/Kafka

- `project.created`, `study.updated`, `scenario.calculationRequested`  
- `calculation.completed` (hydro, hydrolique, dimensionnement)  
- `qualityCheck.result`  
- `ai.recommendationGenerated`  
- `report.generationRequested`, `report.generated`  
- `notification.new`  
- `workflow.stateChanged`  

---

## 6. Files de Messages

- `calculation_requests` (from frontend to calcul services)  
- `calculation_results` (back to orchestrator)  
- `quality_control_requests`  
- `ai_tasks`  
- `report_generation_tasks`  
- `notification_tasks`  

---

## 7. Échanges avec PostgreSQL/PostGIS

- Accès direct microservices via ORM optimisé (Prisma/TypeORM)  
- Transactions réparties avec caution (saga pattern si nécessaire)  
- Stockage spatiale avec index GiST  
- Contentieux transactions gérés par API business, traitement erreurs applicatif

---

## 8. Échanges avec l’IA

- IA Core service : API interne REST et messages  
- Base de données dédiée IA sous-jacente (ajouts/modifications recommandations/explanations)  
- Flux d’évènements vers AI pour triggering calculs, apprentissages, analyses  
- Retour AI vers modules métiers via notifications & API

---

## 9. Organisation Kubernetes

- Chaque microservice déployé dans pods distincts, scalables horizontalement  
- Ingress controller pour API Gateway  
- ConfigMaps et Secrets pour variables configuration/sécurité  
- StatefulSets pour bases de données  
- Autoscaling basé sur charge CPU/RAM et requêtes

---

## 10. Conteneurs Docker

- Image propre par microservice, versionnée  
- Intégration continue avec pipeline CI/CD  
- Multi-staging build pour optimisation taille/image  
- Conteneurs legers, sécurisés, monitorés

---

## 11. Services Obligatoires du MVP

- Auth, User & Project, SIG & Import, Hydrology, Hydraulics, Dimensioning, Quality Control, Reporting, Basic AI Core, Workflow & Notification

---

## 12. Services Reportés à Version 1

- Hydraulics Advanced (transitoire 1D & 2D), Collaboration avancée

---

## 13. Services Reportés à Version 2

- IA Expert Afrique, BIM & IFC intégrations, IA rédacteur complet

---

## 14. Mécanismes de Sécurité

- Auth OAuth2 + JWT  
- RBAC granulaires par microservice  
- Chiffrement TLS pour toutes communications  
- Audit complet avec politique GDPR  
- Surveillances et alertes en temps réel

---

## 15. Mécanismes de Monitoring

- Intégration Prometheus + Grafana  
- Alerting sur erreurs calcul, lenteurs API  
- Supervision logs applicatifs

---

## 16. Mécanismes de Logs

- Centralisation via ELK stack (Elasticsearch, Logstash, Kibana)  
- Traces distribuées pour diagnostic microservices  
- Logs sécurisés avec chiffrement et rotation

---

## 17. Mécanismes de Reprise Après Incident

- Backups réguliers base de données  
- Stratégies failover Kubernetes  
- Réexécution automatique des tâches messages non abouties  
- Monitoring et alerting précoce d'incidents

---

# Conclusion

Cette architecture microservices définit clairement le périmètre du MVP, les services nécessaires, leurs relations, échanges et mécanismes support, garantissant une base technique robuste, évolutive et sécurisée pour OASIS HYDRO SUITE.

---

*Document officiel de référence pour le développement backend et déploiement.*  
