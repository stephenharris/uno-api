export class Deck {

    private _deck;

    public constructor(cards) {
        this._deck = [...cards];
    }

    public shuffle(){
        for(let i  = this._deck.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i+1));
            let tmp = this._deck[i];
            this._deck[i] = this._deck[j];
            this._deck[j] = tmp;
        }
    }

    public deal(n: number = 1) {
        let cards = [];
        for (let i=0; i < n; i++) {
            cards.push(this._deck.pop());
        }
        return cards;
    }

    public peer(n: number = 1) {
        let cards = [];
        for (let i=0; i < Math.min(n, this._deck.length); i++) {
            cards.push(this._deck[this._deck.length - (i+1)]);
        }
        return cards;
    }

    public getCards() {
        return this._deck;
    }

    public countRemaining() {
        return this._deck.length;
    }

}