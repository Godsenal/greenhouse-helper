async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function sendMessageToTab(command) {
  const tab = await getActiveTab();
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tab.id, { command }, (response) => {
      console.log(response.status);
      resolve(response);
    });
  });
}

const buttonCommands = {
  "open-links": "open-applicant-links",
  "open-resume": "open-resume",
  "open-cover-letter": "open-cover-letter",
  "move-stage": "move-stage",
  "reject-applicant": "reject-applicant",
  "submit-reject": "submit-reject",
  "reject-by-qualification-mismatch": "reject-by-qualification-mismatch",
};

Object.entries(buttonCommands).forEach(([buttonId, command]) => {
  document.getElementById(buttonId).addEventListener("click", async () => {
    await sendMessageToTab(command);
  });
});
