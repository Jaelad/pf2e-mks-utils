import {SYSTEM} from "./constants.js"

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

			this.listeners[event]?.forEach((handler => handler(data)))
		})
	}

	emit(event, data, onlyGM = true) {
		const eventData = {type: event, gm: onlyGM, ...data}
		socket.emit(SocketHandler.CHANNEL, eventData)
	}

	on(event, handler) {
		this.listeners[event] = this.listeners[event] ?? []
		this.listeners[event].push(handler)
	}
}