import {SYSTEM} from "../constants.js"
import CommonUtils from "../helpers/common-utils.js"

export default class RelativeConditions {
	constructor() {
		this.token = CommonUtils.getTokenById(game.combat?.combatant?.token.id)
		this.relative = game.combat?.flags?.[SYSTEM.moduleId]?.relative
		if (this.token && this.relative) {
			this.iseethem = this.relative[this.token.id]
			this.theyseeme = {}
			for (const refId in this.relative) {
				if (refId === this.token.id) continue
				for (const tId in this.relative[refId])
					if (tId === this.token.id)
						this.theyseeme[refId] = this.relative[refId][tId]
			}
		}
	}

	get isOk() {
		return !!this.token && !!this.relative && !!this.iseethem
	}

	get isChanged() {
		return !!this.relative.changed
	}

	getMyAwarenessOf(token) {
		return this.iseethem[token.id].awareness
	}

	getMyAttitudeToward(token) {
		return this.theyseeme[token.id].attitude
	}

	getMyCoverFrom(token) {
		return this.theyseeme[token.id].cover
	}

	
	getAwarenessTowardMe(token) {
		return this.theyseeme[token.id].awareness
	}

	getAttitudeTowardMe(token) {
		return this.iseethem[token.id].attitude
	}

	getCoverFromMe(token) {
		return this.iseethem[token.id].cover
	}

	setMyAwarenessOf(token, awareness) {
		this.iseethem[token.id].awareness = awareness
		this.relative.changed = true
	}

	setMyAttitudeToward(token, attitude) {
		this.theyseeme[token.id].attitude = attitude
		this.relative.changed = true
	}

	setMyCoverFrom(token, cover) {
		this.theyseeme[token.id].cover = cover
		this.relative.changed = true
	}

	setAwarenessTowardMe(token, awareness) {
		this.theyseeme[token.id].awareness = awareness
		this.relative.changed = true
	}

	setAttitudeTowardMe(token, attitude) {
		this.iseethem[token.id].attitude = attitude
		this.relative.changed = true
	}

	setCoverFromMe(token, cover) {
		this.iseethem[token.id].cover = cover
		this.relative.changed = true
	}

	get detectableTargets() {
		const detectables = []
		for (const tId in this.iseethem) {
			if (tId.awareness > 1)
				detectables.push(tId)
		}
		return detectables
	}

	getPerceptionDCs() {
		const result = []
		for (const tId of this.theyseeme) {
			const awareness = this.theyseeme[tId].awareness
			const cover = this.theyseeme[tId].cover
			
			if (awareness < 3) {
				const token = CommonUtils.getTokenById(tId)
				const dc = token.actor.perception.dc.value
				result.push({token, dc})
			}
		}
		return result
	}
	
}