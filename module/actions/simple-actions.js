import {SimpleAction, SystemAction} from "../action.js"
import Condition, {CONDITION_FLATFOOTED} from "../model/condition.js"
import Equipments, {EQU_ALCHEMISTS_TOOLS, EQU_THVS_TOOLS} from "../model/equipments.js"

export class ActionTumbleThrough extends SystemAction {

	constructor(MKS) {
		super(MKS, 'tumbleThrough', 'encounter', false, false, {
			icon: "systems/pf2e/icons/spells/unimpeded-stride.webp",
			tags: ['move'],
			actionGlyph: 'A',
			targetCount: 1,
			opposition: 'enemy',
			// checkType: 'skill[acrobatics]',
			// traits: ['move'],
			// dc: t => t.actor.saves.reflex.dc.value,
		})
	}
}

export class ActionSenseMotive extends SystemAction {
	constructor(MKS) {
		super(MKS, 'senseMotive', 'encounter', false, false, {
			icon: "systems/pf2e/icons/spells/enhance-senses.webp",
			tags: ['inspection'],
			actionGlyph: 'A',
			targetCount: 1,
			opposition: 'enemy',
			// checkType: 'perception',
			// traits: ["concentrate", "secret"],
			// dc: t => t.actor.skills.deception.dc.value,
		})
	}
}

export class ActionForceOpen extends SystemAction {
	constructor(MKS) {
		super(MKS, 'forceOpen', 'encounter', false, false, {
			icon: "systems/pf2e/icons/spells/forceful-hand.webp",
			tags: ['attack'],
			// checkType: 'skill[athletics]',
			// traits: ['attack'],
			dc: 15
		})
	}

	async act(engagement, options) {
		return super.act(engagement, {...options, applyMAP: true})
	}
}

export class ActionBalance extends SystemAction {
	constructor(MKS) {
		super(MKS, 'balance', 'encounter', false, false, {
			icon: "systems/pf2e/icons/spells/tempest-form.webp",
			tags: ['move'],
			// checkType: 'skill[acrobatics]',
			// traits: ['move'],
			dc: 15
		})
	}
}

export class ActionClimb extends SystemAction {
	constructor(MKS) {
		super(MKS, 'climb', 'encounter', false, false, {
			icon: "systems/pf2e/icons/spells/rope-trick.webp",
			tags: ['move'],
			// checkType: 'skill[athletics]',
			// traits: ['move'],
			dc: 15
		})
	}
}

export class ActionGrabAnEdge extends SystemAction {
	constructor(MKS) {
		super(MKS, 'grabAnEdge', 'encounter', false, false, {
			icon: "systems/pf2e/icons/spells/object-reading.webp",
			tags: ['situational'],
			actionGlyph: 'R',
			// checkType: 'reflex',
			// traits: ['manipulate'],
			dc: 15
		})
	}
}

export class ActionHighJump extends SystemAction {
	constructor(MKS) {
		super(MKS, 'highJump', 'encounter', false, false, {
			icon: "systems/pf2e/icons/spells/wind-jump.webp",
			tags: ['move'],
			actionGlyph: 'D',
			// checkType: 'skill[athletics]',
			// traits: ['move'],
			dc: 15
		})
	}
}

export class ActionLongJump extends SystemAction {
	constructor(MKS) {
		super(MKS, 'longJump', 'encounter', false, false, {
			icon: "systems/pf2e/icons/spells/jump.webp",
			tags: ['move'],
			actionGlyph: 'D',
			// checkType: 'skill[athletics]',
			// traits: ['move'],
			dc: 15
		})
	}
}

export class ActionSwim extends SystemAction {
	constructor(MKS) {
		super(MKS, 'swim', 'encounter', false, false, {
			icon: "systems/pf2e/icons/spells/waters-of-prediction.webp",
			tags: ['move'],
			// checkType: 'skill[athletics]',
			// traits: ['move'],
			dc: 15
		})
	}
}

export class ActionLie extends SystemAction {
	constructor(MKS) {
		super(MKS, 'lie', 'encounter', false, false, {
			icon: "systems/pf2e/icons/spells/glibness.webp",
			tags: ['social'],
			actionGlyph: 'T',
			targetCount: 2,
			opposition: 'enemy',
			// checkType: 'skill[deception]',
			// traits: ['concentrate', 'auditory', 'linguistic', 'mental', 'secret'],
			// dc: t => t.actor.perception.dc.value,
		})
	}
}

