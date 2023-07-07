import {SystemAction} from "../action.js"
import Condition, { CONDITION_FRIGHTENED } from "../model/condition.js"
import Effect, { EFFECT_IMMUNE_TO_DEMORALIZE } from "../model/effect.js"

export default class ActionDemoralize extends SystemAction {
	constructor(MKS) {
		super(MKS, 'demoralize', 'encounter', false, true, {
			icon: "systems/pf2e/icons/spells/deja-vu.webp",
			tags: ['social', 'combat'],
			actionGlyph: 'A',
			targetCount: 1,
			opposition: 'enemy',
		})
	}

	pertinent(engagement, warn) {
		const immuneToDem = new Effect(engagement.targeted, EFFECT_IMMUNE_TO_DEMORALIZE)
		const actorsImmuneTo = immuneToDem.exists ? immuneToDem.getFlag("actors") : []
		const inRange = engagement.distance() <= 30
		if (!inRange) {
			if (warn) this._.warn("PF2E.Actions.Warning.Reach")
			return false
		}

		const notImmune = !(actorsImmuneTo?.includes(engagement.initiator.actor.id))
		if (!notImmune) {
			if (warn) this._.warn("PF2E.Actions.Warning.Immune")
			return false
		}
		return inRange && notImmune
	}

	async apply(engagement, result) {
		const selected = engagement.initiator, targeted = engagement.targeted
		const immuneToDem = new Effect(targeted, EFFECT_IMMUNE_TO_DEMORALIZE)
		let previousActors = immuneToDem.getFlag("actors") ?? []
		previousActors.push(selected.actor.id)
		immuneToDem.ensure().then( () => {
			immuneToDem.setFlag("actors", previousActors).then()
		})

		const frightened = new Condition(targeted, CONDITION_FRIGHTENED)
		if (result.roll.degreeOfSuccess > 1)
			await frightened.ensure()
		if (result.roll.degreeOfSuccess === 3)
			frightened.setValue(2).then()
	}
}