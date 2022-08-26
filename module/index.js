import MksUtils from "./mks-utils.js"

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
	registerPackageDebugFlag(MksUtils.MODULEID)
})

Hooks.on("init", () => {
	const MKS = new MksUtils()
	game["MKS"] = MKS

	Hooks.on("preCreateChatMessage", (chatMessage, options) => {
		if (chatMessage.isCheckRoll) {
			MKS.encounterManager.onCheckRoll(chatMessage.token.object, chatMessage.roll, options?.flags?.pf2e, chatMessage, options)
		}
	})

	Hooks.on("createItem", (item) => {
		if (item.constructor.name === 'EffectPF2e') {
			MKS.encounterManager.onCreateEffect(item).then()
		}
	})

	Hooks.on("pf2e.startTurn", (combatant) => {
		MKS.encounterManager.onStartTurn(combatant).then()
	})

	Hooks.on("pf2e.endTurn", (combatant) => {
		MKS.encounterManager.onEndTurn(combatant).then()
	})
})
