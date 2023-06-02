import Action, {SimpleAction} from "../action.js"
import Compendium from "../compendium.js"
import Dialogs from "../apps/dialogs.js"
import {default as i18n} from "../../lang/pf2e-i18n.js"
import CommonUtils from "../helpers/common-utils.js"

export default class ActionAdministerFirstAid extends SimpleAction {
	constructor(MKS) {
		super(MKS, {action: 'administerFirstAid',
			traits: ['manipulate'],
			checkType: 'skill[medicine]',
			icon: "systems/pf2e/icons/spells/heal-companion.webp",
			tags: ['combat'],
			actionGlyph: 'D',
			targetCount: 1
		})
	}
	
	async act({overrideDC}) {
		const {applicable, selected, targeted} = this.isApplicable(null,true)
		if (!applicable) return

		const buttons = []
		const dyingCond = this.effectManager.getCondition(targeted, 'dying')
		const persistentDamages = this.effectManager.getConditions(targeted, 'persistent-damage')
		const bleedingCond = persistentDamages.find(pd => pd.system.persistent.damageType === 'bleed')
		const poisonedCond = persistentDamages.find(pd => pd.system.persistent.damageType === 'poison')
		
		if (dyingCond)
			buttons.push({ value: 'dying', name: 'PF2E.Actions.AdministerFirstAid.Dying'})
		if (bleedingCond)
			buttons.push({ value: 'bleeding', name: 'PF2E.Actions.AdministerFirstAid.Bleeding'})
		if (poisonedCond)
			buttons.push({ value: 'poisoned', name: 'PF2E.Actions.AdministerFirstAid.Poisoned'})

		let dc, affliction, formula, id
		if (buttons.length > 1)
			affliction = await Dialogs.multipleButtons(buttons, "PF2E.MKS.Dialog.AdministerFirstAid.SelectType") ?? 'dying'
		else if (dyingCond)
			affliction = 'dying'
		else if (bleedingCond)
			affliction = 'bleeding'
		else if (poisonedCond)
			affliction = 'poisoned'

		if (affliction === 'dying') {
			dc = dyingCond.badge.value + 15
			id = dyingCond.id
		}
		else if (affliction === 'bleeding') {
			dc = bleedingCond.system.persistent.dc
			formula = bleedingCond.system.persistent.formula
			id = bleedingCond.id
		}
		else if (affliction === 'poisoned') {
			dc = poisonedCond.system.persistent.dc
			formula = poisonedCond.system.persistent.formula
			id = poisonedCond.id
		}

		await super.act({overrideDC: dc, affliction, formula, conditionId: id})
	}

	resultHandler(roll, selected, targeted, options) {
		super.resultHandler(roll, selected, targeted, options)
		
		const degreeOfSuccess = roll.degreeOfSuccess
		if (options.affliction === 'dying') {
			if (degreeOfSuccess > 1) {
				this.effectManager.removeCondition(targeted, 'dying').then(() => {
					this.effectManager.setCondition(targeted, 'unconscious').then()
				})
			}
			else if (degreeOfSuccess === 0) {
				const dyingCond = this.effectManager.getCondition(targeted, 'dying')
				this.effectManager.setBadge(dyingCond, {increment: 1}).then()
			}
		}
		else if (options.affliction === 'bleeding') {
			if (degreeOfSuccess > 1) {
				const flatCheckRoll = new Roll('1d20').roll({async: false})
				CommonUtils.chat(targeted, i18n.$$("PF2E.Actions.AdministerFirstAid.BleedingFlatCheck", {roll: flatCheckRoll.result}))
				
				if (flatCheckRoll.result >= 15) {
					this.effectManager.removeConditions(targeted, [options.conditionId]).then()
				}
			}
			else if (degreeOfSuccess === 0) {
				const healthLost = new Roll(options.formula).roll({async: false})
				this._.actorManager.applyHPChange(targeted, {value: -1 * healthLost}).then(()=> {
					CommonUtils.chat(targeted, i18n.$$("PF2E.MKS.Chat.HealthLost", {healthLost}))
				})
			}
		}
		else if (options.affliction === 'poisoned') {
			const bonus = degreeOfSuccess === 2 ? 2 : degreeOfSuccess === 3 ? 4 : degreeOfSuccess === 0 ? -2 : 0
			if (bonus !== 0)
				this.effectManager.setEffect(targeted, Compendium.EFFECT_POISON_TREATED, {flags: {"mks.treatPoisonBonus": bonus}}).then()
		}
	}

	applies(selected, targeted) {
		const handsFree = this._.inventoryManager.handsFree(selected)
		const healersTools = !!selected && selected.actor.itemTypes.equipment.find(e => (e.slug === 'healers-tools' || e.slug === 'healers-tools-expanded')
			&& ((e.carryType === 'worn' && handsFree > 0) || e.handsHeld === 2))
		const dyingCond = this.effectManager.getCondition(targeted, 'dying')
		const bleedingEffect = this.effectManager.getCondition(targeted, 'persistent-damage-bleed')
		const poisonEffect = this.effectManager.getCondition(targeted, 'persistent-damage-poison')

		const distance = this._.distanceTo(selected, targeted)
		return selected.actor.alliance === targeted.actor.alliance && distance < 10
			&& (dyingCond?.badge?.value > 0 || !!bleedingEffect || !!poisonEffect) && !!healersTools
	}
}