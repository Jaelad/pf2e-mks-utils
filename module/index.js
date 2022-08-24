import MksUtils from "./mks-utils.js"
import ActionAid from "./aid.js"

/*Enable Debug Module */
Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
	registerPackageDebugFlag(MksUtils.MODULEID)
})

Hooks.on("init", () => {
	const MKS = new MksUtils()
	game["PF2E_Utils_MKS"] = MKS
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

// Hooks.on("getCheckModifiersDialogHeaderButtons", (dialog) => {
// 	// console.log("TEST: " + dialog.context.dc)
// 	// if (!dialog.context.dc)
// 	// 	dialog.context.dc = {value: 21}
// })
//
// Hooks.on("getCheckModifiersDialogHeaderButtons", (dialog) => {
// 	// console.log("TEST: " + dialog.context.dc)
// 	// if (!dialog.context.dc)
// 	// 	dialog.context.dc = {value: 21}
// })
//
// Hooks.on("renderCheckModifiersDialog", (dialog) => {
// 	// console.log("TEST: " + dialog.context.dc)
// 	// if (!dialog.context.dc)
// 	// 	dialog.context.dc = {value: 21}
// })
