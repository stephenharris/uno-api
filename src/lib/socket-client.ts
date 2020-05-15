var AWS = require('aws-sdk');

export class SocketClient {
    
    private apigatewaymanagementapi;

    constructor(private url, private apiverion = '2018-11-29') {
        this.apigatewaymanagementapi = new AWS.ApiGatewayManagementApi({
            //apiVersion: '2018-11-29',
            //endpoint: url,
            apiVersion: '2029',
            endpoint: 'http://localhost:3001',
        });
    }

    public emit(connectionId, payload) {
        new Promise((resolve, reject) => {
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
