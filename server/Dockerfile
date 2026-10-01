FROM node:22-alpine
WORKDIR /app
COPY package.json index.mjs ./
USER node
ENV PORT=8080
EXPOSE 8080
CMD ["node", "index.mjs"]
