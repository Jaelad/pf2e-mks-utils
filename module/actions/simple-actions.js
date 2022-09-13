import {SimpleAction} from "../action.js"

export class ActionTumbleThrough extends SimpleAction {

	constructor(MKS) {
		super(MKS, {action: 'tumbleThrough',
			traits: ['move'],
			checkType: 'skill[acrobatics]',
			icon: "systems/pf2e/icons/spells/mislead.webp",
			defaultDC: (s,t) => t.actor.saves.reflex.dc.value,
			tags: ['situational'],
			mode: 'encounter',
			actionGlyph: 'A',
			hasTarget: true,
		})
	}
}

export class ActionSenseMotive extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'senseMotive',
			traits: ["concentrate", "secret"],
			checkType: 'perception',
			icon: "systems/pf2e/icons/spells/enhance-senses.webp",
			defaultDC: (s,t) => t.actor.skills.deception.dc.value,
			tags: ['social'],
			mode: 'encounter',
			actionGlyph: 'A',
			hasTarget: true
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
			icon: "systems/pf2e/icons/spells/agile-feet.webp",
			tags: ['situational'],
			defaultDC: () => 30,
			actionGlyph: 'D',
		})
	}
}

export class ActionLongJump extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'longJump',
			traits: ['move'],
			checkType: 'skill[athletics]',
			icon: "systems/pf2e/icons/spells/agile-feet.webp",
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
			defaultDC: (s,t) => t.actor.perception.dc.value,
			icon: "systems/pf2e/icons/spells/glibness.webp",
			tags: ['social'],
			actionGlyph: 'T',
		})
	}
}
