export default class CentricTemplate extends MeasuredTemplate {
	constructor() {
		super(...arguments)

		this.onTemplateCreated = null
		this._onMouseMove = event => {
			event.stopPropagation()
		}

		this._onLeftClick = () => {
			const destination = canvas.grid.getSnappedPosition(this.x, this.y, 2)
			this.data._source.x = destination.x
			this.data._source.y = destination.y
			const promise = canvas.scene && canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [this.data.toObject()])
			if (this.onTemplateCreated)
				promise.then(this.onTemplateCreated)
			this.destroy()
		}

		this._onMouseWheel = event => {
			if (event.ctrlKey)
				return

			event.preventDefault()
			event.stopPropagation()
			const snap = (this.wheelSnap ?? 9) * (event.shiftKey ? 3 : event.altKey ? (1/3) : 1)
			this.data._source.direction += snap * Math.sign(event.deltaY)
			this.data.direction += snap * Math.sign(event.deltaY)
			this.refresh()
		}
	}

	destroy(options) {
		canvas.stage.off("mousemove", this._onMouseMove)
		canvas.stage.off("mousedown", this._onLeftClick)
		canvas.stage.off("rightdown", this.destroy)
		canvas.app.view.onwheel = null
		canvas.activateLayer("tokens")
		super.destroy(options)
	}

	async drawPreview() {
		this.layer.activate()
		await this.draw()
		this.layer.preview.addChild(this)
		this.activatePreviewListeners()
	}

	activatePreviewListeners() {
		canvas.stage.on("mousemove", this._onMouseMove)
		canvas.stage.on("mousedown", this._onLeftClick)
		canvas.stage.on("rightdown", this.destroy.bind(this))
		canvas.app.view.onwheel = this._onMouseWheel
	}
}