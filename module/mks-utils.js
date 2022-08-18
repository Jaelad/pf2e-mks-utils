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

    initHooks() {

    }

    getAttackActions(actor, ready=null) {
        return actor.data.data.actions.filter(a => ready === null || a.ready === ready)
    }

    getAttackActions(actor, proficient=null) {
        return actor.data.skills.filter(s => proficient === null || s.proficient === proficient)
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