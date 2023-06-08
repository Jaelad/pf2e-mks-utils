import {default as i18n} from "../../lang/pf2e-i18n.js"
import { SimpleAction } from "../action.js"
import Compendium from "../compendium.js"
import Check from "../check.js"
import $$strings from "../../utils/strings.js";
import Equipments from "../model/equipments.js";
import { CONDITION_GRABBED } from "../model/condition.js";

export default class ActionDisarm extends SimpleAction {

	constructor(MKS) {
		super(MKS, {action: 'demoralize',
			icon: "systems/pf2e/icons/spells/hand-of-the-apprentice.webp",
			tags: ['combat'],
			actionGlyph: 'A',
			targetCount: 1,
		})
	}

	pertinent(engagement, warn) {
		const equipments = new Equipments(engagement.initiator)
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

	disarmItem(selected, targeted, item) {
		const rollCallback = ({roll}) => {
			if (roll.degreeOfSuccess === 0)
				this.effectManager.setCondition(selected, 'flat-footed', {flags: {"mks.duration": {type: 'start', turn: 0}}}).then()
			else if (roll.degreeOfSuccess === 2)
				this.effectManager.setEffect(targeted, Compendium.EFFECT_DISARM_SUCCESS).then()
			else if (roll.degreeOfSuccess === 3)
				this._.inventoryManager.dropItem(item).then()
		}

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
		check.roll(selected, targeted).then(rollCallback)
	}

	async act(engagement, {overrideDC}) {
		const heldItems = this._.inventoryManager.heldItems(targeted)
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
			this.disarmItem(selected, targeted, heldItems.find((i)=>i.id === itemId))
		}

		new Dialog({
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

	isApplicable(method=null, warn=false) {
		const selected = this._.ensureOneSelected(warn)
		const targeted = this._.ensureOneTarget(null,warn)
		if (!selected || !targeted)
			return {applicable: false}

		const handsFree = this._.inventoryManager.handsFree(selected)
		const sizeDiff = this._.getSizeDifference(selected, targeted)
		const grabbed = this.effectManager.hasCondition(selected, 'grabbed')
		const distance = this._.distanceTo(selected, targeted)
		const heldItems = this._.inventoryManager.heldItems(targeted)
		const reqMet = (handsFree > 0 || grabbed) && sizeDiff < 2 && heldItems.length > 0 && selected.actor.alliance !== targeted.actor.alliance
			&& distance < (this._.inventoryManager.wieldsWeaponWithTraits(selected, ['reach', 'disarm']) ? 15 : 10)

		return {applicable: reqMet, selected, targeted}
	}
}
