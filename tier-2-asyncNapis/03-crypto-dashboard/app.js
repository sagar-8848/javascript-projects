// ==========================================
// 1. DOM ELEMENTS CACHE
// ==========================================

// ── HEADER ──
const lastUpdated = document.getElementById('last-updated');
const refreshBtn = document.getElementById('refresh-btn');
const refreshRingPrg = document.getElementById('refresh-ring-progress');

// ── GLOBAL STATS BAR ──
const gMarketCap = document.getElementById('g-marketcap');
const gVolume = document.getElementById('g-volume');
const gBtc = document.getElementById('g-btc');
const gCoins = document.getElementById('g-coins');

// ── CONTROLS ──
const searchInput = document.getElementById('search-input');
const tabs = document.querySelectorAll('.tab');

// ── TABLE ──
const coinsTbody = document.getElementById('coins-tbody');
const sortableCols = document.querySelectorAll('th.sortable');

// ── STATES ──
const loadingEl = document.getElementById('loading');
const emptyStateEl = document.getElementById('empty-state');
const watchlistEmpty = document.getElementById('watchlist-empty');

// ── MODAL ──
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const modalIcon = document.getElementById('modal-icon');
const modalName = document.getElementById('modal-name');
const modalSymbol = document.getElementById('modal-symbol');
const modalRank = document.getElementById('modal-rank');
const modalPrice = document.getElementById('modal-price');
const modalChange = document.getElementById('modal-change');
const modalCap = document.getElementById('modal-cap');
const modalVol = document.getElementById('modal-vol');
const modalHigh = document.getElementById('modal-high');
const modalLow = document.getElementById('modal-low');
const modalSupply = document.getElementById('modal-supply');
const modalAth = document.getElementById('modal-ath');
const modalDesc = document.getElementById('modal-desc');

// ── TOAST ──
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toast-msg');


// ==========================================
// 2. STATE & CONFIG
// ==========================================
const BASE_URL = "https://api.coingecko.com/api/v3";

const state = {
  coins: [],       // raw data from API
  watchlist: [],   // ids from localStorage
  sortBy: null,    // 'price' | 'change' | 'cap'
  sortDir: 'desc',
  query: '',
  tab: 'all',      // 'all' | 'watchlist'
  intervalId: null,
  abortCtrl: null,
};


// ==========================================
// 3. UTILITIES
// ==========================================

let toastTimer;
function showToast(msg, type = "success") {
  clearTimeout(toastTimer);
  toastMsg.textContent = msg;
  toast.className = `toast ${type}`;
  toast.classList.remove("hidden");
  toastTimer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2000);
}


// ==========================================
// 4. API LAYER
// ==========================================

async function fetchTopCoins() {
  const res = await fetch(`${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1`);

  if (!res.ok) throw new Error("failed to fetch the market data!")
  const data = await res.json();
  return data;
}




// ==========================================
// 5. UI CONTROLLER
// ==========================================

function renderTable(coins, oldCoins) {
  coinsTbody.innerHTML = ""
  coins.forEach((coin) => {
    const tr = document.createElement("tr");

    // ? check if the old coins exist or not 
    let priceClass = ""

    const oldCoin = oldCoins ? oldCoins.find(c => c.id === coin.id) : null;
    if (oldCoin) {
      if (coin.current_price > oldCoin.current_price) {
        priceClass = "flash-up";
      }
      else if (coin.current_price < oldCoin.current_price) {
        priceClass = "flash-down"
      }
    }

    // ! check if the coin exists in state.watchlist or not 

    const isExist = state.watchlist.includes(coin.id)
    const watchedClass = isExist ? "watched" : ""

    // ? figure out if the price went up or down

    const isUp = coin.price_change_percentage_24h > 0;
    const changeClass = isUp ? "change-badge--up" : "change-badge--down";
    const changeSign = isUp ? "+" : "";
    const changeValue = coin.price_change_percentage_24h ? coin.price_change_percentage_24h.toFixed(2) : "0.00";

    tr.innerHTML = `
    <td class="td-rank">${coin.market_cap_rank}</td>


    <td class="td-coin" >
      <img src="${coin.image}" alt="${coin.name}" class="coin-icon">
      <div class="coin-info">
          <span class="coin-name">${coin.name}</span>
          <span class="coin-symbol">${coin.symbol}</span>
        </div>
    </td>

    

    <td class="td-price ${priceClass}">$${coin.current_price.toLocaleString()}</td>


          <td class="td-change">
        <span class="change-badge ${changeClass}">
          ${changeSign}${changeValue}%
        </span>
      </td>


      <td class="td-cap td-hide-sm">$${coin.market_cap.toLocaleString()}</td>
 
     <td class="td-watch">
        <button class="watch-btn ${watchedClass}" data-id=${coin.id}>⭐</button>
      </td>

      `

    coinsTbody.appendChild(tr);
  })
}



