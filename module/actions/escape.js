import {default as i18n} from "../../lang/pf2e-helper.js"
import {default as LOG} from "../../utils/logging.js"
import Action from "../action.js"
import Compendium from "../compendium.js"
import Check from "../check.js"
import {ROLL_MODE} from "../constants.js";
import Dialogs from "../apps/dialogs.js";

export default class ActionEscape extends Action {
	static CONDITIONS = ['immobilized', 'grabbed', 'restrained']

	async escape(options = {}) {
		const {applicable, selected} = this.isApplicable(null,true)
		if (!applicable)
			return

		let conditionSlug //[1].data.data.references.parent.type == condition
		const conditions = this._.effectManager.getConditions(selected, ActionEscape.CONDITIONS)
			.filter((c) => !c.data.data.references?.parent?.type)
		if (conditions.length === 1)
			conditionSlug = conditions[0].slug
		else
			await Dialogs.selectOne(conditions, null, (c) => c.slug, "pf2e.mks.dialog.escape.selectcondition")
				.then((c) => conditionSlug = c)

		if (!conditionSlug)
			return

		let checkType
		const checkOptions = [
			{name: i18n.$("PF2E.MartialUnarmed"), value: 'strike[basic-unarmed]'},
			{name: i18n.$("PF2E.ActionsCheck.athletics"), value: 'skill[athletics]'},
			{name: i18n.$("PF2E.ActionsCheck.acrobatics"), value: 'skill[acrobatics]'},
		]
		await Dialogs.selectOne(checkOptions, null, null, "pf2e.mks.dialog.escape.selectskill")
			.then((co) => checkType = co)


		this.requestGmSetDC({action: 'escape'}, (dc) => {
			const rollCallback = ({roll, actor}) => {
				if (roll?.data.degreeOfSuccess > 1)
					this._.effectManager.removeCondition(selected, conditionSlug)
				this._.compendiumToChat(selected, Compendium.ACTION_ESCAPE, ROLL_MODE.BLIND)
			}

			const check = new Check({
				actionGlyph: "A",
				rollOptions: ["action:escape"],
				extraOptions: ["action:escape"],
				traits: ["attack"],
				weaponTrait: "escape",
				checkType,
				difficultyClass: dc
			})
			check.roll(selected).then(rollCallback)
		})
	}

	methods(onlyApplicable) {
		const {applicable} = this.isApplicable()
		return !onlyApplicable || applicable ? [{
			method: "escape",
			label: i18n.action("escape"),
			icon: "systems/pf2e/icons/spells/humanoid-form.webp",
			action: 'A',
			mode: "encounter",
			tags: ['combat']
		}] : []
	}

	isApplicable(method=null, warn=false) {
		const selected = this._.ensureOneSelected(warn)
		if (!selected)
			return {applicable: false}

		const hasCondition = this._.effectManager.hasCondition(selected, ActionEscape.CONDITIONS)

		return {applicable: hasCondition, selected}
	}
}
