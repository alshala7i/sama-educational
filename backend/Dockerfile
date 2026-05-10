FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install ALL dependencies including devDependencies (needed for nest build, prisma cli, typescript)
RUN npm ci --include=dev

# Copy build config files
COPY tsconfig.json tsconfig.build.json nest-cli.json ./

# Copy prisma schema and generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code and build
COPY src ./src
RUN npx nest build

EXPOSE 3001

CMD ["node", "dist/main"]
