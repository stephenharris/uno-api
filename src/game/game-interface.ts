

export interface GameInterface {
    getState();
    setId(id);
    id();
    getGame();
    startGame();
    joinGame(playerName, playerId)

    // This shouldn't really be here
    playCard(playerId, card)
}