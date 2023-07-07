import {default as i18n} from "../../lang/pf2e-i18n.js"
import {default as LOG} from "../../utils/logging.js"
import { SystemAction } from "../action.js"
import Equipments from "../model/equipments.js"
import { CONDITION_PRONE } from "../model/condition.js"

export default class ActionShove extends SystemAction {

	constructor(MKS) {
		super(MKS, 'shove', 'encounter', false, true, {
			icon: "systems/pf2e/icons/spells/knock.webp",
			actionGlyph: 'A',
			tags: ['attack'],
			targetCount: 1,
			opposition: 'enemy'
		})
	}

	pertinent(engagement) {
		const equipments = new Equipments(engagement.initiator)
		const shoveW = equipments.weaponWieldedWithTraits(['shove'])

		return (equipments.handsFree > 0 || shoveW) && engagement.sizeDifference > -2
			&& (shoveW ? engagement.inMeleeRange : engagement.isAdjacent)
	}

	async apply(engagement, result) {
		super.apply(engagement, result)
		const degreeOfSuccess = result.roll.degreeOfSuccess
		if (degreeOfSuccess === 0)
			engagement.setConditionOnInitiator(CONDITION_PRONE)
	}
}
