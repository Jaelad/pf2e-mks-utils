import {default as i18n} from "../../lang/pf2e-i18n.js"
import {default as LOG} from "../../utils/logging.js"
import Action from "../action.js"
import Compendium from "../compendium.js"
import Check from "../check.js"
import {ROLL_MODE} from "../constants.js";
import { Engagement } from "../model/engagement.js"
import Equipments from "../model/equipments.js"
import Effect from "../model/effect.js"
import Condition, { CONDITION_PRONE } from "../model/condition.js"

export default class ActionShove extends Action {

	constructor(MKS) {
		super(MKS, 'shove', 'encounter', false, true)
	}

	get properties() {
		return {
			label: i18n.action("shove"),
			icon: "systems/pf2e/icons/spells/knock.webp",
			actionGlyph: 'A',
			tags: ['combat']
		}
	}

	relevant(warn) {
		const selected = this._.ensureOneSelected(warn)
		const targeted = this._.ensureOneTarget(null,warn)
		if (!selected || !targeted || selected.id === targeted.id)
			return

		const engagement = new Engagement(selected, targeted)
		const equipments = new Equipments(selected)
		
		if (equipments.handsFree > 0 && engagement.sizeDifference < 2 && engagement.isEnemy
			&& engagement.distance < (equipments.weaponWieldedWithTraits(selected, ['reach', 'shove']) ? 15 : 10))
			return engagement
	}

	async act(engagement, options) {
		const check = new Check({
			actionGlyph: "A",
			rollOptions: ["action:shove"],
			extraOptions: ["action:shove"],
			traits: ["attack"],
			weaponTrait: "shove",
			checkType: "skill[athletics]",
			difficultyClassStatistic: (target) => target.saves.fortitude
		})
		check.roll(engagement).then(rollCallback)
	}

	async apply(engagement, result) {
		const degreeOfSuccess = result.roll.degreeOfSuccess
		if (degreeOfSuccess === 0)
			engagement.setConditionOnInitiator(CONDITION_PRONE)
		else if (degreeOfSuccess > 1)
			this._.compendiumToChat(selected, Compendium.ACTION_SHOVE, ROLL_MODE.BLIND)
	}
}
