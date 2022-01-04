FROM node:14 as build

WORKDIR /usr/local/app

COPY package.json .

RUN npm install

COPY . .

RUN npm run build


FROM nginx:latest

COPY --from=build /usr/local/app/dist/timestream-navigator /usr/share/nginx/html

EXPOSE 80
