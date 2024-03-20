FROM node:20

WORKDIR /src/api-plan-nexus

COPY package.json ./

RUN npm install 

COPY . .

EXPOSE 3333

CMD [ "npm", "run" , "dev" ]