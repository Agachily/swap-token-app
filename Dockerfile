FROM node:16-alpine
WORKDIR /swap-token-app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD npm run dev