import {default as i18n} from "../../lang/pf2e-i18n.js"
import Action from "../action.js"
import Compendium from "../compendium.js"
import Check from "../check.js"
import {ROLL_MODE} from "../constants.js";
import Dialogs from "../apps/dialogs.js";
import { Engagement } from "../model/engagement.js"
import Condition, { CONDITION_GRABBED, CONDITION_IMMOBILIZED, CONDITION_RESTRAINED } from "../model/condition.js"

export default class ActionEscape extends Action {
	static CONDITIONS = [CONDITION_IMMOBILIZED, CONDITION_GRABBED, CONDITION_RESTRAINED]

	constructor(MKS) {
		super(MKS, 'escape', 'encounter', false, true, {
			icon: "systems/pf2e/icons/spells/humanoid-form.webp",
			actionGlyph: 'A',
			tags: ['combat']
		})
	}

	relevant(warn) {
		const selected = this._.ensureOneSelected(warn)
		if (!selected)
			return
		const engagement = new Engagement(selected)
		return engagement.hasInitiatorCondition(ActionEscape.CONDITIONS) ? engagement :undefined
	}

	async act(engagement, options) {
		const conds = Condition.collect(engagement.initiator, ActionEscape.CONDITIONS)

		let selectedCond //[1].system.references.parent.type == condition
		const conditions = Condition.collect(engagement.initiator, ActionEscape.CONDITIONS)
			.filter((c) => !c.system.references?.parent?.type)
		if (conditions.length === 1)
			selectedCond = conditions[0]
		else
			selectedCond = await Dialogs.selectOne(conditions, "PF2E.MKS.Dialog.Escape.SelectCondition", null, (c) => c.condition)
				.then((c) => c.slug)

		if (!selectedCond)
			return

		const checkOptions = [
			{name: i18n.$("PF2E.MartialUnarmed"), value: 'strike[basic-unarmed]'},
			{name: i18n.$("PF2E.ActionsCheck.athletics"), value: 'skill[athletics]'},
			{name: i18n.$("PF2E.ActionsCheck.acrobatics"), value: 'skill[acrobatics]'},
		]
		const checkType = await Dialogs.selectOne(checkOptions, "PF2E.MKS.Dialog.Escape.SelectSkill").then((co) => co.value)

		const check = new Check({
			actionGlyph: "A",
			rollOptions: ["action:escape"],
			extraOptions: ["action:escape"],
			traits: ["attack"],
			weaponTrait: "escape",
			checkType
		})

		return await check.roll(engagement).then(({roll, actor}) => this.createResult(engagement, roll, {condition: selectedCond}))
	}

	async apply(engagement, result) {
		const roll = result.roll
		if (roll.degreeOfSuccess > 1)
			new Condition(engagement.initiator, result.options.condition).purge()
		if (roll.degreeOfSuccess >= 0)
			this._.compendiumToChat(selected, Compendium.ACTION_ESCAPE, ROLL_MODE.BLIND, true)
	}
}
