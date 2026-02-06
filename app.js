////////////////////////////////////////////////////////////////////////// Variables

//////////////////////////////////////////////////////////////////////////
// UI ELEMENTS — top nav buttons
const styleBtn = document.getElementById("styleBtn");
const resBtn = document.getElementById("resBtn");
const playBtn = document.getElementById("playBtn");

const kickBtn = document.getElementById("kickBtn");
const snareBtn = document.getElementById("snareBtn");
const hatBtn = document.getElementById("hatBtn");

//////////////////////////////////////////////////////////////////////////
// GRID ELEMENTS
const kickGrid = document.getElementById("kickGrid");
const snareGrid = document.getElementById("snareGrid");
const hatGrid = document.getElementById("hatGrid");

const labelColumn = document.getElementById("labelColumn");

//////////////////////////////////////////////////////////////////////////
// APP STATE
let currentPage = "kick"; // which instrument page is visible
let currentStyle = "rand"; // user-facing style selection
let labelMode = "res"; // label rendering mode

//////////////////////////////////////////////////////////////////////////
// OVERLAY MODES (per-instrument)
let kickOverlayMode = 0;
let snareOverlayMode = 0;
let hatOverlayMode = 0;

//////////////////////////////////////////////////////////////////////////
// STYLE SYSTEM
const styles = ["rand", "lofi", "boom", "dilla", "romil", "dre"];
let styleIndex = 0; // index into styles[]

//////////////////////////////////////////////////////////////////////////
// RESOLUTION SYSTEM
const resolutions = [8, 16, 32];
let resIndex = 1; // index into resolutions[]

////////////////////////////////////////////////////////////////////////// Label Functions

// Works with labels based on resolution choice.
function updateLabels() {
  const labels = document.querySelectorAll(".labelCell");

  labels.forEach(label => {
    const row = parseInt(label.dataset.row, 10);

    if (labelMode === "res") {
      // NUMERIC MODE: 1–16
      label.textContent = String(row + 1).padStart(2, "0");
    } else {
      // HEX MODE: 0–F
      label.textContent = row.toString(16).toUpperCase();
    }
  });
}

////////////////////////////////////////////////////////////////////////// Grid Functions
function createGrid(grid, type) {
  grid.innerHTML = "";

  const ROWS = 16;
  const COLS = 5; // 1 label + 4 steps

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      // --- COLUMN 1: LABEL CELL ---
      if (col === 0) {
        const label = document.createElement("div");
        label.classList.add("labelCell");
        label.dataset.row = row;
        label.dataset.col = col;
        label.textContent = ""; // filled by updateLabels()
        grid.appendChild(label);
        continue;
      }

      // --- COLUMNS 2–5: STEP BUTTONS ---
      const btn = document.createElement("button");
      btn.classList.add("stepBtn");
      btn.dataset.state = "off";
      btn.dataset.type = type;
      btn.dataset.row = row;
      btn.dataset.col = col - 1; // 0–3 for your engines

      // 8th-note rows: 0,2,4,6,8,10,12,14
      if (row % 2 === 0) {
        btn.classList.add("eighthRow");
      }

      btn.addEventListener("click", () => {
        const state = btn.dataset.state;

        // Reset to base, then re-apply persistent structural classes
        btn.className = "stepBtn";
        if (row % 2 === 0) {
          btn.classList.add("eighthRow");
        }
        if (row === 3 || row === 7 || row === 11) {
          btn.classList.add("rowDivider");
        }

        if (state === "off") {
          btn.dataset.state = "on";
          btn.classList.add(type + "On");
        } else if (state === "on") {
          btn.dataset.state = "ghost";
          btn.classList.add(type + "Ghost");
        } else {
          btn.dataset.state = "off";
        }

        updateOverlaps();
      });

      // Bar dividers still apply visually
      if (row === 3 || row === 7 || row === 11) {
        btn.classList.add("rowDivider");
      }

      grid.appendChild(btn);
    }
  }
}

