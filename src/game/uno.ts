import { GameState } from './game-state.enum'
import {getRandomInt} from '../lib/random-integer'
import {mod} from '../lib/mod';
import {Deck} from './deck';
import { GameInterface } from './game-interface';

export class Uno implements GameInterface {
    
    private state = initialState;

    public constructor(state = null) {
      if(state) {
        this.state = state;
      }
      this.state = Object.assign({}, initialState, state);
      this.state.game = 'uno';
      
    }

    public setId(id) {
        this.state.id = id;
        return this;
    }

    public id() {
      return this.state.id;
    }

    public getState() {
        return this.state;
    }

    public getPlayerState(playerId) {
        return {
              ...this.state,
              thisPlayer: playerId,
              cardsInPlayersHand: this.state.cardsInHand[playerId],
        }
    }

    public getGame() {
        return this.state.game;
    }

    public startGame() {
    
        let deck = new Deck(UnoCards);
        deck.shuffle();

        console.log("this.state.players");
        console.log(this.state.players);

        let playersHands = this.state.players.reduce((hands, player) => {
            hands[player.id] = deck.deal(7)
            return hands;
        }, {})

        let discardPile = deck.deal();
        
        this.state = {
          ...this.state, 
          state: GameState.PLAY, 
          playersTurn: getRandomInt(0, this.state.players.length),
          cardsInDeck: deck.getCards(),
          cardsInHand: playersHands,
          discardPile: discardPile,
          winner: "?",
        }

        return this.state;
    }

    public joinGame(playerName: string, playerId) {
        const player = {
            name: playerName,
            id:  playerId
        }

        if (this.state.players.some((player) => player.id == playerId)) {
          return this.state;
        }

        if(this.state.state !== GameState.AWAITING_PLAYERS) {
          throw Error('Cannot join game that is already in progress')
        }

        let players = this.state.players;
        players.push(player);
        this.state = {...this.state, players: players};

        return this.state;
    }

    public playCard(playerId, card) {

        const [playedNumber, playedColour] = card.split('');
        const [topNumber, topColour] = this.state.discardPile[0].split('');

        if (playedNumber !== '*' && playedNumber !== '?' && playedNumber !== topNumber && playedColour !== topColour) {
            return this.state;
        }

        // Must be player's turn
        if(this.state.players[this.state.playersTurn].id !== playerId) {
            return this.state;
        }

        let found = this.state.cardsInHand[playerId].find((cardInHand) => card.replace(/([\?\*])([rbyg])(\d)/i, '$1?$3') == cardInHand);
        if(!found) {
            return this.state;
        }

        let hand = this.state.cardsInHand[playerId].filter((cardInHand) => found != cardInHand);

        let cardsInHand = {
            ...this.state.cardsInHand,
            [playerId]: hand
        };

        let discardPile = [...this.state.discardPile];
        discardPile.unshift(card);
        this.state.discardPile = discardPile;

        //change direction
        if(card[0] === "c") {
            this.state.direction = -1 * this.state.direction;
        }

        let deck = new Deck(this.state.cardsInDeck);
        let nextPlayer = mod((this.state.playersTurn + this.state.direction), this.state.players.length);
        
        //+2 cards
        if(card[0] === "+") {
            let resp = this.dealAndReshuffle(2);
            cardsInHand[this.state.players[nextPlayer].id] = cardsInHand[this.state.players[nextPlayer].id].concat(resp.dealt);
            deck = resp.deck;

            // Skip next player
            nextPlayer = (nextPlayer + this.state.direction) % this.state.players.length;
        }

        //+4 cards
        if(card[0] === "*") {
            let resp = this.dealAndReshuffle(4);
            cardsInHand[this.state.players[nextPlayer].id] = cardsInHand[this.state.players[nextPlayer].id].concat(resp.dealt);
            deck = resp.deck;
            
            // Skip next player
            nextPlayer = (nextPlayer + this.state.direction) % this.state.players.length;
        }

        //miss a turn
        if(card[0] === "x") { 
            // Skip next player
            nextPlayer = (nextPlayer + this.state.direction) % this.state.players.length;
        }

        this.state = {
            ...this.state, 
            state: hand.length === 0 ? GameState.GAME_OVER : this.state.state,
            winner: hand.length === 0 ? playerId : '?',
            playersTurn: nextPlayer,
            cardsInHand: cardsInHand,
            discardPile: discardPile,
            cardsInDeck: deck.getCards(),
        }
        return this.state;
    }

    public pickUp(playerId) {
        
        if(this.state.players[this.state.playersTurn].id !== playerId) {
            return this.state;
        }

        let resp = this.dealAndReshuffle(1);
        this.state.cardsInHand[playerId] = this.state.cardsInHand[playerId].concat(resp.dealt);

        this.state = {
            ...this.state, 
            playersTurn: mod((this.state.playersTurn + this.state.direction), this.state.players.length),
            cardsInDeck: resp.deck.getCards()
        }        

        return this.state;
    }

    private dealAndReshuffle(n) {

        let deck = new Deck(this.state.cardsInDeck);

        let remainingInDeck = Math.min(n, deck.countRemaining());
        let cards = deck.deal(remainingInDeck);

        if(deck.countRemaining() === 0) {
            let newDeckCards = [];
            while(this.state.discardPile.length > 1) {
                newDeckCards.push(this.state.discardPile.pop());
            }

            deck = new Deck(newDeckCards);
            if(n > cards.length) {
                cards = cards.concat(deck.deal(n - cards.length));
            }
        }        

        return {'deck': deck, 'dealt': cards};
    }
}

const initialState = {
    id: null,
    game: "uno",
    state: GameState.AWAITING_PLAYERS,
    players: [],
    playersTurn: null,
    cardsInHand: {
    },
    cardsInDeck: [],
    discardPile: [],
    winner: '?',
    direction: 1
};

export const UnoCards = [
    "0r", "1r0", "1r1", "2r0", "2r1", "3r0", "3r1", "4r0", "4r1", "5r0", "5r1", "6r0", "6r1", "7r0", "7r1", "8r0", "8r1", "9r0", "9r1", "+r0", "+r1", "cr0", "cr1", "xr0", "xr1",
    "0g", "1g0", "1g1", "2g0", "2g1", "3g0", "3g1", "4g0", "4g1", "5g0", "5g1", "6g0", "6g1", "7g0", "7g1", "8g0", "8g1", "9g0", "9g1", "+g0", "+g1", "cg0", "cg1", "xg0", "xg1", 
    "0b", "1b0", "1b1", "2b0", "2b1", "3b0", "3b1", "4b0", "4b1", "5b0", "5b1", "6b0", "6b1", "7b0", "7b1", "8b0", "8b1", "9b0", "9b1", "+b0", "+b1", "cb0", "cb1", "xb0", "xb1", 
    "0y", "1y0", "1y1", "2y0", "2y1", "3y0", "3y1", "4y0", "4y1", "5y0", "5y1", "6y0", "6y1", "7y0", "7y1", "8y0", "8y1", "9y0", "9y1", "+y0", "+y1", "cy0", "cy1", "xy0", "xy1",
    "??0", "??1", "??2", "??3", "*?0", "*?1", "*?2", "*?3"
]