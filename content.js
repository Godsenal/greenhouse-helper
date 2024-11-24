chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received command:", request.command);

  switch (request.command) {
    case "open-applicant-links":
      openAllApplicantLinks();
      break;
    case "open-resume":
      openResume();
      break;
    case "open-cover-letter":
      openCoverLetter();
      break;
    case "move-stage":
      moveStage();
      break;
    case "reject-by-qualification-mismatch":
      rejectByQualificationMismatch();
      break;
    default:
      console.log("알 수 없는 명령어:", request.command);
  }

  sendResponse({ status: "ok" });
  return true;
});

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
  const rejectButton = document.querySelector(
    'button[data-provides="open-reject-modal"]'
  );

  if (rejectButton) {
    rejectButton.click();
  } else {
    console.log("Reject button not found");
    return;
  }

  const checkForm = setInterval(() => {
    const rejectForm = document.querySelector("form[name='reject-modal']");
    const reasonInput = rejectForm?.querySelector(
      'input[name="rejection_reason"]'
    );

    if (reasonInput) {
      clearInterval(checkForm);
      reasonInput.value = "불합격(Qualifications Mismatch)";
      rejectForm.querySelector("button[type='submit']").click();
    }
  }, 100);

  setTimeout(() => clearInterval(checkForm), 5000);
}

document.addEventListener("keydown", (event) => {
  if (event.altKey && event.shiftKey) {
    switch (event.keyCode) {
      case 79:
        openAllApplicantLinks();
        break;
      case 82:
        openResume();
        break;
      case 67:
        openCoverLetter();
        break;
      case 77:
        moveStage();
        break;
      case 74:
        rejectByQualificationMismatch();
        break;
      default:
        break;
    }
    event.preventDefault();
  }
});
