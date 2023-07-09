import {SimpleAction} from "../action.js"
import RelativeConditions from "../model/relative-conditions.js"
import { CONDITION_HIDDEN, CONDITION_OBSERVED, UUID_CONDITONS } from "../model/condition.js"
import DCHelper from "../helpers/dc-helper.js"
import {default as i18n} from "../../lang/pf2e-i18n.js"
import { AWARENESS } from "../constants.js"

export default class ActionSneak extends SimpleAction {
	constructor(MKS) {
		super(MKS, 'sneak', 'encounter', true, true, {
			icon: "systems/pf2e/icons/spells/undetectable-alignment.webp",
			tags: ['stealth'],
			actionGlyph: 'A',
			targetCount: 2,
			requiresEncounter: true,
			opposition: 'enemy',
			checkType: 'skill[stealth]',
			traits: ['move', 'secret']
		})
	}

	pertinent(engagement, warn) {
		const relative = new RelativeConditions()
		let result = true
		for (const target of engagement.targets) {
			const awareness = relative.getAwarenessTowardMe(target)
			if (awareness === AWARENESS.indexOf(CONDITION_OBSERVED)) {
				result = false
				if (warn) this._.warn("PF2E.MKS.Warning.Target.AtLeastHidden")
				break
			}
		}
		return result
	}

	async apply(engagement, result) {
		const relative = new RelativeConditions()
		const roll = result.roll

		for (const target of engagement.targets) {
			const dc =  target.actor.perception.dc.value
				, awareness = relative.getAwarenessTowardMe(target)
				, cover = relative.getMyCoverFrom(target) ?? 0
			const coverBonus = Math.max(0, 2 * (cover-1))
			if (awareness < 3) {
				const degree = DCHelper.calculateRollSuccess(roll, dc - coverBonus)
				relative.setAwarenessTowardMe(target, degree > 1 ? 1 : (degree == 1 ? 2 : 3))
				const conditionUuid = degree > 1 ? UUID_CONDITONS.undetected : (degree == 1 ? UUID_CONDITONS.hidden : UUID_CONDITONS.observed)

				const message = i18n.$$('PF2E.Actions.Stealth.Result', {target: target.name
					, roll: roll.total, dc, cover: coverBonus
					, currentCondRef: `@UUID[${UUID_CONDITONS[AWARENESS[awareness]]}]`
					, conditionRef: `@UUID[${conditionUuid}]`})
				this.messageToChat(engagement.initiator, message, true)
			}
		}
	}
}