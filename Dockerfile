# Stage 1 (builder)

#Instruction
#alpine means small
FROM node:24-alpine AS builder

#create app dir/folder inside container
WORKDIR /app

#copy json
COPY package*.json ./

#instal dependencies
RUN npm ci 

#copy rest
COPY . .

#build app
RUN npm run build


# Stage 2 (production)

FROM node:24-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev
RUN apk add --no-cache curl
COPY --from=builder --chown=node:node /app/dist ./dist
RUN chown -R node:node /app
USER node
EXPOSE 4000

CMD ["npm", "run", "start:prod"]
