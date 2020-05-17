import {Uno, UnoCards} from './uno';
import { GameState } from './game-state.enum';

describe('Uno', () => {
  
    describe('joining a game', () => {

      it('should allow player to join', async () => {
        let game = new Uno({
          id: "test",
          state: GameState.AWAITING_PLAYERS,
          players: [],
          playersTurn: null,
          cardsInHand: {},
          cardsInDeck: [],
          discardPile: []
        });
        
        game.joinGame('Alice', '60d90150-891b-4395-b67e-e992ad4a095a');
        let newState = game.joinGame('Bob', '4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4');

        expect(newState.players.length).toEqual(2);
        expect(newState.players.map((player) => player.name)).toEqual(['Alice', 'Bob']);
      });


      it('should not allow to join with the same id', async () => {
        let game = new Uno({
          id: "test",
          state: GameState.AWAITING_PLAYERS,
          players: [
            {"id":"60d90150-891b-4395-b67e-e992ad4a095a", "name": "Alice"},
            {"id":"4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "name": "Bob"},
          ],
          playersTurn: null,
          cardsInHand: {},
          cardsInDeck: [],
          discardPile: [],
        });
        
        let newState = game.joinGame('Alice', '60d90150-891b-4395-b67e-e992ad4a095a');

        expect(newState.players.length).toEqual(2);
        expect(newState.players.map((player) => player.name)).toEqual(['Alice', 'Bob']);
      });

    })

    describe('starting a game', () => {

      it('starting the game should deal hands from deck and move to play', async () => {
        let game = new Uno({
          id: "test",
          state: GameState.AWAITING_PLAYERS,
          players: [
            {"id":"60d90150-891b-4395-b67e-e992ad4a095a", "name": "Alice"},
            {"id":"4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "name": "Bob"},
          ],
          playersTurn: null,
          cardsInHand: {},
          cardsInDeck: UnoCards,
          discardPile: [],
        });
        
        let newState = game.startGame();

        //Cards have been dealt
        expect(newState.cardsInHand['60d90150-891b-4395-b67e-e992ad4a095a'].length).toEqual(7);
        expect(newState.cardsInHand['4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4'].length).toEqual(7);

        //One card used to start discard pile
        expect(newState.discardPile.length).toEqual(1);

        expect([0,1,]).toContain(newState.playersTurn);

        //Cards taken from deuck
        expect(newState.cardsInDeck.length).toEqual(UnoCards.length - 15);
      });
    })

    describe('playing a card', () => {

      it('player can play card that matches by number', async () => {
        let game = new Uno({
          state: GameState.PLAY,
          players: [
            {"id":"60d90150-891b-4395-b67e-e992ad4a095a", "name": "Alice"},
            {"id":"4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "name": "Bob"},
          ],
          playersTurn: 1,
          cardsInHand: {
            "60d90150-891b-4395-b67e-e992ad4a095a": ["3r0", "6b1", "7b0", "7b1"],
            "4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4": ["5y0", "0b", "1r0", "2r1"]
          },
          cardsInDeck: ["8g1", "7b0", "9g0", "3y1"],
          discardPile: ["5b0", "5g1", "7g1", "6g1", "6y0"],
        });
        
        let newState = game.playCard("4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "5y0");

        // Card is now first in  discard pile
        expect(newState.discardPile).toEqual(["5y0", "5b0", "5g1", "7g1", "6g1", "6y0"]);

        //Card is not in player's hand5y0
        expect(newState.cardsInHand['4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4']).not.toContain("5y0");

        //Play has moved to next player
        expect(newState.playersTurn).toEqual(0);
        
        //Game state is unchanged
        expect(newState.state).toEqual(GameState.PLAY);
      });

      it('player can play card that matches by colour', async () => {
        let game = new Uno({
          state: GameState.PLAY,
          players: [
            {"id":"60d90150-891b-4395-b67e-e992ad4a095a", "name": "Alice"},
            {"id":"4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "name": "Bob"},
          ],
          playersTurn: 1,
          cardsInHand: {
            "60d90150-891b-4395-b67e-e992ad4a095a": ["3r0", "6b1", "7b0", "7b1"],
            "4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4": ["5y0", "0b", "1r0", "2r1"]
          },
          cardsInDeck: ["8g1", "7b0", "9g0", "3y1"],
          discardPile: ["5b0", "5g1", "7g1", "6g1", "6y0"],
        });
        
        let newState = game.playCard("4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "0b");

        // Card is now first in  discard pile
        expect(newState.discardPile).toEqual(["0b", "5b0", "5g1", "7g1", "6g1", "6y0"]);

        //Card is not in player's hand
        expect(newState.cardsInHand['4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4']).not.toContain("0b");

        //Play has moved to next player
        expect(newState.playersTurn).toEqual(0);
        
        //Game state is unchanged
        expect(newState.state).toEqual(GameState.PLAY);
      });

      it('player cannot player card that does not match', async () => {
        let game = new Uno({
          state: GameState.PLAY,
          players: [
            {"id":"60d90150-891b-4395-b67e-e992ad4a095a", "name": "Alice"},
            {"id":"4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "name": "Bob"},
          ],
          playersTurn: 1,
          cardsInHand: {
            "60d90150-891b-4395-b67e-e992ad4a095a": ["3r0", "6b1", "7b0", "7b1"],
            "4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4": ["5y0", "0b", "1r0", "2r1"]
          },
          cardsInDeck: ["5b1", "7b0", "9g0", "3y1"],
          discardPile: ["5b0", "5g1", "7g1", "6g1", "6y0"],
        });
        
        let newState = game.playCard("4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "1r0");

        // Discard pile is unchanged
        expect(newState.discardPile).toEqual(["5b0", "5g1", "7g1", "6g1", "6y0"]);

        //Card is STILL in player's hand
        expect(newState.cardsInHand['4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4']).toContain("1r0");

        //Play has NOT moved to next player
        expect(newState.playersTurn).toEqual(1);
        
        //Game state is unchanged
        expect(newState.state).toEqual(GameState.PLAY);
      });

      it('player cannot player card that is not in their hand', async () => {
        let game = new Uno({
          state: GameState.PLAY,
          players: [
            {"id":"60d90150-891b-4395-b67e-e992ad4a095a", "name": "Alice"},
            {"id":"4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "name": "Bob"},
          ],
          playersTurn: 1,
          cardsInHand: {
            "60d90150-891b-4395-b67e-e992ad4a095a": ["3r0", "6b1", "7b0", "7b1"],
            "4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4": ["5y0", "0b", "1r0", "2r1"]
          },
          cardsInDeck: ["5b1", "7b0", "9g0", "3y1"],
          discardPile: ["5b0", "5g1", "7g1", "6g1", "6y0"],
        });
        
        let newState = game.playCard("4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "5b1");

        // Discard pile is unchanged
        expect(newState.discardPile).toEqual(["5b0", "5g1", "7g1", "6g1", "6y0"]);

        //Play has NOT moved to next player
        expect(newState.playersTurn).toEqual(1);
        
        //Game state is unchanged
        expect(newState.state).toEqual(GameState.PLAY);
      });

      it('player cannot play card when its not their turn', async () => {
        let game = new Uno({
          state: GameState.PLAY,
          players: [
            {"id":"60d90150-891b-4395-b67e-e992ad4a095a", "name": "Alice"},
            {"id":"4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "name": "Bob"},
          ],
          playersTurn: 1,
          cardsInHand: {
            "60d90150-891b-4395-b67e-e992ad4a095a": ["3r0", "6b1", "7b0", "7b1"],
            "4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4": ["5y0", "0b", "1r0", "2r1"]
          },
          cardsInDeck: ["5b1", "7b0", "9g0", "3y1"],
          discardPile: ["5b0", "5g1", "7g1", "6g1", "6y0"],
        });
        
        let newState = game.playCard("60d90150-891b-4395-b67e-e992ad4a095a", "6b1");

        // Discard pile is unchanged
        expect(newState.discardPile).toEqual(["5b0", "5g1", "7g1", "6g1", "6y0"]);

        //Card is still in their hand
        expect(newState.cardsInHand['60d90150-891b-4395-b67e-e992ad4a095a']).toContain("6b1");

        //Play has NOT moved to next player
        expect(newState.playersTurn).toEqual(1);
        
        //Game state is unchanged
        expect(newState.state).toEqual(GameState.PLAY);
      });


      it('player can play +2 that matches by colour', async () => {
        let game = new Uno({
          state: GameState.PLAY,
          players: [
            {"id":"60d90150-891b-4395-b67e-e992ad4a095a", "name": "Alice"},
            {"id":"4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "name": "Bob"},
            {"id":"baaade3a-ea39-4c94-9ecf-7189d0ca0d56", "name": "Charlie"},
          ],
          playersTurn: 1,
          cardsInHand: {
            "60d90150-891b-4395-b67e-e992ad4a095a": ["3r0", "6b1", "7b0", "7b1"],
            "4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4": ["+b0", "0b", "1r0", "2r1"],
            "baaade3a-ea39-4c94-9ecf-7189d0ca0d56": ["9y0", "0g", "8r1", "5r1"]
          },
          cardsInDeck: ["8g1", "7b0", "9g0", "3y1"],
          discardPile: ["5b0", "5g1", "7g1", "6g1", "6y0"],
        });
        
        let newState = game.playCard("4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "+b0");

        // Card is now first in  discard pile
        expect(newState.discardPile).toEqual(["+b0", "5b0", "5g1", "7g1", "6g1", "6y0"]);

        //Card is not in player's hand5y0
        expect(newState.cardsInHand['4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4']).not.toContain("+b0");

        //Play has skipped the next player
        expect(newState.playersTurn).toEqual(0);

        //Next player has two extra cards
        expect(newState.cardsInHand['baaade3a-ea39-4c94-9ecf-7189d0ca0d56']).toEqual(["9y0", "0g", "8r1", "5r1","3y1",  "9g0"]);

        //Cards removed from decks
        expect(newState.cardsInDeck).toEqual(["8g1", "7b0"]);
        
        //Game state is unchanged
        expect(newState.state).toEqual(GameState.PLAY);
      });

      it('player can play +2 on a +2', async () => {
        let game = new Uno({
          state: GameState.PLAY,
          players: [
            {"id":"60d90150-891b-4395-b67e-e992ad4a095a", "name": "Alice"},
            {"id":"4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "name": "Bob"},
            {"id":"baaade3a-ea39-4c94-9ecf-7189d0ca0d56", "name": "Charlie"},
          ],
          playersTurn: 1,
          cardsInHand: {
            "60d90150-891b-4395-b67e-e992ad4a095a": ["3r0", "6b1", "7b0", "7b1"],
            "4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4": ["+r1", "0b", "1r0", "2r1"],
            "baaade3a-ea39-4c94-9ecf-7189d0ca0d56": ["9y0", "0g", "8r1", "5r1"]
          },
          cardsInDeck: ["8g1", "7b0", "9g0", "3y1"],
          discardPile: ["+b0", "5g1", "7g1", "6g1", "6y0"],
        });
        
        let newState = game.playCard("4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "+r1");

        // Card is now first in  discard pile
        expect(newState.discardPile).toEqual(["+r1", "+b0", "5g1", "7g1", "6g1", "6y0"]);

        //Card is not in player's hand5y0
        expect(newState.cardsInHand['4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4']).not.toContain("+r1");

        //Play has skipped the next player
        expect(newState.playersTurn).toEqual(0);

        //Next player has two extra cards
        expect(newState.cardsInHand['baaade3a-ea39-4c94-9ecf-7189d0ca0d56']).toEqual(["9y0", "0g", "8r1", "5r1", "3y1", "9g0"]);

        //Cards removed from decks
        expect(newState.cardsInDeck).toEqual(["8g1", "7b0"]);
        
        //Game state is unchanged
        expect(newState.state).toEqual(GameState.PLAY);
      });


      it('player can play +2 that matches by colour', async () => {
        let game = new Uno({
          state: GameState.PLAY,
          players: [
            {"id":"60d90150-891b-4395-b67e-e992ad4a095a", "name": "Alice"},
            {"id":"4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "name": "Bob"},
            {"id":"baaade3a-ea39-4c94-9ecf-7189d0ca0d56", "name": "Charlie"},
          ],
          playersTurn: 1,
          cardsInHand: {
            "60d90150-891b-4395-b67e-e992ad4a095a": ["3r0", "6b1", "7b0", "7b1"],
            "4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4": ["+b0", "0b", "1r0", "2r1"],
            "baaade3a-ea39-4c94-9ecf-7189d0ca0d56": ["9y0", "0g", "8r1", "5r1"]
          },
          cardsInDeck: ["8g1", "7b0", "9g0", "3y1"],
          discardPile: ["5b0", "5g1", "7g1", "6g1", "6y0"],
        });
        
        let newState = game.playCard("4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "+b0");

        // Card is now first in  discard pile
        expect(newState.discardPile).toEqual(["+b0", "5b0", "5g1", "7g1", "6g1", "6y0"]);

        //Card is not in player's hand5y0
        expect(newState.cardsInHand['4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4']).not.toContain("+b0");

        //Play has skipped the next player
        expect(newState.playersTurn).toEqual(0);

        //Next player has two extra cards
        expect(newState.cardsInHand['baaade3a-ea39-4c94-9ecf-7189d0ca0d56']).toEqual(["9y0", "0g", "8r1", "5r1","3y1",  "9g0"]);

        //Cards removed from decks
        expect(newState.cardsInDeck).toEqual(["8g1", "7b0"]);
        
        //Game state is unchanged
        expect(newState.state).toEqual(GameState.PLAY);
      });

      //TODO +2 can cause deck to be reset

      it('player can play miss-a-turn that matches by colour', async () => {
        let game = new Uno({
          state: GameState.PLAY,
          players: [
            {"id":"60d90150-891b-4395-b67e-e992ad4a095a", "name": "Alice"},
            {"id":"4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "name": "Bob"},
            {"id":"baaade3a-ea39-4c94-9ecf-7189d0ca0d56", "name": "Charlie"},
          ],
          playersTurn: 1,
          cardsInHand: {
            "60d90150-891b-4395-b67e-e992ad4a095a": ["3r0", "6b1", "7b0", "7b1"],
            "4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4": ["xr1", "0b", "1r0", "2r1"],
            "baaade3a-ea39-4c94-9ecf-7189d0ca0d56": ["9y0", "0g", "8r1", "5r1"]
          },
          cardsInDeck: ["8g1", "7b0", "9g0", "3y1"],
          discardPile: ["3r1", "5g1", "7g1", "6g1", "6y0"],
        });
        
        let newState = game.playCard("4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "xr1");

        // Card is now first in  discard pile
        expect(newState.discardPile).toEqual(["xr1", "3r1", "5g1", "7g1", "6g1", "6y0"]);

        //Card is not in player's hand5y0
        expect(newState.cardsInHand['4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4']).not.toContain("xr1");

        //Play has skipped the next player
        expect(newState.playersTurn).toEqual(0);

        //Next player has the same cards
        expect(newState.cardsInHand['baaade3a-ea39-4c94-9ecf-7189d0ca0d56']).toEqual(["9y0", "0g", "8r1", "5r1"]);

        //Cards in deck unchanged
        expect(newState.cardsInDeck).toEqual(["8g1", "7b0", "9g0", "3y1"]);
        
        //Game state is unchanged
        expect(newState.state).toEqual(GameState.PLAY);
      });


      it('player can play miss-a-turn on a miss-a-turn', async () => {
        let game = new Uno({
          state: GameState.PLAY,
          players: [
            {"id":"60d90150-891b-4395-b67e-e992ad4a095a", "name": "Alice"},
            {"id":"4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "name": "Bob"},
            {"id":"baaade3a-ea39-4c94-9ecf-7189d0ca0d56", "name": "Charlie"},
          ],
          playersTurn: 1,
          cardsInHand: {
            "60d90150-891b-4395-b67e-e992ad4a095a": ["3r0", "6b1", "7b0", "7b1"],
            "4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4": ["xr1", "0b", "1r0", "2r1"],
            "baaade3a-ea39-4c94-9ecf-7189d0ca0d56": ["9y0", "0g", "8r1", "5r1"]
          },
          cardsInDeck: ["8g1", "7b0", "9g0", "3y1"],
          discardPile: ["xg0", "5g1", "7g1", "6g1", "6y0"],
        });
        
        let newState = game.playCard("4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "xr1");

        // Card is now first in  discard pile
        expect(newState.discardPile).toEqual(["xr1", "xg0", "5g1", "7g1", "6g1", "6y0"]);

        //Card is not in player's hand5y0
        expect(newState.cardsInHand['4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4']).not.toContain("xr1");

        //Play has skipped the next player
        expect(newState.playersTurn).toEqual(0);

        //Next player has the same cards
        expect(newState.cardsInHand['baaade3a-ea39-4c94-9ecf-7189d0ca0d56']).toEqual(["9y0", "0g", "8r1", "5r1"]);

        //Cards in deck unchanged
        expect(newState.cardsInDeck).toEqual(["8g1", "7b0", "9g0", "3y1"]);
        
        //Game state is unchanged
        expect(newState.state).toEqual(GameState.PLAY);
      });

      it('player can play change direction card that matches by colour', async () => {
        let game = new Uno({
          state: GameState.PLAY,
          players: [
            {"id":"60d90150-891b-4395-b67e-e992ad4a095a", "name": "Alice"},
            {"id":"4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "name": "Bob"},
            {"id":"baaade3a-ea39-4c94-9ecf-7189d0ca0d56", "name": "Charlie"},
            {"id":"e46e0917-e0bf-4798-8508-1c21058a1edc", "name": "Dan"},
          ],
          playersTurn: 2,
          cardsInHand: {
            "60d90150-891b-4395-b67e-e992ad4a095a": ["3r0", "6b1", "7b0", "7b1"],
            "4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4": ["0b", "1r0", "2r1"],
            "baaade3a-ea39-4c94-9ecf-7189d0ca0d56": ["cb0", "0g", "8r1", "5r1"],
            "e46e0917-e0bf-4798-8508-1c21058a1edc": ["+g0", "7g1", "2r0", "6y1"],
          },
          cardsInDeck: ["8g1", "7b0", "9g0", "3y1"],
          discardPile: ["5b0", "5g1", "7g1", "6g1", "6y0"],
          direction: 1
        });
        
        let newState = game.playCard("baaade3a-ea39-4c94-9ecf-7189d0ca0d56", "cb0");

        // Card is now first in  discard pile
        expect(newState.discardPile).toEqual(["cb0", "5b0", "5g1", "7g1", "6g1", "6y0"]);

        //Card is not in player's hand
        expect(newState.cardsInHand['baaade3a-ea39-4c94-9ecf-7189d0ca0d56']).not.toContain("cb0");

        //Play has moved to next player, but direction has changed
        expect(newState.playersTurn).toEqual(1);
        expect(newState.direction).toEqual(-1);
        
        //Game state is unchanged
        expect(newState.state).toEqual(GameState.PLAY);
      });

      it('player can play change direction card on a play change direction card', async () => {
        let game = new Uno({
          state: GameState.PLAY,
          players: [
            {"id":"60d90150-891b-4395-b67e-e992ad4a095a", "name": "Alice"},
            {"id":"4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "name": "Bob"},
            {"id":"baaade3a-ea39-4c94-9ecf-7189d0ca0d56", "name": "Charlie"},
            {"id":"e46e0917-e0bf-4798-8508-1c21058a1edc", "name": "Dan"},
          ],
          playersTurn: 2,
          cardsInHand: {
            "60d90150-891b-4395-b67e-e992ad4a095a": ["3r0", "6b1", "7b0", "7b1"],
            "4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4": ["0b", "1r0", "2r1"],
            "baaade3a-ea39-4c94-9ecf-7189d0ca0d56": ["cb0", "0g", "8r1", "5r1"],
            "e46e0917-e0bf-4798-8508-1c21058a1edc": ["+g0", "7g1", "2r0", "6y1"],
          },
          cardsInDeck: ["8g1", "7b0", "9g0", "3y1"],
          discardPile: ["cg0", "5g1", "7g1", "6g1", "6y0"],
          direction: -1
        });
        
        let newState = game.playCard("baaade3a-ea39-4c94-9ecf-7189d0ca0d56", "cb0");

        // Card is now first in  discard pile
        expect(newState.discardPile).toEqual(["cb0", "cg0", "5g1", "7g1", "6g1", "6y0"]);

        //Card is not in player's hand
        expect(newState.cardsInHand['baaade3a-ea39-4c94-9ecf-7189d0ca0d56']).not.toContain("cb0");

        //Play has moved to next player, but direction has changed
        expect(newState.playersTurn).toEqual(3);
        expect(newState.direction).toEqual(1);
        
        //Game state is unchanged
        expect(newState.state).toEqual(GameState.PLAY);
      });


      it('player can play a change-colour card', async () => {
        let game = new Uno({
          state: GameState.PLAY,
          players: [
            {"id":"60d90150-891b-4395-b67e-e992ad4a095a", "name": "Alice"},
            {"id":"4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "name": "Bob"},
            {"id":"baaade3a-ea39-4c94-9ecf-7189d0ca0d56", "name": "Charlie"},
          ],
          playersTurn: 1,
          cardsInHand: {
            "60d90150-891b-4395-b67e-e992ad4a095a": ["3r0", "6b1", "7b0", "7b1"],
            "4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4": ["??0", "0b", "1r0", "2r1"],
            "baaade3a-ea39-4c94-9ecf-7189d0ca0d56": ["9y0", "0g", "8r1", "5r1"]
          },
          cardsInDeck: ["8g1", "7b0", "9g0", "3y1"],
          discardPile: ["+b0", "5g1", "7g1", "6g1", "6y0"],
        });
        
        // play change colour card to green
        let newState = game.playCard("4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "?g0");

        // Card is now first in  discard pile
        expect(newState.discardPile).toEqual(["?g0", "+b0", "5g1", "7g1", "6g1", "6y0"]);

        //Card is not in player's hand
        expect(newState.cardsInHand['4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4']).not.toContain("??0");

        //Play has moved to next player
        expect(newState.playersTurn).toEqual(2);

        //Game state is unchanged
        expect(newState.state).toEqual(GameState.PLAY);

        //colour is now green, so you can't play a red card
        newState = game.playCard("baaade3a-ea39-4c94-9ecf-7189d0ca0d56", "5r1");
        //play has not moved on
        expect(newState.playersTurn).toEqual(2);


        //but you can play a green card
        newState = game.playCard("baaade3a-ea39-4c94-9ecf-7189d0ca0d56", "0g");
        //play has moved on agin
        expect(newState.playersTurn).toEqual(0);

      });

      it('player can play a +4 card', async () => {
        let game = new Uno({
          state: GameState.PLAY,
          players: [
            {"id":"60d90150-891b-4395-b67e-e992ad4a095a", "name": "Alice"},
            {"id":"4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "name": "Bob"},
            {"id":"baaade3a-ea39-4c94-9ecf-7189d0ca0d56", "name": "Charlie"},
          ],
          playersTurn: 1,
          cardsInHand: {
            "60d90150-891b-4395-b67e-e992ad4a095a": ["3r0", "6b1", "7b0", "7b1"],
            "4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4": ["*?3", "0b", "1r0", "2r1"],
            "baaade3a-ea39-4c94-9ecf-7189d0ca0d56": ["9y0", "0g", "8r1", "5r1"]
          },
          cardsInDeck: ["3b0", "8g1", "7b0", "9g0", "3y1"],
          discardPile: ["5g1", "7g1", "6g1", "6y0"],
        });
        
        // play +4 card and change colour red
        let newState = game.playCard("4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "*r3");

        // Card is now first in  discard pile
        expect(newState.discardPile).toEqual(["*r3","5g1", "7g1", "6g1", "6y0"]);

        //Card is not in player's hand
        expect(newState.cardsInHand['4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4']).not.toContain("*?3");

        //Next player has four extra cards
        expect(newState.cardsInHand['baaade3a-ea39-4c94-9ecf-7189d0ca0d56']).toEqual(["9y0", "0g", "8r1", "5r1","3y1", "9g0", "7b0", "8g1"]);

        //Play has skipped the next player
        expect(newState.playersTurn).toEqual(0);

        //Game state is unchanged
        expect(newState.state).toEqual(GameState.PLAY);

        //colour is now red, so you can't play a blue card
        newState = game.playCard("60d90150-891b-4395-b67e-e992ad4a095a", "6b1");
        //play has not moved on
        expect(newState.playersTurn).toEqual(0);


        //but you can play a red card
        newState = game.playCard("60d90150-891b-4395-b67e-e992ad4a095a", "3r0");
        //play has moved on again
        expect(newState.playersTurn).toEqual(1);

      });


      it('+4 card causes deck reset if there are insufficent cards', async () => {
        let game = new Uno({
          state: GameState.PLAY,
          players: [
            {"id":"60d90150-891b-4395-b67e-e992ad4a095a", "name": "Alice"},
            {"id":"4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "name": "Bob"},
            {"id":"baaade3a-ea39-4c94-9ecf-7189d0ca0d56", "name": "Charlie"},
          ],
          playersTurn: 1,
          cardsInHand: {
            "60d90150-891b-4395-b67e-e992ad4a095a": ["3r0", "6b1", "7b0", "7b1"],
            "4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4": ["*?3", "0b", "1r0", "2r1"],
            "baaade3a-ea39-4c94-9ecf-7189d0ca0d56": ["9y0", "0g", "8r1", "5r1"]
          },
          cardsInDeck: ["8g1", "7b0"],
          discardPile: ["5g1", "7g1", "6g1", "6y0", "9g0", "3y1"],
        });
        
        // play +4 card and change colour red
        let newState = game.playCard("4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "*r3");

        expect(newState.cardsInHand['baaade3a-ea39-4c94-9ecf-7189d0ca0d56']).toContain("8g1");
        expect(newState.cardsInHand['baaade3a-ea39-4c94-9ecf-7189d0ca0d56']).toContain("7b0");

        // Discard pile now only has one card
        expect(newState.discardPile).toEqual(["*r3"]);

        expect(newState.cardsInDeck.length).toEqual(4);
      });

      //TODO assert +4 can't be played if another card can

    });


    describe('drawing a card', () => {

      it('player can pick up a card', async () => {
        let game = new Uno({
          state: GameState.PLAY,
          players: [
            {"id":"60d90150-891b-4395-b67e-e992ad4a095a", "name": "Alice"},
            {"id":"4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "name": "Bob"},
          ],
          playersTurn: 1,
          cardsInHand: {
            "60d90150-891b-4395-b67e-e992ad4a095a": ["3r0", "6b1", "7b0", "7b1"],
            "4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4": ["5y0", "0b", "1r0", "2r1"]
          },
          cardsInDeck: ["8g1", "7b0", "9g0", "3y1"],
          discardPile: ["5b0", "5g1", "7g1", "6g1", "6y0"],
        });
        
        let newState = game.pickUp("4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4");

        // Card removed from deck
        expect(newState.cardsInDeck).toEqual( ["8g1", "7b0", "9g0"]);

        //Card is in player's hand5y0
        expect(newState.cardsInHand['4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4']).toContain("3y1");

        //Play has moved to next player
        expect(newState.playersTurn).toEqual(0);
        
        //Game state is unchanged
        expect(newState.state).toEqual(GameState.PLAY);
      });

      it('player cannot pick up if is not their turn', async () => {
        let game = new Uno({
          state: GameState.PLAY,
          players: [
            {"id":"60d90150-891b-4395-b67e-e992ad4a095a", "name": "Alice"},
            {"id":"4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "name": "Bob"},
          ],
          playersTurn: 1,
          cardsInHand: {
            "60d90150-891b-4395-b67e-e992ad4a095a": ["3r0", "6b1", "7b0", "7b1"],
            "4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4": ["5y0", "0b", "1r0", "2r1"]
          },
          cardsInDeck: ["8g1", "7b0", "9g0", "3y1"],
          discardPile: ["5b0", "5g1", "7g1", "6g1", "6y0"],
        });
        
        let newState = game.pickUp("60d90150-891b-4395-b67e-e992ad4a095a");

        // Card removed from deck
        expect(newState.cardsInDeck).toEqual( ["8g1", "7b0", "9g0", "3y1"]);

        //Card is NOT in player's hand5y0
        expect(newState.cardsInHand['4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4']).not.toContain("3y1");

        //Play has NOT moved to next player
        expect(newState.playersTurn).toEqual(1);
        
        //Game state is unchanged
        expect(newState.state).toEqual(GameState.PLAY);
      });

      it('reset deck from discard pile if deck runs out', async () => {
        let game = new Uno({
          state: GameState.PLAY,
          players: [
            {"id":"60d90150-891b-4395-b67e-e992ad4a095a", "name": "Alice"},
            {"id":"4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "name": "Bob"},
          ],
          playersTurn: 1,
          cardsInHand: {
            "60d90150-891b-4395-b67e-e992ad4a095a": ["3r0", "6b1", "7b0", "7b1"],
            "4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4": ["5y0", "0b", "1r0", "2r1"]
          },
          cardsInDeck: ["4y1"],
          discardPile: ["5b0", "5g1", "7g1", "6g1"],
        });
        
        let newState = game.pickUp("4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4");

        // Deck is replenished from discard pile (all but first) 
        expect(newState.cardsInDeck).toContain("5g1");
        expect(newState.cardsInDeck).toContain("7g1");
        expect(newState.cardsInDeck).toContain("6g1");

        //Discard pile still contains top card
        expect(newState.discardPile).toEqual(["5b0"]);

        //Card is in player's hand
        expect(newState.cardsInHand['4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4']).toContain("4y1");
      });
    });


    describe('winning the game', () => {

      it('player wins by emptying their hand', async () => {
        let game = new Uno({
          state: GameState.PLAY,
          players: [
            {"id":"60d90150-891b-4395-b67e-e992ad4a095a", "name": "Alice"},
            {"id":"4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "name": "Bob"},
          ],
          playersTurn: 1,
          cardsInHand: {
            "60d90150-891b-4395-b67e-e992ad4a095a": ["3r0", "6b1", "7b0", "7b1"],
            "4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4": ["5y0"]
          },
          cardsInDeck: ["8g1", "7b0", "9g0", "3y1"],
          discardPile: ["5b0", "5g1", "7g1", "6g1", "6y0"],
        });
        
        let newState = game.playCard("4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "5y0");
        
        //Game state is unchanged
        expect(newState.state).toEqual(GameState.GAME_OVER);
        expect(newState.winner).toEqual("4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4");
      });

    });



    describe('get player state', () => {

      let game;
      beforeEach(() => {
        game = new Uno({
          state: GameState.PLAY,
          players: [
            {"id":"60d90150-891b-4395-b67e-e992ad4a095a", "name": "Alice"},
            {"id":"4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "name": "Bob"},
            {"id":"baaade3a-ea39-4c94-9ecf-7189d0ca0d56", "name": "Charlie"},
          ],
          playersTurn: 1,
          cardsInHand: {
            "60d90150-891b-4395-b67e-e992ad4a095a": ["6b1", "7b0", "7b1"],
            "4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4": ["*?3", "0b", "1r0", "2r1"],
            "baaade3a-ea39-4c94-9ecf-7189d0ca0d56": ["9y0"]
          },
          cardsInDeck: ["8g1", "7b0"],
          discardPile: ["5g1", "7g1", "6g1", "6y0", "9g0", "3y1"],
        });
      });
      
      it('returns the player\'s ID', async () => {
        let playerState = game.getPlayerState("4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4");
        expect(playerState.thisPlayer).toEqual("4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4");
      });

      it('returns the player\'s hand', async () => {
        let playerState = game.getPlayerState("4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4");
        expect(playerState.cardsInPlayersHand).toEqual(["*?3", "0b", "1r0", "2r1"]);
      });

      it('returns the number of cards in other players hands', async () => {
        let playerState = game.getPlayerState("4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4");
        expect(playerState.cardsInHand).toEqual({
          "60d90150-891b-4395-b67e-e992ad4a095a": 3,
          "4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4": 4,
          "baaade3a-ea39-4c94-9ecf-7189d0ca0d56": 1,
        });
      });

      it('it does not return the deck', async () => {
        let playerState = game.getPlayerState("4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4");
        console.log(playerState);
        expect(playerState).not.toHaveProperty("cardsInDeck")
      });
      //


      it('it does not error if in default state', async () => {
        let game = new Uno({
          state: GameState.AWAITING_PLAYERS,
          players: [
            {"id":"60d90150-891b-4395-b67e-e992ad4a095a", "name": "Alice"},
            {"id":"4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4", "name": "Bob"},
            {"id":"baaade3a-ea39-4c94-9ecf-7189d0ca0d56", "name": "Charlie"},
          ],
          playersTurn: null,
          playerCounter:0,
          cardsInHand: {},
          cardsInDeck: [],
          discardPile: [],
          winner: '?',
          direction: 1
        });
        let playerState = game.getPlayerState("4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4");

        expect(playerState.cardsInHand).toEqual({
          "60d90150-891b-4395-b67e-e992ad4a095a": 0,
          "4d0a6b5b-dbe1-4a81-b3da-d3096f2b11c4": 0,
          "baaade3a-ea39-4c94-9ecf-7189d0ca0d56": 0,
        });
      });

    });


  });