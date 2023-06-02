import {SimpleAction} from "../action.js"
import Compendium from "../compendium.js"

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

	applies(selected, targeted) {
		const immuneEffect = this.effectManager.getEffect(targeted, Compendium.EFFECT_IMMUNE_TO_DEMORALIZE)
		const distance = this._.distanceTo(selected, targeted)
		return selected.actor.alliance !== targeted.actor.alliance && distance <= 30
			&& !(immuneEffect?.flags?.mks?.actors?.includes(selected.actor.id))
	}

	resultHandler(roll, selected, targeted) {
		const immuneEffect = this.effectManager.getEffect(targeted, Compendium.EFFECT_IMMUNE_TO_DEMORALIZE)
		let previousActors = immuneEffect?.flags?.mks?.actors ?? []
		previousActors.push(selected.actor.id)
		if (immuneEffect)
			this.effectManager.removeEffect(targeted, Compendium.EFFECT_IMMUNE_TO_DEMORALIZE).then(() => {
				this.effectManager.setEffect(targeted, Compendium.EFFECT_IMMUNE_TO_DEMORALIZE, {flags: {"mks.actors": previousActors}}).then()
			})
		else
			this.effectManager.setEffect(targeted, Compendium.EFFECT_IMMUNE_TO_DEMORALIZE, {flags: {"mks.actors": previousActors}}).then()

		if (roll.degreeOfSuccess === 2)
			this.effectManager.setCondition(selected, 'frightened').then()
		else if (roll.degreeOfSuccess === 3)
			this.effectManager.setCondition(targeted, 'frightened', {badgeMod: {increment: 1}}).then()
	}
}