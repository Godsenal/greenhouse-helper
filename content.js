function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const waitInterval = setInterval(() => {
      const element = document.querySelector(selector);

      if (element) {
        clearInterval(waitInterval);
        resolve(element);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(waitInterval);
      reject(new Error("Element not found"));
    }, timeout);
  });
}

function openAllApplicantLinks() {
  if (window.location.pathname !== "/people") {
    console.log("지원자 리스트가 있는 페이지에서만 동작해요");
    return;
  }

  const links = document.querySelectorAll(
    '#content .job-info-column[href^="/people"]'
  );
  links.forEach((link) => {
    console.log(link);

    const url = link.getAttribute("href");
    if (url) window.open(url, "_blank");
  });
}

function openResume() {
  console.log("Opening resume");

  const action = document.querySelector(
    "span#more-actions button[data-provides-of='resume']"
  );
  if (action) {
    action.click();
  }
}

function openCoverLetter() {
  console.log("Opening cover letter");

  const action = document.querySelector(
    "span#more-actions button[data-provides-of='cover_letter']"
  );
  if (action) {
    action.click();
  }
}

function reject() {
  const rejectButton = document.querySelector(
    'button[data-provides="open-reject-modal"]'
  );

  if (rejectButton) {
    rejectButton.click();
  } else {
    console.log("Reject button not found");
  }
}

function moveStage() {
  const moveStageButton = document.querySelector(
    'button[data-provides="move-stage-modal"]'
  );
  if (moveStageButton) {
    moveStageButton.click();
  } else {
    console.log("Move stage button not found");
  }
}

function rejectByQualificationMismatch() {
  reject();

  waitForElement("form[name='reject-modal']").then((rejectForm) => {
    const reasonInput = rejectForm?.querySelector(
      'input[name="rejection_reason"]'
    );

    if (reasonInput) {
      reasonInput.value = "불합격(Qualifications Mismatch)";
      rejectForm.querySelector("button[type='submit']").click();
    }
  });
}

function moveNextStage() {
  moveStage();

  const modal = document.querySelector(
    "div[role='dialog'][aria-label='move-stage-modal']"
  );
  const nextStageButton = modal?.querySelector(
    "span[data-autofocus-inside='true'] button"
  );
  if (nextStageButton) {
    nextStageButton.click();
  }
}

const commands = {
  "open-applicant-links": { handler: openAllApplicantLinks, keyCode: 79 },
  "open-resume": { handler: openResume, keyCode: 82 },
  "open-cover-letter": { handler: openCoverLetter, keyCode: 67 },
  reject: { handler: reject, keyCode: 74 },
  "move-stage": { handler: moveStage, keyCode: 77 },
  "move-next-stage": { handler: moveNextStage, keyCode: 78 },
  "reject-by-qualification-mismatch": {
    handler: rejectByQualificationMismatch,
    keyCode: 81,
  },
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received command:", request.command);

  const command = commands[request.command];

  if (command) {
    command.handler();
  }

  sendResponse({ status: "ok" });
  return true;
});

document.addEventListener("keydown", (event) => {
  if (event.altKey && event.shiftKey) {
    const command = Object.values(commands).find(
      (command) => command.keyCode === event.keyCode
    );

    if (command) {
      command.handler();
    }

    event.preventDefault();
  }
});

if (window.location.pathname === "/people") {
  function addOpenInNewTabButtons() {
    const persons = document.querySelectorAll("table.person");

    console.log(persons);

    persons.forEach((personTable) => {
      const nameTd = personTable.querySelector(".person-info-column");
      const jobInfoTd = personTable.querySelector(".job-info-column");

      if (nameTd && jobInfoTd) {
        const jobHref = jobInfoTd.getAttribute("href");
        if (jobHref && !nameTd.querySelector(".open-new-tab-button")) {
          // 중복 버튼 방지
          const button = document.createElement("button");
          button.textContent = "새 탭에서 열기"; // "Open in New Tab"
          button.className = "open-new-tab-button";
          button.style.marginLeft = "10px";
          button.addEventListener("click", (e) => {
            e.stopPropagation();
            window.open(jobHref, "_blank");
          });
          nameTd.appendChild(button);
        }
      }
    });
  }

  addOpenInNewTabButtons();

  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        addOpenInNewTabButtons();
      }
    }
  });

  // 대상 노드를 관찰하도록 설정
  const targetNode = document.getElementById("content"); // 필요에 따라 선택자 조정
  if (targetNode) {
    observer.observe(targetNode, { childList: true, subtree: true });
  }
}
