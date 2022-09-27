import Compendium from "./compendium.js"
import {default as i18n} from "../lang/pf2e-helper.js"
import {default as LOG} from "../utils/logging.js"
import {ATTITUDES} from "./constants.js"
import RelativeCondPanel from "./apps/relative-cond-panel.js"

export default class EncounterManager {
	constructor(MKS) {
		this._ = MKS
	}

	tokensTurnInCombat(token) {
		return token.inCombat && token.combatant.encounter.started && token.combatant.encounter.current.tokenId === token.id
	}

	onCheckRoll(token, checkRoll, pf2e) {
		const traits = pf2e.context?.traits
		const attackTrait = traits?.find(t => t.name === "attack")
		if (attackTrait && this.tokensTurnInCombat(token)) {
			LOG.info(`Applying MAP to ${token.name}`)
			this._.effectManager.setEffect(token, Compendium.EFFECT_MULTIPLE_ATTACK, {badgeMod: {increment:1}}).then()
		}

		const aided = pf2e.modifiers.find(mod => mod.slug === 'aided')
		if (aided)
			this._.effectManager.removeEffect(token, Compendium.EFFECT_AIDED).then()
	}

	async onCreateEffect(effect, options, userId) {
	}

	async onStartTurn(combatant) {
		await this._.effectManager.removeEffect(combatant.actor, Compendium.EFFECT_MULTIPLE_ATTACK)
		
		await this.applyRelativeConditions(combatant)
		RelativeCondPanel.rerender()
	}
	
	async onEndTurn(combatant) {
		await this._.effectManager.removeEffect(combatant.actor, Compendium.EFFECT_MULTIPLE_ATTACK)

		LOG.info("Round : " +  combatant.encounter.round + " Turn : " + combatant.encounter.turn)

		const effects = combatant.actor.itemTypes.effect
		effects.forEach(effect => {
			LOG.info(`Effect '${effect.name} : ${effect?.remainingDuration?.remaining}`)
			if (effect.slug === 'effect-grabbing') {
				if (effect?.remainingDuration?.remaining === 0) {
					const grabbedTokenId = effect.flags?.mks?.grapple?.grabbed
					grabbedTokenId && this._.actions.grapple.onGrabbingExpired(grabbedTokenId)
				}
			}
		})
	}
	
	async applyRelativeConditions(combatant) {
		const encounter = combatant.parent
		let relativeData = encounter.flags?.mks?.relative ?? {}
		let actorRelativeConds = relativeData?.[combatant.token.id], flagUpdate = false
		if (!actorRelativeConds) {
			actorRelativeConds = {}
			relativeData[combatant.token.id] = actorRelativeConds
			flagUpdate = true
		}
		
		const combatants = Array.from(encounter.combatants)
		for (let i = 0; i < combatants.length; i++) {
			const c = combatants[i], tokenId = c.token.id
			await this._.effectManager.removeEffect(c.actor, Compendium.EFFECT_COVER)
			await this._.effectManager.removeCondition(c.actor, ['hidden', 'hostile', 'unfriendly', 'friendly', 'helpful'])
			
			if (c.actor.alliance === combatant.actor.alliance) continue
			
			const relativeConds = actorRelativeConds[tokenId]
			if (relativeConds.cover > -1) {
				const coverTaken = this._.effectManager.hasEffect(c.actor, 'cover-taken')
				const coverState = coverTaken ? relativeConds.cover === 2 ? 4 : 2 : relativeConds.cover
				if (coverState > 0)
					await this._.effectManager.setEffect(c.actor, Compendium.EFFECT_COVER, {badgeMod: {value: coverState}})
			}
			else {
				relativeConds.cover = 0
				flagUpdate = true
			}
			
			if (relativeConds.awareness > -1) {
				await c.token.update({hidden: relativeConds.awareness < 2})
				if (relativeConds.awareness === 2)
					await this._.effectManager.setCondition(c.actor, 'hidden')
			}
			else {
				relativeConds.awareness = c.token.hidden ? 1 : 3
				flagUpdate = true
			}
			
			if (relativeConds.attitude > -1) {
				if (relativeConds.attitude !== 2)
					await this._.effectManager.setCondition(c.actor, ATTITUDES[relativeConds.attitude])
			}
			else {
				relativeConds.attitude = 2
				flagUpdate = true
			}
		}
		
		if (flagUpdate)
			await encounter.update({"flags.mks.relative" : relativeData})
	}
	
	onEncounterStart(encounter) {
		const relative = {}
		const combatants = Array.from(encounter.combatants)
		for (let i = 0; i < combatants.length; i++) {
			let ref = combatants[i]
			let refRelative = relative[ref.token.id] = {}
			for (let j = 0; j < combatants.length; j++) {
				let target = combatants[j]
				if (ref.actor.alliance === target.actor.alliance) continue
				
				refRelative[target.token.id] = {cover: 0, awareness: target.token.hidden ? 1 : 3, attitude: 2}
			}
		}
		
		encounter.update({"flags.mks.relative" : relative})
		RelativeCondPanel.rerender()
	}
}