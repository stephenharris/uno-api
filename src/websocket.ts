import { SocketClient } from "./lib/socket-client";
import { MessageGateway } from "./message-gateway";
import { GameService } from "./game/game.service";
import { snakeToPascalCase } from "./lib/snake-to-pascal-case";

const AWS = require('aws-sdk');

//AWS.config.loadFromPath('./config.local.json');
const ddb = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});;
const gameService = new GameService(ddb);
const messageGateway = new MessageGateway(gameService)

export async function connect(event, context){
  console.log(`${event.requestContext.connectionId} connected`);

  return {
    statusCode: 200,
  };
};

export async function message(event, context){
  const domain = event.requestContext.domainName;
  const stage = event.requestContext.stage;
  const connectionId = event.requestContext.connectionId;
  const body = JSON.parse(event.body);
  const callbackUrlForAWS = `https://${domain}/${stage}`;

  const client =  new SocketClient(callbackUrlForAWS);

  console.log(`message from ${connectionId}`, event);
  
  const method = `handle${snakeToPascalCase(body.action)}`;
  console.log('method', method);
  
  if ( typeof messageGateway[method] === 'function') {
    console.log('calling method');
    await messageGateway[method](connectionId, body.payload, client);

    return {
      statusCode: 200,
    };
  } else {
    console.log('action not found');
    return {
      statusCode: 404,
    };
  }

};


export async function disconnect(event, context){
  console.log(`disconnecting ${event.requestContext.connectionId}`);
  var params = {
    TableName : "Games",
    IndexName: 'Connections',
    KeyConditionExpression: "#connectionId = :connectionId",
    ExpressionAttributeNames:{
        "#connectionId": "connectionId"
    },
    ExpressionAttributeValues : {
        ':connectionId' : event.requestContext.connectionId
    }
  };
    
  let connections = await ddb.query(params).promise();  
  if (connections && connections.Items) {
    for (let connection of connections.Items) {
      console.log(`remove ${connection.connectionId} from db...`);  
      const deleteParams = {
        TableName: 'Games',
        Key: {
            'pk': connection.pk,
            'sk': connection.sk
        }
      };

      try {
        await ddb.delete(deleteParams).promise();
      } catch (err) {
        console.log(`failed to remove ${connection.connectionId} from DB`);
      }
    }
  }
  return { statusCode: 200, body: 'Disconnected.' };    
};