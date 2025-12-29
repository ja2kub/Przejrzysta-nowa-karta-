
function normalizeUrl(url) {
    if (!/^https?:\/\//i.test(url)) {
        return "https://" + url;
    }
    return url;
}

// ====== KONFIG ======
const searchEngines = {
  google: { name: "Google", base: "https://www.google.com/search?q=", domain: "google.com" },
  duck:   { name: "DuckDuckGo", base: "https://duckduckgo.com/?q=", domain: "duckduckgo.com" },
  bing:   { name: "Bing", base: "https://www.bing.com/search?q=", domain: "bing.com" },
  brave:  { name: "Brave Search", base: "https://search.brave.com/search?q=", domain: "search.brave.com" }
};

const DEFAULT_ENGINE_KEY = localStorage.getItem("searchEngine") || "google";

// ====== ELEMENTY ======
const clockEl = document.getElementById("clock");
const bgInput = document.getElementById("bgUpload");
const bgLayer = document.getElementById("bgLayer");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const shortcutsContainer = document.getElementById("shortcuts");
const addShortcutBtn = document.getElementById("addShortcutBtn");
const focusModeBtn = document.getElementById("focusModeBtn");

let currentEngineKey = DEFAULT_ENGINE_KEY;
let shortcuts = JSON.parse(localStorage.getItem("shortcuts") || "[]");
let isFocusMode = localStorage.getItem("focusMode") === "true";

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
    // Apply filters to bgLayer
    // Brightness is percent, blur is px
    // CSS filter: brightness(%) blur(px)
    bgLayer.style.filter = `brightness(${brightnessVal}%) blur(${blurVal}px)`;

    localStorage.setItem("bgBlur", blurVal);
    localStorage.setItem("bgBrightness", brightnessVal);
}

// Init values from localStorage or default
const savedBlur = localStorage.getItem("bgBlur") || "0";
const savedBrightness = localStorage.getItem("bgBrightness") || "100";

if (blurSlider && brightnessSlider) {
    blurSlider.value = savedBlur;
    brightnessSlider.value = savedBrightness;
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
    fontColor: "Kolor czcionki"
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
    fontColor: "Font Color"
  }
};

let currentLang = localStorage.getItem("language") || "pl";

function updateLanguage() {
  const t = translations[currentLang];

  // Update elements with data-i18n
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (t[key]) {
      // For inputs with button role or just text content
      if (key === "focusMode" && isFocusMode) {
          el.textContent = t["exitFocus"];
      } else {
          el.textContent = t[key];
      }
    }
  });

  // Update placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (t[key]) el.placeholder = t[key];
  });

  // Update search input specifically if not covered above
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
// Initial apply
updateLanguage();


// ====== MENUS (Customize / View) ======
function setupMenus() {
  const toggles = document.querySelectorAll(".menu-toggle");

  toggles.forEach(toggle => {
    const menu = toggle.nextElementSibling;
    if (!menu || !menu.classList.contains("menu-content")) return;

    // Click handler
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      // Close others
      document.querySelectorAll(".menu-content").forEach(m => {
        if (m !== menu) m.classList.add("hidden");
      });
      // Ensure open (fix conflict with hover)
      menu.classList.remove("hidden");
    });

    // Hover handler (mouse enter on button)
    toggle.addEventListener("mouseenter", () => {
      // Close others
      document.querySelectorAll(".menu-content").forEach(m => {
        if (m !== menu) m.classList.add("hidden");
      });
      menu.classList.remove("hidden");
    });

    // Leave handler (mouse leave button) - verify if entering menu
    toggle.addEventListener("mouseleave", (e) => {
       // We need a small delay or check if moving to menu
       setTimeout(() => {
         if (!menu.matches(":hover") && !toggle.matches(":hover")) {
           menu.classList.add("hidden");
         }
       }, 100);
    });

    // Leave handler for menu
    menu.addEventListener("mouseleave", () => {
      setTimeout(() => {
         if (!menu.matches(":hover") && !toggle.matches(":hover")) {
           menu.classList.add("hidden");
         }
       }, 100);
    });
  });

  // Close menus when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".menu-content") && !e.target.closest(".menu-toggle")) {
      document.querySelectorAll(".menu-content").forEach(m => m.classList.add("hidden"));
    }
  });
}
setupMenus();



// ====== WYSZUKIWARKA ======

