FROM node:current-alpine3.21

WORKDIR /usr/src/app

RUN apk add --no-cache \
    python3 make g++ pkgconfig

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# Add timezone configuration
RUN apk add --no-cache tzdata
ENV TZ=Europe/Paris
RUN ln -sf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Copier le script de démarrage et donner les permissions
COPY start.sh .
RUN chmod +x start.sh

RUN chown -R node:node /usr/src/app
USER node

ENTRYPOINT ["./start.sh"]
