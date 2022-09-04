import $$strings from "../utils/strings.js"

export default class PF2EI18N {
	static $ = (toTranslate) => game.i18n.localize(toTranslate)
	static $$ = (toTranslate, params) => game.i18n.format(toTranslate, params)

	static action(action) {
		return PF2EI18N.$(`PF2E.Actions.${$$strings.camelize(action).replace('-', '')}.Title`)
	}

	static condition(condition) {
		return PF2EI18N.$(`PF2E.ConditionType${$$strings.camelize(action)}`)
	}

	static skillCheck(skill) {
		return PF2EI18N.$(`PF2E.ActionsCheck.${skill}`)
	}

	static skill(skill) {
		return PF2EI18N.$(`PF2E.Skill${$$strings.camelize(skill)}`)
	}

	static save(save) {
		return PF2EI18N.$(`PF2E.Saves${$$strings.camelize(save)}`)
	}

	static spellAttack(tradition) {
		return PF2EI18N.$$("PF2E.SpellAttackWithTradition", {tradition: $$strings.camelize(tradition)})
	}

	static ability(abilityAbrv) {
		return PF2EI18N.$(`PF2E.Ability${$$strings.camelize(abilityAbrv)}`)
	}

	static alignment(alignmentShort) {
		return PF2EI18N.$(`PF2E.Alignment${alignmentShort.toUpperCase()}`)
	}

	static attitude(attitude) {
		return PF2EI18N.$(`PF2E.Attitudes.${$$strings.camelize(attitude)}`)
	}

	static language(lang) {
		return PF2EI18N.$(`PF2E.Language${$$strings.camelize(lang)}`)
	}

	static trait(trait) {
		return PF2EI18N.$(`PF2E.Trait${$$strings.camelize(trait)}`)
	}

	static weapon(weaponSlug) {
		return PF2EI18N.$(`PF2E.Weapon.Base.${weaponSlug}`)
	}

	static actionTag(tag) {
		return PF2EI18N.$(`PF2E.ActionTag.${tag}`)
	}

	static modifier(mod) {
		return PF2EI18N.$(`PF2E.MKS.Modifier.${mod}`)
	}

	static modifierType(mt) {
		return PF2EI18N.$(`PF2E.BonusLabel.${mt}`)
	}

	static uiAction(action) {
		return PF2EI18N.$(`PF2E.MKS.UI.Actions.${action}`)
	}
}