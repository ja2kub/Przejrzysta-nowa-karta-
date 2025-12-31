
// ====== UTILS & CONFIG ======
function normalizeUrl(url) {
    if (!/^https?:\/\//i.test(url)) {
        return "https://" + url;
    }
    return url;
}

const searchEngines = {
  google: { name: "Google", base: "https://www.google.com/search?q=", domain: "google.com" },
  duck:   { name: "DuckDuckGo", base: "https://duckduckgo.com/?q=", domain: "duckduckgo.com" },
  bing:   { name: "Bing", base: "https://www.bing.com/search?q=", domain: "bing.com" },
  brave:  { name: "Brave Search", base: "https://search.brave.com/search?q=", domain: "search.brave.com" }
};

const DEFAULT_ENGINE_KEY = localStorage.getItem("searchEngine") || "google";

// ====== DOM ELEMENTS ======
const clockEl = document.getElementById("clock");
const bgInput = document.getElementById("bgUpload");
const bgLayer = document.getElementById("bgLayer");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const shortcutsContainer = document.getElementById("shortcuts");
const addShortcutBtn = document.getElementById("addShortcutBtn");
const focusModeBtn = document.getElementById("focusModeBtn");

// Modal Elements
const cModal = document.getElementById("customModal");
const cModalTitle = document.getElementById("cModalTitle");
const cModalMessage = document.getElementById("cModalMessage");
const cModalInput = document.getElementById("cModalInput");
const cModalCancel = document.getElementById("cModalCancel");
const cModalConfirm = document.getElementById("cModalConfirm");

// Weather Elements
const weatherWidget = document.getElementById("weatherWidget");
const weatherToggle = document.getElementById("weatherToggle");
const weatherIcon = document.getElementById("weatherIcon");
const weatherTemp = document.getElementById("weatherTemp");
const weatherDesc = document.getElementById("weatherDesc");
const weatherHumidity = document.getElementById("weatherHumidity");
const weatherWind = document.getElementById("weatherWind");

// Date Elements
const dateWidget = document.getElementById("dateWidget");
const dateToggle = document.getElementById("dateToggle");

// ====== STATE ======
let currentEngineKey = DEFAULT_ENGINE_KEY;
let shortcuts = JSON.parse(localStorage.getItem("shortcuts") || "[]");
let isFocusMode = localStorage.getItem("focusMode") === "true";
let weatherEnabled = localStorage.getItem("weatherEnabled") === "true";
let weatherApiKey = localStorage.getItem("weatherApiKey") || "";
let dateEnabled = localStorage.getItem("dateEnabled") === "true";

// ====== MODAL LOGIC ======
function showModal({ title = "", message = "", input = false, defaultValue = "", confirmText = "OK", cancelText = "Anuluj", hideCancel = false }) {
    return new Promise((resolve) => {
        if (!cModal) return resolve(null);

        cModalTitle.textContent = title;
        cModalMessage.textContent = message;

        if (input) {
            cModalInput.value = defaultValue;
            cModalInput.classList.remove("hidden");
        } else {
            cModalInput.classList.add("hidden");
        }

        cModalConfirm.textContent = confirmText;
        cModalCancel.textContent = cancelText;

        cModalCancel.style.display = hideCancel ? "none" : "";

        cModal.classList.remove("hidden");
        cModal.setAttribute("aria-hidden", "false");
        cModal.style.display = "flex"; // Force flex display

        if (input) {
            setTimeout(() => { cModalInput.focus(); cModalInput.select(); }, 50);
        } else {
            cModalConfirm.focus();
        }

        const close = (val) => {
            cleanup();
            cModal.classList.add("hidden");
            cModal.setAttribute("aria-hidden", "true");
            cModal.style.display = ""; // Reset to default (none via css class)
            resolve(val);
        };

        const onConfirm = () => {
            if (input) close(cModalInput.value);
            else close(true);
        };
        const onCancel = () => {
            close(input ? null : false);
        };
        const onKey = (e) => {
            if (e.key === "Enter") onConfirm();
            if (e.key === "Escape") onCancel();
        };

        cModalConfirm.onclick = onConfirm;
        cModalCancel.onclick = onCancel;
        cModalInput.onkeydown = onKey;

        const globalKey = (e) => {
             if (e.key === "Escape") onCancel();
        };
        document.addEventListener("keydown", globalKey);

        function cleanup() {
            cModalConfirm.onclick = null;
            cModalCancel.onclick = null;
            cModalInput.onkeydown = null;
            document.removeEventListener("keydown", globalKey);
        }
    });
}

