const fetch = require("node-fetch");
const core = require("@actions/core");
const github = require("@actions/github");
const { Webhooks } = require("@octokit/webhooks");

try {
  const PAT = core.getInput("PAT", { required: true });
  const EVENT = core.getInput("EVENT", { required: true });

  const webhook = new Webhooks({ secret: PAT });

  let DATA = {};

  try {
    DATA = JSON.parse(core.getInput("PAYLOAD"));
  } catch (err) {
    core.setFailed("The payload passed is not valid JSON");
  }

  const PAYLOAD = {
    event_type: `${EVENT}`,
    client_payload: {
      ...DATA,
    },
  };

  const SIGNITURE = webhook.sign(PAYLOAD);

  let { owner, repo } = github.context.repo;

  fetch(`https://api.github.com/repos/${owner}/${repo}/dispatches`, {
    method: "POST",
    headers: {
      "X-Hub-Signature": SIGNITURE,
      Authorization: `token ${PAT}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github.everest-preview+json",
    },
    body: JSON.stringify(PAYLOAD),
  })
    .then((res) => {
      if (res.status == 204) {
        return {
          msg: `Successful call to webhook event ${PAYLOAD.event_type}`,
        };
      }

      return res.json();
    })
    .then((res) => core.info(JSON.stringify(res)))
    .catch((err) => {
      throw "Failed to execute Webhook request";
    });
} catch (error) {
  core.setFailed(error.message);
}
