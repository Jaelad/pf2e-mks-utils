import GhostTemplate from "./ghost-template.js";

export default class CentricTemplate extends GhostTemplate {
	constructor() {
		super(...arguments)

		this.onTemplateCreated = null
		this._onMouseMove = event => {
			event.stopPropagation()
		}

		this._onMouseWheel = event => {
			if (event.ctrlKey)
				return

			event.preventDefault()
			event.stopPropagation()
			const snap = (this.wheelSnap ?? 9) * (event.shiftKey ? 3 : event.altKey ? (1/3) : 1)
			this.document._source.direction += snap * Math.sign(event.deltaY)
			this.document.direction += snap * Math.sign(event.deltaY)
			this.refresh()
		}
	}
}