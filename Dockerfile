FROM node:20-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package.json backend/package-lock.json ./

# Install ALL deps including devDependencies (needed for nest build, prisma cli, typescript, ts-node)
RUN npm ci --include=dev

# Copy build config
COPY backend/tsconfig.json backend/tsconfig.build.json backend/nest-cli.json ./

# Copy prisma schema and generate client
COPY backend/prisma ./prisma
RUN npx prisma generate

# Copy source and build
COPY backend/src ./src
RUN npx nest build

EXPOSE 3001

CMD ["node", "dist/main"]
