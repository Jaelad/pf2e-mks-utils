export const SYSTEM = {
	moduleId: 'pf2e-tools-mks',
	foundryVersion: () => game.version ?? game.data.version,
	gameSystem: () => game.system?.id ?? game.data.system.id,
	systemSupported: () => /pf2e/.exec(SYSTEM.gameSystem())
}

export const SELECTORS = {
	spellcasting: /spell\[(arcane|primal|divine|occult)]/,
	skill: /skill\[([\w,]+)]/,
	strike: /strike\[([\w-]+)]/,
}

export const MODIFIER_TYPE = {
	ABILITY: "ability",
	PROFICIENCY: "proficiency",
	CIRCUMSTANCE: "circumstance",
	ITEM: "item",
	POTENCY: "potency",
	STATUS: "status",
	UNTYPED: "untyped",
}

export const ACTION_GLYPH = {
	A: {img: "systems/pf2e/icons/actions/OneAction.webp"},
	D: {img: "systems/pf2e/icons/actions/TwoActions.webp"},
	T: {img: "systems/pf2e/icons/actions/ThreeActions.webp"},
	F: {img: "systems/pf2e/icons/actions/FreeAction.webp"},
	R: {img: "systems/pf2e/icons/actions/Reaction.webp"},
	'': {img: "systems/pf2e/icons/actions/Empty.webp"}
}

export const DEGREE_OF_SUCCESS_STRINGS = ["criticalFailure", "failure", "success", "criticalSuccess"]

export const ATTITUDES = ['hostile', 'unfriendly', 'indifferent', 'friendly', 'helpful']
export const AWARENESS = ['unnoticed', 'undetected', 'hidden', 'observed']
export const COVER = ['none', 'lesser', 'standard', 'greater']

export const SKILLS = {
	acrobatics: "acr",
	arcana: "arc",
	athletics: "ath",
	crafting: "cra",
	deception: "dec",
	diplomacy: "dip",
	intimidation: "itm",
	medicine: "med",
	nature: "nat",
	occultism: "occ",
	performance: "prf",
	religion: "rel",
	society: "soc",
	stealth: "ste",
	survival: "sur",
	thievery: "thi"
}

export const ACTOR_IDENTIFICATION = {
	'aberration': ['occultism'],
	'animal': ['nature'],
	'astral': ['occultism'],
	'beast': ['arcana', 'nature'],
	'celestial': ['religion'],
	'construct': ['crafting', 'arcana'],
	'dragon': ['arcana'],
	'elemental': ['arcana', 'nature'],
	'ethereal': ['occultism'],
	'fey': ['nature'],
	'fiend': ['religion'],
	'fungus': ['nature'],
	'humanoid': ['society'],
	'monitor': ['religion'],
	'ooze': ['occultism'],
	'plant':  ['nature'],
	'spirit': ['occultism'],
	'undead': ['religion'],
	'trap': ['survival'],
	'environmental': ['nature', 'survival'],
	'haunt': ['occultism', 'religion']
}

export const ROLL_MODE = {
	PUBLIC: 'publicroll',
	GM: 'gmroll',
	BLIND: 'blindroll',
	SELF: 'selfroll'
}

export const SKILL_LONG_FORMS = Object.keys(SKILLS)
export const SAVE_TYPES = ["fortitude", "reflex", "will"]
export const DC_SLUGS = new Set(["ac", "perception", ...SAVE_TYPES, ...SKILL_LONG_FORMS])

export const PROFICIENCY_RANK_OPTION = [
	"proficiency:untrained",
	"proficiency:trained",
	"proficiency:expert",
	"proficiency:master",
	"proficiency:legendary",
]