FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# A Vite alapértelmezett portja
EXPOSE 5173

# A --host kapcsoló elengedhetetlen, hogy a Docker konténerből kilásson a Vite
CMD ["npm", "run", "dev", "--", "--host"]