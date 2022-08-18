export default class MksUtils {
	i18n = (toTranslate) => game.i18n.localize(toTranslate)

	static MODULEID = 'pf2e-utils-mks'
	static FOUNDRY_VERSION = 0
	static GAME_SYSTEM = null
	static LOG_LEVEL = {
		Debug: 0,
		Info: 1,
		Warn: 2,
		Error: 3
	}

	constructor() {
		this.initHooks()

		MksUtils.FOUNDRY_VERSION = game.version ?? game.data.version
		MksUtils.GAME_SYSTEM = game.system?.id ?? game.data.system.id
		this.systemSupported = /pf2e/.exec(MksUtils.GAME_SYSTEM) !== null
	}

    static withTemplate = (template, vars = {}) => {
        const handler = new Function('vars', [
            'const tagged = ( ' + Object.keys(vars).join(', ') + ' ) =>',
            '`' + template + '`',
            'return tagged(...Object.values(vars))'
        ].join('\n'))

        return handler(vars)
    }

	static log(force, level, ...args) {
		const shouldLog = force || game.modules.get('_dev-mode')?.api?.getPackageDebugValue(MksUtils.MODULEID)

		if (shouldLog) {
			switch (level) {
				case MksUtils.LOG_LEVEL.Error:
					console.error("MKS Utils", '|', ...args)
					break
				case MksUtils.LOG_LEVEL.Warn:
					console.warn("MKS Utils", '|', ...args)
					break
				case MksUtils.LOG_LEVEL.Info:
					console.info("MKS Utils", '|', ...args)
					break
				case MksUtils.LOG_LEVEL.Debug:
				default:
					console.debug("MKS Utils", '|', ...args)
					break
			}
		}
	}

	static debug(perdicate, ...args) {
		if (perdicate)
			MksUtils.log(true, MksUtils.LOG_LEVEL.Debug, ...args)
	}
	static info(perdicate, ...args) {
		if (perdicate)
			MksUtils.log(true, MksUtils.LOG_LEVEL.Info, ...args)
	}
	static warn(perdicate, ...args) {
		if (perdicate)
			MksUtils.log(true, MksUtils.LOG_LEVEL.Warn, ...args)
	}
	static error(perdicate, ...args) {
		if (perdicate)
			MksUtils.log(true, MksUtils.LOG_LEVEL.Error, ...args)
	}

	initHooks() {

	}

	_ensureOneActor() {
		let tokens = canvas.tokens.controlled
		if (tokens.length != 1) {
			ui.notifications.warn(this.i18n("utils.mks.warning.actor.onemustbeselected"))
			return null
		}
		return tokens[0].actor
	}

	_ensureAtLeastOneActor(actor) {
		let tokens = canvas.tokens.controlled
		if (tokens.length < 1) {
			ui.notifications.warn(this.i18n("utils.mks.warning.actor.atleastonemustbeselected"))
			return null
		}
		return tokens.map(token => token.actor)
	}

	getAttackActionStats(ready=null) {
		let actor = this._ensureOneActor()
		if (!actor) return

		return actor.data.data.actions.filter(a => ready === null || a.ready === ready)
	}

    getSkillStat(skill) {
        let actor = this._ensureOneActor()
        if (!actor) return

        return actor.skills[skill]
    }

	getSkillStats(proficiencyRankThreshold=null) {
		let actor = this._ensureOneActor()
		if (!actor) return

		let skillStats = Object.entries(actor.skills).map(([key, skill]) => {
			if (proficiencyRankThreshold === null || skill.rank >= proficiencyRankThreshold)
				return skill
		})
		return skillStats.filter(s => s)
	}

	// visibility?: "none" | "gm" | "owner" | "all"
	skillCheckAgainstStaticDC(skill, messageTemplate, dc = null, dcVisibility = 'gm') {
        let actors = this._ensureAtLeastOneActor()
        if (!actors || actors.length < 1) return

		if (!messageTemplate)
			messageTemplate = this.i18n("utils.mks.skill.roll.check.defaulttitle.firstpart")
				+ (dc > 0 && (dcVisibility == 'all' || dcVisibility == 'owner') ? " " + this.i18n("utils.mks.skill.roll.check.defaulttitle.dcpart") : "")

        const promises = {}

        actors.forEach(actor => {
            let skillStat = actor.skills[skill]
            let message = MksUtils.withTemplate(messageTemplate, {actor, skill: skillStat, dc})

            const options = actor.getRollOptions(['skill-check']);
            const context = {
                actor: actor,
                type: 'skill-check',
                options,
                notes: skillStat.notes
            }
            if (dc > 0)
                context.dc = {value: dc, visibility: dcVisibility}

            let promise = game.pf2e.Check.roll(new game.pf2e.CheckModifier(message, skillStat, []), context)
            promises[actor.id] = promise
        })
        return promises
    }
}
/*
let spellCasting = actor.data.items.find(i => i.type == 'spellcastingEntry')
console.log(spellCasting.statistic)
const options = actor.getRollOptions(['arcane-spell-attack']);
let promise = game.pf2e.Check.roll(
	new game.pf2e.CheckModifier("TEST", spellCasting.statistic.check, []), {
	  actor: actor, type: 'arcane-spell-attack',
	  options, notes: [],
	  dc: {
		value: 20
	  }
	},
	event
  )
promise.
	then(function (value) {
		console.log(value);
	}).
	catch(function (err) {
		console.log(err);
	});

*/