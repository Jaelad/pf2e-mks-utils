import {default as i18n} from "../../lang/pf2e-i18n.js"
import Action from "../action.js"
import Compendium from "../compendium.js"
import Check from "../check.js"
import Dialogs from "../apps/dialogs.js"
import DCHelper from "../helpers/dc-helper.js"
import {ROLL_MODE, SYSTEM} from "../constants.js"
import seek from "./seek.js"

export default class ActionCreateADiversion extends Action {
	async act() {
		const {applicable, selected, targets} = this.isApplicable(null,true)
		if (!applicable)
			return

		const type = await Dialogs.multipleButtons([
			{ value: 'trick-gesture', name: 'PF2E.Actions.CreateADiversion.TrickGesture'},
			{ value: 'distracting-words', name: 'PF2E.Actions.CreateADiversion.DistractingWords'},
		], "PF2E.MKS.Dialog.CreateADiversion.SelectType")
		if (!type) return

		const traits = type === 'trick-gesture' ? ['mental', 'manipulate'] : ['mental', 'auditory', 'linguistic']

		const rollCallback = ({roll}) => {
			const relativeData = game.combat?.flags?.[SYSTEM.moduleId]?.relative
			if (!relativeData) return
			
			for (let i=0; i < targets.length; i++) {
				const t = targets[i], dc = t.actor.perception.dc.value
				const relative = relativeData[t.id]
				
				if (relative?.[selected.id]?.awareness > -1)
					relative[selected.id].awareness = dc <= roll.total ? 2 : 3
			}
			
			game.combat.setFlag(SYSTEM.moduleId, 'relative', relativeData).then()
			game.MKS.compendiumToChat(selected, Compendium.ACTION_CREATE_A_DIVERSION, ROLL_MODE.BLIND, true)
		}

		const check = new Check({
			actionGlyph: "A",
			rollOptions: ["action:create-a-diversion"],
			extraOptions: ["action:create-a-diversion"],
			traits,
			checkType: 'skill[deception]'
		})
		check.roll(selected).then(rollCallback)
	}

	methods(onlyApplicable) {
		const {applicable} = this.isApplicable()
		return !onlyApplicable || applicable ? [{
			method: "act",
			label: i18n.action("createADiversion"),
			icon: "systems/pf2e/icons/spells/lose-the-path.webp",
			action: 'A',
			mode: "encounter",
			tags: ['combat', 'stealth']
		}] : []
	}

	isApplicable(method=null, warn=false) {
		const selected = this._.ensureOneSelected(warn, true)
		const targets = this._.ensureAtLeastOneTarget(warn, null)

		return {applicable: !!selected && !!targets, selected, targets}
	}
}
