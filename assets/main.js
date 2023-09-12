const titleElement = document.querySelector("hgroup h1");
const subtextElement = document.querySelector("hgroup h2");
const mlistContainer = document.getElementById("mlistContainer");
const emailContainer = document.getElementById("emailContainer");
const progress = document.querySelector("progress");
const form = document.querySelector("form");
const loader = document.querySelector("form button");
const dialog = document.querySelector("dialog");
const dialogCode = document.querySelector("dialog code");

// Function to update UI elements
function updateUI(elementId) {
  const element = document.querySelector(`#${elementId}`);
  titleElement.innerText = `${element.querySelector("h2").innerText} Mode`;
  subtextElement.innerText = element.querySelector("p").innerText;
  window.scrollTo(0, 0);
}

// Function to toggle bw mailist and ind..
function toggleContainers(elementId) {
  if (elementId === "ind") {
    document
      .querySelector("#mlistContainer textarea")
      .removeAttribute("required");
    document
      .querySelector("#emailContainer input")
      .setAttribute("required", "");
    mlistContainer.style.display = "none";
    emailContainer.style.display = "block";
  } else {
    document.querySelector("#emailContainer input").removeAttribute("required");
    document
      .querySelector("#mlistContainer textarea")
      .setAttribute("required", "");
    mlistContainer.style.display = "block";
    emailContainer.style.display = "none";
  }
}

function start(element) {
  progress.style.visibility = "visible";
  document.querySelector(".home").style.display = "none";
  updateUI(element.id);
  toggleContainers(element.id);
  document.querySelector("select").value = element.id;
  form.style.display = "block";
  setTimeout(() => {
    progress.style.visibility = "hidden";
  }, 500); // Delay to show
}

// Function to handle the select field
function exchange(e) {
  const elementId = e.value === "ind" ? "ind" : "list";
  toggleContainers(elementId);
  updateUI(elementId);
}

// Function to close dialog
function closeDialog(event) {
  event.preventDefault();
  form.reset();
  location.reload();
}

// Function to toggle response display
function resp(event) {
  event.preventDefault();
  const resElem = dialogCode.parentElement;
  if (resElem.style.display === "block") {
    resElem.style.display = "none";
    dialog.querySelector(".secondary").innerText = "Show response";
  } else {
    resElem.style.display = "block";
    dialog.querySelector(".secondary").innerText = "Hide response";
  }
}

// Event for form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent the default function

  // Show loader
  loader.ariaBusy = "true"; // Set aria-busy for btn loader
  progress.style.visibility = "visible";

  try {
    const formData = new FormData(form);
    const response = await fetch("/mail", {
      method: "POST",
      body: formData,
    });
    const responseText = await response.text();
    const statusCode = responseText.match(/\d+/)?.[0]; // doing this because of a bug in mailchannels plugin
    console.log(statusCode);

    if (statusCode === "202") {
      form.reset();
      loader.ariaBusy = "false";
      progress.style.visibility = "hidden";
      dialog.setAttribute("open", "true");
      dialog.querySelector("header span").innerText = "Success!";
      dialog.querySelector("p").innerText =
        "Your email(s) have been sent successfully";
      dialogCode.innerText = responseText;
    } else {
      console.error("Unexpected response status:", statusCode);
      loader.ariaBusy = "false";
      progress.style.visibility = "hidden";
      dialog.setAttribute("open", "true");
      dialog.querySelector("header span").innerText = "Error!";
      dialog.querySelector("p").innerText =
        "An error occurred! Please report with response and console logs";
      dialogCode.innerText = responseText;
    }
  } catch (error) {
    console.error("Error:", error);
    dialog.setAttribute("open", "true");
    dialog.querySelector("header span").innerText = "Error!";
    dialog.querySelector("p").innerText =
      "An error occurred! Please report with response and console logs";
    dialogCode.innerText = responseText;
  }
});

// Function to change placeholder text based on content type
function changePlaceholder(e) {
  const placeholderText =
    e.value === "text/html; charset=utf-8"
      ? `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Your Email</title>
</head>
    
<body>
  <p>Hello,</p>
  <p>This is your email content.</p>
  <p>Regards,</p>
  <p>Your Name</p>
</body>
    
</html>`
      : `Dear John Doe,

Thank you for reaching out to us regarding your recent concern. We sincerely apologize for any inconvenience you may have experienced, and we appreciate your patience as we address this issue.
              
Sincerely,
Raju Rastogi
Customer Support Team
ZoFoss`;

  document
    .querySelector("form textarea#body")
    .setAttribute("placeholder", placeholderText);
}
