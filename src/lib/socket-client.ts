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

    public async emit(connectionId, payload) {
      console.log('emit', connectionId, payload);

      await this.apigatewaymanagementapi.postToConnection({
        connectionId,
        Data: JSON.stringify(payload)
      }).promise().catch(async err => {
        console.log('send error');
        console.log(JSON.stringify(err))
      });

      return true;
    }
}
