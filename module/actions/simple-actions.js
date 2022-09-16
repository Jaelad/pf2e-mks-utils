import {SimpleAction} from "../action.js"
import Compendium from "../compendium.js"
import $$arrays from "../../utils/arrays.js"

export class ActionTumbleThrough extends SimpleAction {

	constructor(MKS) {
		super(MKS, {action: 'tumbleThrough',
			traits: ['move'],
			checkType: 'skill[acrobatics]',
			icon: "systems/pf2e/icons/spells/mislead.webp",
			tags: ['situational'],
			mode: 'encounter',
			actionGlyph: 'A',
			targetCount: 1,
			dc: t => t.actor.saves.reflex.dc.value,
		})
	}
}

export class ActionSenseMotive extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'senseMotive',
			traits: ["concentrate", "secret"],
			checkType: 'perception',
			icon: "systems/pf2e/icons/spells/enhance-senses.webp",
			tags: ['social'],
			mode: 'encounter',
			actionGlyph: 'A',
			targetCount: 1,
			dc: t => t.actor.skills.deception.dc.value,
		})
	}

	applies(selected, targeted) {
		return !!selected && !!targeted && selected.actor.alliance !== targeted.actor.alliance
	}
}

export class ActionForceOpen extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'forceOpen',
			traits: ['attack'],
			checkType: 'skill[athletics]',
			icon: "systems/pf2e/icons/spells/forceful-hand.webp",
			tags: ['situational']
		})
	}
}

export class ActionBalance extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'balance',
			traits: ['move'],
			checkType: 'skill[acrobatics]',
			icon: "systems/pf2e/icons/spells/tempest-form.webp",
			tags: ['situational']
		})
	}
}

export class ActionClimb extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'climb',
			traits: ['move'],
			checkType: 'skill[athletics]',
			icon: "systems/pf2e/icons/spells/rope-trick.webp",
			tags: ['situational']
		})
	}
}

export class ActionGrabAnEdge extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'grabAnEdge',
			traits: ['manipulate'],
			checkType: 'reflex',
			icon: "systems/pf2e/icons/spells/object-reading.webp",
			tags: ['situational'],
			actionGlyph: 'R',
		})
	}
}

export class ActionHighJump extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'highJump',
			traits: ['move'],
			checkType: 'skill[athletics]',
			icon: "systems/pf2e/icons/spells/wind-jump.webp",
			tags: ['situational'],
			actionGlyph: 'D',
		})
	}
}

export class ActionLongJump extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'longJump',
			traits: ['move'],
			checkType: 'skill[athletics]',
			icon: "systems/pf2e/icons/spells/jump.webp",
			tags: ['situational'],
			actionGlyph: 'D',
		})
	}
}

export class ActionSwim extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'swim',
			traits: ['move'],
			checkType: 'skill[athletics]',
			icon: "systems/pf2e/icons/spells/waters-of-prediction.webp",
			tags: ['situational'],
		})
	}
}

export class ActionLie extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'lie',
			traits: ['concentrate', 'auditory', 'linguistic', 'mental', 'secret'],
			checkType: 'skill[deception]',
			icon: "systems/pf2e/icons/spells/glibness.webp",
			tags: ['social'],
			actionGlyph: 'T',
			targetCount: 2,
			dc: t => t.actor.perception.dc.value,
		})
	}
}

export class ActionFeint extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'feint',
			traits: ['mental'],
			checkType: 'skill[deception]',
			icon: "systems/pf2e/icons/spells/mislead.webp",
			tags: ['combat'],
			actionGlyph: 'A',
			targetCount: 1,
			dc: t => t.actor.perception.dc.value,
		})
	}

	applies(selected, targeted) {
		const distance = this._.distanceTo(selected, targeted)
		return !!selected && !!targeted && selected.actor.alliance !== targeted.actor.alliance
			&& distance < (this._.inventoryManager.wieldsWeaponWithTraits(selected, ['reach']) ? 15 : 10)
	}

	resultHandler(roll, selected, targeted) {
		super.resultHandler(roll, selected, targeted)
		if (roll?.data.degreeOfSuccess > 1)
			this.effectManager.setCondition(targeted, 'flat-footed').then()
		else if (roll?.data.degreeOfSuccess < 1)
			this.effectManager.setCondition(selected, 'flat-footed').then()
	}
}

export class ActionRequest extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'request',
			traits: ['mental', 'concentrate', 'auditory', 'linguistic'],
			checkType: 'skill[diplomacy]',
			icon: "systems/pf2e/icons/spells/miracle.webp",
			tags: ['social'],
			actionGlyph: 'A',
			targetCount: 1
		})
	}
}



