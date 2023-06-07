import {default as LOG} from "../../utils/logging.js"
import {SYSTEM} from "../constants.js"
import CommonUtils from "../helpers/common-utils.js"
import DCHelper from "../helpers/dc-helper.js"

export class Engagement {
	constructor(selected, targeted) {
		this.selected = selected && selected.actor ? selected : null
		if (!selected)
			throw new Error("Cannot create an engagement without selected token!")
		this.targeted = targeted && targeted.actor ? targeted : null
	}

	static from(participants) {
		const selectedToken = CommonUtils.getTokenById(participants.selected)
		const targetedTokens = participants.targeted.map(tId => CommonUtils.getTokenById(tId))

		if (!selectedToken || targetedTokens. length !== participants.targeted)
			return

		if (targetedTokens.length < 2)
			return new Engagement(selectedToken, targetedTokens.length === 1 ? targetedTokens[0] : undefined)
		else
			return new Engagements(selectedToken, targetedTokens)
	}

	get participants() {
		return {selected: this.selected.id, targeted: this.targeted ? [this.targeted.id] : []}
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
		return this.selected.actor.alliance === this.targeted.actor.alliance
	}
	
	get isEnemy() {
		let ally = this.isAlly
		return ally === undefined ? undefined : !ally
	}
	
	distance(reachOpts) { // {action: "attack"}
		if (!this.targetExists)
			return
		const reach = this.selected.actor.getReach(reachOpts)
		return this.selected.distanceTo(this.targeted, {reach})
	}

	get inMeleeRange() {
		return this.distance({action: "attack"}) === 0
	}
	
	getTargetDC(dcFunc) {
		if (!this.targetExists)
			return
		return dcFunc(this.targeted)
	}
}

export class Engagements extends Engagement {
	constructor(selected, targetedOnes) {
		super(selected)
		if (Array.isArray(targetedOnes)) {
			let valid = true
			targetedOnes.forEach((t) => {if (!t.actor) valid = false} )
			this.engagements = valid ? targetedOnes.map(t => new Engagement(selected, t)) : []
		}
		else
			this.engagements = []
	}

	get participants() {
		return {selected: this.selected.id, targeted: this.targetedOnes.map(t => t.id)}
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
		return this.engagements.every( e => e.inMeleeRange())
	}
	
	getTargetDC(dcFunc) {
		return this.engagements.reduce((p,e)=> {
			const dc = dcFunc(e.targeted)
			return p > dc ? p : dc
		}, 0)
	}
}