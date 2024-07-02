FROM node:18-alpine AS build

# Définir le répertoire de travail dans le conteneur
WORKDIR /var/www/client

# Copier le fichier package.json et package-lock.json (si disponible)
COPY package.json package-lock.json ./

# Installer les dépendances
RUN npm install

# Copier tous les fichiers de l'application dans le répertoire de travail du conteneur
COPY . .

# Construire l'application
RUN npm run build

# Exposer le port sur lequel l'application va s'exécuter
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "start"]
