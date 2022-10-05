import {default as i18n} from "../../lang/pf2e-i18n.js"
import {default as LOG} from "../../utils/logging.js"
import Action from "../action.js"
import Compendium from "../compendium.js"
import Check from "../check.js"
import {ACTOR_IDENTIFICATION, ROLL_MODE} from "../constants.js"
import DCHelper from "../helpers/dc-helper.js"
import Dialogs from "../apps/dialogs.js"
import $$arrays from "../../utils/arrays.js"

export default class ActionRecallKnowledge extends Action {

	async recallKnowledge(options = {}) {
		const {applicable, selected, targeted} = this.isApplicable(null,true)
		if (!applicable)
			return

		const rollCallback = ({roll, actor}) => {
			this.resultToChat(selected,'recallKnowledge', roll?.data.degreeOfSuccess)
		}

		let dc = 15, possibleSkills = []
		Object.keys(selected.actor.skills).filter(s => s.indexOf('lore') > -1).forEach(l => possibleSkills.push('skill[' + l + ']'))
		dc = DCHelper.calculateDC(targeted.actor.level, targeted.actor.rarity)
		const traits = Array.from(targeted.actor.traits)
		traits.forEach(t => {
			ACTOR_IDENTIFICATION[t]?.forEach(s => possibleSkills.push('skill[' + s + ']'))
		})

		possibleSkills = $$arrays.unique(possibleSkills)
		const selectSkillDialogData = possibleSkills.map(s => {return {value: s, name: Check.checkTypeToLabel(s, selected.actor)}})
		const checkType = await Dialogs.selectOne(selectSkillDialogData, "PF2E.MKS.Dialog.RecallKnowledge.SelectSkill")

		const check = new Check({
			actionGlyph: "A",
			rollOptions: ["action:recall-knowledge"],
			extraOptions: ["action:recall-knowledge"],
			traits: ["secret", "concentrate"],
			checkType,
			rollMode: ROLL_MODE.GM,
			secret: true,
			askGmForDC: {
				action: 'recallKnowledge',
				defaultDC: dc
			}
		})
		check.roll(selected, targeted).then(rollCallback)
	}

	methods(onlyApplicable) {
		const {applicable} = this.isApplicable()
		return !onlyApplicable || applicable ? [{
			method: "recallKnowledge",
			label: i18n.action("recallKnowledge"),
			icon: "systems/pf2e/icons/spells/daydreamers-curse.webp",
			action: 'A',
			mode: "encounter",
			tags: ['basic']
		}] : []
	}

	isApplicable(method=null, warn=false) {
		const selected = this._.ensureOneSelected(warn)
		const targeted = this._.ensureOneTarget(null,warn)

		return {applicable: !!selected && !!targeted && ['npc', 'hazard', 'character'].includes(targeted.type) && selected.actor.alliance !== targeted.actor.alliance, selected, targeted}
	}
}
