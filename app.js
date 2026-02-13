/* =========================
   Shared: Mobile menu
   ========================= */
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#primary-nav");

if (menuToggle && nav) {
  const closeNav = () => {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeNav();
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-wrap")) closeNav();
  });
}

/* =========================
   Page detection
   ========================= */
const page = document.body.getAttribute("data-page");

/* =========================
   Shared helpers
   ========================= */
function formatUSD(n) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(n);
  } catch {
    return "$" + Math.round(n).toLocaleString();
  }
}

function calcMonthlyPayment(principal, annualRate, years) {
  const n = years * 12;
  const r = (annualRate / 100) / 12;
  if (principal <= 0) return 0;
  if (r === 0) return principal / n;

  const pow = Math.pow(1 + r, n);
  return principal * r * pow / (pow - 1);
}

function initMapboxShell({ containerId, mode = "map" }) {
  const container = document.getElementById(containerId);
  if (!container) return null;
  if (typeof window.mapboxgl === "undefined") return null;

  const token = document.body.getAttribute("data-mapbox-token") || window.MAPBOX_TOKEN;
  if (!token || token === "YOUR_TOKEN") return null;

  try {
    window.mapboxgl.accessToken = token;
    const map = new window.mapboxgl.Map({
      container,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-97.5, 39],
      zoom: 3.15
    });

    container.classList.add("mapbox-ready");
    const hint = container.querySelector(".map-hint");
    if (hint) hint.style.display = "none";

    if (mode === "heatmap") {
      map.on("load", () => {
        const soldData = window.soldDataGeoJSON;
        if (!soldData || soldData.type !== "FeatureCollection") return;

        map.addSource("sold-data", { type: "geojson", data: soldData });

        map.addLayer({
          id: "sold-heat",
          type: "heatmap",
          source: "sold-data",
          paint: {
            "heatmap-weight": 1,
            "heatmap-intensity": 1,
            "heatmap-radius": 30,
            "heatmap-opacity": 0.7,
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0,
              "rgba(245,230,184,0)",
              0.25,
              "rgba(245,230,184,0.5)",
              0.5,
              "rgba(184,140,48,0.65)",
              1,
              "rgba(140,102,28,0.9)"
            ]
          }
        });
      });
    }

    return map;
  } catch {
    return null;
  }
}

/* =========================
   HOME: Just listed + Suggestions
   ========================= */
function initHome() {
  const listingsData = [
    {
      img: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=900&q=80",
      price: "$785,000",
      address: "1482 Cedar Ave, Austin, TX",
      specs: "4 beds • 3 baths • 2,310 sqft"
    },
    {
      img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
      price: "$1,250,000",
      address: "91 Pinecrest Dr, Seattle, WA",
      specs: "5 beds • 4 baths • 3,120 sqft"
    },
    {
      img: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=900&q=80",
      price: "$540,000",
      address: "26 Belmont St, Charlotte, NC",
      specs: "3 beds • 2 baths • 1,780 sqft"
    },
    {
      img: "https://images.unsplash.com/photo-1464890100898-a385f744067f?auto=format&fit=crop&w=900&q=80",
      price: "$920,000",
      address: "372 Harbor Ln, Tampa, FL",
      specs: "4 beds • 3 baths • 2,620 sqft"
    },
    {
      img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
      price: "$689,000",
      address: "78 Willow Ct, Phoenix, AZ",
      specs: "3 beds • 2 baths • 2,050 sqft"
    },
    {
      img: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=900&q=80",
      price: "$1,080,000",
      address: "12 Magnolia Rd, Nashville, TN",
      specs: "4 beds • 3 baths • 2,940 sqft"
    }
  ];

  const listingsGrid = document.querySelector("#listings-grid");
  if (listingsGrid) {
    listingsGrid.innerHTML = listingsData.map((item) => `
      <article class="listing-card">
        <div class="listing-media">
          <img src="${item.img}" alt="${item.address}" loading="lazy" />
          <span class="badge-new">New</span>
        </div>
        <div class="listing-body">
          <h3>${item.price}</h3>
          <p class="address">${item.address}</p>
          <p class="specs">${item.specs}</p>
        </div>
      </article>
    `).join("");
  }

  const locationInput = document.querySelector("#location-input");
  const suggestionsList = document.querySelector("#location-suggestions");

  const locations = [
    "Austin, TX", "Seattle, WA", "Downtown Miami, FL", "Nob Hill, San Francisco, CA",
    "Capitol Hill, Denver, CO", "South End, Charlotte, NC", "Tempe, AZ", "Nashville, TN"
  ];

  function renderSuggestions(value) {
    if (!suggestionsList) return;
    const term = value.trim().toLowerCase();
    suggestionsList.innerHTML = "";
    if (!term) return suggestionsList.classList.remove("show");

    const matches = locations.filter((l) => l.toLowerCase().includes(term)).slice(0, 5);
    if (!matches.length) return suggestionsList.classList.remove("show");

    suggestionsList.innerHTML = matches.map((m) => `<li role="option"><button type="button">${m}</button></li>`).join("");
    suggestionsList.classList.add("show");
  }

  if (locationInput && suggestionsList) {
    locationInput.addEventListener("input", (e) => renderSuggestions(e.target.value));
    suggestionsList.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      locationInput.value = btn.textContent.trim();
      suggestionsList.classList.remove("show");
      locationInput.focus();
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".location-field")) suggestionsList.classList.remove("show");
    });
  }

  const searchForm = document.querySelector("#buy-search-form");
  const feedback = document.querySelector("#search-feedback");
  if (searchForm && feedback) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(searchForm);
      const location = (fd.get("location") || "").toString().trim();
      const q = location ? `?q=${encodeURIComponent(location)}` : "";
      window.location.href = `search.html${q}`;
    });
  }
}

