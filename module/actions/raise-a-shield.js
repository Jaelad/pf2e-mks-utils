import {default as i18n} from "../../lang/pf2e-i18n.js"
import Action from "../action.js"
import Effect, { EFFECT_RAISE_A_SHIELD } from "../model/effect.js"

export default class ActionRaiseAShield extends Action {

	async raiseAShield() {
		const {applicable, selected} = this.isApplicable(null,true)
		if (!applicable)
			return

		const raiseAShield = new Effect(selected, EFFECT_RAISE_A_SHIELD)
		if (raiseAShield.exists)
			await raiseAShield.purge()
		else {
			await raiseAShield.ensure()
			selected.actor.heldShield.toChat().then()
		}
	}

	methods(onlyApplicable) {
		const {applicable} = this.isApplicable()
		return !onlyApplicable || applicable ? [{
			method: "raiseAShield",
			label: i18n.action("raiseAShield"),
			icon: "systems/pf2e/icons/actions/raise-a-shield.webp",
			action: 'A',
			mode: "encounter",
			tags: ['combat']
		}] : []
	}

	isApplicable(method=null, warn=false) {
		let selected = this._.ensureOneSelected(warn)

		const shield = selected?.actor.heldShield
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

		return {applicable: shieldOk, selected}
	}
}