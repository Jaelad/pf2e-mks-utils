import {default as i18n} from "../../lang/pf2e-i18n.js"
import Action from "../action.js"
import Compendium from "../compendium.js"
import Check from "../check.js"
import Dialogs from "../apps/dialogs.js"
import DCHelper from "../helpers/dc-helper.js"
import {ROLL_MODE, SYSTEM} from "../constants.js"
import seek from "./seek.js"
import Effect, { EFFECT_RESIST_A_DIVERSION } from "../model/effect.js"
import RelativeConditions from "../model/relative-conditions.js"
import { UUID_CONDITONS } from "../model/condition.js"

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
			const relative = new RelativeConditions()
			if (!relative.isOk) return

			for (const target of targets) {
				const awareness = relative.getAwarenessTowardMe(target)
				if (awareness < 3)
					continue
				const resistDiversion = new Effect(target, EFFECT_RESIST_A_DIVERSION)
				const dc = target.actor.perception.dc.value + (resistDiversion.exists ? 4 : 0)

				const degree = DCHelper.calculateRollSuccess(roll, dc)
				relative.setAwarenessTowardMe(target, degree > 1 ? 2 : 3)
				const conditionUuid = degree > 1 ? UUID_CONDITONS.hidden : UUID_CONDITONS.observed

				resistDiversion.ensure()

				const message = i18n.$$('PF2E.Actions.CreateADiversion.Result', {target: target.name, conditionRef: `@UUID[${conditionUuid}]`})
				this.messageToChat(selected, 'create-a-diversion', message, 'A', true)
			}
			
			RelativeConditions.sync()
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
			tags: ['stealth']
		}] : []
	}

	isApplicable(method=null, warn=false) {
		const selected = this._.ensureOneSelected(warn, true)
		const targets = this._.ensureAtLeastOneTarget(warn, null)

		return {applicable: !!selected && !!targets, selected, targets}
	}
}
