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
      });

      if (row === 8 || row === 16 || row === 24) btn.classList.add("rowDivider");
      grid.appendChild(btn);
    }
  }
}

// Engines for each instrument, style, and resolution

const engines = {
  kick: {
    lofi: {
      32: [0.8, 0, 0, 0, 0.6, 0, 0, 0, 0.7, 0, 0, 0, 0.5, 0, 0, 0, 0.9, 0, 0, 0, 0.6, 0, 0, 0, 0.7, 0, 0, 0, 0.5, 0, 0, 0],
      16: [], // will be derived
      8: [], // will be derived
    },
    boom: {
      32: [0.9, 0, 0, 0, 0.7, 0, 0, 0, 0.8, 0, 0, 0, 0.6, 0, 0, 0, 1.0, 0, 0, 0, 0.7, 0, 0, 0, 0.8, 0, 0, 0, 0.6, 0, 0, 0],
      16: [],
      8: [],
    },
    dilla: {
      32: [0.7, 0, 0.3, 0, 0.5, 0, 0.2, 0, 0.6, 0, 0.4, 0, 0.5, 0, 0.3, 0, 0.8, 0, 0.5, 0, 0.6, 0, 0.4, 0, 0.7, 0, 0.5, 0, 0.6, 0, 0.4, 0],
      16: [],
      8: [],
    },
  },
  snare: {
    lofi: {
      32: [0, 0, 0, 0, 0, 0, 0, 0, 0.9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.9, 0, 0, 0, 0, 0, 0, 0],
      16: [],
      8: [],
    },
    boom: {
      32: [0, 0, 0, 0, 0.8, 0, 0, 0, 0, 0.7, 0, 0, 0, 0.9, 0, 0, 0, 0.6, 0, 0, 0, 1.0, 0, 0, 0, 0, 0.8, 0, 0, 0, 0, 0.9],
      16: [],
      8: [],
    },
    dilla: {
      32: [0, 0, 0, 0.3, 0.5, 0, 0, 0.4, 0.6, 0, 0, 0.5, 0.7, 0, 0, 0.3, 0.5, 0, 0, 0.6, 0.8, 0, 0, 0.7, 0.9, 0, 0, 0.8, 1.0, 0, 0, 0.9],
      16: [],
      8: [],
    },
  },
  hat: {
    lofi: {
      32: [0.5, 0.3, 0.4, 0.2, 0.6, 0.4, 0.5, 0.3, 0.7, 0.5, 0.6, 0.4, 0.8, 0.6, 0.7, 0.5, 0.6, 0.4, 0.5, 0.3, 0.7, 0.5, 0.6, 0.4, 0.8, 0.6, 0.7, 0.5, 0.9, 0.7, 0.8, 0.6],
      16: [],
      8: [],
    },
    boom: {
      32: [0.6, 0.4, 0.5, 0.3, 0.7, 0.5, 0.6, 0.4, 0.8, 0.6, 0.7, 0.5, 0.9, 0.7, 0.8, 0.6, 0.7, 0.5, 0.6, 0.4, 0.8, 0.6, 0.7, 0.5, 0.9, 0.7, 0.8, 0.6, 1.0, 0.8, 0.9, 0.7],
      16: [],
      8: [],
    },
    dilla: {
      32: [0.7, 0.5, 0.6, 0.4, 0.8, 0.6, 0.7, 0.5, 0.9, 0.7, 0.8, 0.6, 1.0, 0.8, 0.9, 0.7, 0.8, 0.6, 0.7, 0.5, 0.9, 0.7, 0.8, 0.6, 1.0, 0.8, 0.9, 0.7, 1.0, 0.8, 0.9, 0.7],
      16: [],
      8: [],
    },
  },
};

// Derive 16th and 8th resolution maps from 32nd maps
function deriveResolutionMaps() {
  for (const instrument in engines) {
    for (const style in engines[instrument]) {
      const base32 = engines[instrument][style]["32"];
      // 16th: keep odd steps from 32nd, zero others
      const map16 = base32.map((prob, i) => (i % 2 === 0 ? prob : 0));
      // 8th: keep every 4th step starting at 0, zero others
      const map8 = base32.map((prob, i) => (i % 4 === 0 ? prob : 0));
      engines[instrument][style]["16"] = map16;
      engines[instrument][style]["8"] = map8;
    }
  }
}

deriveResolutionMaps();

// Updated randomizeGrid to use engine probabilities with corrected snare step alignment
function randomizeGrid(grid, type) {
  const buttons = grid.querySelectorAll(".stepBtn");
  const engine = engines[type][currentStyle][String(currentRes)];

  buttons.forEach((btn, idx) => {
    btn.dataset.state = "off";
    btn.className = "stepBtn";

    // Calculate column and row within 4x32 grid
    const col = idx % 4; // 0 to 3
    const row = Math.floor(idx / 4); // 0 to 31

    // Calculate step index in 128-step sequence (4 bars of 32 steps)
    const stepIndex = row + col * 32; // 0 to 127

    // Use the 32-step engine probability repeated for each bar
    const stepInBar = stepIndex % 32;
    const prob = engine[stepInBar] || 0;
    if (prob === 0) return; // skip inactive steps

    const r = Math.random();
    if (r < prob * 0.2) {
      btn.dataset.state = "on";
      btn.classList.add(type + "On");
    } else if (r < prob * 0.35) {
      btn.dataset.state = "ghost";
      btn.classList.add(type + "Ghost");
    }
  });
}

kickBtn.addEventListener("click", () => switchPage("kick"));
snareBtn.addEventListener("click", () => switchPage("snare"));
hatBtn.addEventListener("click", () => switchPage("hat"));

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
