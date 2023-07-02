import {SimpleAction} from "../action.js"
import Condition, {CONDITION_FLATFOOTED} from "../model/condition.js"
import Equipments, {EQU_ALCHEMISTS_TOOLS, EQU_THVS_TOOLS} from "../model/equipments.js"

export class ActionTumbleThrough extends SimpleAction {

	constructor(MKS) {
		super(MKS, {action: 'tumbleThrough',
			checkType: 'skill[acrobatics]',
			traits: ['move'],
			icon: "systems/pf2e/icons/spells/unimpeded-stride.webp",
			tags: ['situational'],
			actionGlyph: 'A',
			targetCount: 1,
			opposition: 'enemy',
			dc: t => t.actor.saves.reflex.dc.value,
		})
	}
}

export class ActionSenseMotive extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'senseMotive', gmActs: false,
			checkType: 'perception',
			traits: ["concentrate", "secret"],
			icon: "systems/pf2e/icons/spells/enhance-senses.webp",
			tags: ['social'],
			actionGlyph: 'A',
			targetCount: 1,
			opposition: 'enemy',
			dc: t => t.actor.skills.deception.dc.value,
		})
	}
}

export class ActionForceOpen extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'forceOpen',
			checkType: 'skill[athletics]',
			traits: ['attack'],
			icon: "systems/pf2e/icons/spells/forceful-hand.webp",
			tags: ['situational'],
			dc: 15
		})
	}
}

export class ActionBalance extends SimpleAction { //TESTED
	constructor(MKS) {
		super(MKS, {action: 'balance',
			checkType: 'skill[acrobatics]',
			traits: ['move'],
			icon: "systems/pf2e/icons/spells/tempest-form.webp",
			tags: ['situational'],
			dc: 15
		})
	}
}

export class ActionClimb extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'climb',
			checkType: 'skill[athletics]',
			traits: ['move'],
			icon: "systems/pf2e/icons/spells/rope-trick.webp",
			tags: ['situational'],
			dc: 15
		})
	}
}

export class ActionGrabAnEdge extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'grabAnEdge',
			checkType: 'reflex',
			traits: ['manipulate'],
			icon: "systems/pf2e/icons/spells/object-reading.webp",
			tags: ['situational'],
			actionGlyph: 'R',
			dc: 15
		})
	}
}

export class ActionHighJump extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'highJump',
			checkType: 'skill[athletics]',
			traits: ['move'],
			icon: "systems/pf2e/icons/spells/wind-jump.webp",
			tags: ['situational'],
			actionGlyph: 'D',
			dc: 15
		})
	}
}

export class ActionLongJump extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'longJump',
			checkType: 'skill[athletics]',
			traits: ['move'],
			icon: "systems/pf2e/icons/spells/jump.webp",
			tags: ['situational'],
			actionGlyph: 'D',
			dc: 15
		})
	}
}

export class ActionSwim extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'swim',
			checkType: 'skill[athletics]',
			traits: ['move'],
			icon: "systems/pf2e/icons/spells/waters-of-prediction.webp",
			tags: ['situational'],
			dc: 15
		})
	}
}

export class ActionLie extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'lie', gmActs: false,
			checkType: 'skill[deception]',
			traits: ['concentrate', 'auditory', 'linguistic', 'mental', 'secret'],
			icon: "systems/pf2e/icons/spells/glibness.webp",
			tags: ['social'],
			actionGlyph: 'T',
			targetCount: 2,
			opposition: 'enemy',
			dc: t => t.actor.perception.dc.value,
		})
	}
}

export class ActionFeint extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'feint',
			checkType: 'skill[deception]',
			traits: ['mental'],
			icon: "systems/pf2e/icons/spells/mislead.webp",
			tags: ['combat'],
			actionGlyph: 'A',
			targetCount: 1,
			opposition: 'enemy',
			dc: t => t.actor.perception.dc.value,
		})
	}
	
	pertinent(engagement, warn) {
		return engagement.inMeleeRange
	}
	
	async apply(engagement, result) {
		await super.apply(engagement, result)
		
		const roll = engagement.roll
		if (roll.degreeOfSuccess > 1)
			return engagement.setConditionOnTarget(CONDITION_FLATFOOTED)
		else if (roll.degreeOfSuccess < 1)
			return engagement.setConditionOnSelected(CONDITION_FLATFOOTED)
	}
}

export class ActionRequest extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'request',
			checkType: 'skill[diplomacy]',
			traits: ['mental', 'concentrate', 'auditory', 'linguistic'],
			icon: "systems/pf2e/icons/spells/miracle.webp",
			tags: ['social'],
			actionGlyph: 'A',
			targetCount: 1,
			opposition: 'enemy',
			dc: 15
		})
	}
}