export class ActionFeint extends SystemAction {
	constructor(MKS) {
		super(MKS, 'feint', 'encounter', false, true, {
			icon: "systems/pf2e/icons/spells/mislead.webp",
			tags: ['mental'],
			actionGlyph: 'A',
			targetCount: 1,
			opposition: 'enemy',
			// checkType: 'skill[deception]',
			// traits: ['mental'],
			// dc: t => t.actor.perception.dc.value
		})
	}
	
	pertinent(engagement, warn) {
		const melee = engagement.inMeleeRange
		if (warn && !melee)
			this._.warn("PF2E.Actions.Warning.Reach")
		return melee
	}
	
	async apply(engagement, result) {
		await super.apply(engagement, result)
		
		const roll = result.roll
		if (roll.degreeOfSuccess > 1)
			return engagement.setConditionOnTarget(CONDITION_FLATFOOTED)
		else if (roll.degreeOfSuccess < 1)
			return engagement.setConditionOnSelected(CONDITION_FLATFOOTED)
	}
}

export class ActionRequest extends SystemAction {
	constructor(MKS) {
		super(MKS, 'request', 'encounter', false, false, {
			icon: "systems/pf2e/icons/spells/miracle.webp",
			tags: ['social'],
			actionGlyph: 'A',
			targetCount: 1,
			// checkType: 'skill[diplomacy]',
			// traits: ['mental', 'concentrate', 'auditory', 'linguistic'],
			dc: 15
		})
	}
}

export class ActionCommandAnAnimal extends SystemAction {
	constructor(MKS) {
		super(MKS, 'commandAnAnimal', 'encounter', false, false, {
			icon: "systems/pf2e/icons/spells/awaken-animal.webp",
			tags: ['combat'],
			actionGlyph: 'A',
			targetCount: 1,
			opposition: 'ally',
			// checkType: 'skill[nature]',
			// traits: ['concentrate', 'auditory'],
			dc: 15
		})
	}
	
	pertinent(engagement, warn) {
		const animal = engagement.targetHasTrait('animal')
		if (warn && !animal)
			this._.warn("PF2E.MKS.Warning.Target.WrongType")
		return animal
	}
}

export class ActionPerform extends SystemAction {
	constructor(MKS) {
		super(MKS, 'perform', 'encounter', false, false, {
			icon: "systems/pf2e/icons/features/classes/magnum-opus.webp",
			tags: ['social'],
			actionGlyph: 'A',
			// checkType: 'skill[performance]',
			// traits: ['concentrate'],
			dc: 15
		})
	}
}

export class ActionConcealAnObject extends SystemAction {
	constructor(MKS) {
		super(MKS, 'concealAnObject', 'encounter', false, false, {
			icon: "systems/pf2e/icons/spells/umbral-mindtheft.webp",
			tags: ['stealth'],
			actionGlyph: 'A',
			targetCount: 2,
			opposition: 'enemy',
			// checkType: 'skill[stealth]',
			// traits: ['manipulate', 'secret'],
			// dc: t => t.actor.perception.dc.value
		})
	}
}

export class ActionPalmAnObject extends SystemAction {
	constructor(MKS) {
		super(MKS, 'palmAnObject', 'encounter', false, false, {
			icon: "systems/pf2e/icons/spells/quivering-palm.webp",
			tags: ['stealth'],
			actionGlyph: 'A',
			targetCount: 2,
			opposition: 'enemy',
			// checkType: 'skill[thievery]',
			// traits: ['manipulate'],
			// dc: t => t.actor.perception.dc.value
		})
	}
}

export class ActionSteal extends SystemAction {
	constructor(MKS) {
		super(MKS, 'steal', 'encounter', false, false, {
			icon: "systems/pf2e/icons/spells/mending.webp",
			tags: ['stealth'],
			actionGlyph: 'A',
			targetCount: 1,
			opposition: 'enemy',
			// checkType: 'skill[thievery]',
			// traits: ['manipulate'],
			dc: 15
		})
	}
}