async function customAlert(msg) {
    return showModal({ title: "Info", message: msg, hideCancel: true });
}

async function customConfirm(msg) {
    return showModal({ title: "Potwierdź", message: msg, confirmText: "Tak", cancelText: "Nie" });
}

async function customPrompt(msg, def = "") {
    return showModal({ title: "Wprowadź dane", message: msg, input: true, defaultValue: def, confirmText: "OK", cancelText: "Anuluj" });
}

// ====== ZEGAR ======
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2,"0");
  const m = String(now.getMinutes()).padStart(2,"0");
  clockEl.textContent = `${h}:${m}`;
}
updateClock();
setInterval(updateClock, 1000);

// ====== TAPETA ======
function applyBackgroundDataUrl(dataUrl, animate = true) {
  if (!bgLayer) return;
  if (!animate) {
    bgLayer.style.backgroundImage = `url('${dataUrl}')`;
    bgLayer.style.opacity = "1";
    return;
  }
  bgLayer.style.opacity = "0";
  setTimeout(() => {
    bgLayer.style.backgroundImage = `url('${dataUrl}')`;
    bgLayer.style.opacity = "1";
  }, 260);
}

const savedBg = localStorage.getItem("customBackground");
if (savedBg) applyBackgroundDataUrl(savedBg, false);

bgInput.addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    const dataUrl = ev.target.result;
    applyBackgroundDataUrl(dataUrl, true);
    localStorage.setItem("customBackground", dataUrl);
  };
  reader.readAsDataURL(file);
});


// ====== BLUR / BRIGHTNESS SLIDERS ======
const blurSlider = document.getElementById("blurSlider");
const brightnessSlider = document.getElementById("brightnessSlider");

function updateBgFilters() {
    const blurVal = blurSlider.value;
    const brightnessVal = brightnessSlider.value;
    bgLayer.style.filter = `brightness(${brightnessVal}%) blur(${blurVal}px)`;
    localStorage.setItem("bgBlur", blurVal);
    localStorage.setItem("bgBrightness", brightnessVal);
}

const savedBlurVal = localStorage.getItem("bgBlur") || "0";
const savedBrightnessVal = localStorage.getItem("bgBrightness") || "100";

if (blurSlider && brightnessSlider) {
    blurSlider.value = savedBlurVal;
    brightnessSlider.value = savedBrightnessVal;
    updateBgFilters();
    blurSlider.addEventListener("input", updateBgFilters);
    brightnessSlider.addEventListener("input", updateBgFilters);
}

// ====== LANGUAGE / TŁUMACZENIA ======
const translations = {
  pl: {
    addShortcut: "＋ Dodaj skrót",
    customizeBtn: "Personalizacja",
    setWallpaper: "Ustaw tapetę",
    theme: "Motyw",
    viewBtn: "Widok",
    focusMode: "Tryb skupienia",
    exitFocus: "Wyłącz skupienie",
    blur: "Blur",
    brightness: "Jasność",
    language: "Język: PL",
    searchPlaceholder: "Szukaj...",
    editShortcut: "Edytuj skrót",
    namePlaceholder: "Nazwa",
    urlPlaceholder: "Adres URL (np. https://example.com)",
    cancel: "Anuluj",
    save: "Zapisz",
    confirmDelete: "Usunąć skrót?",
    invalidUrl: "Nieprawidłowy adres URL.",
    urlPrompt: "Adres URL:",
    namePrompt: "Nazwa skrótu (ENTER = domyślna):",
    fontColor: "Kolor czcionki",
    weather: "Pogoda",
    date: "Data",
    humidity: "Wilgotność",
    wind: "Wiatr"
  },
  en: {
    addShortcut: "＋ Add Shortcut",
    customizeBtn: "Customize",
    setWallpaper: "Set Wallpaper",
    theme: "Theme",
    viewBtn: "View",
    focusMode: "Focus Mode",
    exitFocus: "Exit Focus",
    blur: "Blur",
    brightness: "Brightness",
    language: "Language: EN",
    searchPlaceholder: "Search...",
    editShortcut: "Edit Shortcut",
    namePlaceholder: "Name",
    urlPlaceholder: "URL Address (e.g. https://example.com)",
    cancel: "Cancel",
    save: "Save",
    confirmDelete: "Delete shortcut?",
    invalidUrl: "Invalid URL.",
    urlPrompt: "URL Address:",
    namePrompt: "Shortcut Name (ENTER = default):",
    fontColor: "Font Color",
    weather: "Weather",
    date: "Date",
    humidity: "Humidity",
    wind: "Wind"
  }
};

