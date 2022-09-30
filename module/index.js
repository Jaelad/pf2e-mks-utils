import MksTools from "./mks-tools.js"
import ActionsPanel from "./apps/actions-panel.js"
import Action from "./action.js"
import {ROLL_MODE} from "./constants.js"
import RelativeCondPanel from "./apps/relative-cond-panel.js"

Hooks.on("init", () => {
	const MKS = new MksTools()
	game["MKS"] = MKS

	Hooks.on("preCreateChatMessage", (chatMessage, options) => {
		if (chatMessage.isCheckRoll) {
			MKS.encounterManager.onCheckRoll(chatMessage.token.object, chatMessage.rolls?.[0], options?.flags?.pf2e, chatMessage, options)
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
	
	Hooks.on("updateCombat", (combatant) => {
		RelativeCondPanel.rerender()
	})
})

Hooks.on("ready", () => {
	MksTools.registerSocketListeners()
})

Hooks.on("getSceneControlButtons", (controls) => {

	const actionsPanelLink = {
		icon: "fas fa-dice",
		name: "actionspanel",
		title: game.i18n.localize("PF2E.MKS.UI.ActionsPanel.Label"),
		button: true,
		visible: true,
		onClick: () => {
			ActionsPanel.show({ inFocus: true, tab: "encounter" })
		}
	}
	const relativeCondPanelLink = {
		icon: "fas fa-user-friends",
		name: "relativecondpanel",
		title: game.i18n.localize("PF2E.MKS.UI.RelativeCondPanel.Label"),
		button: true,
		visible: true,
		onClick: () => {
			RelativeCondPanel.show({ inFocus: true})
		}
	}

	const bar = controls.find(c => c.name === "token")
	bar.tools.push(actionsPanelLink)
	bar.tools.push(relativeCondPanelLink)
})

Hooks.on("targetToken", (user, token) => {
	ActionsPanel.rerender()
})

Hooks.on("controlToken", (user, token) => {
	ActionsPanel.rerender()
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