export class ActionPickALock extends SystemAction {
	constructor(MKS) {
		super(MKS, 'pickALock', 'encounter', false, false, {
			icon: "systems/pf2e/icons/spells/freedom.webp",
			tags: ['stealth'],
			actionGlyph: 'D',
			// checkType: 'skill[thievery]',
			// traits: ['manipulate'],
			dc: 15
		})
	}
	
	pertinent(engagement, warn) {
		const thievesTools = new Equipments(engagement.initiator).hasEquippedAny(EQU_THVS_TOOLS).length > 0
		if (warn && !thievesTools)
			this._.warn("PF2E.MKS.Warning.Action.MustUseThievesTools")
		return thievesTools
	}
}

export class ActionDisableDevice extends SystemAction {
	constructor(MKS) {
		super(MKS, 'disableDevice', 'encounter', false, false, {
			icon: "systems/pf2e/icons/spells/visions-of-danger.webp",
			tags: ['stealth'],
			actionGlyph: 'D',
			// checkType: 'skill[thievery]',
			// traits: ['manipulate'],
			dc: 15
		})
	}

	pertinent(engagement, warn) {
		const thievesTools = new Equipments(engagement.initiator).hasEquippedAny(EQU_THVS_TOOLS).length > 0
		if (warn && !thievesTools)
			this._.warn("PF2E.MKS.Warning.Action.MustUseThievesTools")
		return thievesTools
	}
}

export class ActionAvoidNotice extends SystemAction {
	constructor(MKS) {
		super(MKS, 'avoidNotice', 'exploration', false, false, {
			icon: "systems/pf2e/icons/spells/pass-without-trace.webp",
			tags: ['move'],
			actionGlyph: '',
			// checkType: 'skill[stealth]',
			// traits: ['exploration'],
			dc: 15
		})
	}
}

export class ActionBorrowAnArcaneSpell extends SystemAction {
	constructor(MKS) {
		super(MKS, 'borrowAnArcaneSpell', 'exploration', false, false, {
			icon: "systems/pf2e/icons/spells/message.webp",
			tags: ['preparation'],
			actionGlyph: '',
			// checkType: 'skill[arcana]',
			// traits: ['exploration', 'concentrate'],
			dc: 15
		})
	}
}

export class ActionCoerce extends SystemAction {
	constructor(MKS) {
		super(MKS, 'coerce', 'exploration', false, false, {
			icon: "systems/pf2e/icons/spells/inveigle.webp",
			tags: ['social'],
			actionGlyph: '',
			// checkType: 'skill[intimidation]',
			// traits: ['exploration', 'concentrate', 'auditory', 'emotion', 'linguistic', 'mental'],
			dc: 15
		})
	}
}


export class ActionCoverTracks extends SystemAction {
	constructor(MKS) {
		super(MKS, 'coverTracks', 'exploration', false, false, {
			icon: "systems/pf2e/icons/spells/unseen-servant.webp",
			tags: ['move'],
			actionGlyph: '',
			// checkType: 'skill[survival]',
			// traits: ['exploration', 'concentrate', 'move'],
			dc: 15
		})
	}
}

export class ActionDecipherWriting extends SystemAction {
	constructor(MKS) {
		super(MKS, 'decipherWriting', 'exploration', false, false, {
			icon: "systems/pf2e/icons/spells/pact-broker.webp",
			tags: ['learning'],
			actionGlyph: '',
			// checkType: 'skill',
			// traits: ['exploration', 'concentrate', 'secret'],
			dc: 15
		})
	}
}

export class ActionGatherInformation extends SystemAction {
	constructor(MKS) {
		super(MKS, 'gatherInformation', 'exploration', false, false, {
			icon: "systems/pf2e/icons/spells/resplendent-mansion.webp",
			tags: ['social'],
			actionGlyph: '',
			// checkType: 'skill[diplomacy,society,survival]',
			// traits: ['exploration', 'secret'],
			dc: 15
		})
	}
}

export class ActionIdentifyAlchemy extends SystemAction {
	constructor(MKS) {
		super(MKS, 'identifyAlchemy', 'exploration', false, false, {
			icon: "systems/pf2e/icons/spells/sanctified-ground.webp",
			tags: ['learning'],
			actionGlyph: '',
			// checkType: 'skill[crafting]',
			// traits: ['exploration', 'concentrate', 'secret'],
			dc: 15
		})
	}
	
