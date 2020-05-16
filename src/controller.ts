import { GameService } from "./game/game.service";
import { SocketClient } from "./lib/socket-client";
import { Uno } from "./game/uno";
import { GameInterface } from "./game/game-interface";

export class Controller {

    public collectionPath = '/game/?';
    public itemPath = '/game/(?<id>[0-9a-zA-Z-]+)/?';
  
    constructor(private gameService: GameService) {
    }

    public handleGetItem(pathparams) {
            
        try {
            return this.gameService.getGame(pathparams.id).then((game) => {
                return {
                    statusCode: 200,
                    body: JSON.stringify(game.getState())
                };
            });
        } catch (error) {
            console.log("error", error);
            throw error;   
        }
    }

    public async handlePost() {
        try {
            let game = await this.gameService.createGame("uno");
            return {
                statusCode: 200,
                body: JSON.stringify(game.getState())
            };
        } catch (error) {
            console.log("error", error);
            throw error;   
        }
    }
}