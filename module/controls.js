import {ActionsPanel} from "./apps/actions-panel.js";

export default function getSceneControlButtons(controls) {
	if (canvas == null) {
		return
	}

	console.log(controls)

	console.log(controls[0].tools.push({
			name: "mks-actions-panel",
			title: "pf2e.mks.ui.actionspanel.label",
			icon: "fas fa-hat-wizard",
			onClick: () => {
				//new ActionsPanel().render(true)
			},
			button: true,
			visible: true
	}))

	// controls.push({
	// 	name: "mks-tools",
	// 	title: "pf2e.mks.ui.actionspanel.label",
	// 	icon: "fas fa-magic",
	// 	layer: "specials",
	// 	visible: true,
	// 	tools: [
	// 		{
	// 			name: "mks-actions-panel",
	// 			title: "pf2e.mks.ui.actionspanel.label",
	// 			icon: "fas fa-hat-wizard",
	// 			onClick: () => {
	// 				game.MKS.actionsPanel.render(true)
	// 			},
	// 			button: true
	// 		}
	// 	],
	// });
}
