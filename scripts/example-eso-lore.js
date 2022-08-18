const targets = game.user.targets;

if (!actor || targets.size != 1) {
  ui.notifications.warn("You must have an actor selected, and one actor targeted");
} else {
  const skillName = "Esoteric Lore";
  const skillKey = "esoteric-lore";
  const actionSlug = "action:recall-knowledge"
  const actionName = "Recall Knowledge"

  const modifiers = []
  let DCbyLevel = [14, 15, 16, 18, 19, 20, 22, 23, 24, 26, 27, 28, 30, 31, 32, 34, 35, 36, 38, 39, 40, 42, 44, 46, 48, 50]

  const [target] = targets
  

  let DC = DCbyLevel[target.actor.data.data.details.level.value]

  const notes = [...token.actor.data.data.skills[skillKey].notes];

  const options = token.actor.getRollOptions(['all', 'skill-check', skillName.toLowerCase()]);
  options.push(`action:${actionSlug}`);

  game.pf2e.Check.roll(
    new game.pf2e.CheckModifier(
      `<span class="pf2-icon">A</span> <b>${actionName}</b> - <p class="compact-text">${skillName } Skill Check</p>`,
      token.actor.data.data.skills[skillKey], modifiers), {
      actor: token.actor,
      type: 'skill-check',
      options,
      notes,
      dc: {
        value: DC
      }
    },
    event
  );
}