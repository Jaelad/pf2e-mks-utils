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

	pertinent(engagement, warn) {
		const equipments = new Equipments(engagement.initiator)
		const rangedTripW = equipments.weaponWieldedWithTraits(['ranged-trip'])
		const tripW = equipments.weaponWieldedWithTraits(['trip'])

		const freeHands = equipments.handsFree > 0 || tripW || rangedTripW
		if (!freeHands) {
			if (warn) this._.warn("PF2E.Actions.Warning.FreeHands")
			return false
		}
		const sizeOk = engagement.sizeDifference > -2
		if (!sizeOk) {
			if (warn) this._.warn("PF2E.Actions.Warning.Size")
			return false
		}
		const reachOk = rangedTripW || (tripW ? engagement.inMeleeRange : engagement.isAdjacent)
		if (!reachOk) {
			if (warn) this._.warn("PF2E.Actions.Warning.Reach")
			return false
		}
		return true
	}

	async act(engagement, options) {
		return super.act(engagement, {...options, applyMAP: true})
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