	pertinent(engagement, warn) {
		const alchTools = new Equipments(engagement.initiator).hasEquippedAny(EQU_ALCHEMISTS_TOOLS).length > 0
		if (warn && !alchTools)
			this._.warn("PF2E.MKS.Warning.Action.MustUseAlchemistsTools")
		return alchTools
	}
}

export class ActionIdentifyMagic extends SystemAction {
	constructor(MKS) {
		super(MKS, 'identifyMagic', 'exploration', false, false, {
			icon: "systems/pf2e/icons/spells/unrelenting-observation.webp",
			tags: ['learning'],
			actionGlyph: '',
			// checkType: 'skill[arcana,nature,occultism,religion]',
			// traits: ['exploration', 'concentrate', 'secret'],
			dc: 15
		})
	}
}

export class ActionImpersonate extends SystemAction {
	constructor(MKS) {
		super(MKS, 'impersonate', 'exploration', false, false, {
			icon: "systems/pf2e/icons/spells/illusory-disguise.webp",
			tags: ['situational'],
			actionGlyph: '',
			targetCount: 2,
			opposition: 'enemy',
			// checkType: 'skill[deception]',
			// traits: ['exploration', 'concentrate', 'secret', 'manipulate'],
			// dc: t => t.actor.perception.dc.value
		})
	}
}

export class ActionLearnASpell extends SystemAction {
	constructor(MKS) {
		super(MKS, 'learnASpell', 'exploration', false, false, {
			icon: "systems/pf2e/icons/spells/timely-tutor.webp",
			tags: ['learning'],
			actionGlyph: '',
			// checkType: 'skill[arcana,nature,occultism,religion]',
			// traits: ['exploration', 'concentrate'],
			dc: 15
		})
	}
}

export class ActionMakeAnImpression extends SystemAction {
	constructor(MKS) {
		super(MKS, 'makeAnImpression', 'exploration', false, false, {
			icon: "systems/pf2e/icons/spells/entrancing-eyes.webp",
			tags: ['social'],
			actionGlyph: '',
			targetCount: 1,
			// checkType: 'skill[diplomacy]',
			// traits: ['exploration', 'concentrate', 'auditory', 'linguistic', 'mental'],
			// dc: t => t.actor.saves.will.dc.value,
		})
	}
}

export class ActionSenseDirection extends SystemAction {
	constructor(MKS) {
		super(MKS, 'senseDirection', 'exploration', false, false, {
			icon: "systems/pf2e/icons/spells/gravity-weapon.webp",
			tags: ['situational'],
			actionGlyph: '',
			// checkType: 'skill[survival]',
			// traits: ['exploration', 'secret'],
			dc: 15
		})
	}
}

export class ActionSqueeze extends SystemAction {
	constructor(MKS) {
		super(MKS, 'squeeze', 'exploration', false, false, {
			icon: "systems/pf2e/icons/spells/abundant-step.webp",
			tags: ['move'],
			actionGlyph: '',
			// checkType: 'skill[acrobatics]',
			// traits: ['exploration', 'move'],
			dc: 15
		})
	}
}

export class ActionTrack extends SystemAction {
	constructor(MKS) {
		super(MKS, 'track', 'exploration', false, false, {
			icon: "systems/pf2e/icons/spells/locate.webp",
			tags: ['move'],
			actionGlyph: '',
			// checkType: 'skill[survival]',
			// traits: ['exploration', 'move', 'concentrate'],
			dc: 15
		})
	}
}

export class ActionCreateForgery extends SystemAction {
	constructor(MKS) {
		super(MKS, 'createForgery', 'downtime', false, false, {
			icon: "systems/pf2e/icons/spells/crusade.webp",
			tags: ['situational'],
			actionGlyph: '',
			// checkType: 'skill[society]',
			// traits: ['downtime', 'secret'],
			dc: 15
		})
	}
}

export class ActionSubsist extends SystemAction {
	constructor(MKS) {
		super(MKS, 'subsist', 'downtime', false, false, {
			icon: "systems/pf2e/icons/spells/curse-of-lost-time.webp",
			tags: ['situational'],
			actionGlyph: '',
			// checkType: 'skill[society,survival]',
			// traits: ['downtime'],
			dc: 15
		})
	}
}

