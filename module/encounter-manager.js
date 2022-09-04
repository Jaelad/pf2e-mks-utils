import Compendium from "./compendium.js"
import {default as i18n} from "../lang/pf2e-helper.js"
import {default as LOG} from "../utils/logging.js"

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
}