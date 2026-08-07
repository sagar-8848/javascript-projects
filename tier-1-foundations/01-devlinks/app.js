// ? to store the data we get from the user...
const cardContainer = document.getElementById("links-container");
const toastContainer = document.getElementById("toast");
const toastMsg = document.getElementById("toast-msg");
const NoOfLinks = document.getElementById("link-count");
const emptyState = document.getElementById("empty-state");

const copyIcon = `  <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="green"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-clipboard-list-icon lucide-clipboard-list"
      >
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="M12 11h4" />
        <path d="M12 16h4" />
        <path d="M8 11h.01" />
        <path d="M8 16h.01" />
      </svg>`;

const deleteIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2-icon lucide-trash-2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;

const links = loadLinks();
renderLinks();

function loadLinks() {
  const storedLinks = localStorage.getItem("devlinks");

  if (storedLinks === null) {
    return [];
  }

  const data = JSON.parse(storedLinks);
  return data;
}

function saveLinks() {
  const stringifiedLinks = JSON.stringify(links);
  localStorage.setItem("devlinks", stringifiedLinks);
}

// ? getting the elements from HTML

function renderLinks() {
  countLinks();
  // * if the array is empty, return
  if (links.length === 0) {
    emptyState.classList.remove("hidden");
    cardContainer.innerHTML = "";

    return;
  }

  emptyState.classList.add("hidden");

  cardContainer.innerHTML = "";
  links.forEach((curElem, index) => {
    const infoContainer = document.createElement("div");
    infoContainer.classList.add("link-card__info");

    const actionContainer = document.createElement("div");
    actionContainer.classList.add("link-card__actions");

    // * creating copy button
    const copyBtn = document.createElement("button");
    copyBtn.classList.add("copy-btn");
    copyBtn.innerHTML = copyIcon;

    // * adding event listener to the copyBtn

    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(curElem.url);
        toastMessage("Copied!");
      } catch {
        toastMessage("Copy failed!");
      }
    });

    // ? creating delete button
    const dltBtn = document.createElement("button");
    dltBtn.classList.add("dlt-btn");
    dltBtn.innerHTML = deleteIcon;
    // ? adding event listener to the dlt button
    dltBtn.addEventListener("click", () => {
      links.splice(index, 1);
      toastMessage("deleted successfully!");
      saveLinks();
      renderLinks();
    });

    const card = document.createElement("div");
    card.classList.add("link-card");

    const title = document.createElement("div");
    title.classList.add("link-card__title");
    title.textContent = curElem.title;

    const url = document.createElement("a");
    url.classList.add("link-card__url");
    url.setAttribute("href", `${curElem.url}`);
    url.setAttribute("target", "_blank");
    url.setAttribute("rel", "noopener noreferrer");
    url.textContent = curElem.url;

    actionContainer.appendChild(copyBtn);
    actionContainer.appendChild(dltBtn);
    infoContainer.appendChild(title);
    infoContainer.appendChild(url);
    card.appendChild(infoContainer);
    card.appendChild(actionContainer);
    cardContainer.appendChild(card);
  });
}

// ? for the empty state

const titleInput = document.getElementById("title-input");
const urlInput = document.getElementById("url-input");

const form = document.getElementById("link-form");

// ? now,

form.addEventListener("submit", (e) => {
  // ? to stop the default behaviour of the form
  e.preventDefault();

  const titleValue = titleInput.value.trim();
  let urlValue = urlInput.value.trim();
  // * first validation, if any field is empty, then show an toast message

  if (!titleValue || !urlValue) {
    toastMessage("⚠️ Fill in both fields!");
    return;
  }

  // * adding validation logics

  const validationCheck =
    urlValue.startsWith("https://") || urlValue.startsWith("http://");

  if (!validationCheck) {
    urlValue = `https://${urlValue}`;
  }

  try {
    new URL(urlValue);
  } catch (err) {
    console.log("invalid url");

    toastMessage("the url is not valid!");
    return;
  }

  const isDuplicate = links.some(
    (curElem) =>
      curElem.url.trim().toLowerCase() === urlValue.trim().toLowerCase(),
  );

  if (isDuplicate) {
    toastMessage("⚠️ link already exists!");
    return;
  }

  const linkObj = {
    title: titleValue,
    url: urlValue,
  };

  links.push(linkObj);
  saveLinks();
  renderLinks();
  toastMessage("link added success!");

  // ? reset the form
  resetForm();
});

// * functiont to count the link

function countLinks() {
  const linkCount = links.length;
  NoOfLinks.textContent = linkCount === 0 ? "0 links" : `${linkCount} links`;
}

// * function show toast message

function toastMessage(msg) {
  toastContainer.classList.remove("hidden");
  toastMsg.textContent = msg;

  setTimeout(() => {
    toastContainer.classList.add("hidden");
  }, 1500);
}

// * reset the form after the user submits
function resetForm() {
  form.reset();
}
