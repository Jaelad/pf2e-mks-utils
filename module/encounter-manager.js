import {default as LOG} from "../utils/logging.js"
import RelativeCondPanel from "./apps/relative-cond-panel.js"
import {ATTITUDES, AWARENESS, SYSTEM} from "./constants.js"
import Condition, {Attitude, Awareness} from "./model/condition.js"
import Effect, { EFFECT_AIDED, EFFECT_COVER, EFFECT_COVER_TAKEN, EFFECT_MAP } from "./model/effect.js"
import Item from "./model/item.js"

export default class EncounterManager {
	constructor(MKS) {
		this._ = MKS
	}

	tokensTurnInCombat(token) {
		return token.inCombat && token.combatant.encounter.started && token.combatant.encounter.current.tokenId === token.id
	}

	async onCreateEffect(item) {

	}

	onCheckRoll(token, checkRoll, pf2e) {
		// const traits = pf2e.context?.traits
		// const attackTrait = traits?.find(t => t.name === "attack")
		// if (attackTrait && this.tokensTurnInCombat(token)) {
		// 	LOG.info(`Applying MAP to ${token.name}`)
		// 	const map = new Effect(token, EFFECT_MAP)
		// 	if (map.exists)
		// 		map.setBadgeValue(1, 'inc').then()
		// 	else
		// 		map.ensure().then()
		// }

		// const aided = pf2e.modifiers.find(mod => mod.slug === "aided")
		// if (aided)
		// 	new Effect(token, EFFECT_AIDED).purge()
	}
	
	async onStartTurn(combatant) {
		// await new Effect(combatant.actor, EFFECT_MAP).purge()
		
		await this.applyRelativeConditions(combatant)
	}
	
	async onEndTurn(combatant) {
		// await new Effect(combatant.actor, EFFECT_MAP).purge()

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
		await this.syncRelativeConds(encounter, false)
	}
	
	async syncRelativeConds(encounterOrCombatant, onlyOnTurn = true) {
		const encounter = encounterOrCombatant?.combatants ? encounterOrCombatant : encounterOrCombatant?.encounter
		if (!encounter) return
		const combatants = encounter.combatants
		const relativeData = {}
		for (const ref of combatants) {
			if (onlyOnTurn && ref.encounter.combatant.id !== ref.id)
				continue
			const rel = {}
			
			for (const other of combatants) {
				if (ref.actor.alliance === other.actor.alliance) continue
				const conds = {}
				rel[other.token.id] = conds
				
				conds.awareness = other.token.hidden ? 0 : new Awareness(other.actor).stateIndex
				conds.attitude = new Attitude(other.actor).stateIndex
				
				const cover = new Effect(ref.actor, EFFECT_COVER)
				conds.cover = cover.badgeValue ?? 0
			}
			relativeData[ref.token.id] = rel
		}
		
		await encounter.setFlag(SYSTEM.moduleId, "relative", relativeData).then(() => {
			RelativeCondPanel.rerender()
		})
	}
	
	async onEncounterEnd(encounter) {
		const combatants = Array.from(encounter.combatants)
		for (let i = 0; i < combatants.length; i++) {
			new Effect(combatants[i].actor, EFFECT_COVER).purge()
			Item.purgeAll(combatants[i].actor, AWARENESS.concat(ATTITUDES))
		}
	}
	
	async applyCover(combatant, targetCombatant, coverValue) {
		const coverTaken = new Effect(targetCombatant.actor, EFFECT_COVER_TAKEN)
		const coverState = coverTaken.exists ? coverValue === 2 ? 3 : coverValue : coverValue
		const cover = new Effect(targetCombatant.actor, EFFECT_COVER)

		if (coverState > 0)
			return cover.ensure().then(() => {
				cover.setBadgeValue(coverState)
			})
		else
			return cover.purge()
	}
	
	async applyAwareness(combatant, targetCombatant, awareness) {
		return new Awareness(targetCombatant.actor).setStateAsync(awareness)
	}
	
	async applyAttitude(combatant, targetCombatant, attitude) {
		return new Attitude(targetCombatant.actor).setStateAsync(attitude)
	}
	
	async applyRelativeConditions(combatant) {
		const encounter = combatant.parent
		let relativeData = encounter.flags?.[SYSTEM.moduleId]?.relative ?? {}
		let actorRelativeConds = relativeData?.[combatant.token.id]
		
		const combatants = Array.from(encounter.combatants)
		for (let i = 0; i < combatants.length; i++) {
			const c = combatants[i], tokenId = c.token.id
			if (c.actor.alliance === combatant.actor.alliance) {
				await Item.purgeAll(c.actor, [...ATTITUDES, ...AWARENESS])
				await new Effect(c.actor, EFFECT_COVER).purge()
				continue
			}
			
			const relativeConds = actorRelativeConds[tokenId] ?? {cover: 0, awareness: 3, attitude: 2}
			
			const cover = new Effect(c.actor, EFFECT_COVER)
			const coverTaken = new Effect(c.actor, EFFECT_COVER_TAKEN)
			const awareness = new Awareness(c.actor)
			const attitude = new Attitude(c.actor)
			
			const coverState = coverTaken.exists ? relativeConds.cover === 2 ? 3 : 2 : relativeConds.cover
			if (coverState > 0)
				cover.ensure().then(() => {
					cover.setBadgeValue(coverState)
				})
			
			awareness.setStateAsync(relativeConds.awareness).then()
			attitude.setStateAsync(relativeConds.attitude).then()
		}
	}
}