import {default as i18n} from "../../lang/pf2e-i18n.js"

export default class DropItemDialog extends Application {
	constructor(resolve, {title, classes, filter, filteredOutWarning}) {
		super({
			template: "modules/pf2e-tools-mks/templates/drop-item.hbs",
			classes,
			title,
			width: 270,
		})
		this.resolve = resolve
		this.filter = filter
		this.filteredOutWarning = filteredOutWarning
	}
	
	async getData() {
		let data = super.getData()
		data.item = this.item
		return data
	}
	
	activateListeners($html) {
		super.activateListeners($html)
		
		$html.on("drop", async (event) => {
			const json = event.originalEvent?.dataTransfer?.getData("text/plain")
			if (!json?.startsWith("{") || !json.endsWith("}")) return
			
			const data = JSON.parse(json)
			const item = data.type === 'Item' && data.uuid ? await fromUuid(data.uuid) : null
			
			if (item && this.filter?.(item)) {
				this.item = item
				this.render()
			}
			else if (this.filteredOutWarning) {
				ui.notifications.error(i18n.$(this.filteredOutWarning))
			}
		})
		
		$html.find("[data-event-handler=select]").on("click", () => {
			this.close()
		})
		
		$html.find("[data-event-handler=cancel]").on("click", () => {
			this.item = null
			this.close()
		})
	}
	
	close(options = {}) {
		this.resolve(this.item)
		return super.close(options)
	}
	
	static async getItem(options) {
		return new Promise((resolve) => {
			new DropItemDialog(resolve, options).render(true)
		})
	}
}