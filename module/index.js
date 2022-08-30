import MksTools from "./mks-tools.js"
import getSceneControlButtons from "./controls.js"

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
	registerPackageDebugFlag(MksTools.MODULEID)
})

Hooks.on("init", () => {
	const MKS = new MksTools()
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

Hooks.on("getSceneControlButtons", getSceneControlButtons)
