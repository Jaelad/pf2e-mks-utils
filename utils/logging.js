export default class Logger {
	static LOG_LEVEL = {
		Debug: 0,
		Info: 1,
		Warn: 2,
		Error: 3
	}

	static log(level, ...args) {
		const shouldLog = true //game.modules.get('_dev-mode')?.api?.getPackageDebugValue(MksUtils.MODULEID)

		if (shouldLog) {
			switch (level) {
				case Logger.LOG_LEVEL.Error:
					console.error("MKS Utils", '|', ...args)
					break
				case Logger.LOG_LEVEL.Warn:
					console.warn("MKS Utils", '|', ...args)
					break
				case Logger.LOG_LEVEL.Info:
					console.info("MKS Utils", '|', ...args)
					break
				case Logger.LOG_LEVEL.Debug:
				default:
					console.debug("MKS Utils", '|', ...args)
					break
			}
		}
	}

	static debug(...args) {
		Logger.log(Logger.LOG_LEVEL.Debug, ...args)
	}
	static info(...args) {
		Logger.log(Logger.LOG_LEVEL.Info, ...args)
	}
	static warn(...args) {
		Logger.log(Logger.LOG_LEVEL.Warn, ...args)
	}
	static error(...args) {
		Logger.log(Logger.LOG_LEVEL.Error, ...args)
	}
}