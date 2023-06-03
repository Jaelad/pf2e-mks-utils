import {SimpleAction} from "../action.js"
import RelativeConditions from "../model/relative-conditions.js"
import { UUID_HIDDEN, UUID_OBSERVED, UUID_UNDETECTED } from "../model/condition.js"
import DCHelper from "../helpers/dc-helper.js"
import {default as i18n} from "../../lang/pf2e-i18n.js"

export default class ActionSneak extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'sneak',
			traits: ['move', 'secret'],
			checkType: 'skill[stealth]',
			icon: "systems/pf2e/icons/spells/undetectable-alignment.webp",
			tags: ['combat', 'stealth'],
			actionGlyph: 'A',
			targetCount: 2,
			requiresEncounter: true
		})
	}
	
	resultHandler(roll, selected, targets, options) {
		const relative = new RelativeConditions()
		if (!relative.isOk) return

		for (const target of targets) {
			const dc =  target.actor.perception.dc.value, awareness = relative.getAwarenessTowardMe(target)

			if (awareness < 3) {
				const degree = DCHelper.calculateDegreeOfSuccess(roll.dice[0].total, roll.total, dc)
				relative.setAwarenessTowardMe(target, degree > 1 ? 1 : (degree == 1 ? 2 : 3))
				const conditionUuid = degree > 1 ? UUID_UNDETECTED : (degree == 1 ? UUID_HIDDEN : UUID_OBSERVED)

				const message = i18n.$$('PF2E.Actions.Sneak.Result', {target: target.name, conditionRef: "@UUID[" + conditionUuid + "]"})
				this.messageToChat(selected, this.action, message, this.actionGlyph, true)
			}
		}
	}
	
	applies(selected, targets) {
		const opposition = targets?.filter(t => selected.actor.alliance !== t.actor.alliance)
		return game.user.isGM && !!selected && !!targets && opposition.length === targets.length
	}
}