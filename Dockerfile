FROM node:20

COPY ./ ./app/

WORKDIR /app

# Ensure husky doesn't run as we're not in a git repo and don't need to setup hooks
RUN HUSKY=0 npm ci

RUN npm run build

CMD [ "npm", "run", "server:start:prod" ]
