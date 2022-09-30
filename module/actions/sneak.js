import {SimpleAction} from "../action.js"
import {SYSTEM} from "../constants.js"

export default class ActionSneak extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'sneak',
			traits: ['move', 'secret'],
			checkType: 'skill[stealth]',
			icon: "systems/pf2e/icons/spells/undetectable-alignment.webp",
			tags: ['combat', 'stealth'],
			actionGlyph: 'A',
			targetCount: 2,
			requiresEncounter: true,
			dc: t => t.actor.perception.dc.value,
		})
	}
	
	resultHandler(roll, selected, targets, options) {
		super.resultHandler(roll, selected, targets, options)
		const relativeData = game.combat?.flags?.[SYSTEM.moduleId]?.relative
		if (!relativeData) return
		
		for (let i=0; i < targets.length; i++) {
			const t = targets[i], dc = t.actor.perception.dc.value
			const relative = relativeData[t.id]
			
			if (relative?.[selected.id]?.awareness > -1)
				relative[selected.id].awareness = dc <= roll.total ? 1 : dc > roll.total + 10 ? 3 : 2
		}
		game.combat.setFlag(SYSTEM.moduleId, 'relative', relativeData).then()
	}
	
	applies(selected, targets) {
		const opposition = targets?.filter(t => selected.actor.alliance !== t.actor.alliance)
		return !!selected && !!targets && targets.length === opposition.length
	}
}