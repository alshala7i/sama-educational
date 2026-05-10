FROM node:20

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

# Copy source and build NestJS app
COPY backend/src ./src
RUN npx nest build

# Run migrations and seed at BUILD time (baked into the image for SQLite)
RUN npx prisma migrate deploy && npx ts-node --project tsconfig.json prisma/seed.ts

EXPOSE 3001

CMD ["node", "dist/main"]
