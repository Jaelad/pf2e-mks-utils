export default class PF2EI18N {
	static camelize(str, initialUpper = true) {
		return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
			return !initialUpper && index === 0  ? word.toLowerCase() : word.toUpperCase()
		}).replace(/\s+/g, '')
	}

	static $ = (toTranslate) => game.i18n.localize(toTranslate)

	static action(action) {
		return PF2EI18N.$(`PF2E.Actions.${PF2EI18N.camelize(action)}.Title`)
	}

	static condition(condition) {
		return PF2EI18N.$(`PF2E.ConditionType${PF2EI18N.camelize(action)}`)
	}

	static skillCheck(skill) {
		return PF2EI18N.$(`PF2E.ActionsCheck.${skill}`)
	}

	static skill(skill) {
		return PF2EI18N.$(`PF2E.Skill${PF2EI18N.camelize(skill)}`)
	}

	static save(save) {
		return PF2EI18N.$(`PF2E.Saves${PF2EI18N.camelize(save)}`)
	}

	static ability(abilityAbrv) {
		return PF2EI18N.$(`PF2E.Ability${PF2EI18N.camelize(abilityAbrv)}`)
	}

	static alignment(alignmentShort) {
		return PF2EI18N.$(`PF2E.Alignment${alignmentShort.toUpperCase()}`)
	}

	static attitude(attitude) {
		return PF2EI18N.$(`PF2E.Attitudes.${PF2EI18N.camelize(attitude)}`)
	}

	static language(lang) {
		return PF2EI18N.$(`PF2E.Language${PF2EI18N.camelize(lang)}`)
	}

	static trait(trait) {
		return PF2EI18N.$(`PF2E.Trait${PF2EI18N.camelize(trait)}`)
	}

}