import {default as i18n} from "../../lang/pf2e-i18n.js"
import Action from "../action.js"
import Effect, { EFFECT_RAISE_A_SHIELD } from "../model/effect.js"
import { Engagement } from "../model/engagement.js"

export default class ActionRaiseAShield extends Action {

	constructor(MKS) {
		super(MKS, 'raiseAShield', 'encounter', false, false, {
			icon: "systems/pf2e/icons/actions/raise-a-shield.webp",
			actionGlyph: 'A',
			tags: ['combat']
		})
	}

	relevant(warn) {
		const selected = this._.ensureOneSelected(warn)
		if (!selected)
			return
		const engagement = new Engagement(selected)

		const shield = engagement.initiator.actor.heldShield
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
		return shieldOk ? engagement : undefined
	}
	
	async apply(engagement) {
		new Effect(engagement.initiator, EFFECT_RAISE_A_SHIELD).toogle().then(()=> {
			engagement.initiator.actor.heldShield?.toChat().then()
		})
	}
}