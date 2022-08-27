import Compendium from "./compendium.js"
import EffectManager from "./effect-manager.js"
import SimpleCheckRoll from "./simple-checkroll.js"
import ActionAid from "./actions/aid.js"
import ActionGrapple from "./actions/grapple.js"
import EncounterManager from "./encounter-manager.js"
import TemplateManager from "./measurement/template-manager.js"

export default class MksUtils {
	static i18n = (toTranslate) => game.i18n.localize(toTranslate)

	static MODULEID = 'pf2e-tools-mks'
	static FOUNDRY_VERSION = 0
	static GAME_SYSTEM = null
	static LOG_LEVEL = {
		Debug: 0,
		Info: 1,
		Warn: 2,
		Error: 3
	}
	static REGEX_SPELLCASTING_SELECTOR = /spell\[(arcane|primal|divine|occult)]/
	static REGEX_SKILL_SELECTOR = /skill\[(\w+)]/
	static REGEX_STRIKE_SELECTOR = /strike\[(\w+)]/

	constructor() {
		MksUtils.FOUNDRY_VERSION = game.version ?? game.data.version
		MksUtils.GAME_SYSTEM = game.system?.id ?? game.data.system.id
		this.systemSupported = /pf2e/.exec(MksUtils.GAME_SYSTEM) !== null

		this.effectManager = new EffectManager(this)
		this.encounterManager = new EncounterManager(this)
		this.simpleCheckRoll = new SimpleCheckRoll(this)
		this.templateManager = new TemplateManager(this)

		this.actions = {
			aid: new ActionAid(this),
			grapple: new ActionGrapple(this)
		}
	}

    static withTemplate = (template, vars = {}) => {
        const handler = new Function('vars', [
            'const tagged = ( ' + Object.keys(vars).join(', ') + ' ) =>',
            '`' + template + '`',
            'return tagged(...Object.values(vars))'
        ].join('\n'))

        return handler(vars)
    }

	static async sleep(msec) {
		return new Promise(resolve => setTimeout(resolve, msec))
	}

	static escapeHtml(html) {
		const text = document.createTextNode(html);
		const p = document.createElement('p');
		p.appendChild(text);
		return p.innerHTML;
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

	static debug(...args) {
		MksUtils.log(true, MksUtils.LOG_LEVEL.Debug, ...args)
	}
	static info(...args) {
		MksUtils.log(true, MksUtils.LOG_LEVEL.Info, ...args)
	}
	static warn(...args) {
		MksUtils.log(true, MksUtils.LOG_LEVEL.Warn, ...args)
	}
	static error(...args) {
		MksUtils.log(true, MksUtils.LOG_LEVEL.Error, ...args)
	}

	getTokenById(tokenId) {
		//return canvas.tokens.placeables.find(t => t.id === tokenId)
		return game.scenes.active.tokens.get(tokenId)
	}

	ensureOneSelected() {
		let tokens = canvas.tokens.controlled
		if (tokens.length != 1) {
			const warning = MksUtils.i18n("pf2e.mks.warning.actor.onemustbeselected")
			ui.notifications.warn(warning)
			throw new Error(warning)
		}
		return tokens[0]
	}

	ensureAtLeastOneSelected() {
		let tokens = canvas.tokens.controlled
		if (tokens.length < 1) {
			const warning = MksUtils.i18n("pf2e.mks.warning.actor.atleastonemustbeselected")
			ui.notifications.warn(warning)
			throw new Error(warning)
		}
		return tokens
	}

	ensureOneTarget(player) {
		let tokens
		if (player)
			tokens = game.users.players.find(p => p.name == player).targets
		else
			tokens = game.user.targets
		if (tokens.size != 1) {
			const warning = MksUtils.i18n("pf2e.mks.warning.target.onemustbeselected")
			ui.notifications.warn(warning)
			throw new Error(warning)
		}
		return Array.from(tokens)[0]
	}

	ensureAtLeastOneTarget(player) {
		let tokens
		if (player)
			tokens = game.users.players.find(p => p.name === player).targets
		else
			tokens = game.user.targets
		if (tokens.length < 1) {
			const warning = MksUtils.i18n("pf2e.mks.warning.target.atleastonemustbeselected")
			ui.notifications.warn(warning)
			throw new Error(warning)
		}
		return Array.from(tokens)
	}

	localSave(key, value, actor = null) {
		const storeKey = (actor ? actor.id + "/" : "") + key
		const storeValue = JSON.stringify(value)
		localStorage.setItem(storeKey, storeValue)
		MksUtils.info("Store: " + storeKey + ":" + storeValue)
	}

	localLoad(key, actor = null) {
		const storeKey = (actor ? actor.id + "/" : "") + key
		const storeValue = localStorage.getItem(storeKey)
		return JSON.parse(storeValue)
	}

	localDelete(key, actor = null) {
		const storeKey = (actor ? actor.id + "/" : "") + key
		localStorage.removeItem(storeKey)
	}

	getAttackActionStats(ready=null) {
		let actor = this.ensureOneSelected().actor
		if (!actor) return

		return actor.data.data.actions.filter(a => ready === null || a.ready === ready)
	}

    getSkillStat(skill) {
        let actor = this.ensureOneSelected().actor
        if (!actor) return

        return actor.skills[skill]
    }

	getSkillStats(proficiencyRankThreshold=null) {
		let actor = this.ensureOneSelected().actor
		if (!actor) return

		let skillStats = Object.entries(actor.skills).map(([key, skill]) => {
			if (proficiencyRankThreshold === null || skill.rank >= proficiencyRankThreshold)
				return skill
		})
		return skillStats.filter(s => s)
	}
}
