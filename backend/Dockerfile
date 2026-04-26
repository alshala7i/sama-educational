FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN npm run build
RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
