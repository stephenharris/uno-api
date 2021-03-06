import { Uno } from './uno';
import { GameInterface } from './game-interface';

export class GameService {
    
    constructor(private ddb) {
    }

    public async addConnnection(gameId, connectionId, playerId) {
        var params = {
            TableName: 'Games',
            Item: {
              "pk": gameId + "|connections",
              "sk": connectionId,
              'connectionId' : connectionId,
              'playerId' : playerId
            }
        };

        console.log(params);
          
        this.ddb.put(params, function(err, data) {
            if (err) {
              console.log("Error", err);
              throw Error(err);
            } else {
              console.log("Success", data);
            }
        });   
    }

    public async removeConnnection(gameId, connectionId) {
        var params = {
            TableName: 'Games',
            Key: {
                'pk': gameId + "|connections",
                'sk': connectionId
            }
        };

        console.log(params);
          
        this.ddb.delete(params, function(err, data) {
            if (err) {
              console.log("Error", err);
              throw Error(err);
            } else {
              console.log("Success", data);
            }
        });   
    }

    public getPlayers(gameId: string): Promise<Array<any>> {
        //gameId = 'foobar';
        console.log(`Get game with ID ${gameId}`);
        var params = {
            TableName : "Games",
            KeyConditionExpression: "#pk = :gameId",
            ExpressionAttributeNames:{
                "#pk": "pk"
            },
            ExpressionAttributeValues : {
                ':gameId' : gameId + "|connections"
            }
        };
        
        return this.ddb.query(params).promise()
            .then((response) => {
                console.log('found', response);
                return response.Items;
            })
            .catch((error) => console.log('error', error));
    }

    public getPlayer(gameId: string, connectionId: string): Promise<Array<any>> {
        //gameId = 'foobar';
        console.log(`Get player in game ${gameId} with connection ${connectionId}`);
        var params = {
            TableName : "Games",
            Key: {
                'pk': gameId + '|connections',
                'sk': connectionId
            }
        };
        
        return this.ddb.get(params).promise()
            .then((response) => {
                console.log('found', response);
                console.log('found', response.Item);
                return response.Item.playerId;
            })
            .catch((error) => console.log('error', error));

    }


    public async createGame(type: string) {

        let gameId = await this.generateGameId();
        let game;

        game = new Uno();
        game.setId(gameId);

        await this.storeGame(game);
        return game;
    }

    public storeGame(game: GameInterface) {
        console.log(`Store game with ID ${game.id()}`);
        var params = {
            TableName: 'Games',
            Item: {
              "pk": game.id(),
              "sk": "GameState",
              'state' : game.getState()
            }
        };

        console.log(params);
          
        return this.ddb.put(params).promise().catch(
            (error) => {
                console.log("Error storing game", error);
                throw Error(error);
            }
        );
    }

    public getGame(gameId: string): Promise<GameInterface> {
        //gameId = 'foobar';
        console.log(`Get game with ID ${gameId}`);
        var params = {
            TableName : "Games",
            Key: {
                'pk': gameId,
                'sk': 'GameState'
            },
            ExpressionAttributeValues : {
                ':gameId' : gameId,
            },
            ConsistentRead: true
        };
        
        return this.ddb.get(params).promise()
            .then((response) => {
                console.log('found', response);
                console.log('found', response.Item);
                
                //let type = response.Item.state.game;
                let game = new Uno(response.Item.state);

                return game;
            })
            .catch((error) => console.log('error', error));
    }

    private gameExists(gameId) {
        console.log(`Checking if game with ID ${gameId} exists`);
        var params = {
            TableName : "Games",
            Key: {
                'pk': gameId,
                'sk': 'GameState'
            },
            ConsistentRead: true
        };
        
        return this.ddb.get(params).promise()
            .then((response) => {
                return !!response.Item;
            })
            .catch((error) => console.log('error', error));
    }

    private async generateGameId() {

        let keyExists = true;
        let gameId;
        let alphabet = ['A','B','C','D','E','F','G','H','J','K','L','M','N','P','R','S','T','U','V','W','X','Y','Z', '2', '3', '4','5', '6','7','8','9'];

        while(keyExists) {
            gameId = '';
            for(let i =0; i < 6; i++) {
                gameId = gameId + alphabet[Math.floor(Math.random() * alphabet.length)];
            }
            keyExists = await this.gameExists(gameId);
        }
        return gameId ;
    }

}