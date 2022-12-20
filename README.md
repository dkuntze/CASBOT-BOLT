to run locally, issue this command:

`serverless offline --noPrependStageInUrl`

you'll need to have an `.env` file with some params.

To plug into Slack locally:

`ngrok http 3000`

`serverless deploy`

`serverless deploy function -f slack`

https://5i0038ta3i.execute-api.us-east-1.amazonaws.com/dev/slack/events