// ==========================================sz\
// 6. MANAGER & LISTENERS
// ==========================================


// ! filter the search 

searchInput.addEventListener("input", () => {
  const searchedValue = searchInput.value.trim().toLowerCase();
  state.query = searchedValue;

  if (searchedValue === "") {
    renderTable(state.coins)
  }
  else {
    const filteredOne = state.coins.filter(curCoin => curCoin.name.toLowerCase().includes(searchedValue));
    renderTable(filteredOne)
  }

})

// ! when some one clicks on start button, push it to the watchlist array

coinsTbody.addEventListener("click", (e) => {
  if (e.target.classList.contains("watch-btn")) {
    const coinId = e.target.getAttribute("data-id")

    if (state.watchlist.includes(coinId)) {
      state.watchlist = state.watchlist.filter(id => id !== coinId)
    }
    else {
      state.watchlist.push(coinId)
    }
    localStorage.setItem("cryptoWatchlist", JSON.stringify(state.watchlist))
    e.target.classList.toggle("watched")
  }
})

// ! sorting feature 

sortableCols.forEach((col) => {
  col.addEventListener("click", () => {
    const sortKey = col.getAttribute("data-sort");
    if (state.sortBy === sortKey) {
      state.sortDir = state.sortDir === "desc" ? "asc" : "desc"
    }
    else {
      state.sortBy = sortKey;
      state.sortDir = "desc"  // our default sort directionw will be higher to lower
    }
    sortAndRender()
  })
})

// ! sortAndRender function 

function sortAndRender() {
  const sorted = [...state.coins]
  // ? if the user have not cliked any sort key then just show the default data 
  if (state.sortBy === null) {
    renderTable(sorted)
    return;
  }

  // ? if the user wants to sort by any sortkey then 

  // ? if the sort direction is in higher to lower, change it into lower to higher
  if (state.sortDir === "desc") {
    sorted.sort((a, b) => {
      return b[state.sortBy] - a[state.sortBy]
    })
  }

  // ? else change it into higher to lower 
  else {
    sorted.sort((a, b) => {
      return a[state.sortBy] - b[state.sortBy]
    })
  }

  renderTable(sorted)

}

// ! adding add event listener to the tabs

tabs.forEach((tab) => {
  tab.addEventListener("click", (e) => {
    const tabName = tab.getAttribute("data-tab")
    state.tab = tabName;
    renderTableByTab(tab)
  })
})

// ! renderTableByTab()

function renderTableByTab(tab) {
  tabs.forEach(tab => tab.classList.remove("active"));
  tab.classList.add("active")
}

// ! init function 
async function init() {
  const savedCoins = localStorage.getItem("cryptoWatchlist");

  if (savedCoins) {
    state.watchlist = JSON.parse(savedCoins)
  }
  try {
    const data = await fetchTopCoins();
    state.coins = data;
    renderTable(data)
  }
  catch (err) {
    console.error("Init crashed:", err.message)
    showToast(err.message, "error");
    loadingEl.classList.add("hidden");
    emptyStateEl.classList.remove("hidden");
  }

  state.intervalId = setInterval(async () => {
    try {
      const oldCoins = [...state.coins]
      const newData = await fetchTopCoins();
      state.coins = newData;
      renderTable(newData, oldCoins)

    }
    catch (err) {
      console.log("something went wrong!, try again after sometimes!")
    }
  }, 30000);
}





// ? to start the app
init()