// (Usunięto: interfejs wyboru wyszukiwarki — używana będzie domyślna przeglądarki)

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = searchInput.value.trim();
  if (!q) return;
  // Użyj domyślnej wyszukiwarki przeglądarki przez chrome.search.query (jeśli dostępne)
  try {
    if (chrome && chrome.search && typeof chrome.search.query === "function") {
      chrome.search.query({ text: q });
      return;
    }
  } catch (err) { /* fallback dalej */ }
  // Fallback: użyj Google, jeśli chrome.search.query nie jest dostępne
  const target = searchEngines.google.base + encodeURIComponent(q);
  window.location.href = target;
});

// ====== SKRÓTY ======
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

    a.addEventListener("contextmenu", (ev) => {
      ev.preventDefault();
      // If Control key is pressed, edit instead of delete
      if (ev.ctrlKey) {
          openEditModal(i);
          return;
      }

      const t = translations[currentLang];
      const ok = confirm(t ? t.confirmDelete : `Usunąć skrót "${s.name}"?`);
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

addShortcutBtn.addEventListener("click", () => {
  let url = prompt("Adres URL:");
  if (!url) return;
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./,"");
    const defaultName = host;
    const name = prompt("Nazwa skrótu (ENTER = domyślna):", defaultName) || defaultName;
    const favicon = `https://www.google.com/s2/favicons?domain=${host}&sz=128`;

    shortcuts.push({ name, url: parsed.href, icon: favicon });
    localStorage.setItem("shortcuts", JSON.stringify(shortcuts));
    renderShortcuts();
  } catch (err) {
    alert("Nieprawidłowy adres URL.");
  }
});

