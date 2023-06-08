import {SimpleAction} from "../action.js"
import Condition, { CONDITION_FRIGHTENED } from "../model/condition.js"
import Effect, { EFFECT_IMMUNE_TO_DEMORALIZE } from "../model/effect.js"

export default class ActionDemoralize extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'demoralize',
			checkType: 'skill[intimidation]',
			traits: ['mental', 'concentrate', 'auditory', 'emotion', 'fear'],
			icon: "systems/pf2e/icons/spells/deja-vu.webp",
			tags: ['social', 'combat'],
			actionGlyph: 'A',
			targetCount: 1,
			dc: t => t.actor.saves.will.dc.value,
		})
	}

	pertinent(engagement, warn) {
		const immuneToDem = new Effect(targeted, EFFECT_IMMUNE_TO_DEMORALIZE)
		const actorsImmuneTo = immuneToDem.getFlag("actors")
		return engagement.isEnemy && engagement.distance() <= 30
			&& !(actorsImmuneTo?.includes(engagement.initiator.actor.id))
	}

	apply(engagement, result) {
		const selected = engagement.initiator, targeted = engagement.targeted
		const immuneToDem = new Effect(targeted, EFFECT_IMMUNE_TO_DEMORALIZE)
		let previousActors = immuneToDem.getFlag("actors") ?? []
		previousActors.push(selected.actor.id)
		immuneToDem.ensure().then( () => {
			immuneToDem.setFlag("actors", previousActors).then()
		})

		if (roll.degreeOfSuccess === 2)
			new Condition(selected, CONDITION_FRIGHTENED).ensure().then()
		else if (roll.degreeOfSuccess === 3)
			new Condition(targeted, CONDITION_FRIGHTENED).ensure().then((c) => {
				c.setValue(1, true)
			})
	}
}