import Action, {SimpleAction} from "../action.js"
import Effect from "../model/effect.js"
import Equipments, { EQU_HEALERS_TOOLS, EQU_HEALERS_TOOLS_EXPANDED } from "../model/equipments.js"

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
		const hasHealersTools = new Equipments(selected).hasAny([EQU_HEALERS_TOOLS, EQU_HEALERS_TOOLS_EXPANDED])
		if (!hasHealersTools)
			return
		super.resultHandler(roll, selected, targeted, options)
		
		const degreeOfSuccess = roll.degreeOfSuccess
		const bonus = degreeOfSuccess == 2 ? 2 : degreeOfSuccess == 3 ? 4 : degreeOfSuccess == 0 ? -2 : 0
		if (bonus !== 0) {
			const diseaseTreated = new Effect(targeted, EFFECT_DISEASE_TREATED)
			diseaseTreated.ensure().then(() => {
				diseaseTreated.setFlag("treatDiseaseBonus", bonus)
			})
		}
	}
	
	applies(selected, targeted) {
		return selected.actor.alliance === targeted.actor.alliance
	}
}