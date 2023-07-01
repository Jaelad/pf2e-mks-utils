import {default as i18n} from "../../lang/pf2e-i18n.js"
import $$strings from "../../utils/strings.js";
import Equipments from "../model/equipments.js";
import { CONDITION_FLATFOOTED, CONDITION_GRABBED } from "../model/condition.js";
import { EFFECT_DISARM_SUCCESS } from "../model/effect.js";
import { Engagement } from "../model/engagement.js";
import { SystemAction } from "../action.js";

export default class ActionDisarm extends SystemAction {
	constructor(MKS) {
		super(MKS, 'disarm', 'encounter', false, true, {
			icon: "systems/pf2e/icons/spells/hand-of-the-apprentice.webp",
			actionGlyph: 'A',
			tags: ['combat'],
			targetCount: 1,
			opposition: 'enemy'
		})
	}

	pertinent(engagement) {
		const equipments = new Equipments(engagement.initiator)
		const disarmW = equipments.weaponWieldedWithTraits(['disarm'])

		return (equipments.handsFree > 0 || disarmW) && engagement.sizeDifference > -2
			&& (disarmW ? engagement.inMeleeRange : engagement.isAdjacent)
	}
}
