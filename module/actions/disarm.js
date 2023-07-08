import {default as i18n} from "../../lang/pf2e-i18n.js"
import Equipments from "../model/equipments.js";
import { SystemAction } from "../action.js";
import { CONDITION_FLATFOOTED } from "../model/condition.js";
import { EFFECT_DISARM_SUCCESS } from "../model/effect.js";

export default class ActionDisarm extends SystemAction {
	constructor(MKS) {
		super(MKS, 'disarm', 'encounter', false, true, {
			icon: "systems/pf2e/icons/spells/hand-of-the-apprentice.webp",
			actionGlyph: 'A',
			tags: ['attack'],
			targetCount: 1,
			opposition: 'enemy'
		})
	}

	pertinent(engagement, warn) {
		const equipments = new Equipments(engagement.initiator)
		const disarmW = equipments.weaponWieldedWithTraits(['disarm'])

		const freeHands = equipments.handsFree > 0 || disarmW
		if (!freeHands) {
			if (warn) this._.warn("PF2E.Actions.Warning.FreeHands")
			return false
		}
		const sizeOk = engagement.sizeDifference > -2
		if (!sizeOk) {
			if (warn) this._.warn("PF2E.Actions.Warning.Size")
			return false
		}
		const reachOk = disarmW ? engagement.inMeleeRange : engagement.isAdjacent
		if (!reachOk) {
			if (warn) this._.warn("PF2E.Actions.Warning.Reach")
			return false
		}
		return true
	}

	async act(engagement, options) {
		const modifiers = []
		if (engagement.hasTargetEffect(EFFECT_DISARM_SUCCESS))
			modifiers.push(new game.pf2e.Modifier({
				label: "PF2E.MKS.Modifier.partially-disarmed",
				slug: "partially-disarmed",
				type: "circumstance",
				modifier: 4, // Max range penalty before automatic failure
			}))
		return super.act(engagement, {...options, applyMAP: true}, modifiers)
	}

	async apply(engagement, result) {
		super.apply(engagement, result)
		const degreeOfSuccess = result.roll.degreeOfSuccess
		if (degreeOfSuccess === 0)
			engagement.setConditionOnInitiator(CONDITION_FLATFOOTED)
		else if (degreeOfSuccess === 2)
			engagement.setEffectOnTarget(EFFECT_DISARM_SUCCESS)
		else if (degreeOfSuccess === 3)
			new Effect(engagement.targeted, EFFECT_DISARM_SUCCESS).purge()
	}
}
