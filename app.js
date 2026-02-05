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
let currentStyle = "lofi";
let currentRes = 16;
let labelMode = "res";

let kickOverlayMode = 0;
let snareOverlayMode = 0;
let hatOverlayMode = 0;

const styles = ["lofi", "boom", "dilla"];
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

    if (labelMode === "res") {
      if (currentRes === 32) div.textContent = String(i).padStart(2, "0");
      if (currentRes === 16 && i % 2 === 1) div.textContent = String((i + 1) / 2).padStart(2, "0");
      if (currentRes === 8 && (i - 1) % 4 === 0) div.textContent = String((i + 3) / 4).padStart(2, "0");
    } else {
      const hex = ((i - 1) % 16).toString(16).toUpperCase();
      div.textContent = hex;
    }

    if (i === 8 || i === 16 || i === 24) div.classList.add("rowDivider");
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
// prettier-ignore
const engines = {
  kick: {
    lofi: {
      32: [
        // ---- Beat 1 (steps 0–7) ----
        1,0,0,0, 0,0,0,0,
        // Lofi almost always starts with a kick on 1
        // No syncopation, no chatter

        // ---- Beat 2 (steps 8–15) ----
        0,0,0,0, 0,0,0,0,
        // Lofi rarely places a kick on beat 2

        // ---- Beat 3 (steps 16–23) ----
        1.5,0,0,0, 0,0,0,0,
        // Beat 3 is the “optional” lofi kick
        // 1.5 = could be full, ghost, or blank → perfect for lofi looseness

        // ---- Beat 4 (steps 24–31) ----
        0,0,0,0, 0,0,0,0
        // Lofi almost never hits on 4
      ],
      16: [],
      8: [],
    },
    boom: {
      32: [
        // ---- Beat 1 (steps 0–7) ----
        1, 0.5, 1.5, 0.5,   // 0–3: strong 1, syncopation on the "e"
        1.5, 0.5, 1.5, 0.5, // 4–7: classic boom-bap 16th-note kick grid

        // ---- Beat 2 (steps 8–15) ----
        0, 0.5, 1.5, 0.5,   // 8–11: avoid kick on 9 (step 8), syncopation after
        1.5, 0.5, 1.5, 0.5, // 12–15: busy but pocketed

        // ---- Beat 3 (steps 16–23) ----
        1, 0.5, 1.5, 0.5,   // 16–19: strong kick on beat 3
        1.5, 0.5, 1.5, 0.5, // 20–23: syncopation grid

        // ---- Beat 4 (steps 24–31) ----
        0, 0.5, 1.5, 0.5,   // 24–27: avoid kick on 25 (step 24)
        1.5, 0.5, 1.5, 0.5  // 28–31: end-of-bar syncopation
      ],
      16: [],
      8: [],
    },
    dilla: {
      32: [
        // ---- Beat 1 (steps 0–7) ----
        1, 0.5, 0.5, 0.5,   // 0–3: strong 1, but everything after is loose
        0.5, 0.5, 0.5, 0.5, // 4–7: Dilla’s “drunken” early-bar kicks

        // ---- Beat 2 (steps 8–15) ----
        0, 0.5, 0.5, 0.5,   // 8–11: often NO kick on 9, but lots of ghost options
        0.5, 0.5, 0.5, 0.5, // 12–15: Dilla’s mid-bar swing zone

        // ---- Beat 3 (steps 16–23) ----
        1, 0.5, 1, 0.5,     // 16–19: displaced kicks, sometimes doubled
        0.5, 0.5, 0.5, 0.5, // 20–23: ghost-heavy lead-in

        // ---- Beat 4 (steps 24–31) ----
        0.5, 0.5, 0.5, 0.5, // 24–27: Dilla often avoids a strong 4
        1, 0.5, 0.5, 0.5    // 28–31: late-bar anchor kick
      ],
      16: [],
      8: [],
    },
    romil: {
      32: [
        // ---- Beat 1 (steps 0–7) ----
        1, 0, 0, 0,      // 0–3: strong downbeat
        0, 0.5, 0, 0,    // 4–7: ghost-only pickup after the upbeat (NEVER a full kick)

        // ---- Beat 2 (steps 8–15) ----
        0, 0, 1, 0,      // 8–11: real syncopated kick on step 10
        0, 0, 0, 0,      // 12–15: leave space (Romil does this a lot)

        // ---- Beat 3 (steps 16–23) ----
        0.5, 0, 0, 0,    // 16–19: ghost-only early pickup (never a full kick)
        0, 1, 0, 0,      // 20–23: real upbeat kick on step 20

        // ---- Beat 4 (steps 24–31) ----
        0, 0, 1, 0,      // 24–27: real late-bar kick on step 26
        0, 0, 0, 0       // 28–31: clean tail
      ],
      16: [],
      8: [],
    },
    westcoast: {
      32: [
        // ---- Beat 1 (steps 0–7) ----
        1, 0, 0, 0,      // 0–3: strong downbeat
        1, 0, 0, 0,      // 4–7: upbeat 8th on step 4 (classic bounce)

        // ---- Beat 2 (steps 8–15) ----
        0, 0, 1, 0,      // 8–11: mid‑bar kick on the “&” of 2 (step 10)
        0, 0, 0, 0,      // 12–15: leave space for snare + bass

        // ---- Beat 3 (steps 16–23) ----
        1, 0, 0, 0,      // 16–19: downbeat of beat 3
        1, 0, 0, 0,      // 20–23: upbeat 8th on step 20

        // ---- Beat 4 (steps 24–31) ----
        0, 0, 1, 0,      // 24–27: syncopated kick on step 26
        0, 0, 0, 0       // 28–31: clean tail
      ],
      16: [],
      8: [],
    },
  },

  snare: {
    lofi: {
      32: [
        // ---- Beat 1 (steps 0–7) ----
        0,0,0,0, 0,0,0,0, 
        // Lofi NEVER hits on beat 1, no ghosts either

        // ---- Beat 2 (steps 8–15) ----
        1,0,0,0, 0,0,0,0,
        // Strong backbeat on 8, no chatter before or after

        // ---- Beat 3 (steps 16–23) ----
        0,0,0,0, 0,0,0,0,
        // Lofi NEVER hits on beat 3

        // ---- Beat 4 (steps 24–31) ----
        1,0,0,0, 0,0,0,0
        // Strong backbeat on 24, no chatter
      ],
      16: [],
      8: [],
    },
    boom: {
      32: [
        // ---- Beat 1 (steps 0–7) ----
        0, 0, 0, 0,     // 0–3: NEVER ghost here (between kicks)
        0, 0, 0.5, 0.5, // 4–7: lead-in ghosts into snare on 8

        // ---- Beat 2 (steps 8–15) ----
        1, 0.5, 0, 0,   // 8–11: snare on 8, optional ghost after
        0, 0, 0, 0,     // 12–15: usually blank

        // ---- Beat 3 (steps 16–23) ----
        0, 0, 0, 0,     // 16–19: no ghosts here
        0, 0, 0.5, 0.5, // 20–23: lead-in ghosts into snare on 24

        // ---- Beat 4 (steps 24–31) ----
        1, 0.5, 0, 0,   // 24–27: snare on 24, optional ghost after
        0, 0, 0, 0      // 28–31: usually blank
      ],
      16: [],
      8: [],
    },
    dilla: {
      32: [
        // ---- Beat 1 (steps 0–7) ----
        0, 0.5, 0.5, 0.5,   // 0–3: Dilla allows early ghosts (lazy, dragged feel)
        0.5, 0.5, 0.5, 0.5, // 4–7: more ghost chatter leading into 8

        // ---- Beat 2 (steps 8–15) ----
        1, 0.5, 0.5, 0.5,   // 8–11: snare on 8, but often LATE → ghost cluster after
        1, 0.5, 0.5, 0.5,   // 12–15: Dilla sometimes doubles the backbeat feel

        // ---- Beat 3 (steps 16–23) ----
        0, 0.5, 0.5, 0.5,   // 16–19: ghosty lead-in to 24
        0.5, 0.5, 0.5, 0.5, // 20–23: heavy ghost zone before snare on 24

        // ---- Beat 4 (steps 24–31) ----
        1, 0.5, 0.5, 0.5,   // 24–27: snare on 24, again often LATE
        1, 0.5, 0.5, 0.5    // 28–31: Dilla sometimes drags into the next bar
      ],
      16: [],
      8: [],
    },
    romil: {
      32: [
        // ---- Beat 1 (steps 0–7) ----
        0, 0, 0, 0,      // 0–3: no early snares
        1, 0, 0, 0,      // 4–7: snare on beat 2 (clean, modern)

        // ---- Beat 2 (steps 8–15) ----
        0, 0, 0, 0,      // 8–11: space for melodic kicks
        0, 0, 1, 0,      // 12–15: snare on beat 4

        // ---- Beat 3 (steps 16–23) ----
        0, 0, 0, 0,      // 16–19: repeat structure for consistency
        1, 0, 0, 0,      // 20–23: snare on beat 2 (bar 2 feel)

        // ---- Beat 4 (steps 24–31) ----
        0, 0, 0, 0,      // 24–27: space before final snare
        0, 1.5, 1, 0     // 28–31: ghost → flam → snare on beat 4
      ],
      16: [],
      8: [],
    },
    westcoast: {
      32: [
        // ---- Beat 1 (steps 0–7) ----
        0, 0, 0, 0,      // 0–3: no early snare
        1, 0, 0, 0,      // 4–7: snare on beat 2 (tight, bright)

        // ---- Beat 2 (steps 8–15) ----
        0, 0, 0, 0,      // 8–11: clean pocket
        0, 0, 1, 0,      // 12–15: snare on beat 4

        // ---- Beat 3 (steps 16–23) ----
        0, 0, 0, 0,      // 16–19: repeat structure
        1, 0, 0, 0,      // 20–23: snare on beat 2 (bar 2 feel)

        // ---- Beat 4 (steps 24–31) ----
        0, 0, 0, 0,      // 24–27: no ghosting (West Coast stays clean)
        0, 0, 1, 0       // 28–31: snare on beat 4, no flam
      ],
      16: [],
      8: [],
    },
  },
  hat: {
    lofi: {
      32: [
        // 8th-note lazy hats: hits on 0,4,8,12,16,20,24,28
        0.5,0,0,0, 0.5,0,0,0,
        0.5,0,0,0, 0.5,0,0,0,
        0.5,0,0,0, 0.5,0,0,0,
        0.5,0,0,0, 0.5,0,0,0
      ],
      16: [],
      8: [],
    },
    boom: {
      32: [
        // 16th-note hats: hits on every even step (0,2,4,...,30)
        1,0, 1,0, 1,0, 1,0,
        1,0, 1,0, 1,0, 1,0,
        1,0, 1,0, 1,0, 1,0,
        1,0, 1,0, 1,0, 1,0
      ],
      16: [],
      8: [],
    },
    dilla: {
      32: [
        // 16th hats with 32nd ghost flavor:
        // full on evens, ghost-eligible on odds → drunken, busy, but still gridded
        1,0.5, 1,0.5, 1,0.5, 1,0.5,
        1,0.5, 1,0.5, 1,0.5, 1,0.5,
        1,0.5, 1,0.5, 1,0.5, 1,0.5,
        1,0.5, 1,0.5, 1,0.5, 1,0.5
      ],
      16: [],
      8: [],
    },
    romil: {
      32: [
        // ---- Beat 1 (steps 0–7) ----
        1, 0, 1, 0.5,    // 0–3: clean 16ths w/ ghost option
        1, 0, 1.5, 0,    // 4–7: modern roll potential

        // ---- Beat 2 (steps 8–15) ----
        1, 0, 1, 0.5,    // 8–11: consistent but not rigid
        1, 0, 1.5, 0,    // 12–15: tasteful 32nd ghost

        // ---- Beat 3 (steps 16–23) ----
        1, 0, 1, 0.5,    // 16–19: repeat the groove
        1, 0, 1.5, 0,    // 20–23: subtle variation

        // ---- Beat 4 (steps 24–31) ----
        1, 0, 1, 0.5,    // 24–27: keep the modern feel
        1, 0, 1.5, 0     // 28–31: final ghost option
      ],
      16: [],
      8: [],
    },
    westcoast: {
      32: [
        // ---- Beat 1 (steps 0–7) ----
        1, 0, 1, 0,      // 0–3: straight 16ths, no ghosts
        1, 0, 1, 0,      // 4–7: classic Dre-style tight hats

        // ---- Beat 2 (steps 8–15) ----
        1, 0, 1, 0,      // 8–11: keep it clean
        1, 0, 1, 0,      // 12–15: no rolls, no stutters

        // ---- Beat 3 (steps 16–23) ----
        1, 0, 1, 0,      // 16–19: repeat the groove
        1, 0, 1, 0,      // 20–23: consistent 16ths

        // ---- Beat 4 (steps 24–31) ----
        1, 0, 1, 0,      // 24–27: keep the pocket tight
        1, 0, 1, 0       // 28–31: no ghosting, no variation
      ],
      16: [],
      8: [],
    },
  },

}

// Derive 16th and 8th resolution maps from 32nd maps
function deriveResolutionMaps() {
  for (const instrument in engines) {
    for (const style in engines[instrument]) {
      const base32 = engines[instrument][style]["32"];

      // 8th notes: keep only steps 0, 8, 16, 24
      const map8 = base32.map((v, i) => (i % 8 === 0 ? v : 0));

      // 16th notes: keep only steps 0, 2, 4, 6, ...
      const map16 = base32.map((v, i) => {
        if (i % 2 !== 0) return 0; // only even indices survive

        // preserve 1, 0.5, and 1.5
        if (v === 1 || v === 0.5 || v === 1.5) return v;

        return 0;
      });

      engines[instrument][style]["16"] = map16;
      engines[instrument][style]["8"] = map8;
    }
  }
}

deriveResolutionMaps();

function randomizeGrid(grid, type) {
  const buttons = grid.querySelectorAll(".stepBtn");
  const engine = engines[type][currentStyle][String(currentRes)];

  // --- Style-based thinning (hat variation lives here) ---
  const STYLE_THINNING = {
    lofi: { full: 0.6, ghost: 0.4 },
    boom: { full: 0.85, ghost: 0.6 },
    dilla: { full: 0.95, ghost: 0.55 },
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
