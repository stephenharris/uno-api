var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.local.json');

var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

var params = {
    AttributeDefinitions: [
        {
          AttributeName: 'pk',
          AttributeType: 'S'
        },
        {
          AttributeName: 'sk',
          AttributeType: 'S'
        },
        {
          AttributeName: 'connectionId',
          AttributeType: 'S'
        }
      ],
      KeySchema: [
        {
          AttributeName: 'pk',
          KeyType: 'HASH'
        },
        {
          AttributeName: 'sk',
          KeyType: 'RANGE'
        }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 5, 
        WriteCapacityUnits: 5
    }, 
    TableName: "Games",
    GlobalSecondaryIndexes: [
      {
        IndexName: 'Connections', /* required */
        KeySchema: [ /* required */
          {
            AttributeName: 'connectionId', /* required */
            KeyType: 'HASH' /* required */
          },
          /* more items */
        ],
        Projection: { /* required */
          ProjectionType: 'KEYS_ONLY'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5, /* required */
          WriteCapacityUnits: 5 /* required */
        }
      },
      /* more items */
    ],
   };

   ddb.createTable(params, function(err, data) {
     if (err) console.log(err, err.stack); // an error occurred
     else     console.log(data);           // successful response
   });