import MksTools from "./mks-tools.js"
import ActionsPanel from "./apps/actions-panel.js"
import Action from "./action.js"
import {ROLL_MODE} from "./constants.js"
import RelativeCondPanel from "./apps/relative-cond-panel.js"
import EquipmentsPanel from "./apps/equipments-panel.js"
import RelativeConditions from "./model/relative-conditions.js"

Hooks.on("init", () => {
	const MKS = new MksTools()
	game["MKS"] = MKS

	Hooks.on("preCreateChatMessage", (chatMessage, options) => {
		if (game.user.isGM && chatMessage.isCheckRoll) {
			MKS.encounterManager.onCheckRoll(chatMessage.token.object, chatMessage.rolls?.[0], options?.flags?.pf2e, chatMessage, options)
		}
	})

	Hooks.on("createItem", (item) => {
		if (game.user.isGM && item.constructor.name === 'EffectPF2e') {
			MKS.encounterManager.onCreateEffect(item).then()
		}
	})

	Hooks.on("pf2e.startTurn", (combatant) => {
		if (game.user.isGM)
			MKS.encounterManager.onStartTurn(combatant).then()
	})

	Hooks.on("pf2e.endTurn", (combatant) => {
		if (game.user.isGM)
			MKS.encounterManager.onEndTurn(combatant).then()
	})

	Hooks.on("combatStart", (combat) => {
		if (game.user.isGM)
			MKS.encounterManager.onEncounterStart(combat).then()
	})
	
	Hooks.on("preDeleteCombat", (combat) => {
		if (game.user.isGM)
			MKS.encounterManager.onEncounterEnd(combat).then()
	})
	
	Hooks.on("updateCombat", (combatant) => {
		RelativeCondPanel.rerender()
	})
})

Hooks.on("ready", () => {
	MksTools.registerSocketListeners()

	setInterval(() => {
		RelativeConditions.sync()
	}, 3000)
})

Hooks.on("getSceneControlButtons", (controls) => {

	const actionsPanelLink = {
		icon: "fas fa-dice",
		name: "actionspanel",
		title: game.i18n.localize("PF2E.MKS.UI.ActionsPanel.Label"),
		button: true,
		visible: true,
		onClick: () => {
			if (game.combat?.combatant || canvas.tokens.controlled.length === 1)
				ActionsPanel.show({ inFocus: true, tab: "encounter" })
		}
	}
	const relativeCondPanelLink = {
		icon: "fas fa-user-friends",
		name: "relativecondpanel",
		title: game.i18n.localize("PF2E.MKS.UI.RelativeCondPanel.Label"),
		button: true,
		visible: game.user.isGM,
		onClick: () => {
			if (game.combat?.combatant)
				RelativeCondPanel.show({ inFocus: true})
		}
	}
	
	const equipmentsPanelLink = {
		icon: "fas fa-vest",
		name: "equipmentspanel",
		title: game.i18n.localize("PF2E.MKS.UI.EquipmentsPanel.Label"),
		button: true,
		visible: true,
		onClick: () => {
			if (game.combat?.combatant || canvas.tokens.controlled.length === 1)
				EquipmentsPanel.show({ inFocus: true})
		}
	}

	const bar = controls.find(c => c.name === "token")
	bar.tools.push(actionsPanelLink)
	bar.tools.push(equipmentsPanelLink)
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
