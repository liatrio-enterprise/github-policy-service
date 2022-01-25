FROM node:16.13.1-slim as build

WORKDIR /usr/src/app
COPY . .

RUN yarn --production

FROM gcr.io/distroless/nodejs:16

LABEL org.opencontainers.image.source=https://github.com/liatrio/org-management-facilitor

COPY --from=build /usr/src/app /usr/src/app
WORKDIR /usr/src/app

CMD ["src/app.js"]
