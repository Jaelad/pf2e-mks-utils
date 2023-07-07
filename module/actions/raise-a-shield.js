import {default as i18n} from "../../lang/pf2e-i18n.js"
import Action from "../action.js"
import Effect, { EFFECT_RAISE_A_SHIELD } from "../model/effect.js"
import { Engagement } from "../model/engagement.js"

export default class ActionRaiseAShield extends Action {

	constructor(MKS) {
		super(MKS, 'raiseAShield', 'encounter', false, false, {
			icon: "systems/pf2e/icons/actions/raise-a-shield.webp",
			actionGlyph: 'A',
			tags: ['combat'],
		})
	}

	pertinent(engagement, warn) {
		const selected = engagement.initiator
		const shield = selected.actor.heldShield
		let shieldOk = false
		if (shield?.isBroken === false) {
			shieldOk = true
		}
		else if (shield?.isBroken) {
			if (warn) this._.warn(i18n.$$('PF2E.Actions.RaiseAShield.ShieldIsBroken', {actor: selected.actor.name, shield: shield.name}))
			shieldOk = false
		}
		else {
			if (warn)this._.warn(i18n.$$('PF2E.Actions.RaiseAShield.NoShieldEquipped', {actor: selected.actor.name}))
			shieldOk = false
		}
		return shieldOk
	}

	async act(engagement, options) {
		new Effect(engagement.initiator, EFFECT_RAISE_A_SHIELD).toogle().then(()=> {
			engagement.initiator.actor.heldShield?.toChat().then()
		})
	}
}