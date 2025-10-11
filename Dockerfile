FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2 
FROM node:18-alpine
WORKDIR /app

# Install a small static server
RUN npm install -g serve

# Copy built app from build stage
COPY --from=build /app/dist ./dist

EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]

# FROM node:alpine

# WORKDIR /app

# COPY package*.json ./
# COPY package-lock.json ./


# RUN npm ci --force

# COPY . ./

# # RUN npm run build

# EXPOSE 3000

# CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
# CMD ["serve", "build"]

# FROM node:alpine

# WORKDIR /app

# COPY package*.json ./

# RUN npm install

# COPY . ./

# RUN npm run build

# EXPOSE 3000

# CMD ["npm", "run", "dev"]
# CMD ["serve", "build"]