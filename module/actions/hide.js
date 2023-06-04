import {SimpleAction} from "../action.js"
import {default as i18n} from "../../lang/pf2e-i18n.js"
import RelativeConditions from "../model/relative-conditions.js"
import Condition, { UUID_CONDITONS } from "../model/condition.js"
import DCHelper from "../helpers/dc-helper.js"

export default class ActionHide extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'hide',
			traits: ['secret'],
			checkType: 'skill[stealth]',
			icon: "systems/pf2e/icons/spells/zealous-conviction.webp",
			tags: ['stealth'],
			actionGlyph: 'A',
			targetCount: 2,
			requiresEncounter: true,
		})
	}
	
	resultHandler(roll, selected, targets, options) {
		const concealed = new Condition(selected, 'concealed').exists
		const relative = new RelativeConditions()
		if (!relative.isOk) return

		for (const target of targets) {
			const dc =  target.actor.perception.dc.value, awareness = relative.getAwarenessTowardMe(target), cover = relative.getMyCoverFrom(target) ?? 1
			if (awareness < 3 || (cover < 2 && !concealed))
				continue
			const coverBonus = Math.max(0, 2 * (cover-1))
			const degree = DCHelper.calculateRollSuccess(roll, dc - coverBonus)
			if (degree < 2) {
				const message = i18n.$$('PF2E.Actions.Hide.Result', {target: target.name, conditionRef: `@UUID[${UUID_CONDITONS.observed}]`})
				this.messageToChat(selected, this.action, message, this.actionGlyph, true)
			}
			else {
				relative.setAwarenessTowardMe(target, Math.min(awareness, 2))
				const message = i18n.$$('PF2E.Actions.Hide.Result', {target: target.name, conditionRef: `@UUID[${UUID_CONDITONS.hidden}]`})
				this.messageToChat(selected, this.action, message, this.actionGlyph, true)
			}
		}
	}
	
	applies(selected, targets) {
		const opposition = targets?.filter(t => selected.actor.alliance !== t.actor.alliance)
		return game.user.isGM && !!selected && !!targets && opposition.length === targets.length
	}
}