export class ActionCommandAnAnimal extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'commandAnAnimal',
			checkType: 'skill[nature]',
			traits: ['concentrate', 'auditory'],
			icon: "systems/pf2e/icons/spells/awaken-animal.webp",
			tags: ['social'],
			actionGlyph: 'A',
			targetCount: 1,
			opposition: 'ally',
			dc: 15
		})
	}
	
	pertinent(engagement, warn) {
		const ok = super.pertinent(engagement, warn)
		return ok && Array.from(engagement?.targeted?.actor?.traits).indexOf('animal') !== -1
	}
}

export class ActionPerform extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'perform',
			checkType: 'skill[performance]',
			traits: ['concentrate'],
			icon: "systems/pf2e/icons/features/classes/magnum-opus.webp",
			tags: ['social'],
			actionGlyph: 'A',
			dc: 15
		})
	}
}

export class ActionConcealAnObject extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'concealAnObject', gmActs: false,
			checkType: 'skill[stealth]',
			traits: ['manipulate', 'secret'],
			icon: "systems/pf2e/icons/spells/umbral-mindtheft.webp",
			tags: ['stealth'],
			actionGlyph: 'A',
			targetCount: 2,
			opposition: 'enemy',
			dc: t => t.actor.perception.dc.value
		})
	}
}

export class ActionPalmAnObject extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'palmAnObject',
			checkType: 'skill[thievery]',
			traits: ['manipulate'],
			icon: "systems/pf2e/icons/spells/quivering-palm.webp",
			tags: ['stealth'],
			actionGlyph: 'A',
			targetCount: 2,
			opposition: 'enemy',
			dc: t => t.actor.perception.dc.value
		})
	}
}

export class ActionSteal extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'steal',
			checkType: 'skill[thievery]',
			traits: ['manipulate'],
			icon: "systems/pf2e/icons/spells/mending.webp",
			tags: ['stealth'],
			actionGlyph: 'A',
			targetCount: 1,
			opposition: 'enemy',
			dc: 15
		})
	}
}

export class ActionPickALock extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'pickALock',
			checkType: 'skill[thievery]',
			traits: ['manipulate'],
			icon: "systems/pf2e/icons/spells/freedom.webp",
			tags: ['stealth'],
			actionGlyph: 'D',
			dc: 15
		})
	}
	
	pertinent(engagement, warn) {
		const ok = super.pertinent(engagement, warn)
		return ok && new Equipments(engagement.initiator).hasEquippedAny(EQU_THVS_TOOLS).length > 0
	}
}

export class ActionDisableDevice extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'disableDevice',
			checkType: 'skill[thievery]',
			traits: ['manipulate'],
			icon: "systems/pf2e/icons/spells/visions-of-danger.webp",
			tags: ['stealth'],
			actionGlyph: 'D',
			dc: 15
		})
	}

	pertinent(engagement, warn) {
		const ok = super.pertinent(engagement, warn)
		return ok && new Equipments(engagement.initiator).hasEquippedAny(EQU_THVS_TOOLS).length > 0
	}
}

export class ActionAvoidNotice extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'avoidNotice', mode: 'exploration',
			checkType: 'skill[stealth]',
			traits: ['exploration'],
			icon: "systems/pf2e/icons/spells/pass-without-trace.webp",
			tags: ['stealth'],
			actionGlyph: '',
			dc: 15
		})
	}
}

export class ActionBorrowAnArcaneSpell extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'borrowAnArcaneSpell', mode: 'exploration',
			checkType: 'skill[arcana]',
			traits: ['exploration', 'concentrate'],
			icon: "systems/pf2e/icons/spells/message.webp",
			tags: ['preparation'],
			actionGlyph: '',
			dc: 15
		})
	}
}

export class ActionCoerce extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'coerce', mode: 'exploration',
			checkType: 'skill[intimidation]',
			traits: ['exploration', 'concentrate', 'auditory', 'emotion', 'linguistic', 'mental'],
			icon: "systems/pf2e/icons/spells/inveigle.webp",
			tags: ['social'],
			actionGlyph: '',
			dc: 15
		})
	}
}


export class ActionCoverTracks extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'coverTracks', mode: 'exploration',
			checkType: 'skill[survival]',
			traits: ['exploration', 'concentrate', 'move'],
			icon: "systems/pf2e/icons/spells/unseen-servant.webp",
			tags: ['situational'],
			actionGlyph: '',
			dc: 15
		})
	}
}

