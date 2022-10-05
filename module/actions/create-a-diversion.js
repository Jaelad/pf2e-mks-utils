import {default as i18n} from "../../lang/pf2e-i18n.js"
import Action from "../action.js"
import Compendium from "../compendium.js"
import Check from "../check.js"
import Dialogs from "../apps/dialogs.js"
import DCHelper from "../helpers/dc-helper.js"

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
		const difficultyClass = DCHelper.getMaxDC(targets,
			(t) => t.actor.perception.dc.value + (this._.effectManager.hasEffect(t, Compendium.EFFECT_RESIST_A_DIVERSION) ? 4 : 0))

		const rollCallback = ({roll}) => {
			this.resultToChat(selected, this.action, roll?.data.degreeOfSuccess, this.actionGlyph)
		}

		const check = new Check({
			actionGlyph: "A",
			rollOptions: ["action:create-a-diversion"],
			extraOptions: ["action:create-a-diversion"],
			traits,
			checkType: 'skill[deception]',
			difficultyClass
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
		const selected = this._.ensureOneSelected(warn)
		const targets = this._.ensureAtLeastOneTarget(null, warn)

		return {applicable: !!selected && !!targets, selected, targets}
	}
}
