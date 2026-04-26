FROM node:22-alpine AS client

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.25.0 --activate

COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./
COPY ./packages/client/package.json ./packages/client/package.json
COPY ./packages/server/package.json ./packages/server/package.json
COPY ./packages/shared/package.json ./packages/shared/package.json
COPY ./packages/server/prisma ./packages/server/prisma

RUN pnpm install --frozen-lockfile

COPY ./packages/client ./packages/client

RUN pnpm --filter @ocean-palette/client run build

FROM node:22-alpine AS server

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.25.0 --activate

COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./
COPY ./packages/client/package.json ./packages/client/package.json
COPY ./packages/server/package.json ./packages/server/package.json
COPY ./packages/shared/package.json ./packages/shared/package.json
COPY ./packages/server/prisma ./packages/server/prisma

RUN pnpm install --frozen-lockfile

COPY ./packages/server ./packages/server

FROM node:22-alpine

WORKDIR /app/packages/server
ENV DATABASE_URL=file:./prisma/data/db.sqlite3

COPY --from=server /app /app
COPY --from=client /app/packages/client/dist /app/packages/client/dist

RUN mkdir -p /app/packages/server/public/assets/images
RUN ln -s /data /app/packages/server/prisma/data
RUN ln -s /assets /app/packages/server/public/assets

ENTRYPOINT ["npm", "run"]
CMD ["start"]
