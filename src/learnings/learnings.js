async function saveLearning(app, payload, logger) {
    let category;
    let project;
    let learning;
    const submitted_values = payload.state.values;
    Object.values(submitted_values).forEach((value) => {
        if (value['category_select-action']) {
            category = value['category_select-action'].selected_option.value;
            //logger.info(category);
        }
        if (value['cp_input-action']) {
            project = value['cp_input-action'].value;
            //logger.info(project);
        }
        if (value['learning_input-action']) {
            learning = value['learning_input-action'].value;
            logger.info(learning);
        }
    });
}

function getLearnings(view) {
    return true;
}

module.exports = {saveLearning, getLearnings}
