FROM node:16

RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

COPY package*.json ./
RUN npm install --only=development

COPY . .

RUN npm run build

ENV NODE_ENV=development

USER appuser

EXPOSE 3001

CMD ["npm", "run", "start:dev"]

