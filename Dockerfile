FROM node:20

WORKDIR /backend

COPY . .

RUN npm i

EXPOSE 3333

CMD ["npm", "start"]