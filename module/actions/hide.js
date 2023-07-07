import {SimpleAction} from "../action.js"
import {default as i18n} from "../../lang/pf2e-i18n.js"
import RelativeConditions from "../model/relative-conditions.js"
import Condition, { CONDITION_CONCEALED, UUID_CONDITONS } from "../model/condition.js"
import DCHelper from "../helpers/dc-helper.js"

export default class ActionHide extends SimpleAction {
	constructor(MKS) {
		super(MKS, 'hide', 'encounter', true, true, {
			icon: "systems/pf2e/icons/spells/zealous-conviction.webp",
			tags: ['stealth'],
			actionGlyph: 'A',
			targetCount: 2,
			requiresEncounter: true,
			opposition: 'enemy',
			checkType: 'skill[stealth]',
			traits: ['secret'],
		})
	}

	pertinent(engagement) {
		const relative = new RelativeConditions()
		if (!relative.isOk) return false
		const concealed = new Condition(engagement.initiator, CONDITION_CONCEALED).exists

		for (const target of engagement.targets) {
			const awareness = relative.getAwarenessTowardMe(target), cover = relative.getMyCoverFrom(target) ?? 0
			if (awareness < 3 || (cover < 2 && !concealed))
				return false
		}
		return true
	}

	async apply(engagement, result) {
		const relative = new RelativeConditions()

		for (const target of engagement.targets) {
			const dc =  target.actor.perception.dc.value
				, awareness = relative.getAwarenessTowardMe(target)
				, cover = relative.getMyCoverFrom(target) ?? 0
			const coverBonus = Math.max(0, 2 * (cover-1))
			const degree = DCHelper.calculateRollSuccess(result.roll, dc - coverBonus)
			if (degree < 2) {
				const message = i18n.$$('PF2E.Actions.Hide.Result', {target: target.name, conditionRef: `@UUID[${UUID_CONDITONS.observed}]`})
				this.messageToChat(engagement.initiator, message, true)
			}
			else {
				relative.setAwarenessTowardMe(target, Math.min(awareness, 2))
				const message = i18n.$$('PF2E.Actions.Hide.Result', {target: target.name, conditionRef: `@UUID[${UUID_CONDITONS.hidden}]`})
				this.messageToChat(engagement.initiator, message, true)
			}
		}
	}
}