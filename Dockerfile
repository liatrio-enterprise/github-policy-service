FROM node:16.13.1-slim as build

WORKDIR /usr/src/app
COPY . .

RUN yarn --production

FROM mcr.microsoft.com/azure-functions/node:4-node16

LABEL org.opencontainers.image.source=https://github.com/liatrio/github-org-policy-service

COPY --from=build /usr/src/app /usr/src/app
WORKDIR /usr/src/app

ENTRYPOINT ["node", "app.js"]
