import {default as i18n} from "../../lang/pf2e-i18n.js"
import {default as LOG} from "../../utils/logging.js"
import {SystemAction} from "../action.js"
import Check from "../check.js"
import {MONSTER_KNOWLEDGE, ROLL_MODE} from "../constants.js"
import DCHelper from "../helpers/dc-helper.js"
import Dialogs from "../apps/dialogs.js"
import $$arrays from "../../utils/arrays.js"

export default class ActionRecallKnowledge extends SystemAction {

	constructor(MKS) {
		super(MKS, 'recallKnowledge', 'encounter', true, true, {
			icon: "systems/pf2e/icons/spells/daydreamers-curse.webp",
			actionGlyph: 'A',
			tags: ['inspection'],
			targetCount: 1,
			opposition: 'enemy'
		})
	}

	pertinent(engagement) {
		return ['npc', 'hazard', 'character'].includes(engagement.targeted.actor.type)
	}

	async act(engagement, options) {
		const selected = engagement.initiator, targeted = engagement.targeted
		let dc = 15, possibleSkills = []
		Object.keys(selected.actor.skills).filter(s => s.indexOf('lore') > -1).forEach(l => possibleSkills.push('skill[' + l + ']'))
		dc = DCHelper.calculateDC(targeted.actor.level, targeted.actor.rarity)
		const traits = Array.from(targeted.actor.traits)
		traits.forEach(t => {
			MONSTER_KNOWLEDGE[t]?.forEach(s => possibleSkills.push('skill[' + s + ']'))
		})

		possibleSkills = $$arrays.unique(possibleSkills)
		const selectSkillDialogData = possibleSkills.map(s => {return {value: s, name: Check.checkTypeToLabel(s, selected.actor)}})
		const checkType = await Dialogs.selectOne(selectSkillDialogData, "PF2E.MKS.Dialog.RecallKnowledge.SelectSkill")

		const check = new Check({
			checkType,
			traits: ["secret", "concentrate"],
			actionGlyph: "A",
			rollOptions: ["action:recall-knowledge"],
			extraOptions: ["action:recall-knowledge"],
			rollMode: ROLL_MODE.GM,
			secret: true,
			askGmForDC: {
				action: 'recallKnowledge',
				defaultDC: dc
			}
		})
		return check.roll(engagement).then(({roll, actor}) => this.createResult(engagement, roll))
	}
}
