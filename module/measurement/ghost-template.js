export default class GhostTemplate extends MeasuredTemplate {
	constructor() {
		super(...arguments)
		this.onTemplateCreated = null
		this.moveTime = 0

		this._onMouseMove = event => {
			event.stopPropagation()
			const now = Date.now()
			if (now - this.moveTime <= 20)
				return;
			const center = event.getLocalPosition(this.layer),
				snapped = canvas.grid.getSnappedPosition(center.x, center.y, 2);
			this.document.x = snapped.x
			this.document.y = snapped.y
			this.refresh()
			this.moveTime = now
		}

		this._onMouseWheel = event => {
			if (event.ctrlKey) {
				event.preventDefault()
				event.stopPropagation()
				const delta = canvas.grid.type > CONST.GRID_TYPES.SQUARE ? 30 : 15,
					snap = event.shiftKey ? delta : 5;
				this.document._source.direction += snap * Math.sign(event.deltaY)
				this.document.direction += snap * Math.sign(event.deltaY)
				this.refresh()
			}
			else if (event.shiftKey) {
				event.preventDefault()
				event.stopPropagation()
				const snap = 45
				this.document._source.direction += snap * Math.sign(event.deltaY)
				this.document.direction += snap * Math.sign(event.deltaY)
				this.refresh()
			}
		}

		this._onLeftClick = () => {
			const destination = canvas.grid.getSnappedPosition(this.x, this.y, 2)
			this.document._source.x = destination.x
			this.document._source.y = destination.y
			const promise = canvas.scene && canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [this.document.toObject()])
			const callback = this.onTemplateCreated
			if (callback)
				promise.then((templates) => {
					templates?.length > 0 && setTimeout(()=> callback(templates[0]), 100)
				})
			this.destroy()
		}
	}

	destroy(options) {
		canvas.stage.off("mousemove", this._onMouseMove)
		canvas.stage.off("mousedown", this._onLeftClick)
		canvas.stage.off("rightdown", this.destroy)
		canvas.app.view.onwheel = null
		canvas["tokens"].activate()
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