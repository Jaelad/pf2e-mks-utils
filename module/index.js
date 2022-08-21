import MksUtils from "./mks-utils.js"
import ActionAid from "./aid.js"

/*Enable Debug Module */
Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
	registerPackageDebugFlag(MksUtils.MODULEID)
})

Hooks.on("init", () => {
	const MKS = new MksUtils()
	game["PF2E_Utils_MKS"] = MKS
	MKS.actions = {
		aid: new ActionAid(MKS)
	}

})
