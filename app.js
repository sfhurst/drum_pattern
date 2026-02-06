const styleBtn = document.getElementById("styleBtn");
const resBtn = document.getElementById("resBtn");
const playBtn = document.getElementById("playBtn");

const kickBtn = document.getElementById("kickBtn");
const snareBtn = document.getElementById("snareBtn");
const hatBtn = document.getElementById("hatBtn");

const kickGrid = document.getElementById("kickGrid");
const snareGrid = document.getElementById("snareGrid");
const hatGrid = document.getElementById("hatGrid");

const labelColumn = document.getElementById("labelColumn");

let currentPage = "kick";
let currentStyle = "rand";
let currentRes = 16;
let labelMode = "res";

let kickOverlayMode = 0;
let snareOverlayMode = 0;
let hatOverlayMode = 0;

const styles = ["rand", "lofi", "boom", "dilla", "romil", "dre"];

function resolveStyle(style) {
  if (style !== "rand") return style;

  // filter out "rand" so it never picks itself
  const realStyles = styles.filter(s => s !== "rand");

  const idx = Math.floor(Math.random() * realStyles.length);
  return realStyles[idx];
}

let styleIndex = 0;

const resolutions = [8, 16, 32];
let resIndex = 1;

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

function cycleStyle() {
  styleIndex = (styleIndex + 1) % styles.length;
  currentStyle = styles[styleIndex];
  styleBtn.textContent = currentStyle;
}

function cycleResolution() {
  resIndex = (resIndex + 1) % resolutions.length;
  currentRes = resolutions[resIndex];
  resBtn.textContent = currentRes;
  updateLabels();
}

function updateLabels() {
  labelColumn.innerHTML = "";

  for (let i = 1; i <= 32; i++) {
    const div = document.createElement("div");
    div.style.height = "18px";

    const rowIndex = i - 1; // 0–31

    if (labelMode === "res") {
      // NUMERIC MODE
      if (currentRes === 32) {
        div.textContent = String(i).padStart(2, "0");
      } else if (currentRes === 16) {
        // Active rows: 0,2,4,...30
        if (rowIndex % 2 === 0) {
          const step16 = rowIndex / 2; // 0–15
          div.textContent = String(step16).padStart(2, "0");
        }
      } else if (currentRes === 8) {
        // Active rows: 0,4,8,...28
        if (rowIndex % 4 === 0) {
          const step8 = rowIndex / 4; // 0–7
          div.textContent = String(step8).padStart(2, "0");
        }
      }
    } else {
      // HEX MODE
      if (currentRes === 32) {
        // 0–1F
        div.textContent = rowIndex.toString(16).toUpperCase().padStart(2, "0");
      } else if (currentRes === 16) {
        // Active rows: 0,2,4,...30 → hex 0–F
        if (rowIndex % 2 === 0) {
          const step16 = rowIndex / 2; // 0–15
          div.textContent = step16.toString(16).toUpperCase();
        }
      } else if (currentRes === 8) {
        // Active rows: 0,4,8,...28 → hex 0–7
        if (rowIndex % 4 === 0) {
          const step8 = rowIndex / 4; // 0–7
          div.textContent = step8.toString(16).toUpperCase();
        }
      }
    }

    // Bar dividers stay the same
    if (i === 8 || i === 16 || i === 24) {
      div.classList.add("rowDivider");
    }

    labelColumn.appendChild(div);
  }
}

function createGrid(grid, type) {
  grid.innerHTML = "";
  for (let row = 1; row <= 32; row++) {
    for (let col = 1; col <= 4; col++) {
      const btn = document.createElement("button");
      btn.classList.add("stepBtn");
      btn.dataset.state = "off";
      btn.dataset.type = type;

      btn.addEventListener("click", () => {
        const state = btn.dataset.state;
        btn.className = "stepBtn";

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

      if (row === 8 || row === 16 || row === 24) btn.classList.add("rowDivider");
      grid.appendChild(btn);
    }
  }
}

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

// Engines for each instrument, style, and resolution
//////// Sent to engines.js

function randomizeGrid(grid, type) {
  const buttons = grid.querySelectorAll(".stepBtn");
  const actualStyle = resolveStyle(currentStyle);
  const engine = engines[type][actualStyle][String(currentRes)];

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

  buttons.forEach((btn, idx) => {
    btn.dataset.state = "off";
    btn.classList.remove(type + "On", type + "Ghost");
    btn.classList.add("stepBtn");

    const col = idx % 4;
    const row = Math.floor(idx / 4);
    const stepIndex = row + col * 32;
    const stepInBar = stepIndex % 32;

    const expect = engine[stepInBar] || 0;

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
resBtn.addEventListener("click", cycleResolution);

labelColumn.addEventListener("click", () => {
  labelMode = labelMode === "res" ? "hex" : "res";
  updateLabels();
});

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
