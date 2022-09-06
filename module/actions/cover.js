import {default as i18n} from "../../lang/pf2e-helper.js"
import {default as LOG} from "../../utils/logging.js"
import Action from "../action.js"
import Compendium from "../compendium.js"
import Check from "../check.js"
import {ROLL_MODE} from "../constants.js";

export default class ActionCover extends Action {

	takeCover(options = {}) {
		const {applicable, selected} = this.isApplicable('takeCover',true)
		if (!applicable)
			return

		if (this.effectManager.hasEffect(selected, Compendium.EFFECT_COVER))
			this.effectManager.setEffect(selected, Compendium.EFFECT_COVER, {badgeMod: {value: 4}}).then()
		else
			this.effectManager.setEffect(selected, Compendium.EFFECT_COVER, {changes: {"data.badge.value": 2}}).then()
	}

	giveCover(options = {}) {
		const {applicable, selected} = this.isApplicable('giveCover',true)
		if (!applicable)
			return

		this.effectManager.setEffect(selected, Compendium.EFFECT_COVER, {badgeMod: {multiply: 2}}).then()
	}

	methods(onlyApplicable) {
		const methods = []
		if (!onlyApplicable || this.isApplicable('takeCover').applicable) {
			methods.push({
				method: "takeCover",
				label: i18n.action("takeCover"),
				icon: "systems/pf2e/icons/conditions-2/status_acup.webp",
				action: 'A',
				mode: "encounter",
				tags: ['combat', 'stealth']
			})
		}
		if (!onlyApplicable || this.isApplicable( 'giveCover').applicable) {
			methods.push({
				method: "giveCover",
				label: i18n.action("giveCover"),
				icon: "systems/pf2e/icons/conditions-2/status_acup.webp",
				action: 'A',
				mode: "encounter",
				tags: ['combat', 'stealth']
			})
		}
		return methods
	}

	isApplicable(method, warn=false) {
		const selected = this._.ensureOneSelected(warn)
		if (!selected)
			return {applicable: false}

		const coverEffect = this.effectManager.getEffect(selected, Compendium.EFFECT_COVER)
		const prone = this.effectManager.hasCondition(selected, 'prone')
		if (method === 'giveCover')
			return {applicable: game.user.isGM && (!coverEffect || coverEffect.data.data.badge?.value < 4), selected}
		else if (method === 'takeCover')
			return {applicable: !game.user.isGM && prone || coverEffect?.data.data.badge?.value === 2, selected}
	}
}
