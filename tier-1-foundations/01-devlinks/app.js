// ? to store the data we get from the user...

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
  const emptyState = document.getElementById("empty-state");

  if (links.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  const cardContainer = document.getElementById("links-container");

  cardContainer.innerHTML = "";
  links.forEach((curElem) => {
    const infoContainer = document.createElement("div");
    infoContainer.classList.add("link-card__info");
    const card = document.createElement("div");
    card.classList.add("link-card");

    const title = document.createElement("div");
    title.classList.add("link-card__title");
    title.textContent = curElem.title;

    const url = document.createElement("div");
    url.classList.add("link-card__url");
    url.textContent = curElem.url;

    infoContainer.appendChild(title);
    infoContainer.appendChild(url);
    card.appendChild(infoContainer);
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

// ? reset the form after the user submits
function resetForm() {
  form.reset();
}
