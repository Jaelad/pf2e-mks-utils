import CommonUtils from "../helpers/common-utils.js"
import Condition from "./condition.js"
import Effect from "./effect.js"
import Item from "./item.js"

export class Engagement {
	constructor(initiator, targeted) {
		this.initiator = initiator && initiator.actor ? initiator : null
		if (!initiator)
			throw new Error("Cannot create an engagement without initiator token!")
		this.targeted = targeted && targeted.actor ? targeted : null
	}

	static from(participants) {
		const init = participants.initiator, targeted = participants.targeted ?? []
		const initiatorToken = CommonUtils.getTokenById(init)
		const targetedTokens = targeted.map(tId => CommonUtils.getTokenById(tId))

		if (!initiatorToken || targetedTokens.length !== targeted.length)
			return

		if (targetedTokens.length < 2)
			return new Engagement(initiatorToken, targetedTokens.length === 1 ? targetedTokens[0] : undefined)
		else
			return new Engagements(initiatorToken, targetedTokens)
	}

	get participants() {
		return {initiator: this.initiator.id, targeted: this.targeted ? [this.targeted.id] : []}
	}

	get targetExists() {
		return this.opponentCount > 0
	}

	get targets() {
		return [this.targeted]
	}
	
	get opponentCount() {
		return !!this.targeted ? 1 : 0
	}
	
	get isAlly() {
		if (!this.targetExists)
			return
		return this.initiator.actor.alliance === this.targeted.actor.alliance
	}
	
	get isEnemy() {
		let ally = this.isAlly
		return ally === undefined ? undefined : !ally
	}
	
	distance(reachOpts) { // {action: "attack"}
		if (!this.targetExists)
			return
		const reach = this.initiator.actor.getReach(reachOpts)
		return this.initiator.distanceTo(this.targeted, {reach})
	}

	get inMeleeRange() {
		return this.distance({action: "attack"}) === 0
	}
	
	get isAdjacent() {
		return this.distance() === 0
	}
	
	getTargetDC(dcFunc) {
		if (!this.targetExists)
			return
		return dcFunc(this.targeted)
	}

	hasInitiatorCondition(condition, any = true) {
		if (Array.isArray(condition))
			return Item[any ? 'hasAny' : 'hasAll'](this.initiator, condition)
		else
			return new Condition(this.targeted, condition).exists
	}

	hasTargetCondition(condition, any = true) {
		if (Array.isArray(condition))
			return Item[any ? 'hasAny' : 'hasAll'](this.targeted, condition)
		else
			return new Condition(this.targeted, condition).exists
	}
	
	async setConditionOnInitiator(condition) {
		return new Condition(this.initiator, condition).ensure()
	}

	async setConditionOnTarget(condition) {
		return new Condition(this.targeted, condition).ensure()
	}

	async setEffectOnInitiator(effect) {
		return new Effect(this.initiator, effect).ensure()
	}

	async setEffectOnTarget(effect) {
		return new Effect(this.targeted, effect).ensure()
	}

	get sizeDifference() {
		return this.initiator.actor.system.traits.size.difference(this.targeted.actor.system.traits.size)
	}
}

export class Engagements extends Engagement {
	constructor(initiator, targetedOnes) {
		super(initiator)
		if (Array.isArray(targetedOnes)) {
			let valid = true
			targetedOnes.forEach((t) => {if (!t.actor) valid = false} )
			this.engagements = valid ? targetedOnes.map(t => new Engagement(initiator, t)) : []
		}
		else
			this.engagements = []
	}

	get participants() {
		return {initiator: this.initiator.id, targeted: this.targetedOnes.map(t => t.id)}
	}

	get targets() {
		return this.engagements?.map(e => e.targeted)
	}

	get targetExists() {
		return this.engagements.length > 0
	}
	
	get opponentCount() {
		return this.engagements.length
	}
	
	get isAlly() {
		return this.engagements.every( e => e.isAlly())
	}

	get inMeleeRange() {
		return this.engagements.every( e => e.inMeleeRange)
	}
	
	get isAdjacent() {
		return this.engagements.every( e => e.isAdjacent)
	}
	
	getTargetDC(dcFunc) {
		return this.engagements.reduce((p,e)=> {
			const dc = dcFunc(e.targeted)
			return p > dc ? p : dc
		}, 0)
	}

	hasTargetCondition(condition, any = true) {
		return this.engagements.every( e => e.hasTargetCondition(condition, any))
	}
	
	async setConditionOnTarget(condition) {
		for (const en of this.engagements)
			await en.setConditionOnTarget(condition)
	}

	get sizeDifference() {
		return this.engagements.reduce( (c, v) => Math.min(c, e.sizeDifference))
	}
}