export class ActionDecipherWriting extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'decipherWriting', mode: 'exploration', gmActs: false,
			checkType: 'skill',
			traits: ['exploration', 'concentrate', 'secret'],
			icon: "systems/pf2e/icons/spells/pact-broker.webp",
			tags: ['learning'],
			actionGlyph: '',
			dc: 15
		})
	}
}

export class ActionGatherInformation extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'gatherInformation', mode: 'exploration', gmActs: false,
			checkType: 'skill[diplomacy,society,survival]',
			traits: ['exploration', 'secret'],
			icon: "systems/pf2e/icons/spells/resplendent-mansion.webp",
			tags: ['social'],
			actionGlyph: '',
			dc: 15
		})
	}
}

export class ActionIdentifyAlchemy extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'identifyAlchemy', mode: 'exploration',gmActs: false,
			checkType: 'skill[crafting]',
			traits: ['exploration', 'concentrate', 'secret'],
			icon: "systems/pf2e/icons/spells/sanctified-ground.webp",
			tags: ['learning'],
			actionGlyph: '',
			dc: 15
		})
	}
	
	pertinent(engagement, warn) {
		const ok = super.pertinent(engagement, warn)
		return ok && new Equipments(engagement.initiator).hasAny(EQU_ALCHEMISTS_TOOLS).length > 0
	}
}

export class ActionIdentifyMagic extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'identifyMagic', mode: 'exploration', gmActs: false,
			checkType: 'skill[arcana,nature,occultism,religion]',
			traits: ['exploration', 'concentrate', 'secret'],
			icon: "systems/pf2e/icons/spells/unrelenting-observation.webp",
			tags: ['learning'],
			actionGlyph: '',
			dc: 15
		})
	}
}

export class ActionImpersonate extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'impersonate', mode: 'exploration', gmActs: false,
			checkType: 'skill[deception]',
			traits: ['exploration', 'concentrate', 'secret', 'manipulate'],
			icon: "systems/pf2e/icons/spells/illusory-disguise.webp",
			tags: ['situational'],
			actionGlyph: '',
			targetCount: 2,
			opposition: 'enemy',
			dc: t => t.actor.perception.dc.value
		})
	}
}

export class ActionLearnASpell extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'learnASpell', mode: 'exploration',
			checkType: 'skill[arcana,nature,occultism,religion]',
			traits: ['exploration', 'concentrate'],
			icon: "systems/pf2e/icons/spells/timely-tutor.webp",
			tags: ['learning'],
			actionGlyph: '',
			dc: 15
		})
	}
}

export class ActionMakeAnImpression extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'impersonate', mode: 'exploration',
			traits: ['exploration', 'concentrate', 'auditory', 'linguistic', 'mental'],
			checkType: 'skill[diplomacy]',
			icon: "systems/pf2e/icons/spells/entrancing-eyes.webp",
			tags: ['social'],
			actionGlyph: '',
			targetCount: 2,
			opposition: 'enemy',
			dc: t => t.actor.saves.will.dc.value,
		})
	}
}

export class ActionSenseDirection extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'senseDirection', mode: 'exploration', gmActs: false,
			checkType: 'skill[survival]',
			traits: ['exploration', 'secret'],
			icon: "systems/pf2e/icons/spells/gravity-weapon.webp",
			tags: ['situational'],
			actionGlyph: '',
			dc: 15
		})
	}
}

export class ActionSqueeze extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'squeeze', mode: 'exploration',
			checkType: 'skill[acrobatics]',
			traits: ['exploration', 'move'],
			icon: "systems/pf2e/icons/spells/abundant-step.webp",
			tags: ['situational'],
			actionGlyph: '',
			dc: 15
		})
	}
}

export class ActionTrack extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'track', mode: 'exploration',
			checkType: 'skill[survival]',
			traits: ['exploration', 'move', 'concentrate'],
			icon: "systems/pf2e/icons/spells/locate.webp",
			tags: ['situational'],
			actionGlyph: '',
			dc: 15
		})
	}
}

export class ActionCreateForgery extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'createForgery', mode: 'downtime', gmActs: false,
			checkType: 'skill[society]',
			traits: ['downtime', 'secret'],
			icon: "systems/pf2e/icons/spells/crusade.webp",
			tags: ['situational'],
			actionGlyph: '',
			dc: 15
		})
	}
}

export class ActionSubsist extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'subsist',
			checkType: 'skill[society,survival]',
			traits: ['downtime'],
			icon: "systems/pf2e/icons/spells/curse-of-lost-time.webp",
			tags: ['situational'],
			actionGlyph: '',
			mode: 'downtime',
			dc: 15
		})
	}
}