let currentLang = localStorage.getItem("language") || "pl";

function updateLanguage() {
  const t = translations[currentLang];
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (t[key]) {
      if (key === "focusMode" && isFocusMode) {
          el.textContent = t["exitFocus"];
      } else {
          el.textContent = t[key];
      }
    }
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (t[key]) el.placeholder = t[key];
  });
  if (searchInput) searchInput.placeholder = t.searchPlaceholder;
}

const langToggle = document.getElementById("langToggle");
if (langToggle) {
    langToggle.addEventListener("click", () => {
        currentLang = (currentLang === "pl") ? "en" : "pl";
        localStorage.setItem("language", currentLang);
        updateLanguage();
    });
}
updateLanguage();

// ====== MENUS ======
function setupMenus() {
  const toggles = document.querySelectorAll(".menu-toggle");
  toggles.forEach(toggle => {
    const menu = toggle.nextElementSibling;
    if (!menu || !menu.classList.contains("menu-content")) return;
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll(".menu-content").forEach(m => {
        if (m !== menu) m.classList.add("hidden");
      });
      menu.classList.remove("hidden");
    });
    toggle.addEventListener("mouseenter", () => {
      document.querySelectorAll(".menu-content").forEach(m => {
        if (m !== menu) m.classList.add("hidden");
      });
      menu.classList.remove("hidden");
    });
    toggle.addEventListener("mouseleave", (e) => {
       setTimeout(() => {
         if (!menu.matches(":hover") && !toggle.matches(":hover")) {
           menu.classList.add("hidden");
         }
       }, 100);
    });
    menu.addEventListener("mouseleave", () => {
      setTimeout(() => {
         if (!menu.matches(":hover") && !toggle.matches(":hover")) {
           menu.classList.add("hidden");
         }
       }, 100);
    });
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".menu-content") && !e.target.closest(".menu-toggle")) {
      document.querySelectorAll(".menu-content").forEach(m => m.classList.add("hidden"));
    }
  });
}
setupMenus();

// ====== SEARCH ======
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = searchInput.value.trim();
  if (!q) return;
  try {
    if (chrome && chrome.search && typeof chrome.search.query === "function") {
      chrome.search.query({ text: q });
      return;
    }
  } catch (err) { }
  const target = searchEngines.google.base + encodeURIComponent(q);
  window.location.href = target;
});

// ====== SHORTCUTS ======
function renderShortcuts() {
  shortcutsContainer.innerHTML = "";
  shortcuts.forEach((s, i) => {
    const a = document.createElement("a");
    a.dataset.index = i;
    a.className = "shortcut";
    a.href = s.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    const iconWrap = document.createElement("div");
    iconWrap.className = "shortcut-icon";
    const img = document.createElement("img");
    img.src = s.icon;
    img.alt = s.name;
    img.onerror = function() {
      img.style.display = "none";
      const fallback = document.createElement("div");
      fallback.style.fontSize = "1.2rem";
      fallback.style.color = "white";
      fallback.textContent = s.name[0] ? s.name[0].toUpperCase() : "•";
      iconWrap.appendChild(fallback);
    };
    iconWrap.appendChild(img);
    const nameDiv = document.createElement("div");
    nameDiv.className = "shortcut-name";
    nameDiv.textContent = s.name;
    a.appendChild(iconWrap);
    a.appendChild(nameDiv);

    a.addEventListener("contextmenu", async (ev) => {
      ev.preventDefault();
      if (ev.ctrlKey) {
          openEditModal(i);
          return;
      }
      const t = translations[currentLang];
      const ok = await customConfirm(t ? t.confirmDelete : `Usunąć skrót "${s.name}"?`);
      if (ok) {
        shortcuts.splice(i,1);
        localStorage.setItem("shortcuts", JSON.stringify(shortcuts));
        renderShortcuts();
      }
    });
    shortcutsContainer.appendChild(a);
  });
}
renderShortcuts();

