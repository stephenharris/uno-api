import { GameService } from "./game/game.service";
import { SocketClient } from "./lib/socket-client";
import { Uno } from "./game/uno";

export class MessageGateway {
  
    constructor(private gameService: GameService) {
    }

    private emitState(client, game: Uno) {
      console.log('emit state', game.id())
     return this.gameService.getPlayers(game.id())
      .then(async (players) => {
        return players.map(async (player) => {
          console.log(`send state to ${player.playerId} / ${player.connectionId}`);
        
          let payload = game.getPlayerState(player.playerId);
          await client.emit(player.connectionId, payload).catch(() => {console.log('Failed to send to player.connectionId')});
        });
      })
    }
    
    async handlePing(clientId: string, payload: any, client: SocketClient) {
      console.log('handlePing');
      await client.emit(clientId, {"recievedFrom": clientId, "payload": payload}).catch(() => {console.log('Failed to send to player.connectionId')});
    }
    
    async handleJoinGame(clientId: string, payload: any, client: SocketClient) {
  
      console.log(`Client ${clientId} / ${payload.name} ${payload.id} joining game ${payload.gameId}`);
      await this.gameService.addConnnection(payload.gameId, clientId, payload.id);
      

      return this.gameService
        .getGame(payload.gameId)
        .then(async (game) => {
          let newState = game.joinGame(payload.name, payload.id)
    
          await this.gameService.storeGame(game);
          
          await this.emitState(client, (game as Uno));
        });
    }
  
    handleStartGame(clientId: string, payload: any, client: SocketClient) {
      console.log(`Client ${clientId} started the game`);
 
      return this.gameService
        .getGame(payload.gameId)
        .then(async (game) => {
          let newState = game.startGame();
          await this.gameService.storeGame(game);
  
          await this.emitState(client, (game as Uno));
        });
    }
  
    handlePlayCard(clientId: string, payload: any, client: SocketClient) {
      
      console.log(`Client ${clientId} played card ${payload.card} in game ${payload.gameId}`);
  
      return this.gameService
        .getGame(payload.gameId)
        .then(async (game) => {
  
          let newState = game.playCard(payload.playerId, payload.card);
          await this.gameService.storeGame(game);
  
          await this.emitState(client, (game as Uno));
        });
    }
  
    handlePickupCard(clientId: string, payload: any, client: SocketClient) {
      
      console.log(`Client ${payload.playerId}/${clientId} picked up card in game ${payload.gameId}`);
  
      return this.gameService
        .getGame(payload.gameId)
        .then(async (game) => {
  
          let newState = (game as Uno).pickUp(payload.playerId);
          this.gameService.storeGame(game);
  
          this.emitState(client, (game as Uno));
        });
    }  
}