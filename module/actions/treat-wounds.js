import {default as i18n} from "../../lang/pf2e-i18n.js"
import { SystemAction } from "../action.js"
import { EQU_HEALERS_TOOLS, EQU_HEALERS_TOOLS_EXPANDED } from "../model/equipments.js"

export default class ActionTreatWounds extends SystemAction {

	constructor(MKS) {
		super(MKS, 'treatWounds', 'exploration', false, false, {
			icon: "systems/pf2e/icons/features/feats/treat-wounds.webp",
			actionGlyph: '',
			tags: ['preparation'],
			targetCount: 1,
			opposition: 'ally'
		})
	}

	pertinent(engagement, warn) {
		const hpLost = this._.actorManager.hasLostHP(engagement.targeted)
		if (!hpLost) {
			if (warn) this._.warn("PF2E.Actions.TreatWounds.Warning.FullHp")
			return false
		}
		const healersTools = new Equipments(engagement.initiator).hasAny([EQU_HEALERS_TOOLS, EQU_HEALERS_TOOLS_EXPANDED]).length > 0
		if (!healersTools) {
			if (warn) this._.warn("PF2E.MKS.Warning.Action.MustUseHealersTools")
			return false
		}
		return true
	}
}