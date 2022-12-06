const { App, AwsLambdaReceiver } = require('@slack/bolt');
const {saveLearning} = require("./src/learnings/learnings");

// Initialize your custom receiver
const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

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

app.command('/franklin', async ({ command, ack, respond }) => {
  // Acknowledge command request
  await ack();

  if (command.text === 'get learnings') {
    await respond('looking up...');
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
              "type": "plain_text_input",
              "action_id": "cp_input-action"
            },
            "label": {
              "type": "plain_text",
              "text": "Customer / Project",
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
  await saveLearning(app, view, logger);
});

// Handle the Lambda function event
module.exports.handler = async (event, context, callback) => {
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
}