addShortcutBtn.addEventListener("click", async () => {
  console.log("Add Shortcut Clicked");
  const t = translations[currentLang];
  let url = await customPrompt(t ? t.urlPrompt : "Adres URL:");
  console.log("URL entered:", url);
  if (!url) return;
  url = url.trim();
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./,"");
    const defaultName = host;
    const name = await customPrompt((t ? t.namePrompt : "Nazwa skrótu (ENTER = domyślna):"), defaultName) || defaultName;
    const favicon = `https://www.google.com/s2/favicons?domain=${host}&sz=128`;

    shortcuts.push({ name, url: parsed.href, icon: favicon });
    localStorage.setItem("shortcuts", JSON.stringify(shortcuts));
    renderShortcuts();
  } catch (err) {
    customAlert(t ? t.invalidUrl : "Nieprawidłowy adres URL.");
  }
});

// ====== DRAG & DROP ======
function extractUrlFromDataTransferAsync(dt, cb) {
  try {
    if (!dt) return cb(null);
    try { const v = dt.getData('text/uri-list'); if (v) return cb(v.split('\n')[0].trim()); } catch(e){}
    try { const v = dt.getData('URL'); if (v) return cb(v.trim()); } catch(e){}
    try { const v = dt.getData('text/plain'); if (v && /https?:\/\//.test(v)) return cb(v.trim()); } catch(e){}
    if (dt.items && dt.items.length) {
      for (let i = 0; i < dt.items.length; i++) {
        const it = dt.items[i];
        if (it.kind === 'string') {
          try {
            it.getAsString(function(s) {
              if (!s) return cb(null);
              const m = s.match(/href=["']?([^"' >]+)/i) || s.match(/<a[^>]+href=["']?([^"' >]+)/i);
              const candidate = m ? m[1] : s.split(/\r?\n/)[0].trim();
              return cb(candidate);
            });
            return;
          } catch(e){ continue; }
        }
      }
    }
    return cb(null);
  } catch (e) {
    try { return cb(null); } catch(e2){}
  }
}

function addShortcutFromUrl(rawUrl) {
  if (!rawUrl) return;
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const defaultName = host;
    const name = defaultName;
    const favicon = `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
    shortcuts.push({ name, url: parsed.href, icon: favicon });
    localStorage.setItem("shortcuts", JSON.stringify(shortcuts));
    renderShortcuts();
  } catch (err) {
    console.warn("DnD Error:", rawUrl);
  }
}

function addDropHighlight(el) { el.classList.add('dnd-highlight'); }
function removeDropHighlight(el) { el.classList.remove('dnd-highlight'); }

addShortcutBtn.addEventListener('dragover', (ev) => {
  ev.preventDefault();
  ev.dataTransfer.dropEffect = 'copy';
  addDropHighlight(addShortcutBtn);
});
addShortcutBtn.addEventListener('dragleave', () => removeDropHighlight(addShortcutBtn));
addShortcutBtn.addEventListener('drop', (ev) => {
  ev.preventDefault();
  removeDropHighlight(addShortcutBtn);
  extractUrlFromDataTransferAsync(ev.dataTransfer, function(url) {
    url = url || ev.dataTransfer.getData('text/plain');
    if (url) addShortcutFromUrl(url);
  });
});

shortcutsContainer.addEventListener('dragover', (ev) => {
  ev.preventDefault();
  ev.dataTransfer.dropEffect = 'copy';
  addDropHighlight(shortcutsContainer);
});
shortcutsContainer.addEventListener('dragleave', () => removeDropHighlight(shortcutsContainer));
shortcutsContainer.addEventListener('drop', (ev) => {
  ev.preventDefault();
  removeDropHighlight(shortcutsContainer);
  extractUrlFromDataTransferAsync(ev.dataTransfer, function(url) {
    url = url || ev.dataTransfer.getData('text/plain');
    if (url) addShortcutFromUrl(url);
  });
});

// ====== THEME & FONT COLOR ======
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("themeToggle");
  const colorInput = document.getElementById("fontColorInput");
  const colorPicker = document.getElementById("fontColorPicker");

  function hexToRgba(hex, alpha) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function applyCustomColor(hex) {
    if (!hex || !/^#([0-9A-F]{3}){1,2}$/i.test(hex)) return;
    document.documentElement.style.setProperty("--text", hex);
    document.documentElement.style.setProperty("--muted", hexToRgba(hex, 0.65));
    if (colorInput) colorInput.value = hex;
    if (colorPicker) colorPicker.value = hex;
    localStorage.setItem("customFontColor", hex);
  }

  function setTheme(mode) {
    if (mode === "light") {
      document.documentElement.style.setProperty("--text", "#000000");
      document.documentElement.style.setProperty("--muted", "rgba(0,0,0,0.65)");
      document.documentElement.style.setProperty("--accent", "#3333ff");
    } else {
      document.documentElement.style.setProperty("--text", "#ffffff");
      document.documentElement.style.setProperty("--muted", "rgba(255,255,255,0.65)");
      document.documentElement.style.setProperty("--accent", "#ff3333");
    }
    localStorage.setItem("theme", mode);
  }

  let currentTheme = localStorage.getItem("theme") || "dark";
  const savedColor = localStorage.getItem("customFontColor");
  if (savedColor) {
    setTheme(currentTheme);
    applyCustomColor(savedColor);
  } else {
    setTheme(currentTheme);
  }

  if (btn) {
    btn.addEventListener("click", () => {
        localStorage.removeItem("customFontColor");
        if (colorInput) colorInput.value = "";
        currentTheme = (currentTheme === "dark") ? "light" : "dark";
        setTheme(currentTheme);
    });
  }

  if (colorInput && colorPicker) {
      colorInput.addEventListener("input", (e) => {
          let val = e.target.value.trim();
          if (val && !val.startsWith("#")) val = "#" + val;
          if (/^#([0-9A-F]{3}){1,2}$/i.test(val)) {
              applyCustomColor(val);
          }
      });
      colorPicker.addEventListener("input", (e) => {
          applyCustomColor(e.target.value);
      });
  }
});

// ====== EDIT SHORTCUT MODAL ======
let editingShortcutIndex = null;
const editModal = document.getElementById("editShortcutModal");
const editNameInput = document.getElementById("editName");
const editUrlInput = document.getElementById("editUrl");

function openEditModal(index) {
  if (!editModal || !editNameInput || !editUrlInput) return;
  const sc = shortcuts[index];
  if (!sc) return;
  editingShortcutIndex = Number(index);
  editNameInput.value = sc.name || "";
  editUrlInput.value = sc.url || "";
  editModal.classList.remove("hidden");
  editModal.setAttribute('aria-hidden','false');
  editUrlInput.focus();
  editUrlInput.select();
}

function closeEditModal() {
  if (editModal) {
      editModal.classList.add("hidden");
      editModal.setAttribute("aria-hidden", "true");
  }
  editingShortcutIndex = null;
}

document.addEventListener("DOMContentLoaded", () => {
    const saveBtn = document.getElementById("saveEdit");
    const cancelBtn = document.getElementById("cancelEdit");
    if (!editModal || !saveBtn || !cancelBtn) return;

    saveBtn.addEventListener("click", () => {
        if (editingShortcutIndex === null) { closeEditModal(); return; }
        if (!shortcuts[editingShortcutIndex]) { closeEditModal(); return; }
        const nameVal = editNameInput.value.trim() || shortcuts[editingShortcutIndex].name;
        let urlVal = editUrlInput.value.trim();
        if (!urlVal) { customAlert("Adres URL nie może być pusty."); return; }
        if (!/^https?:\/\//i.test(urlVal)) urlVal = "https://" + urlVal;
        try {
            const parsed = new URL(urlVal);
            shortcuts[editingShortcutIndex].name = nameVal;
            shortcuts[editingShortcutIndex].url = parsed.href;
            shortcuts[editingShortcutIndex].icon = `https://www.google.com/s2/favicons?domain=${parsed.hostname.replace(/^www\./,'')}&sz=128`;
            localStorage.setItem("shortcuts", JSON.stringify(shortcuts));
            renderShortcuts();
            closeEditModal();
        } catch (err) {
            customAlert("Nieprawidłowy adres URL.");
        }
    });

    cancelBtn.addEventListener("click", closeEditModal);
    editModal.addEventListener("click", (e) => {
        if (e.target === editModal) closeEditModal();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !editModal.classList.contains("hidden")) closeEditModal();
    });
});

