FROM node:18

WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install dotenv
COPY . .

EXPOSE 5000
CMD ["node", "index.js"]
