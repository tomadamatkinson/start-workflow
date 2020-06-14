const core = require('@actions/core');
const { createWebhooksApi } = require("@octokit/webhooks")

try {

    const URL = core.getInput('URL', { required: true })
    const PAT = core.getInput('PAT', { required: true })

    const webhook = createWebhooksApi({ secret: PAT })

    let DATA = {}

    try {
        DATA = JSON.parse(core.getInput('PAYLOAD'))
    } catch (err) {
        DATA = {}
    }

    const PAYLOAD = {
        ...DATA
    }

    const SIGNITURE = webhook.sign(PAYLOAD)

    fetch(URL, {
        method: "POST",
        headers: {
            "X-Hub-Signature": SIGNITURE,
            "Authorization": `token ${PAT}`,
            "Content-Type": "application/json",
            "Accept": "application/vnd.github.everest-preview+json"
        },
        body: PAYLOAD
    })
} catch (error) {
    core.setFailed(error.message);
}