// ====== DRAG & DROP: przeciągnij link na przycisk "Dodaj skrót" lub do sekcji skrótów ======
function extractUrlFromDataTransfer(dt) {
  try {
    if (!dt) return null;
    // text/uri-list (contains url)
    if (dt.types && Array.from(dt.types).includes('text/uri-list')) {
      const v = dt.getData('text/uri-list').split('\n')[0];
      if (v) return v.trim();
    }
    // text/plain
    const plain = dt.getData('text/plain');
    if (plain && /https?:\/\//.test(plain)) return plain.trim();
    // text/html -> try to extract href
    const html = dt.getData('text/html');
    if (html) {
      const hrefMatch = html.match(/href=["']?([^"' >]+)/i);
      if (hrefMatch) return hrefMatch[1];
      // or anchor tag
      const aMatch = html.match(/<a[^>]+href=["']?([^"' >]+)/i);
      if (aMatch) return aMatch[1];
    }
    return null;
  } catch (e) {
    return null;
  }
}


// Async extractor for dataTransfer (handles dt.items.getAsString fallbacks)
function extractUrlFromDataTransferAsync(dt, cb) {
  try {
    if (!dt) return cb(null);
    // Try common types first (synchronous)
    try { const v = dt.getData('text/uri-list'); if (v) return cb(v.split('\n')[0].trim()); } catch(e){}
    try { const v = dt.getData('URL'); if (v) return cb(v.trim()); } catch(e){}
    try { const v = dt.getData('text/plain'); if (v && /https?:\/\//.test(v)) return cb(v.trim()); } catch(e){}
    try { const html = dt.getData('text/html'); if (html) { const hrefMatch = html.match(/href=["']?([^"' >]+)/i); if (hrefMatch) return cb(hrefMatch[1]); const aMatch = html.match(/<a[^>]+href=["']?([^"' >]+)/i); if (aMatch) return cb(aMatch[1]); } } catch(e){}
    // If dt.items available, try getAsString on first string item
    if (dt.items && dt.items.length) {
      for (let i = 0; i < dt.items.length; i++) {
        const it = dt.items[i];
        if (it.kind === 'string') {
          try {
            it.getAsString(function(s) {
              if (!s) return cb(null);
              // if html, extract href
              const m = s.match(/href=["']?([^"' >]+)/i) || s.match(/<a[^>]+href=["']?([^"' >]+)/i);
              const candidate = m ? m[1] : s.split(/\r?\n/)[0].trim();
              return cb(candidate);
            });
            return;
          } catch(e){ continue; }
        }
      }
    }
    // as last resort, callback null
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
    // push to shortcuts and render
    shortcuts.push({ name, url: parsed.href, icon: favicon });
    localStorage.setItem("shortcuts", JSON.stringify(shortcuts));
    renderShortcuts();
  } catch (err) {
    console.warn("Nieudane dodanie skrótu z DnD:", rawUrl);
  }
}

// Visual feedback class
function addDropHighlight(el) {
  el.classList.add('dnd-highlight');
}
function removeDropHighlight(el) {
  el.classList.remove('dnd-highlight');
}

// Setup for addShortcutBtn
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

// Setup for whole shortcuts container (allows dropping into area)
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






// ====== MOTYW & KOLOR CZCIONKI ======
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("themeToggle");
  const colorInput = document.getElementById("fontColorInput");
  const colorPicker = document.getElementById("fontColorPicker");

  // Helper: Hex to RGBA
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

    // Apply text color
    document.documentElement.style.setProperty("--text", hex);
    // Apply muted color (same RGB, 0.65 opacity)
    document.documentElement.style.setProperty("--muted", hexToRgba(hex, 0.65));

    // Update inputs
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

  // Init Theme
  let currentTheme = localStorage.getItem("theme") || "dark";

  // Check for saved custom color
  const savedColor = localStorage.getItem("customFontColor");
  if (savedColor) {
    // If custom color exists, apply it (overrides theme text colors)
    setTheme(currentTheme); // Set accent colors first
    applyCustomColor(savedColor);
  } else {
    setTheme(currentTheme);
  }

  // Theme Toggle Logic
  if (btn) {
    btn.addEventListener("click", () => {
        // Reset custom color
        localStorage.removeItem("customFontColor");
        if (colorInput) colorInput.value = "";

        // Toggle theme
        currentTheme = (currentTheme === "dark") ? "light" : "dark";
        setTheme(currentTheme);
    });
  }

  // Custom Color Input Logic
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


// --- Edit shortcut functionality (Clean & Consolidated) ---
let editingShortcutIndex = null;

function openEditModal(index) {
  const modal = document.getElementById("editShortcutModal");
  const nameInput = document.getElementById("editName");
  const urlInput = document.getElementById("editUrl");
  if (!modal || !nameInput || !urlInput) return;
  const shortcutsArr = JSON.parse(localStorage.getItem("shortcuts") || "[]");
  const sc = shortcutsArr[index];
  if (!sc) return;
  editingShortcutIndex = Number(index);
  nameInput.value = sc.name || "";
  urlInput.value = sc.url || "";
  modal.classList.remove("hidden");
  modal.setAttribute('aria-hidden','false');
  // focus and select url for quick editing
  urlInput.focus();
  urlInput.select();
}

function closeEditModal() {
  const modal = document.getElementById("editShortcutModal");
  if (modal) {
      modal.classList.add("hidden");
      modal.setAttribute("aria-hidden", "true");
  }
  editingShortcutIndex = null;
}

function setupEditModalListeners() {
    const modal = document.getElementById("editShortcutModal");
    const saveBtn = document.getElementById("saveEdit");
    const cancelBtn = document.getElementById("cancelEdit");
    if (!modal || !saveBtn || !cancelBtn) return;

    saveBtn.addEventListener("click", () => {
        if (editingShortcutIndex === null) { closeEditModal(); return; }
        if (!shortcuts[editingShortcutIndex]) { closeEditModal(); return; }

        const nameVal = document.getElementById("editName").value.trim() || shortcuts[editingShortcutIndex].name;
        let urlVal = document.getElementById("editUrl").value.trim();

        if (!urlVal) { alert("Adres URL nie może być pusty."); return; }
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
            alert("Nieprawidłowy adres URL.");
        }
    });

    cancelBtn.addEventListener("click", closeEditModal);

    // Close on click outside or Escape
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeEditModal();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modal.classList.contains("hidden")) closeEditModal();
    });
}

// Call setup once DOM is ready
document.addEventListener("DOMContentLoaded", setupEditModalListeners);


function setupDragAndDrop() {
  if (!addShortcutBtn || !shortcutsContainer) return;
  // Drag functions are already defined globally or inside this scope above,
  // but to avoid duplication we just ensure listeners are attached in the main flow.
  // The earlier code block already attached them.
}


// ====== TRYB SKUPIENIA (FOCUS MODE) LOGIC ======
function toggleFocusMode() {
    isFocusMode = !isFocusMode;
    applyFocusMode();
    localStorage.setItem("focusMode", isFocusMode);
    // Update text if language is set
    updateLanguage();
}

function applyFocusMode() {
    if (isFocusMode) {
        document.body.classList.add("focus-mode");
    } else {
        document.body.classList.remove("focus-mode");
    }
}

// Init focus mode on load
if (focusModeBtn) {
    focusModeBtn.addEventListener("click", toggleFocusMode);
}
// Apply initial state
applyFocusMode();
