import {SimpleAction} from "../action.js"
import Dialogs from "../apps/dialogs.js"
import {default as i18n} from "../../lang/pf2e-i18n.js"
import CommonUtils from "../helpers/common-utils.js"
import Condition, { CONDITION_DYING } from "../model/condition.js"
import PersistentDamage, { PERSISTENT_BLEED, PERSISTENT_POISON } from "../model/persistent-damage.js"
import Equipments, { EQU_HEALERS_TOOLS, EQU_HEALERS_TOOLS_EXPANDED } from "../model/equipments.js"
import Effect, { EFFECT_POISON_TREATED } from "../model/effect.js"
import Item from "../model/item.js"

export default class ActionAdministerFirstAid extends SimpleAction {
	constructor(MKS) {
		super(MKS, 'administerFirstAid', 'encounter', false, false, {
			icon: "systems/pf2e/icons/spells/heal-companion.webp",
			tags: ['assist'],
			actionGlyph: 'D',
			targetCount: 1,
			opposition: 'ally',
			checkType: 'skill[medicine]',
			traits: ['manipulate']
		})
	}
	
	pertinent(engagement, warn) {
		const adjacent = engagement.isAdjacent
		const affl = Item.hasAny(engagement.targeted, CONDITION_DYING) || PersistentDamage.hasAny(engagement.targeted, [PERSISTENT_BLEED, PERSISTENT_POISON])
		if (warn && !adjacent)
			this._.warn("PF2E.Actions.Warning.Reach")
		if (warn && !affl)
			this._.warn("PF2E.Actions.Warning.NoAffliction")

		return adjacent && affl
	}
	
	async act(engagement) {
		const targeted = engagement.targeted
		const equipments = new Equipments(engagement.initiator)
		const healersTools = !!game.combat
					? equipments.hasEquippedAny([EQU_HEALERS_TOOLS, EQU_HEALERS_TOOLS_EXPANDED]).length > 0
					: equipments.hasAny([EQU_HEALERS_TOOLS, EQU_HEALERS_TOOLS_EXPANDED]).length > 0
		
		if (!healersTools) {
			this._.warn("PF2E.MKS.Warning.Action.MustUseHealersTools")
			return
		}
		
		const dying = new Condition(targeted, CONDITION_DYING)
		const bleeding = new PersistentDamage(targeted, PERSISTENT_BLEED)
		const poisoned = new PersistentDamage(targeted, PERSISTENT_POISON)
		
		const ok = (dying.value > 0 || bleeding.exists || poisoned.exists) && healersTools.length > 0
		if (!ok) return
		
		const buttons = []
		if (dying.value > 0)
			buttons.push({ value: 'dying', name: 'PF2E.Actions.AdministerFirstAid.Dying'})
		if (bleeding.exists)
			buttons.push({ value: 'bleeding', name: 'PF2E.Actions.AdministerFirstAid.Bleeding'})
		if (poisoned.exists)
			buttons.push({ value: 'poisoned', name: 'PF2E.Actions.AdministerFirstAid.Poisoned'})
		
		let dc, affliction, formula, id
		if (buttons.length > 1)
			affliction = await Dialogs.multipleButtons(buttons, "PF2E.MKS.Dialog.AdministerFirstAid.SelectType") ?? 'dying'
		else if (dying.value > 0)
			affliction = 'dying'
		else if (bleeding.exists)
			affliction = 'bleeding'
		else if (poisoned.exists)
			affliction = 'poisoned'
		
		if (affliction === 'dying') {
			dc = dying.value + 15
			id = dying.item.id
		}
		else if (affliction === 'bleeding') {
			dc = bleeding.dc
			formula = bleeding.formula
			id = bleeding.item.id
		}
		else if (affliction === 'poisoned') {
			dc = poisoned.dc
			formula = poisoned.formula
			id = poisoned.item.id
		}
		else
			return
		
		return super.act( engagement, {overrideDC: dc, affliction, formula, conditionId: id})
	}

	async flatCheck(targeted, effect, message) {
		const flatCheckRoll = new Roll('1d20').roll({async: false})
		CommonUtils.chat(targeted, i18n.$$(message, {roll: flatCheckRoll.result}))
		
		if (flatCheckRoll.result >= 15) {
			await effect.purge()
			return true
		}
		return false
	}
	
	async apply(engagement, result) {
		const targeted = engagement.targeted, options = result.options
		const degreeOfSuccess = result.roll.degreeOfSuccess
		if (options.affliction === 'dying') {
			const dying = new Condition(targeted, CONDITION_DYING)
			if (degreeOfSuccess > 1) {
				await dying.purge()
			}
			else if (degreeOfSuccess === 0) {
				await dying.setValue(1, true)
			}
		}
		else if (options.affliction === 'bleeding') {
			const bleeding = new PersistentDamage(targeted, PERSISTENT_BLEED)
			if (degreeOfSuccess > 1) {
				const bleedingStopped = await this.flatCheck(targeted, bleeding, "PF2E.Actions.AdministerFirstAid.BleedingFlatCheck")
				if (!bleedingStopped && degreeOfSuccess > 2)
					await this.flatCheck(targeted, bleeding, "PF2E.Actions.AdministerFirstAid.BleedingFlatCheck")
			}
			else if (degreeOfSuccess === 0) {
				const healthLost = new Roll(options.formula).roll({async: false}).total
				this._.actorManager.applyHPChange(targeted, {value: -1 * healthLost}).then(()=> {
					CommonUtils.chat(targeted, i18n.$$("PF2E.MKS.Chat.HealthLost", {healthLost}))
				})
			}
		}
		else if (options.affliction === 'poisoned') {
			const poisoning = new PersistentDamage(targeted, PERSISTENT_POISON)
			if (degreeOfSuccess > 1) {
				const poisoningStopped = await this.flatCheck(targeted, poisoning, "PF2E.Actions.AdministerFirstAid.PoisoningFlatCheck")
				if (!poisoningStopped && degreeOfSuccess > 2)
					await this.flatCheck(targeted, poisoning, "PF2E.Actions.AdministerFirstAid.PoisoningFlatCheck")
			}
			else if (degreeOfSuccess === 0) {
				const healthLost = new Roll(options.formula).roll({async: false}).total
				this._.actorManager.applyHPChange(targeted, {value: -1 * healthLost}).then(()=> {
					CommonUtils.chat(targeted, i18n.$$("PF2E.MKS.Chat.HealthLost", {healthLost}))
				})
			}
		}
	}
}