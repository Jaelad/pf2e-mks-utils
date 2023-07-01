import {default as i18n} from "../../lang/pf2e-i18n.js"
import { SystemAction } from "../action.js"
import Equipments from "../model/equipments.js"
import { CONDITION_PRONE } from "../model/condition.js";

export default class ActionTrip extends SystemAction {

	constructor(MKS) {
		super(MKS, 'trip', 'encounter', false, true, {
			icon: "systems/pf2e/icons/spells/unimpeded-stride.webp",
			actionGlyph: 'A',
			tags: ['combat'],
			targetCount: 1,
			opposition: 'enemy'
		})
	}

	pertinent(engagement) {
		const equipments = new Equipments(engagement.initiator)
		const rangedTripW = equipments.weaponWieldedWithTraits(['ranged-trip'])
		const tripW = equipments.weaponWieldedWithTraits(['trip'])

		return (equipments.handsFree > 0 || tripW || rangedTripW) && engagement.sizeDifference > -2
			&& (rangedTripW || (tripW ? engagement.inMeleeRange : engagement.isAdjacent))
	}

	async apply(engagement, result) {
		super.apply(engagement, result)

		const degreeOfSuccess = result.roll.degreeOfSuccess
		if (degreeOfSuccess === 0)
			engagement.setConditionOnInitiator(CONDITION_PRONE)
		else if (degreeOfSuccess > 1)
			engagement.setConditionOnTarget(CONDITION_PRONE)
	}
}
