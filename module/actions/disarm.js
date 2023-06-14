import {default as i18n} from "../../lang/pf2e-i18n.js"
import Compendium from "../compendium.js"
import Check from "../check.js"
import $$strings from "../../utils/strings.js";
import Equipments from "../model/equipments.js";
import { CONDITION_FLATFOOTED, CONDITION_GRABBED } from "../model/condition.js";
import { EFFECT_DISARM_SUCCESS } from "../model/effect.js";
import { Engagement } from "../model/engagement.js";
import Action from "../action.js";

export default class ActionDisarm extends Action {
	constructor(MKS) {
		super(MKS, 'disarm', 'encounter', false, true)
	}

	get properties() {
		return {
			label: i18n.action("disarm"),
			icon: "systems/pf2e/icons/spells/hand-of-the-apprentice.webp",
			actionGlyph: 'A',
			tags: ['combat']
		}
	}

	relevant(warn) {
		const selected = this._.ensureOneSelected(warn)
		const targeted = this._.ensureOneTarget(null,warn)
		if (!selected || !targeted || selected.id === targeted.id)
			return

		const engagement = new Engagement(selected, targeted)
		const equipments = new Equipments(selected)
		
		const targetEquipments = new Equipments(engagement.targeted)
		const handsFree = equipments.handsFree
		const sizeDiff = engagement.sizeDifference
		const grabbed = engagement.hasInitiatorCondition(CONDITION_GRABBED)
		const distance = engagement.distance()
		const heldItems = targetEquipments.heldItems
		return (handsFree > 0 || grabbed) && sizeDiff < 2 && heldItems.length > 0 && engagement.isEnemy
			&& distance < (equipments.weaponWieldedWithTraits(['reach', 'disarm']) ? 15 : 10)
	}

	//Below exports.SetGamePF2e = { // Line:50709: actionHelpers: action_macros_1.ActionMacroHelpers,

	async act(engagement, {overrideDC}) {
		const equipments = new Equipments(engagement.targeted)
		const heldItems = equipments.heldItems
		let selectedItem = true

		const dialogContent = `
		<form>
		<div class="form-group">
			<label>${i18n.$("PF2E.MKS.Dialog.disarm.select")}</label>
			<select name="item">
				${heldItems.map((heldItem) =>
					`<option value="${heldItem.id}" ${selectedItem ? 'selected' : ''} ${selectedItem = false}>${$$strings.escapeHtml(heldItem.name)}</option>`
				).join('')}
			</select>
		</div>
		</form>
		`

		const dialogCallback = ($html) => {
			const itemId = $html[0].querySelector('[name="item"]').value
			return this.disarmItem(engagement, heldItems.find((i)=>i.id === itemId))
		}

		return new Dialog({
			title: i18n.$("PF2E.MKS.Dialog.disarm.title"),
			content: dialogContent,
			buttons: {
				no: {
					icon: '<i class="fas fa-times"></i>',
					label: i18n.$("PF2E.MKS.UI.Actions.cancel"),
				},
				yes: {
					icon: '<i class="fas fa-hands-helping"></i>',
					label: i18n.action('disarm'),
					callback: dialogCallback
				},
			},
			default: 'yes',
		}).render(true)
	}

	async disarmItem(engagement, item) {
		const modifiers = []
		if (this.effectManager.hasEffect(targeted, Compendium.EFFECT_DISARM_SUCCESS))
			modifiers.push(new game.pf2e.Modifier({
				label: "PF2E.MKS.Modifier.partially-disarmed",
				slug: "partially-disarmed",
				type: "circumstance",
				modifier: 2, // Max range penalty before automatic failure
			}))

		const check = new Check({
			actionGlyph: "A",
			rollOptions: ["action:disarm"],
			extraOptions: ["action:disarm"],
			traits: ["attack"],
			weaponTrait: "disarm",
			checkType: "skill[athletics]",
			modifiers: modifiers,
			difficultyClassStatistic: (target) => target.saves.reflex
		})
		return await check.roll(engagement).then(({roll, actor}) => this.createResult(engagement, roll, {itemId: item.id}))
	}

	async apply(engagement, result) {
		const roll = result.roll
		if (roll.degreeOfSuccess === 0)
			return engagement.setConditionOnInitiator(CONDITION_FLATFOOTED).then(c => c.setFlag('duration', {type: 'start', turn: 0})) 
		else if (roll.degreeOfSuccess === 2)
			return engagement.setEffectOnTarget(EFFECT_DISARM_SUCCESS)
		else if (roll.degreeOfSuccess === 3)
			return new Equipments(engagement.targeted).dropItem(result.options.itemId)
	}
}
