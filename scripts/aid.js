function getSkills(actor) {
    return (
        Object.entries(actor.data.data.skills)
            .map(([acronym, value]) => {
                return {
                    acronym,
                    name: capitalize(value.name),
                    isLore: value.lore === true,
                    proficiency: rankToProficiency(value.rank),
                    rank: value.rank,
                };
            })
            // earn income is a trained action
            .filter((skill) => skill.proficiency !== 'untrained')
    );
}

function askSkillPopupTemplate(skills) {
    const level = parseInt(localStorage.getItem('earnIncomeLevel') ?? 0, 10);
    const days = parseInt(localStorage.getItem('earnIncomeDays') ?? 1, 10);
    const skillAcronym = localStorage.getItem('earnIncomeSkillAcronym');
    const assurance = localStorage.getItem('earnIncomeAssurance') === 'true';
    return `
    <form>
    <div class="form-group">
        <label>Trained Skills/Lores</label>
        <select name="skillAcronym">
            ${skills
                .map(
                    (skill) =>
                        `<option value="${skill.acronym}" ${
                            skillAcronym === skill.acronym ? 'selected' : ''
                        }>${escapeHtml(skill.name)}</option>`,
                )
                .join('')}
        </select>
    </div>
    <div class="form-group">
        <label>Use Assurance</label>
        <input name="assurance" type="checkbox" ${assurance ? 'checked' : ''}>
    </div>
    <div class="form-group">
        <label>Level</label>
        <select name="level">
            ${Array(21)
                .fill(0)
                .map((_, index) => `<option value="${index}" ${index === level ? 'selected' : ''}>${index}</option>`)
                .join('')}
        </select>
    </div>
    <div class="form-group">
        <label>Days</label>
        <input type="number" name="days" value="${days}">
    </div>
    </form>
    `;
}

function aid(actor, target) {
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

if (!actor || game.user.targets.size != 1)
  ui.notifications.warn("Bir aktör şeçmeli ve bir de hedef seçmelisiniz!");
else
  aid(actor, game.user.targets.first)