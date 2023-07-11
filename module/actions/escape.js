import {default as i18n} from "../../lang/pf2e-i18n.js"
import Action from "../action.js"
import Check from "../check.js"
import Dialogs from "../apps/dialogs.js";
import Condition, { CONDITION_GRABBED, CONDITION_IMMOBILIZED, CONDITION_RESTRAINED } from "../model/condition.js"
import Effect, { EFFECT_MAP } from "../model/effect.js";

export default class ActionEscape extends Action {
	static CONDITIONS = [CONDITION_IMMOBILIZED, CONDITION_GRABBED, CONDITION_RESTRAINED]

	constructor(MKS) {
		super(MKS, 'escape', 'encounter', false, true, {
			icon: "systems/pf2e/icons/spells/humanoid-form.webp",
			actionGlyph: 'A',
			tags: ['attack']
		})
	}

	pertinent(engagement, warn) {
		const conds = engagement.hasInitiatorCondition(ActionEscape.CONDITIONS)
		if (!conds && warn)
			this._.warn("PF2E.Actions.Warning.NoAffliction")
		return conds
	}

	async act(engagement, options) {
		let selectedCond //[1].system.references.parent.type == condition
		const conditions = Condition.collect(engagement.initiator, ActionEscape.CONDITIONS)
			.filter((c) => c.exists && !(c?.item.flags?.pf2e?.grantedBy?.id))
		if (conditions.length === 1)
			selectedCond = conditions[0]?.slug
		else
			selectedCond = await Dialogs.selectOne(conditions, "PF2E.MKS.Dialog.Escape.SelectCondition", null, (c) => c.slug)
		if (!selectedCond)
			return

		const checkOptions = [
			{name: i18n.$("PF2E.MartialUnarmed"), value: 'strike[basic-unarmed]'},
			{name: i18n.$("PF2E.ActionsCheck.athletics"), value: 'skill[athletics]'},
			{name: i18n.$("PF2E.ActionsCheck.acrobatics"), value: 'skill[acrobatics]'},
		]
		const checkType = await Dialogs.selectOne(checkOptions, "PF2E.MKS.Dialog.Escape.SelectSkill")

		const modifiers = []
		const map = new Effect(engagement.initiator, EFFECT_MAP)
			if (map.exists) {
				modifiers.push(new game.pf2e.Modifier({
					label: "PF2E.MKS.Modifier.map",
					slug: "multiple-attack-penalty",
					type: "untyped",
					modifier: map.badgeValue * -5
				}))
			}
		
		const check = new Check({
			actionGlyph: "A",
			rollOptions: ["action:escape"],
			extraOptions: ["action:escape"],
			traits: ["attack"],
			weaponTrait: "escape",
			checkType,
			askGmForDC: {
				action: this.name,
				defaultDC: 15
			},
			modifiers
		})

		return check.roll(engagement)
			.then(({roll, actor}) => roll 
				? this.createResult(engagement, roll, {condition: selectedCond}) 
				: undefined
			)
	}

	async apply(engagement, result) {
		super.apply(engagement, result)
		const roll = result.roll
		if (roll.degreeOfSuccess > 1)
			new Condition(engagement.initiator, result.options.condition).purge()
	}
}
