# Projet Crypto Real-Time Analytics

Ce projet implémente une plateforme d'analyse en temps réel des prix de cryptomonnaies avec intégration d'une analyse de sentiment. Il utilise Node.js pour le backend, React.js pour le frontend, et Kafka pour la gestion des messages.

## Fonctionnalités

- **Prix en Temps Réel :** Affichage des prix actualisés des cryptomonnaies en temps réel grâce à une intégration avec un service de streaming Kafka.
  
- **Analyse de Sentiment :** Analyse le sentiment des actualités concernant les cryptomonnaies à l'aide d'un modèle de traitement du langage naturel (NLP).

- **WebSocket :** Communication bidirectionnelle entre le frontend et le backend via des WebSockets pour une mise à jour instantanée des données.

## Technologie Utilisée

- **Backend :** Node.js, Express.js, Kafka.js
- **Frontend :** React.js, WebSocket API
- **Base de Données :** MongoDB (ou autre base de données selon les besoins)
- **Autres Outils :** Docker (pour la conteneurisation), Kafka (pour le streaming de données), Redis (pour la mise en cache, optionnel)

## Installation et Démarrage

### Prérequis

- Node.js installé localement
- Docker (facultatif pour Kafka, Redis)

### Backend

1. Cloner le repository
   ```bash
   git clone 
   cd analyse/
   ```
   
