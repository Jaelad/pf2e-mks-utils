import {default as i18n} from "../../lang/pf2e-i18n.js"
import { SystemAction } from "../action.js"
import Equipments from "../model/equipments.js"

export default class ActionGrapple extends SystemAction {

	constructor(MKS) {
		super(MKS, 'grapple', 'encounter', false, true, {
			icon: "systems/pf2e/icons/spells/athletic-rush.webp",
			actionGlyph: 'A',
			tags: ['attack'],
			targetCount: 1,
			opposition: 'enemy'
		})
	}

	pertinent(engagement, warn) {
		const equipments = new Equipments(engagement.initiator)
		const grappleW = equipments.weaponWieldedWithTraits(['grapple'])

		const freeHands = equipments.handsFree > 0 || grappleW
		if (!freeHands) {
			if (warn) this._.warn("PF2E.Actions.Warning.FreeHands")
			return false
		}
		const sizeOk = engagement.sizeDifference > -2
		if (!sizeOk) {
			if (warn) this._.warn("PF2E.Actions.Warning.Size")
			return false
		}
		const reachOk = grappleW ? engagement.inMeleeRange : engagement.isAdjacent
		if (!reachOk) {
			if (warn) this._.warn("PF2E.Actions.Warning.Reach")
			return false
		}
		return true
	}
}
