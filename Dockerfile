FROM node:alpine

WORKDIR /app

COPY package*.json ./
COPY package-lock.json ./


RUN npm ci --force

COPY . ./

# RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
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