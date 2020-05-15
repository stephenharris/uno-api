# Uno

An API to play Uno. This is currently very unstable.

## Getting started (local development)

    npm install
    npm run start:local

In a seperate shell, create the database (and a GUI admin for debugging)

    docker run -p 8000:8000 -it --rm instructure/dynamo-local-admin

Then create the table

    node create-table.js

To create a websocket client to test/debug:

    npm run ws

## Deployment

Deployment uses serverless. Following their documentation, ensure `.aws/credentials` has your AWS credentials and then run:

    npm run deploy:prod

