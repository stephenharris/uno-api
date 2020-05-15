import {Deck} from './deck'
import{UnoCards} from './uno';
var deck;

describe('Deck', () => {
  
    beforeEach(() => {
      deck = new Deck(["e","e","e","e","e","sk", "t"]);
    });
    
    describe('deal', () => {
      
      it('should return a card, and remove it', async () => {
        expect(deck.deal()).toEqual(["t"]);
        expect(deck.deal()).toEqual(["sk"]);
        expect(deck.getCards()).toEqual(["e","e","e","e","e"]);
      });

      it('should return multiple cards, and remove then', async () => {
        expect(deck.deal(3)).toEqual(["t", "sk", "e"]);
        expect(deck.deal(3)).toEqual(["e", "e", "e"]);
        expect(deck.getCards()).toEqual(["e"]);
      });

    });
    
    
    describe('peer', () => {
      
      it('should return a card, but not remove it', async () => {
        expect(deck.peer()).toEqual(["t"]);
        expect(deck.peer()).toEqual(["t"]);
      });

      it('should return multiple cards, but not remove then', async () => {
        expect(deck.peer(3)).toEqual(["t", "sk", "e"]);
        expect(deck.peer(3)).toEqual(["t", "sk", "e"]);
      });

    });

  });