// Fill the grid with notes.
function randomizeGrid(grid, type) {
  const buttons = grid.querySelectorAll(".stepBtn");
  const actualStyle = resolveStyle(currentStyle);

  // "32" steps of resolution always available.
  const engine = engines[type][actualStyle]["32"];

  // --- Style-based thinning (hat variation lives here) ---
  const STYLE_THINNING = {
    lofi: { full: 0.6, ghost: 0.4 },
    boom: { full: 0.85, ghost: 0.6 },
    dilla: { full: 0.95, ghost: 0.55 },
    romil: { full: 0.95, ghost: 0.55 },
    dre: { full: 0.95, ghost: 0.55 },
  };

  const thin = STYLE_THINNING[currentStyle] || { full: 1, ghost: 1 };

  // --- Core probabilities ---
  const FULL_HIT_PROB = 0.8;
  const FULL_HIT_PROB_NOT = 0.6;
  const EQUAL_PROB = 0.3;
  const GHOST_PROB = 0.6;

  buttons.forEach(btn => {
    // Reset button state (but keep structural classes like eighthRow/rowDivider)
    btn.dataset.state = "off";
    btn.classList.remove(type + "On", type + "Ghost");

    const row = parseInt(btn.dataset.row, 10); // 0–15 (16th notes)

    // Map row 0–15 → engine indices 0,2,4,...,30
    const engineIndex = row * 2; // 0,2,4,...,30

    const expect = engine[engineIndex] || 0;

    // 0 → always blank
    if (expect === 0) return;

    // --- 1 → full hit expected ---
    if (expect === 1) {
      const full1 = Math.random() < FULL_HIT_PROB;
      const full2 = Math.random() < FULL_HIT_PROB;

      if ((full1 || full2) && Math.random() < thin.full) {
        btn.dataset.state = "on";
        btn.classList.add(type + "On");
        return;
      }

      if (Math.random() < FULL_HIT_PROB_NOT && Math.random() < thin.ghost) {
        btn.dataset.state = "ghost";
        btn.classList.add(type + "Ghost");
        return;
      }

      return;
    }

    // --- 1.5 → equal chance full / ghost / blank ---
    if (expect === 1.5) {
      if (Math.random() < EQUAL_PROB && Math.random() < thin.full) {
        btn.dataset.state = "on";
        btn.classList.add(type + "On");
        return;
      }

      if (Math.random() < EQUAL_PROB && Math.random() < thin.ghost) {
        btn.dataset.state = "ghost";
        btn.classList.add(type + "Ghost");
        return;
      }

      return;
    }

    // --- 0.5 → ghost expected ---
    if (expect === 0.5) {
      const blank1 = Math.random() < GHOST_PROB;
      const blank2 = Math.random() < GHOST_PROB;

      if (blank1 || blank2) return;

      if (Math.random() < thin.ghost) {
        btn.dataset.state = "ghost";
        btn.classList.add(type + "Ghost");
      }

      return;
    }
  });

  updateOverlaps();
}

////////////////////////////////////////////////////////////////////////// Utility Functions

// Shows overlaps
function getGridStates() {
  const kickBtns = document.querySelectorAll("#kickGrid .stepBtn");
  const snareBtns = document.querySelectorAll("#snareGrid .stepBtn");
  const hatBtns = document.querySelectorAll("#hatGrid .stepBtn");

  const total = kickBtns.length; // 128 steps

  const kick = [];
  const snare = [];
  const hat = [];

  for (let i = 0; i < total; i++) {
    kick[i] = kickBtns[i].dataset.state !== "off";
    snare[i] = snareBtns[i].dataset.state !== "off";
    hat[i] = hatBtns[i].dataset.state !== "off";
  }

  return { kick, snare, hat, kickBtns, snareBtns, hatBtns };
}

