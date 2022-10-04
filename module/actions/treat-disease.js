import Action, {SimpleAction} from "../action.js"
import Compendium from "../compendium.js"

export default class ActionTreatDisease extends SimpleAction {
	
	constructor(MKS) {
		super(MKS, {action: 'treatDisease',
			traits: ['manipulate', 'downtime'],
			checkType: 'skill[medicine]',
			icon: "systems/pf2e/icons/effects/treat-disease.webp",
			tags: ['preparation'],
			actionGlyph: '',
			targetCount: 1,
			mode: "downtime"
		})
	}
	
	async resultHandler(roll, selected, targeted, options) {
		super.resultHandler(roll, selected, targeted, options)
		
		const degreeOfSuccess = roll.data.degreeOfSuccess
		const bonus = degreeOfSuccess === 2 ? 2 : degreeOfSuccess === 3 ? 4 : degreeOfSuccess === 0 ? -2 : 0
		if (bonus !== 0)
			this.effectManager.setEffect(targeted, Compendium.EFFECT_DISEASE_TREATED, {flags: {"mks.treatDiseaseBonus": bonus}}).then()
	}
	
	applies(selected, targeted) {
		const healersTools = !!selected && selected.actor.itemTypes.equipment.find(e => e.slug === 'healers-tools' && ['held', 'worn'].includes(e.carryType))
		const healersToolsOk = healersTools && (healersTools.carryType === 'held' || this._.inventoryManager.handsFree(selected) > 0)
		
		return selected.actor.alliance === targeted.actor.alliance && healersToolsOk
	}
}