# Node.js alap (könnyű verzió)
FROM node:22-alpine

# Munkamappa beállítása a konténeren belül
WORKDIR /app

# Függőségek másolása és telepítése
COPY package*.json ./
RUN npm install

# A teljes forráskód másolása
COPY . .

# Port megnyitása
EXPOSE 5050

# Indítás az npm start paranccsal
CMD ["npm", "start"]