/* =========================
   SEARCH: Filters + map placeholder pins
   ========================= */
function initSearch() {
  const data = [
    { id: 1, img: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=900&q=80", price: 785000, priceLabel: "$785,000", address: "1482 Cedar Ave, Austin, TX", beds: 4, baths: 3, type: "House", pos: { x: 18, y: 36 } },
    { id: 2, img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80", price: 1250000, priceLabel: "$1,250,000", address: "91 Pinecrest Dr, Seattle, WA", beds: 5, baths: 4, type: "House", pos: { x: 62, y: 28 } },
    { id: 3, img: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=900&q=80", price: 540000, priceLabel: "$540,000", address: "26 Belmont St, Charlotte, NC", beds: 3, baths: 2, type: "Townhome", pos: { x: 42, y: 58 } },
    { id: 4, img: "https://images.unsplash.com/photo-1464890100898-a385f744067f?auto=format&fit=crop&w=900&q=80", price: 920000, priceLabel: "$920,000", address: "372 Harbor Ln, Tampa, FL", beds: 4, baths: 3, type: "Condo", pos: { x: 76, y: 62 } },
    { id: 5, img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80", price: 689000, priceLabel: "$689,000", address: "78 Willow Ct, Phoenix, AZ", beds: 3, baths: 2, type: "House", pos: { x: 28, y: 70 } },
    { id: 6, img: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=900&q=80", price: 1080000, priceLabel: "$1,080,000", address: "12 Magnolia Rd, Nashville, TN", beds: 4, baths: 3, type: "House", pos: { x: 55, y: 76 } }
  ];

  const listEl = document.querySelector("#results-list");
  const mapEl = document.querySelector("#map-shell");
  const countEl = document.querySelector("#results-count");

  const typeEl = document.querySelector("#f-type");
  const bedsEl = document.querySelector("#f-beds");
  const maxPriceEl = document.querySelector("#f-maxprice");
  const sortEl = document.querySelector("#sort");

  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  const qEl = document.querySelector("#search-query");
  if (qEl && q) qEl.textContent = q;

  const mapboxMap = initMapboxShell({ containerId: "map-shell", mode: "map" });
  let mapboxMarkers = [];

  function posToLngLat(pos) {
    const lng = -125 + (pos.x / 100) * 59;
    const lat = 25 + ((100 - pos.y) / 100) * 24;
    return [lng, lat];
  }

  function applyFilters() {
    let rows = [...data];

    const type = typeEl?.value || "Any";
    const bedsMin = parseInt(bedsEl?.value || "0", 10);
    const maxPrice = parseInt(maxPriceEl?.value || "0", 10);

    if (type !== "Any") rows = rows.filter((r) => r.type === type);
    if (bedsMin > 0) rows = rows.filter((r) => r.beds >= bedsMin);
    if (maxPrice > 0) rows = rows.filter((r) => r.price <= maxPrice);

    const sort = sortEl?.value || "relevance";
    if (sort === "price_asc") rows.sort((a, b) => a.price - b.price);
    if (sort === "price_desc") rows.sort((a, b) => b.price - a.price);

    return rows;
  }

  function renderMapboxMarkers(rows) {
    if (!mapboxMap || typeof window.mapboxgl === "undefined") return;

    mapboxMarkers.forEach((m) => m.remove());
    mapboxMarkers = [];

    rows.forEach((r) => {
      const el = document.createElement("button");
      el.className = "pin";
      el.type = "button";
      el.dataset.id = String(r.id);
      el.setAttribute("aria-label", `Pin for ${r.address}`);

      const marker = new window.mapboxgl.Marker({ element: el })
        .setLngLat(posToLngLat(r.pos))
        .addTo(mapboxMap);

      mapboxMarkers.push(marker);
    });
  }

  function render(rows) {
    if (listEl) {
      listEl.innerHTML = rows.map((r) => `
        <article class="result-card" data-id="${r.id}">
          <div class="result-media">
            <img src="${r.img}" alt="${r.address}" loading="lazy"/>
          </div>
          <div class="result-meta">
            <h4>${r.priceLabel}</h4>
            <p class="muted">${r.address}</p>
            <p class="specs">${r.beds} beds • ${r.baths} baths • ${r.type}</p>
            <a class="link-arrow" href="property.html?id=${r.id}">View details</a>
          </div>
        </article>
      `).join("");
    }

    if (countEl) countEl.textContent = `${rows.length} homes found`;

    if (mapboxMap) {
      renderMapboxMarkers(rows);
      return;
    }

    if (mapEl) {
      mapEl.querySelectorAll(".pin").forEach((p) => p.remove());
      rows.forEach((r) => {
        const pin = document.createElement("button");
        pin.className = "pin";
        pin.type = "button";
        pin.setAttribute("aria-label", `Pin for ${r.address}`);
        pin.style.left = `${r.pos.x}%`;
        pin.style.top = `${r.pos.y}%`;
        pin.dataset.id = String(r.id);
        mapEl.appendChild(pin);
      });
    }
  }

  function setActive(id) {
    document.querySelectorAll(".result-card").forEach((el) => {
      el.classList.toggle("active", el.dataset.id === String(id));
    });
    document.querySelectorAll(".pin").forEach((el) => {
      el.classList.toggle("active", el.dataset.id === String(id));
    });
  }

  function refresh() {
    const rows = applyFilters();
    render(rows);
  }

  refresh();

  [typeEl, bedsEl, maxPriceEl, sortEl].forEach((el) => {
    if (el) el.addEventListener("change", refresh);
  });

  document.addEventListener("click", (e) => {
    const card = e.target.closest(".result-card");
    if (card) setActive(card.dataset.id);

    const pin = e.target.closest(".pin");
    if (pin) setActive(pin.dataset.id);
  });
}

/* =========================
   PROPERTY: Gallery + Mortgage
   ========================= */
function initMortgageCalc() {
  const priceEl = document.querySelector("#mc-price");
  const downEl = document.querySelector("#mc-down");
  const rateEl = document.querySelector("#mc-rate");
  const rateValEl = document.querySelector("#mc-rate-val");
  const yearsEl = document.querySelector("#mc-years");
  const paymentEl = document.querySelector("#mc-payment");

  if (!priceEl || !downEl || !rateEl || !yearsEl || !paymentEl || !rateValEl) return;

  function update() {
    const price = Number(priceEl.value || 0);
    const down = Math.min(Number(downEl.value || 0), price);
    const rate = Number(rateEl.value || 0);
    const years = Number(yearsEl.value || 30);

    rateValEl.textContent = rate.toFixed(2);

    const principal = Math.max(price - down, 0);
    const payment = calcMonthlyPayment(principal, rate, years);
    paymentEl.textContent = formatUSD(payment);
  }

  ["input", "change"].forEach((evt) => {
    priceEl.addEventListener(evt, update);
    downEl.addEventListener(evt, update);
    rateEl.addEventListener(evt, update);
    yearsEl.addEventListener(evt, update);
  });

  update();
}

function initProperty() {
  const mainImg = document.querySelector("#gallery-main-img");
  const thumbs = document.querySelectorAll("[data-thumb]");
  if (mainImg && thumbs.length) {
    thumbs.forEach((t) => {
      t.addEventListener("click", () => {
        const src = t.getAttribute("data-src");
        if (src) mainImg.src = src;
      });
    });
  }

  initMortgageCalc();
}

/* =========================
   SELL: Instant valuation + Heatmap skeleton
   ========================= */
function mockEstimate({ beds, baths, sqft }) {
  const basePerSqft = 260;
  const bedBonus = beds * 9000;
  const bathBonus = baths * 11000;

  const center = (sqft * basePerSqft) + bedBonus + bathBonus;
  const low = center * 0.93;
  const high = center * 1.07;

  const status =
    center >= 900000 ? "Hot market range (high demand)" :
    center >= 600000 ? "Strong seller interest" :
    "Balanced market range";

  return { low, high, status };
}

function initSell() {
  initMapboxShell({ containerId: "sell-heatmap", mode: "heatmap" });

  const form = document.querySelector("#valuation-form");
  const out = document.querySelector("#val-output");
  const statusEl = document.querySelector("#val-status");
  if (!form || !out || !statusEl) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const bedsRaw = document.querySelector("#val-beds").value;
    const beds = bedsRaw.includes("+") ? 5 : Number(bedsRaw);
    const bathsRaw = document.querySelector("#val-baths").value;
    const baths = bathsRaw.includes("+") ? 4 : Number(bathsRaw);
    const sqft = Number(document.querySelector("#val-sqft").value || 0);

    const { low, high, status } = mockEstimate({ beds, baths, sqft });
    out.textContent = `${formatUSD(low)} – ${formatUSD(high)}`;
    statusEl.textContent = status + " • (Mock estimate until comps are connected)";
  });
}

/* Run */
if (page === "home") initHome();
if (page === "search") initSearch();
if (page === "property") initProperty();
if (page === "sell") initSell();
