import { GameService } from "./game/game.service";
import { Controller } from "./controller";
import { snakeToPascalCase } from "./lib/snake-to-pascal-case";

const AWS = require('aws-sdk');

AWS.config.loadFromPath('./config.local.json');
const ddb = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});;
const gameService = new GameService(ddb);
const controller = new Controller(gameService)


export async function handler(event, context){
    console.log(event, context);

    const body = JSON.parse(event.body);

    const path = event.path;
    const method = event.httpMethod;

    const controllerMethod = `handle${snakeToPascalCase(method)}`;
    
    const controllers = [controller];

    for( let c of controllers) {

        let itemRegex = new RegExp( '^' + controller.itemPath + '$' , 'g' )
        let m = itemRegex.exec(path);

        console.log(path);
        console.log("m", m);

        if(m && typeof c[`${controllerMethod}Item`] === 'function') {
            return c[`${controllerMethod}Item`](m.groups);
        }

        let collectionRegex = new RegExp( '^' + controller.collectionPath + '$' , 'g' )
        m = collectionRegex.exec(path);

        console.log(path);
        console.log("m", m);
        
        if (m && typeof c[controllerMethod] === 'function') {
            return c[controllerMethod](m.groups);
        }
    }
    
    return {
        statusCode: 404,
        body: "No controller found"
    };
  
  };
  