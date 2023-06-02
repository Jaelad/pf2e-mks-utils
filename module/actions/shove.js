import {default as i18n} from "../../lang/pf2e-i18n.js"
import {default as LOG} from "../../utils/logging.js"
import Action from "../action.js"
import Compendium from "../compendium.js"
import Check from "../check.js"
import {ROLL_MODE} from "../constants.js";

export default class ActionShove extends Action {

	shove(options = {}) {
		const {applicable, selected, targeted} = this.isApplicable(null,true)
		if (!applicable)
			return

		const rollCallback = ({roll, actor}) => {
			if (roll.degreeOfSuccess === 0)
				this.effectManager.setCondition(selected, 'prone').then()
			else if (roll.degreeOfSuccess > 1)
				this._.compendiumToChat(selected, Compendium.ACTION_SHOVE, ROLL_MODE.BLIND)
		}

		const check = new Check({
			actionGlyph: "A",
			rollOptions: ["action:shove"],
			extraOptions: ["action:shove"],
			traits: ["attack"],
			weaponTrait: "shove",
			checkType: "skill[athletics]",
			difficultyClassStatistic: (target) => target.saves.fortitude
		})
		check.roll(selected, targeted).then(rollCallback)
	}

	methods(onlyApplicable) {
		const {applicable} = this.isApplicable()
		return !onlyApplicable || applicable ? [{
			method: "shove",
			label: i18n.action("shove"),
			icon: "systems/pf2e/icons/spells/knock.webp",
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

		const handsFree = this._.inventoryManager.handsFree(selected)
		const sizeDiff = this._.getSizeDifference(selected, targeted)
		const distance = this._.distanceTo(selected, targeted)
		const reqMet = handsFree > 0 && sizeDiff < 2 && selected.actor.alliance !== targeted.actor.alliance
			&& distance < (this._.inventoryManager.wieldsWeaponWithTraits(selected, ['reach', 'shove']) ? 15 : 10)

		return {applicable: reqMet, selected, targeted}
	}
}
