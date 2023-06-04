import {SimpleAction} from "../action.js"
import Condition, { CONDITION_FRIGHTENED } from "../model/condition.js"
import Effect, { EFFECT_IMMUNE_TO_DEMORALIZE } from "../model/effect.js"

export default class ActionDemoralize extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'demoralize',
			traits: ['mental', 'concentrate', 'auditory', 'emotion', 'fear'],
			checkType: 'skill[intimidation]',
			icon: "systems/pf2e/icons/spells/deja-vu.webp",
			tags: ['social', 'combat'],
			actionGlyph: 'A',
			targetCount: 1,
			dc: t => t.actor.saves.will.dc.value,
		})
	}

	resultHandler(roll, selected, targeted) {
		const immuneToDem = new Effect(targeted, EFFECT_IMMUNE_TO_DEMORALIZE)
		let previousActors = immuneToDem.getFlag("actors") ?? []
		previousActors.push(selected.actor.id)
		immuneToDem.ensure().then( () => {
			immuneToDem.setFlag("actors", previousActors).then()
		})

		const frightened = new Condition(selected, CONDITION_FRIGHTENED).ensure().then()

		if (roll.degreeOfSuccess === 2)
			new Condition(selected, CONDITION_FRIGHTENED).ensure().then()
		else if (roll.degreeOfSuccess === 3)
			new Condition(targeted, CONDITION_FRIGHTENED).ensure().then((c) => {
				c.setValue(1, true)
			})
	}

	applies(selected, targeted) {
		const immuneToDem = new Effect(targeted, EFFECT_IMMUNE_TO_DEMORALIZE)
		const actorsImmuneTo = immuneToDem.getFlag("actors")
		const distance = this._.distanceTo(selected, targeted)
		return selected.actor.alliance !== targeted.actor.alliance && distance <= 30
			&& !(actorsImmuneTo?.includes(selected.actor.id))
	}
}