// Controls my overlap engine for display border colors
function updateOverlaps() {
  const { kick, snare, hat, kickBtns, snareBtns, hatBtns } = getGridStates();

  for (let i = 0; i < kick.length; i++) {
    const k = kick[i];
    const s = snare[i];
    const h = hat[i];

    // Clear borders
    kickBtns[i].style.borderTop = "";
    kickBtns[i].style.borderBottom = "";
    snareBtns[i].style.borderTop = "";
    snareBtns[i].style.borderBottom = "";
    hatBtns[i].style.borderTop = "";
    hatBtns[i].style.borderBottom = "";

    // --- KICK PAGE ---
    if (currentPage === "kick") {
      // Mode 1 → show snare presence (all snare hits)
      if (kickOverlayMode === 1 && s) {
        kickBtns[i].style.borderBottom = "2px solid green";
      }

      // Mode 2 → show hat presence (all hat hits)
      if (kickOverlayMode === 2 && h) {
        kickBtns[i].style.borderTop = "2px solid yellow";
      }

      // Mode 3 → show ONLY true conflicts:
      // kick + snare overlap
      if (kickOverlayMode === 3 && k && s) {
        kickBtns[i].style.borderBottom = "2px solid green";
      }

      // kick + hat overlap
      if (kickOverlayMode === 3 && k && h) {
        kickBtns[i].style.borderTop = "2px solid yellow";
      }
    }

    // --- SNARE PAGE ---
    if (currentPage === "snare") {
      // Mode 1 → show kick presence (all kick hits)
      if (snareOverlayMode === 1 && k) {
        snareBtns[i].style.borderBottom = "2px solid red";
      }

      // Mode 2 → show hat presence (all hat hits)
      if (snareOverlayMode === 2 && h) {
        snareBtns[i].style.borderTop = "2px solid yellow";
      }

      // Mode 3 → show ONLY true conflicts:
      // snare + kick overlap
      if (snareOverlayMode === 3 && k && s) {
        snareBtns[i].style.borderBottom = "2px solid red";
      }

      // snare + hat overlap
      if (snareOverlayMode === 3 && h && s) {
        snareBtns[i].style.borderTop = "2px solid yellow";
      }
    }

    // --- HAT PAGE ---
    if (currentPage === "hat") {
      // Mode 1 → show kick presence (all kick hits)
      if (hatOverlayMode === 1 && k) {
        hatBtns[i].style.borderBottom = "2px solid red";
      }

      // Mode 2 → show snare presence (all snare hits)
      if (hatOverlayMode === 2 && s) {
        hatBtns[i].style.borderTop = "2px solid green";
      }

      // Mode 3 → show ONLY true conflicts:
      // hat + snare overlap
      if (hatOverlayMode === 3 && h && s) {
        hatBtns[i].style.borderTop = "2px solid green";
      }

      // hat + kick overlap
      if (hatOverlayMode === 3 && h && k) {
        hatBtns[i].style.borderBottom = "2px solid red";
      }
    }
  }
}

////////////////////////////////////////////////////////////////////////// Style Functions

// Works with style button. Picks a random style if random is the selection.
function resolveStyle(style) {
  if (style !== "rand") return style;

  // filter out "rand" so it never picks itself
  const realStyles = styles.filter(s => s !== "rand");

  const idx = Math.floor(Math.random() * realStyles.length);
  return realStyles[idx];
}

// Works with style button.
function cycleStyle() {
  styleIndex = (styleIndex + 1) % styles.length;
  currentStyle = styles[styleIndex];
  styleBtn.textContent = currentStyle;
}

////////////////////////////////////////////////////////////////////////// Page Functions

// Works with page buttons and navigation bar.
function switchPage(page) {
  currentPage = page;
  kickGrid.classList.add("hidden");
  snareGrid.classList.add("hidden");
  hatGrid.classList.add("hidden");

  kickBtn.classList.remove("active");
  snareBtn.classList.remove("active");
  hatBtn.classList.remove("active");

  if (page === "kick") {
    kickGrid.classList.remove("hidden");
    kickBtn.classList.add("active");
  }
  if (page === "snare") {
    snareGrid.classList.remove("hidden");
    snareBtn.classList.add("active");
  }
  if (page === "hat") {
    hatGrid.classList.remove("hidden");
    hatBtn.classList.add("active");
  }
  kickOverlayMode = 0;
  snareOverlayMode = 0;
  hatOverlayMode = 0;
  updateOverlaps();
}

////////////////////////////////////////////////////////////////////////// Buttons
kickBtn.addEventListener("click", () => {
  if (currentPage === "kick") {
    kickOverlayMode = (kickOverlayMode + 1) % 4;
  } else {
    switchPage("kick");
    kickOverlayMode = 0;
  }
  updateOverlaps();
});

snareBtn.addEventListener("click", () => {
  if (currentPage === "snare") {
    snareOverlayMode = (snareOverlayMode + 1) % 4;
  } else {
    switchPage("snare");
    snareOverlayMode = 0;
  }
  updateOverlaps();
});

hatBtn.addEventListener("click", () => {
  if (currentPage === "hat") {
    hatOverlayMode = (hatOverlayMode + 1) % 4;
  } else {
    switchPage("hat");
    hatOverlayMode = 0;
  }
  updateOverlaps();
});

styleBtn.addEventListener("click", cycleStyle);

playBtn.addEventListener("click", () => {
  if (currentPage === "kick") randomizeGrid(kickGrid, "kick");
  if (currentPage === "snare") randomizeGrid(snareGrid, "snare");
  if (currentPage === "hat") randomizeGrid(hatGrid, "hat");
});

createGrid(kickGrid, "kick");
createGrid(snareGrid, "snare");
createGrid(hatGrid, "hat");

switchPage("kick");
updateLabels();

document.addEventListener("click", e => {
  if (!e.target.classList.contains("labelCell")) return;

  labelMode = labelMode === "res" ? "hex" : "res";
  updateLabels();
});
