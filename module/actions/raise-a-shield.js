import {default as i18n} from "../../lang/pf2e-i18n.js"
import { SimpleAction } from "../action.js"
import Effect, { EFFECT_RAISE_A_SHIELD } from "../model/effect.js"

export default class ActionRaiseAShield extends SimpleAction {

	constructor(MKS) {
		super(MKS, { action: 'raiseAShield',
			icon: "systems/pf2e/icons/actions/raise-a-shield.webp",
			tags: ['combat'],
			actionGlyph: 'A',
			targetCount: 0
		})
	}

	pertinent(engagement, warn) {
		const shield = engagement.initiator?.actor.heldShield
		let shieldOk = false
		if (shield?.isBroken === false) {
			shieldOk = true
		}
		else if (shield?.isBroken) {
			if (warn) ui.notifications.warn(i18n.$$('PF2E.Actions.RaiseAShield.ShieldIsBroken', {actor: selected.actor.name, shield: shield.name}))
			shieldOk = false
		}
		else {
			if (warn) ui.notifications.warn(i18n.$$('PF2E.Actions.RaiseAShield.NoShieldEquipped', {actor: selected.actor.name}))
			shieldOk = false
		}
		return shieldOk
	}
	
	async act(engagement, options) {}

	async apply(engagement) {
		const raiseAShield = new Effect(engagement.initiator, EFFECT_RAISE_A_SHIELD)
		if (raiseAShield.exists)
			await raiseAShield.purge()
		else {
			await raiseAShield.ensure()
			engagement.initiator.actor.heldShield.toChat().then()
		}
	}
}