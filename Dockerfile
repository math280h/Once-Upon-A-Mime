FROM node:17

WORKDIR /bot

COPY package.json package.json
COPY package-lock.json package-lock.json
COPY tsconfig.json tsconfig.json

RUN npm i

COPY config.json.example /usr/src/bot/config.json

COPY src src

ENV DISCORD_TOKEN = "null"

CMD ["npm", "run", "start"]
