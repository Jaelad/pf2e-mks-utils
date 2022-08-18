import MksUtils from "./mks-utils.js"

/*Enable Debug Module */
Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
	registerPackageDebugFlag(MksUtils.MODULEID)
})

Hooks.on("init", () => {
	game["PF2E_Utils_MKS"] = new MksUtils()
})
