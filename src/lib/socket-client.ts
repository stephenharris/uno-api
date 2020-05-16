var AWS = require('aws-sdk');

export class SocketClient {
    
    private apigatewaymanagementapi;

    constructor(private url, private apiverion = '2018-11-29') {
        this.apigatewaymanagementapi = new AWS.ApiGatewayManagementApi({
            apiVersion: apiverion,
            endpoint: url,
            //apiVersion: '2029',
            //endpoint: 'http://localhost:3001',
        });
        console.log(url, apiverion);
    }

    public emit(connectionId, payload) {
        console.log('emit', connectionId, payload);
        return new Promise((resolve, reject) => {
            this.apigatewaymanagementapi.postToConnection(
              {
                ConnectionId: connectionId, // connectionId of the receiving ws-client
                Data: JSON.stringify(payload),
              },
              (err, data) => {
                if (err) {
                  console.log('err is', err);
                  reject(err);
                }
                resolve(data);
              }
            );
        });
    }
}
