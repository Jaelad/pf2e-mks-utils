export default class CommonUtils {
	static chat(tokenOrActor, message) {
		const token = tokenOrActor?.actor ? tokenOrActor : null
		const actor = tokenOrActor?.actor ?? tokenOrActor
		ChatMessage.create({
			speaker: {
				actor: actor.id,
				token: token?.id,
				scene: game.scenes.active.id,
				alias: (token?.name ?? actor.name)
			},
			content: message
		})
	}
	
	static getTokenById(tokenId) {
		return canvas.tokens.placeables.find(t => t.id === tokenId)
	}

	static getActorById(actorId) {
		return game.actors.get(actorId)
	}

	static findGM() {
		return game.users.find((u) => u.isGM)
	}
}