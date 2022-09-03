import GhostTemplate from "./ghost-template.js"
import CentricTemplate from "./centric-template.js"
import {default as LOG} from "../../utils/logging.js"
import {TemplatePresets} from "./presets.js";

export default class TemplateManager {
	constructor(MKS) {
		this._ = MKS
	}

	//canvas.grid.highlightLayers
	//Template.v78LKhfJ6B2gKUuW.... positions
	draw(token, callback = null, {
		wheelSnap = 9,
		x = (token) => token.data.x + canvas.grid.grid.w / 2,
		y = (token) => token.data.y + canvas.grid.grid.h / 2,
		user = (token) => game.user.id,
		color = (token) => game.user.color,
		preset
	}, overrides = {}){
		if (!token || !TemplatePresets[preset])
			return

		const options = {...TemplatePresets[preset], ...overrides}

		options.x  = x ? x(token) : 0
		options.y  = y ? y(token) : 0
		options.user = user(token)
		options.fillColor = color(token)

		const templateDoc = new MeasuredTemplateDocument(options, {
			parent: canvas.scene
		})
		const template = options.ttype === 'ghost' ? new GhostTemplate(templateDoc) : new CentricTemplate(templateDoc)
		template.wheelSnap = Math.round((wheelSnap ?? 9)/3.0) * 3
		template.onTemplateCreated = callback
		template.drawPreview().then()
	}

	deleteTemplate(templateId) {
		canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [templateId])
	}

	deleteAllTemplates() {
		canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [], {deleteAll: true})
	}

	getEncompassingTokens(template, filter) {
		const positions = canvas.grid.highlightLayers["Template." + template.id]?.positions
		if (!positions) {
			LOG.warn(`Cannot locate highlight positions for template ${template.id}!`)
			return
		}

		const tokens = []
		Array.from(canvas.scene.tokens.values()).forEach(token => {
			if (positions.has(token.x + "." + token.y) && (jQuery.isFunction(filter) ? filter(token) : true))
				tokens.push(token.object)
		})
		return tokens
	}
}