// ====== FOCUS MODE ======
function toggleFocusMode() {
    isFocusMode = !isFocusMode;
    applyFocusMode();
    localStorage.setItem("focusMode", isFocusMode);
    updateLanguage();
}

function applyFocusMode() {
    if (isFocusMode) {
        document.body.classList.add("focus-mode");
    } else {
        document.body.classList.remove("focus-mode");
    }
}

if (focusModeBtn) {
    focusModeBtn.addEventListener("click", toggleFocusMode);
}
applyFocusMode();

// ====== WEATHER LOGIC ======
let fetchingWeatherKey = false;

function updateWeatherVisibility() {
    if (weatherEnabled) {
        weatherWidget.classList.remove("hidden");
        fetchWeather();
    } else {
        weatherWidget.classList.add("hidden");
    }
}

async function fetchWeather() {
    if (!weatherEnabled) return;

    if (!weatherApiKey) {
        if (fetchingWeatherKey) return;
        fetchingWeatherKey = true;
        const key = await customPrompt("Podaj klucz API do WeatherAPI.com (Get your key at weatherapi.com):");
        fetchingWeatherKey = false;

        if (key && key.trim()) {
            weatherApiKey = key.trim();
            localStorage.setItem("weatherApiKey", weatherApiKey);
        } else {
            weatherEnabled = false;
            localStorage.setItem("weatherEnabled", "false");
            updateWeatherVisibility();
            return;
        }
    }

    const lang = currentLang || "pl";
    const url = `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=auto:ip&lang=${lang}`;

    fetch(url)
        .then(async (res) => {
            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                     await customAlert("Błąd klucza API pogody. Sprawdź klucz.");
                     localStorage.removeItem("weatherApiKey");
                     weatherApiKey = "";
                     weatherEnabled = false;
                     updateWeatherVisibility();
                }
                throw new Error("Weather fetch failed");
            }
            return res.json();
        })
        .then(data => {
            if (!data || !data.current) return;
            const temp = data.current.temp_c;
            const iconUrl = "https:" + data.current.condition.icon;
            const text = data.current.condition.text;
            const humidity = data.current.humidity;
            const wind = data.current.wind_kph;
            const t = translations[currentLang];

            weatherTemp.textContent = `${temp}°C`;
            weatherDesc.textContent = text;
            weatherIcon.src = iconUrl;
            weatherIcon.alt = text;
            weatherHumidity.textContent = `${t.humidity}: ${humidity}%`;
            weatherWind.textContent = `${t.wind}: ${wind} km/h`;
        })
        .catch(err => {
            console.error("Weather Error:", err);
            weatherDesc.textContent = "...";
        });
}

if (weatherToggle) {
    weatherToggle.addEventListener("click", () => {
        weatherEnabled = !weatherEnabled;
        localStorage.setItem("weatherEnabled", weatherEnabled);
        updateWeatherVisibility();
    });
}

setInterval(fetchWeather, 15 * 60 * 1000);
updateWeatherVisibility();

// ====== DATE WIDGET ======
function updateDateVisibility() {
    if (dateEnabled) {
        dateWidget.classList.remove("hidden");
        updateDate();
    } else {
        dateWidget.classList.add("hidden");
    }
}

function updateDate() {
    if (!dateEnabled) return;
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = now.toLocaleDateString(currentLang === 'pl' ? 'pl-PL' : 'en-US', options);
    const capitalized = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    dateWidget.textContent = capitalized;
}

if (dateToggle) {
    dateToggle.addEventListener("click", () => {
        dateEnabled = !dateEnabled;
        localStorage.setItem("dateEnabled", dateEnabled);
        updateDateVisibility();
    });
}

setInterval(updateDate, 60 * 1000);
updateDateVisibility();
