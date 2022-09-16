import Action, {SimpleAction} from "../action.js"
import Compendium from "../compendium.js"
import Dialogs from "../apps/dialogs.js"

export class ActionAdministerFirstAid extends SimpleAction {
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

	async act(options = {}) {
		const {applicable, selected, targeted} = this.isApplicable(null,true)
		if (!applicable) return

		const dyingCond = this.effectManager.getCondition(targeted, 'dying')
		const bleedingEffect = this.effectManager.getEffect(targeted, 'persistent-damage-bleed')

		let dc, affliction
		if (dyingCond && bleedingEffect)
			affliction = await Dialogs.multipleButtons([
				{ value: 'dying', name: 'PF2E.Actions.AdministerFirstAid.Dying'},
				{ value: 'bleeding', name: 'PF2E.Actions.AdministerFirstAid.Bleeding'},
			], "PF2E.MKS.Dialog.AdministerFirstAid.SelectType")
				?? 'dying'
		else if (dyingCond)
			affliction = 'dying'
		else if (bleedingEffect)
			affliction = 'bleeding'

		if (affliction === 'dying')
			dc = dyingCond.badge.value + 15
		else if (affliction === 'bleeding')
			dc = bleedingEffect.flags.persistent.dc

		super.act({overrideDC: dc, affliction})
	}

	async resultHandler(roll, selected, targeted, options) {
		if (options.affliction === 'dying') {
			if (roll?.data.degreeOfSuccess > 1) {
				this.effectManager.removeCondition(targeted, 'dying').then(() => {
					this.effectManager.setCondition(targeted, 'unconscious').then()
				})
			}
			else if (roll?.data.degreeOfSuccess === 0) {
				const dyingCond = this.effectManager.getCondition(targeted, 'dying')
				this.effectManager.setBadge(dyingCond, {increment: 1}).then()
			}
		}
		else if (options.affliction === 'bleeding') {
			const flatCheckRoll = await new Roll('1d20').roll({async: true})
			if (flatCheckRoll.result >= options.overrideDC) {
				this.effectManager.removeEffect(targeted, 'persistent-damage-bleed').then()
			}
			else if (roll?.data.degreeOfSuccess === 0) {
				const bleedingEffect = this.effectManager.getEffect(targeted, 'persistent-damage-bleed')
				const healthLost = await new Roll(bleedingEffect.flags.persistent.value).roll({async: true})
				this._.actorManager.hpChange(targeted, -1 * healthLost)
			}
		}
	}

	applies(selected, targeted) {
		const healersTools = selected.actor.itemTypes.equipment.find(e => e.slug === 'healers-tools' && ['held', 'worn'].includes(e.carryType))
		const healersToolsOk = healersTools.carryType === 'held' || this._.inventoryManager.handsFree(selected) > 0
		const dyingCond = this.effectManager.getCondition(targeted, 'dying')
		const bleedingEffect = this.effectManager.getEffect(targeted, 'persistent-damage-bleed')

		const distance = this._.distanceTo(selected, targeted)
		return !!selected && !!targeted && selected.actor.alliance === targeted.actor.alliance && distance < 10
			&& (dyingCond?.badge?.value > 0 || !!bleedingEffect) && healersToolsOk
	}
}