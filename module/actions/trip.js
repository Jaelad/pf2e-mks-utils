import {default as i18n} from "../../lang/pf2e-helper.js"
import {default as LOG} from "../../utils/logging.js"
import Action from "../action.js"
import Compendium from "../compendium.js"
import Check from "../check.js"
import {ROLL_MODE} from "../constants.js";

export default class ActionTrip extends Action {

	trip(options = {}) {
		const {applicable, selected, targeted} = this.isApplicable(null,true)
		if (!applicable)
			return

		const rollCallback = ({roll, actor}) => {
			let degreeOfSuccess = roll?.data.degreeOfSuccess;
			if (degreeOfSuccess === 0)
				this.effectManager.setCondition(selected, 'prone').then()
			else if (degreeOfSuccess > 1)
				this.effectManager.setCondition(targeted, 'prone').then()

			if (degreeOfSuccess > 2)
				this._.compendiumToChat(selected, Compendium.ACTION_TRIP, ROLL_MODE.BLIND)
		}

		const check = new Check({
			actionGlyph: "A",
			rollOptions: ["action:trip"],
			extraOptions: ["action:trip"],
			traits: ["attack"],
			weaponTrait: "trip",
			checkType: "skill[athletics]",
			difficultyClassStatistic: (target) => target.saves.reflex
		})
		check.roll(selected, targeted).then(rollCallback)
	}

	methods(onlyApplicable) {
		const {applicable} = this.isApplicable()
		return !onlyApplicable || applicable ? [{
			method: "trip",
			label: i18n.action("trip"),
			icon: "systems/pf2e/icons/spells/unimpeded-stride.webp",
			action: 'A',
			mode: "encounter",
			tags: ['combat']
		}] : []
	}

	isApplicable(method=null, warn=false) {
		const selected = this._.ensureOneSelected(warn)
		const targeted = this._.ensureOneTarget(null,warn)
		if (!selected || !targeted)
			return {applicable: false}

		const sizeDiff = this._.getSizeDifference(selected, targeted)
		const handsFree = this._.inventoryManager.handsFree(selected)
		const distance = this._.distanceTo(selected, targeted)
		const reqMet = handsFree > 0 && sizeDiff < 2 && selected.actor.alliance !== targeted.actor.alliance
			&& distance < (this._.inventoryManager.wieldsWeaponWithTraits(selected, ['reach', 'trip']) ? 15 : 10)

		return {applicable: reqMet, selected, targeted}
	}
}
