import MksUtils from "./mks-utils.js"
import ActionAid from "./aid.js"

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
	registerPackageDebugFlag(MksUtils.MODULEID)
})

Hooks.on("init", () => {
	const MKS = new MksUtils()
	game["PF2E_Tools_MKS"] = MKS
	MKS.actions = {
		aid: new ActionAid(MKS)
	}

	Hooks.on("preCreateChatMessage", (chatMessage, options) => {
		const traits = options?.flags?.pf2e?.context?.traits
		const attackTrait = traits?.find(t => t.name == "attack")
		if (attackTrait)
			MKS.onAttackRoll(chatMessage.token.id, options.flags.pf2e)
	})

	Hooks.on("createItem", (item) => {
		MKS.onCreateItem(item).then()
	})

	Hooks.on("pf2e.startTurn", (combatant) => {
		MKS.onStartTurn(combatant).then()
	})

	Hooks.on("pf2e.endTurn", (combatant) => {
		MKS.onEndTurn(combatant).then()
	})


})
