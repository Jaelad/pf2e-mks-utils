import {SimpleAction} from "../action.js"
import RelativeConditions from "../model/relative-conditions.js"
import { CONDITION_HIDDEN, UUID_CONDITONS } from "../model/condition.js"
import DCHelper from "../helpers/dc-helper.js"
import {default as i18n} from "../../lang/pf2e-i18n.js"
import { AWARENESS } from "../constants.js"

export default class ActionSneak extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'sneak', gmActs: true,
			checkType: 'skill[stealth]',
			traits: ['move', 'secret'],
			icon: "systems/pf2e/icons/spells/undetectable-alignment.webp",
			tags: ['stealth'],
			actionGlyph: 'A',
			targetCount: 2,
			requiresEncounter: true,
			opposition: 'enemy',
		})
	}

	pertinent(engagement) {
		const relative = new RelativeConditions()
		if (!relative.isOk) return false
		for (const target of engagement.targets) {
			const awareness = relative.getAwarenessTowardMe(target)
			if (awareness !== AWARENESS.indexOf(CONDITION_HIDDEN))
				return false
		}
		return true
	}

	async apply(engagement, result) {
		const relative = new RelativeConditions()

		for (const target of engagement.targets) {
			const dc =  target.actor.perception.dc.value, awareness = relative.getAwarenessTowardMe(target)

			if (awareness < 3) {
				const degree = DCHelper.calculateRollSuccess(result.roll, dc)
				relative.setAwarenessTowardMe(target, degree > 1 ? 1 : (degree == 1 ? 2 : 3))
				const conditionUuid = degree > 1 ? UUID_CONDITONS.undetected : (degree == 1 ? UUID_CONDITONS.hidden : UUID_CONDITONS.observed)

				const message = i18n.$$('PF2E.Actions.Sneak.Result', {target: target.name, conditionRef: `@UUID[${conditionUuid}]`})
				this.messageToChat(engagement.initiator, message, true)
			}
		}
	}
}