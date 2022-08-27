import GhostTemplate from "./ghost-template.js"
import CentricTemplate from "./centric-template.js"
import MksUtils from "../mks-utils.js"
import {TOKEN_MAGIC_FILTERS} from "./tokenmagic/filters.js"

export default class TemplateManager {
	constructor(MKS) {
		this._ = MKS
	}

	//canvas.grid.highlightLayers
	//Template.v78LKhfJ6B2gKUuW.... positions
	drawSeek(token, {wheelSnap}) {
		const templateData = {
			"t": "cone",
			"distance": 30,
			"flags": {
				"pf2e": {
					"origin": {
						"type": "perception",
						"name": "Seek",
						"slug": "seek",
						"traits": [
							"perception"
						]
					}
				},
				tokenmagic:	{
					options: {
						tmfxPreset: "Waves",
						//tmfxTint: 0x000000,
						tmfxTextureAlpha: 0.30
					}
				}
			},
			"angle": 90,
			"user": game.user.id,
			"fillColor": game.user.color, // "#283dcc"
			x: token.data.x + canvas.grid.grid.w / 2,
			y: token.data.y + canvas.grid.grid.h / 2
		}
		// if (TokenMagic) {
		// 	templateData.flags.tokenmagic = TOKEN_MAGIC_FILTERS.SEEK
		// }

		const templateDoc = new MeasuredTemplateDocument(templateData, {
			parent: canvas.scene
		})
		const centric = new CentricTemplate(templateDoc)
		centric.wheelSnap = wheelSnap ?? 1
		centric.onTemplateCreated = (template) => {
			console.log(template)
		}
		centric.drawPreview().then()
	}

	deleteTemplate(templateId) {
		canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [templateId])
	}

	deleteAllTemplates() {
		canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [], {deleteAll: true})
	}
}