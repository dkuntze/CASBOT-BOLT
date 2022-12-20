const { App, AwsLambdaReceiver } = require('@slack/bolt');
const {saveLearning, getLearnings} = require("./src/learnings/learnings");
const { initializeApp } = require('firebase/app');
const { getDatabase } = require('firebase/database');

// Initialize your custom receiver
const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const firebaseConfig = {
  apiKey: "AIzaSyAOtPkzvMzOEPShfJMFzVtbU644wU_CnxE",
  authDomain: "casbot-80caa.firebaseapp.com",
  projectId: "casbot-80caa",
  storageBucket: "casbot-80caa.appspot.com",
  messagingSenderId: "144957664758",
  appId: "1:144957664758:web:7ea9f0847dc52bffd46bd7",
  measurementId: "G-XM5V1TJ277",
  databaseURL: "https://casbot-80caa-default-rtdb.firebaseio.com"
};

const fbase = initializeApp(firebaseConfig);
const database = getDatabase(fbase);

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: awsLambdaReceiver,

  // When using the AwsLambdaReceiver, processBeforeResponse can be omitted.
  // If you use other Receivers, such as ExpressReceiver for OAuth flow support
  // then processBeforeResponse: true is required. This option will defer sending back
  // the acknowledgement until after your handler has run to ensure your handler
  // isn't terminated early by responding to the HTTP request that triggered it.

  // processBeforeResponse: true

});

// Listens to incoming messages that contain "hello"
app.message('rock', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say({
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Hey there <@${message.user}>!`
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Click Me"
          },
          "action_id": "button_click"
        }
      }
    ],
    text: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
  });
});

app.command('/franklin', async ({ command, ack, respond, logger }) => {
  // Acknowledge command request
  await ack();

  if (command.text.startsWith('get learnings')) {
    //await respond();
    await getLearnings(database, logger, respond);
  } else {
    await respond('not implemented yet');
  }
});

app.action('button_click', async ({ body, ack, say }) => {
  // Acknowledge the action
  await ack();
  await say(`https://www.youtube.com/watch?v=bJ9r8LMU9bQ`);
});

app.shortcut('franklin_learning', async ({ shortcut, ack, client, logger }) => {

  try {
    // Acknowledge shortcut request
    await ack();

    // Call the views.open method using one of the built-in WebClients
    const result = await client.views.open({
      trigger_id: shortcut.trigger_id,
      view: {
        type: "modal",
        callback_id: "f_learnings",
        title: {
          type: "plain_text",
          text: "CASHub Franklin"
        },
        close: {
          type: "plain_text",
          text: "Cancel"
        },
        "submit": {
          "type": "plain_text",
          "text": "Submit",
          "emoji": true
        },
        "blocks": [
          {
            "type": "header",
            "text": {
              "type": "plain_text",
              "text": "The Franklin learnings collector",
              "emoji": true
            }
          },
          {
            "type": "divider"
          },
          {
            "type": "input",
            "element": {
              "type": "static_select",
              "placeholder": {
                "type": "plain_text",
                "text": "Select a category",
                "emoji": true
              },
              "options": [
                {
                  "text": {
                    "type": "plain_text",
                    "text": "Best Practice",
                    "emoji": true
                  },
                  "value": "best-practice"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "Process",
                    "emoji": true
                  },
                  "value": "process"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "Communication",
                    "emoji": true
                  },
                  "value": "communication"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "Documentation",
                    "emoji": true
                  },
                  "value": "documentation"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "Product",
                    "emoji": true
                  },
                  "value": "product"
                }
              ],
              "action_id": "category_select-action"
            },
            "label": {
              "type": "plain_text",
              "text": "Category",
              "emoji": true
            }
          },
          {
            "type": "input",
            "element": {
              "type": "static_select",
              "placeholder": {
                "type": "plain_text",
                "text": "Select a Project",
                "emoji": true
              },
              "options": [
                {
                  "text": {
                    "type": "plain_text",
                    "text": "Graco",
                    "emoji": true
                  },
                  "value": "graco"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "Merative",
                    "emoji": true
                  },
                  "value": "merative"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "Maidenform",
                    "emoji": true
                  },
                  "value": "maidenform"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "Keysight",
                    "emoji": true
                  },
                  "value": "keysight"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "Eder Group",
                    "emoji": true
                  },
                  "value": "eder group"
                }
              ],
              "action_id": "project_select-action"
            },
            "label": {
              "type": "plain_text",
              "text": "Project",
              "emoji": true
            }
          },
          {
            "type": "input",
            "element": {
              "type": "plain_text_input",
              "multiline": true,
              "action_id": "learning_input-action"
            },
            "label": {
              "type": "plain_text",
              "text": "Learning",
              "emoji": true
            }
          }
        ]
      }
    });

    logger.info(result);
  }
  catch (error) {
    logger.error(error);
  }
});

app.view('f_learnings', async ({ ack, body, view, client, logger }) => {
  await ack();
  const user = body.user.name;
  await saveLearning(app, view, logger, database, user);
});

// Handle the Lambda function event
module.exports.handler = async (event, context, callback) => {
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
}
