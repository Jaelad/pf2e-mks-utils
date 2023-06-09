import {default as i18n} from "../../lang/pf2e-i18n.js"
import Action from "../action.js"
import Compendium from "../compendium.js"
import Check from "../check.js"
import {ROLL_MODE} from "../constants.js";
import { Engagement } from "../model/engagement.js"
import Equipments from "../model/equipments.js"
import { CONDITION_PRONE } from "../model/condition.js";

export default class ActionTrip extends Action {

	constructor(MKS) {
		super(MKS, 'trip', 'encounter', false, true)
	}

	get properties() {
		return {
			label: i18n.action("trip"),
			icon: "systems/pf2e/icons/spells/unimpeded-stride.webp",
			actionGlyph: 'A',
			tags: ['combat']
		}
	}

	relevant(warn) {
		const selected = this._.ensureOneSelected(warn)
		const targeted = this._.ensureOneTarget(null,warn)
		if (!selected || !targeted)
			return

		const engagement = new Engagement(selected, targeted)
		const equipments = new Equipments(selected)

		if (equipments.handsFree > 0 && engagement.sizeDifference < 2
			&& engagement.isEnemy && engagement.distance < equipments.weaponWieldedWithTraits(['reach', 'trip']) ? 15 : 10)
			return engagement
	}

	async act(engagement, options) {
		const check = new Check({
			actionGlyph: "A",
			rollOptions: ["action:trip"],
			extraOptions: ["action:trip"],
			traits: ["attack"],
			weaponTrait: "trip",
			checkType: "skill[athletics]",
			difficultyClassStatistic: (target) => target.saves.reflex
		})
		return check.roll(engagement).then(({roll, actor}) => this.createResult(engagement, roll))
	}

	async apply(engagement, result) {
		let degreeOfSuccess = result.roll.degreeOfSuccess
		if (degreeOfSuccess === 0)
			engagement.setConditionOnInitiator(CONDITION_PRONE)	
		else if (degreeOfSuccess > 1)
			engagement.setConditionOnTarget(CONDITION_PRONE)

		if (degreeOfSuccess > 2)
			this._.compendiumToChat(selected, Compendium.ACTION_TRIP, ROLL_MODE.BLIND)
	}
}
