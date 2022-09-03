import {SYSTEM} from "./constants.js"
import {default as LOG} from "../utils/logging.js"

export default class SocketHandler {
	static CHANNEL = 'module.' + SYSTEM.moduleId

	constructor(MKS) {
		this._ = MKS
		this.listeners = {}

		socket.on(SocketHandler.CHANNEL, (data) => {
			const event = data.type
			const gm = data.gm
			delete data.type
			delete data.gm

			if (!gm || game.user.isGM)
				this.listeners[event]?.forEach((handler => handler(data)))
		})
	}

	emit(event, data, onlyGM = false) {
		const eventData = {type: event, gm: onlyGM, ...data}
		socket.emit(SocketHandler.CHANNEL, eventData)
	}

	on(event, handler, onlyGM = false) {
		if (onlyGM && !game.user.isGM)
			return
		this.listeners[event] = this.listeners[event] ?? []
		this.listeners[event].push(handler)
	}

	off(event, handler) {
		if (!handler)
			delete this.listeners[event]
		else {
			this.listeners[event] = this.listeners[event]?.filter(h => h !== handler)
			if (this.listeners[event]?.length === 0)
				delete this.listeners[event]
		}
	}

	async waitFor(event, timeout = 5000) {
		let start = new Date().getTime(), returnedData
		const waiter = function(data) {
			returnedData = data
		}
		this.on(event, waiter)

		const waitForResponse = (resolve, reject) => {
			const timeElapsed = Date.now() - start
			if (returnedData)
				resolve(returnedData)
			else if (timeout && timeElapsed >= timeout)
				reject(new Error("Socket wait timed out!"))
			else
				setTimeout(waitForResponse.bind(this, resolve, reject), 500)
			LOG.debug('Still running : ' + timeElapsed)
		}
		return await new Promise(waitForResponse)
			.finally(() => {
				this.off(event, waiter)
			})
	}
}