import Compendium from "./compendium.js"
import {default as LOG} from "../utils/logging.js"
import {ATTITUDES, AWARENESS, SYSTEM} from "./constants.js"
import Condition, {Attitude, Awareness} from "./model/condition.js"
import Effect from "./model/effect.js"

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

		const aided = pf2e.modifiers.find(mod => mod.slug === "aided")
		if (aided)
			this._.effectManager.removeEffect(token, Compendium.EFFECT_AIDED).then()
	}

	async onCreateEffect(effect, options, userId) {
	}
	
	async onStartTurn(combatant) {
		await this._.effectManager.removeEffect(combatant.actor, Compendium.EFFECT_MULTIPLE_ATTACK)
		
		await this.applyRelativeConditions(combatant)
	}
	
	async onEndTurn(combatant) {
		await this._.effectManager.removeEffect(combatant.actor, Compendium.EFFECT_MULTIPLE_ATTACK)

		LOG.info("Round : " +  combatant.encounter.round + " Turn : " + combatant.encounter.turn)

		const effects = combatant.actor.itemTypes.effect
		effects.forEach(effect => {
			LOG.info(`Effect '${effect.name} : ${effect?.remainingDuration?.remaining}`)
			if (effect.slug === "effect-grabbing") {
				if (effect?.remainingDuration?.remaining === 0) {
					const grabbedTokenId = effect.flags?.mks?.grapple?.grabbed
					grabbedTokenId && this._.actions.grapple.onGrabbingExpired(grabbedTokenId)
				}
			}
		})
	}
	
	async onEncounterStart(encounter) {
		await this.syncRelativeConds(encounter)
	}
	
	async syncRelativeConds(encounterOrCombatant) {
		const relativeData = {}
		const encounter = encounterOrCombatant.combatants ? encounterOrCombatant : encounterOrCombatant.parent
		const combatants = encounterOrCombatant.combatants ? Array.from(encounterOrCombatant.combatants) : [encounterOrCombatant]
		for (const ref of combatants) {
			const rel = {}
			
			for (const other of encounter.combatants) {
				if (ref.actor.alliance === other.actor.alliance) continue
				const conds = {}
				rel[other.token.id] = conds
				
				conds.awareness = new Awareness(other.actor).stateIndex
				conds.attitude = new Attitude(other.actor).stateIndex
				
				const cover = new Effect(ref.actor, 'cover')
				conds.cover = cover.badgeValue ?? 0
			}
			relativeData[ref.token.id] = rel
		}
		
		await encounter.setFlag(SYSTEM.moduleId, "relative", relativeData)
	}
	
	async onEncounterEnd(encounter) {
		const combatants = Array.from(encounter.combatants)
		for (let i = 0; i < combatants.length; i++) {
			await this._.effectManager.removeEffect(combatants[i].actor, Compendium.EFFECT_COVER)
			await this._.effectManager.removeCondition(combatants[i].actor, AWARENESS.concat(ATTITUDES))
		}
	}
	
	async applyCover(combatant, targetCombatant, cover) {
		const coverTaken = this._.effectManager.hasEffect(targetCombatant.actor, "effect-cover-taken")
		const coverState = cover === 2 ? (coverTaken ? 3 : 2) : cover
		if (coverState > 0)
			await this._.effectManager.setEffect(targetCombatant.actor, Compendium.EFFECT_COVER, {badgeMod: {value: coverState}})
		else
			await this._.effectManager.removeEffect(targetCombatant.actor, Compendium.EFFECT_COVER)
	}
	
	async applyAwareness(combatant, targetCombatant, awareness) {
		await this._.effectManager.removeCondition(targetCombatant.actor, AWARENESS)
		if (awareness !== 3)
			await this._.effectManager.setCondition(targetCombatant.actor, AWARENESS[awareness])
	}
	
	async applyAttitude(combatant, targetCombatant, attitude) {
		await this._.effectManager.removeCondition(targetCombatant.actor, ATTITUDES)
		if (attitude !== 2)
			await this._.effectManager.setCondition(targetCombatant.actor, ATTITUDES[attitude])
	}
	
	async applyRelativeConditions(combatant) {
		const encounter = combatant.parent
		let relativeData = encounter.flags?.[SYSTEM.moduleId]?.relative ?? {}
		let actorRelativeConds = relativeData?.[combatant.token.id]
		
		const combatants = Array.from(encounter.combatants)
		for (let i = 0; i < combatants.length; i++) {
			const c = combatants[i], tokenId = c.token.id
			if (c.actor.alliance === combatant.actor.alliance) continue
			
			const relativeConds = actorRelativeConds[tokenId] ?? {cover: 0, awareness: 3, attitude: 2}
			
			const cover = new Effect(c.actor, 'cover-taken')
			const coverTaken = new Effect(c.actor, 'cover')
			const awareness = new Awareness(c.actor)
			const attitude = new Attitude(c.actor)
			
			const coverState = coverTaken.exists ? relativeConds.cover === 2 ? 4 : 2 : relativeConds.cover
			if (coverState > 0)
				cover.ensure().then(() => {
					cover.badgeValue = coverState
				})
			
			awareness.setState(relativeConds.awareness).then()
			attitude.setState(relativeConds.attitude).then()
		}
	}
}