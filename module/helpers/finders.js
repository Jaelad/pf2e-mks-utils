export default class Finders {
	static getTokenById(tokenId) {
		return canvas.tokens.placeables.find(t => t.id === tokenId)
	}

	static getActorById(actorId) {
		return game.actors.get(actorId)
	}
}