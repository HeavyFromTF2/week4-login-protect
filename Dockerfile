FROM node:22-alpine

WORKDIR /appn

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]