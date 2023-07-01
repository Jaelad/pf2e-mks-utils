import {default as i18n} from "../../lang/pf2e-i18n.js"
import {default as LOG} from "../../utils/logging.js"
import { SystemAction } from "../action.js"
import Compendium from "../compendium.js"
import $$arrays from "../../utils/arrays.js"
import Check from "../check.js"
import CommonUtils from "../helpers/common-utils.js"
import { Engagement } from "../model/engagement.js"
import Equipments from "../model/equipments.js"
import Condition, { CONDITION_GRABBED, CONDITION_RESTRAINED } from "../model/condition.js"
import Effect, { EFFECT_GRABBING } from "../model/effect.js"

export default class ActionGrapple extends SystemAction {

	constructor(MKS) {
		super(MKS, 'grapple', 'encounter', false, true, {
			icon: "systems/pf2e/icons/spells/athletic-rush.webp",
			actionGlyph: 'A',
			tags: ['combat'],
			targetCount: 1,
			opposition: 'enemy'
		})
	}

	pertinent(engagement) {
		const equipments = new Equipments(engagement.initiator)
		const grappleW = equipments.weaponWieldedWithTraits(['grapple'])

		return (equipments.handsFree > 0 || grappleW) && engagement.sizeDifference > -2
			&& (grappleW ? engagement.inMeleeRange : engagement.isAdjacent)
	}
}
