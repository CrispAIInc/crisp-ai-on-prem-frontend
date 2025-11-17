# FROM node:18-alpine AS build
# WORKDIR /app

# COPY package*.json ./
# RUN npm ci

# COPY . .
# RUN npm run build

# # Stage 2 
# FROM node:18-alpine
# WORKDIR /app

# # Install a small static server
# RUN npm install -g serve

# # Copy built app from build stage
# COPY --from=build /app/dist ./dist

# EXPOSE 8080
# CMD ["serve", "-s", "dist", "-l", "8080"]

# /////////////////////////////////////////////////////////////////////
# ---------- Stage 1: Build the frontend ----------
#FROM node:18-alpine AS build
#WORKDIR /app

# Copy dependency files and install
#COPY package*.json ./
#RUN npm ci

# Copy source code and build
#COPY . .
#RUN npm run build


# ---------- Stage 2: Serve the built frontend ----------
#FROM node:18-alpine AS serve
#WORKDIR /app

# Install 'serve' globally to serve static files
#RUN npm install -g serve

# Copy only the built files from the previous stage
#COPY --from=build /app/dist ./dist

#EXPOSE 3000

# Start the server
#CMD ["serve", "-s", "dist", "-l", "3000"]

# ---------- Stage 1: Build the frontend ----------
FROM node:18-bullseye AS build
WORKDIR /app

# Copy dependency files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Fix Rollup native binary issue
RUN npm install @rollup/rollup-linux-x64-gnu --force || npm rebuild rollup

# Copy source code and build
COPY . .
RUN npm run build


# ---------- Stage 2: Serve the built frontend ----------
FROM node:18-bullseye AS serve
WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]


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