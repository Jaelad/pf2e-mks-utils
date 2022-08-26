import MksUtils from "./mks-utils.js"

export default class SimpleCheckRoll {
	constructor(MKS) {
		this._ = MKS
	}

	getCheckTypes(actor) {
		const checkTypes = ["perception", "fortitude", "reflex", "will"]
		Object.keys(actor.skills).forEach(skillName => {
			checkTypes.push("skill[" + skillName + "]")
		})
		actor.spellcasting.forEach(sc => {
			checkTypes.push("spell[" + sc.tradition + "]")
		})
		actor.data.data.actions.forEach(action => {
			if (action.type === 'strike' && action.ready)
				checkTypes.push("strike[" + action.slug + "]")
		})
		return checkTypes
	}

	getStat(actor, type) {
		let match, stat

		if (type === "ac")
			stat = actor.attributes.ac
		else if (type === "perception")
			stat = actor.perception
		else if (type === "class")
			stat = actor.attributes.classDC
		else if (type === "fortitude")
			stat = actor.saves.fortitude
		else if (type === "reflex")
			stat = actor.saves.reflex
		else if (type === "will")
			stat = actor.saves.will
		else if (type === "spell")
			stat = actor.spellcasting.find()?.statistic
		else if (match = MksUtils.REGEX_SPELLCASTING_SELECTOR.exec(type)) {
			let tradition = match[1]
			stat = actor.spellcasting.find(sc => sc.tradition === tradition)?.statistic
		}
		else if (match = MksUtils.REGEX_SKILL_SELECTOR.exec(type)) {
			let skill = match[1]
			stat = actor.skills[skill]
		}
		else if (match = MksUtils.REGEX_STRIKE_SELECTOR.exec(type)) {
			let slug = match[1]
			stat = actor.data.data.actions.find(strike => strike.slug === slug)
		}
		if (!stat)
			throw new Error("Illegal stat type : " + type)
		return stat
	}

	_getDefaultDomain(checkType) {
		if (checkType === "perception")
			return "perception-check"
		else if (checkType === "fortitude" || checkType === "reflex" || checkType === "will")
			return "saving-throw"
		else if (checkType.startsWith("skill"))
			return "skill-check"
		else if (checkType.startsWith("spell"))
			return "spell-attack"
		else
			throw new Error("Illegal check type : " + checkType)
	}

	_prepareCheckContext(actor, checkType, domain, dc = null, dcVisibility = 'gm') {
		const context = {
			actor,
			type: domain,
			stat: this.getStat(actor, checkType),
			options: actor.getRollOptions([domain]),
			notes: null
		}

		if (!context.stat)
			throw new Error("Cannot find stat : " + checkType)
		context.notes = context.stat.notes

		if (dc > 0)
			context.dc = {value: dc, visibility: dcVisibility}

		return context
	}

	// dcType examples: "ac" | "perception" | "fortitude" | "reflex" | "will" | "class" | "spell[arcane]" | "skill[athletics]"
	// dcReduce: "max" | "min" | "avg"
	// dcVisibility?: "none" | "gm" | "owner" | "all"
	check(tokens, targets, checkType, dcType ,domain = null, playerWhoTargets = null, dcReduce = "max", dcVisibility = 'gm', messageTemplate = null) {
		let dc = this.resolveDC(targets, dcType, dcReduce)
		return this.checkStatic(tokens, checkType, domain, dc, dcVisibility, messageTemplate)
	}

	// dcVisibility?: "none" | "gm" | "owner" | "all"
	checkStatic(tokens, checkType, domain = null, dc = null, dcVisibility = 'gm', messageTemplate = null) {
		if (!domain)
			domain = this._getDefaultDomain(checkType)

		if (!messageTemplate)
			messageTemplate = MksUtils.i18n("pf2e.mks.check."+ domain +".defaulttitle.firstpart")
				+ (dc > 0 && dcVisibility === 'all' ? " " + MksUtils.i18n("pf2e.mks.check.defaulttitle.dcpart") : "")

		const promises = {}
		tokens.forEach(token => {
			const actor = token.actor
			const context = this._prepareCheckContext(actor, checkType, domain, dc, dcVisibility)
			const stat = context.stat
			delete context.stat
			let message = MksUtils.withTemplate(messageTemplate, {actor, stat, dc})

			promises[token.id] = game.pf2e.Check.roll(new game.pf2e.CheckModifier(message, stat, []), context)
		})
		return promises
	}

	// type examples: "ac" | "perception" | "fortitude" | "reflex" | "will" | "class" | "spell[arcane]" | "skill[athletics]"
	// reduce: "max" | "min" | "avg"
	resolveDC(actors, type, reduce = "max") {
		if (!Array.isArray(actors))
			actors = [actors]
		let dcs = []
		actors.forEach(actor => {
			let stat = this.getStat(actor, type)
			dcs.push(stat.dc ? stat.dc.value : stat.value ?? 0)
		})

		switch (reduce) {
			case "max": return Math.max(dcs)
			case "min": return Math.min(dcs)
			case "avg": return dcs.reduce((a, b) => a + b, 0) / dcs.length
			default: throw new Error("Illegal reduce operation : " + reduce)
		}
	}
}