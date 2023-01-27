const { ref, set, get, child } = require('firebase/database');
const fetch  = require("node-fetch");

async function saveLearning(app, payload, logger, db, user) {
    let category;
    let project;
    let learning;
    const submitted_values = payload.state.values;

    //logger.info(submitted_values);
    Object.values(submitted_values).forEach((value) => {
        if (value['category_select-action']) {
            category = value['category_select-action'].selected_option.value;
            //logger.info(category);
        }
        if (value['project_select-action']) {
            project = value['project_select-action'].selected_option.value;
            //logger.info(project);
        }
        if (value['learning_input-action']) {
            learning = value['learning_input-action'].value;
            //logger.info(learning);
        }

    });
    writeData(db, category, project, learning, user, logger);
}

function writeData(db, cat, proj, learn, user, logger) {
    const DateNow = Date.now();
    let post = new URLSearchParams( {
        'date': new Date(DateNow).toString(),
        'user': user,
        'project': proj,
        'category': cat,
        'learning': learn
    });
    fetch('https://main--cashub--dkuntze.hlx.page/casbot-franklin-findings', {method: "POST", headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: post})
        .then((response) => {
            if (response.ok) {
                logger.info('yeah!')
            } else {
                logger.info('failure' + response.status);
            }
        });
}

async function getLearnings(db, log, res) {
    const dbRef = ref(db);
    get(child(dbRef, 'learnings/')).then((snapshot)=> {
        if (snapshot.exists()) {
            res(convertToBlock(snapshot.val(), log));
        }
    }).catch((error) => {
        log.error(error);
    });
}

function convertToBlock(json, log) {
    const response = {
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "Latest Posted Learnings",
                    "emoji": true
                }
            }
        ]
    };

    Object.entries(json).forEach(([key, value]) => {
        response.blocks.push({
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": `*Timestamp:*\n${key}`
                },
                {
                    "type": "mrkdwn",
                    "text": `*Category:*\n${value.category}`
                },
                {
                    "type": "mrkdwn",
                    "text": `*Customer:*\n${value.project}`
                },
                {
                    "type": "mrkdwn",
                    "text": `*Learning:*\n${value.learning}`
                }
            ]
        },
            {
            "type": "divider"
            })
    });



    return response;
}

module.exports = {saveLearning, getLearnings}
