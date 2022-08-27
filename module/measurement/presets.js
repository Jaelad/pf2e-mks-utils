export const TemplatePresets = {
	seek: {
		"t": "cone",
		"angle": 90,
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
		}
	}
}