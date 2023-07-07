import {SimpleAction} from "../action.js"
import Effect, { EFFECT_POISON_TREATED } from "../model/effect.js"
import Equipments, { EQU_HEALERS_TOOLS, EQU_HEALERS_TOOLS_EXPANDED } from "../model/equipments.js"

export default class ActionTreatPoison extends SimpleAction {
	constructor(MKS) {
		super(MKS, 'treatPoison', 'encounter', false, true, {
			icon: "systems/pf2e/icons/effects/treat-poison.webp",
			tags: ['combat'],
			actionGlyph: 'A',
			targetCount: 1,
			opposition: 'ally',
			checkType: 'skill[medicine]',
			traits: ['manipulate'],
			dc: 15
		})
	}
	
	pertinent(engagement, warn) {
		const adjacent = engagement.isAdjacent
		if (warn && !adjacent)
			this._.warn("PF2E.Actions.Warning.Reach")
		return adjacent
	}
	
	async apply(engagement, result) {
		const healersTools = new Equipments(engagement.initiator).hasAny([EQU_HEALERS_TOOLS, EQU_HEALERS_TOOLS_EXPANDED]).length > 0
		if (!healersTools) {
			this._.warn("PF2E.MKS.Warning.Action.MustUseHealersTools")
			return
		}
			
		super.apply(engagement, result)

		const degreeOfSuccess = result.roll.degreeOfSuccess
		const bonus = degreeOfSuccess === 2 ? 2 : degreeOfSuccess === 3 ? 4 : degreeOfSuccess === 0 ? -2 : 0
		if (bonus !== 0) {
			const poisonTreated = new Effect(engagement.targeted, EFFECT_POISON_TREATED)
			poisonTreated.setBadgeValue(bonus)
		}
	}
}