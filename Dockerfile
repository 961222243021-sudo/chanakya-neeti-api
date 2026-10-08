FROM node:24-alpine
WORKDIR /app
COPY package.json server.mjs ./
COPY src ./src
COPY data ./data
COPY public ./public
ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["node", "server.mjs"]
