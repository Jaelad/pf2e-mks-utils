import MksTools from "./mks-tools.js"
import ActionsPanel from "./apps/actions-panel.js"
import Action from "./action.js"

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

Hooks.on("ready", () => {
	MksTools.registerSocketListeners()
})

Hooks.on("getSceneControlButtons", (controls) => {

	const viewer = {
		icon: "fas fa-dice",
		name: "actionspanel",
		title: game.i18n.localize("PF2E.MKS.UI.ActionsPanel.Label"),
		button: true,
		visible: true,
		onClick: () => {
			ActionsPanel.show({ inFocus: true, tab: "manager" })
		}
	};

	const bar = controls.find(c => c.name === "token");
	bar.tools.push(viewer);
})

Hooks.on("targetToken", (user, token) => {
	setTimeout(() => ActionsPanel.rerender(), 300)
})

Hooks.on("controlToken", (user, token) => {
	setTimeout(() => ActionsPanel.rerender(), 300)
})

Hooks.on('getItemSheetPF2eHeaderButtons', (sheet, buttons) => {
	buttons.unshift({
		label: "To Chat",
		class: "to-chat",
		icon: "fas fa-comment-alt",
		onclick: async () => {
			game.MKS.sheetToChat(null, sheet)
		},
	});
})

//Hooks.on("getSceneControlButtons", getSceneControlButtons)
