import {default as LOG} from "../../utils/logging.js"
import {SYSTEM} from "../constants.js"

export class Engagement {
	constructor(selected) {
		this.selected = selected && selected.controlled ? selected : null
	}

	get exists() {
		return false
	}

	get isAlly() {}

	get isEnemy() {
		return !this.isAlly
	}

	get inMeleeRange() {}
}

export class OneToOneEngagement {
	constructor(selected, targeted) {
		super(selected)
		this.targeted = targeted && targeted.actor ? targeted : null
	}

	get exists() {
		return !!this.targeted
	}

	
	get isAlly() {
		return this.selected.actor.alliance === this.targeted.actor.alliance
	}

	get inMeleeRange() {

	}
}

export class OneToManyEngagement {
	constructor(selected, targetedOnes) {
		super(selected)
		if (Array.isArray(targetedOnes)) {
			let valid = true
			targetedOnes.forEach((t) => {if (!t.actor) valid = false} )
			this.targetedOnes = valid ? targetedOnes : []
		}
		else
			this.targetedOnes = []
	}

	get exists() {
		return this.targetedOnes.length > 0
	}

	
	get isAlly() {
		return this.selected.actor.alliance === this.targeted.actor.alliance
	}

	get inMeleeRange() {

	}
}