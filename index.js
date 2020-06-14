const fetch = require("node-fetch");
const core = require("@actions/core");
const { Webhooks } = require("@octokit/webhooks");

try {
  const URL = core.getInput("URL", { required: true });
  const PAT = core.getInput("PAT", { required: true });

  const webhook = new Webhooks({ secret: PAT });

  let DATA = {};

  try {
    DATA = JSON.parse(core.getInput("PAYLOAD"));
  } catch (err) {
    core.setFailed("The payload passed is not valid JSON");
  }

  const PAYLOAD = {
    ...DATA,
  };

  const SIGNITURE = webhook.sign(PAYLOAD);

  fetch(URL, {
    method: "POST",
    headers: {
      "X-Hub-Signature": SIGNITURE,
      Authorization: `token ${PAT}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github.everest-preview+json",
    },
    body: PAYLOAD,
  })
    .then((res) => res.json())
    .then((res) => core.info(res));
} catch (error) {
  core.setFailed(error.message);
}
