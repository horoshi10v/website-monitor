FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine as production
WORKDIR /app
COPY --from=build /app ./
EXPOSE 3002
CMD ["npm", "run", "start:prod"]
