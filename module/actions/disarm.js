import {default as i18n} from "../../lang/pf2e-i18n.js"
import Equipments from "../model/equipments.js";
import { SystemAction } from "../action.js";

export default class ActionDisarm extends SystemAction {
	constructor(MKS) {
		super(MKS, 'disarm', 'encounter', false, true, {
			icon: "systems/pf2e/icons/spells/hand-of-the-apprentice.webp",
			actionGlyph: 'A',
			tags: ['attack'],
			targetCount: 1,
			opposition: 'enemy'
		})
	}

	pertinent(engagement, warn) {
		const equipments = new Equipments(engagement.initiator)
		const disarmW = equipments.weaponWieldedWithTraits(['disarm'])

		const freeHands = equipments.handsFree > 0 || disarmW
		if (!freeHands) {
			if (warn) this._.warn("PF2E.Actions.Warning.FreeHands")
			return false
		}
		const sizeOk = engagement.sizeDifference > -2
		if (!sizeOk) {
			if (warn) this._.warn("PF2E.Actions.Warning.Size")
			return false
		}
		const reachOk = disarmW ? engagement.inMeleeRange : engagement.isAdjacent
		if (!reachOk) {
			if (warn) this._.warn("PF2E.Actions.Warning.Reach")
			return false
		}
		return true
	}
}
