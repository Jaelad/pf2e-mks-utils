import {default as i18n} from "../../lang/pf2e-i18n.js"
import {default as LOG} from "../../utils/logging.js"
import { SystemAction } from "../action.js"
import Compendium from "../compendium.js"
import { Engagement } from "../model/engagement.js"

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
		return this._.actorManager.hasLostHP(engagement.targeted)
	}
}