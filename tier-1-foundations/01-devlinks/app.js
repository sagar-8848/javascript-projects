// ? to store the data we get from the user...
const cardContainer = document.getElementById("links-container");
const toastContainer = document.getElementById("toast");
const toastMsg = document.getElementById("toast-msg");
const NoOfLinks = document.getElementById("link-count");

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
  const strigifiedLinks = JSON.stringify(links);
  localStorage.setItem("devlinks", strigifiedLinks);
}

// ? getting the elements from HTML

function renderLinks() {
  countLinks();
  const emptyState = document.getElementById("empty-state");

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
    copyBtn.textContent = "copy";

    // * adding event listener to the copyBtn

    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(curElem.url);

      toastContainer.classList.remove("hidden");
      toastMessage("successfully copied!");
    });

    // ? creating delete button
    const dltBtn = document.createElement("button");
    dltBtn.classList.add("dlt-btn");
    dltBtn.textContent = "delte";
    // ? adding event listener to the dlt button
    dltBtn.addEventListener("click", () => {
      links.splice(index, 1);
      saveLinks();
      renderLinks();
    });

    const card = document.createElement("div");
    card.classList.add("link-card");

    const title = document.createElement("div");
    title.classList.add("link-card__title");
    title.textContent = curElem.title;

    const url = document.createElement("div");
    url.classList.add("link-card__url");
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
  const urlValue = urlInput.value.trim();

  if (titleValue.length === 0 || urlValue.length === 0) {
    return;
  }

  const linkObj = {
    title: titleValue,
    url: urlValue,
  };

  links.push(linkObj);
  saveLinks();
  renderLinks();

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
  toastMsg.textContent = msg;

  setTimeout(() => {
    toastContainer.classList.add("hidden");
  }, 2000);
}

// * reset the form after the user submits
function resetForm() {
  form.reset();
}
