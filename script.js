// ==================== 게임 상태 ====================
const state = {
  coins: 0,
  totalMined: 0,
  clickPower: 1,
  cps: 0,
  autoClickPower: 0, // 초당 자동 클릭으로 얻는 양
  combo: 0,
  maxCombo: 0,
  totalClicks: 0,
  playTime: 0,
  lastClickTime: 0,
};

// 업그레이드 정의 (오토 봇 추가)
const upgrades = [
  {
    id: "autobot",
    name: "오토 마이너 봇",
    desc: "초당 자동으로 코인 1회 채굴",
    icon: "🤖",
    baseCost: 30,
    costMult: 1.45,
    level: 0,
    effect: () => updateAutoClick(),
    getEffectText: (lvl) => `초당 자동클릭 ${lvl}회`,
  },
  {
    id: "pickaxe",
    name: "양자 곡괭이",
    desc: "클릭당 코인 +1",
    icon: "⛏️",
    baseCost: 100,
    costMult: 1.5,
    level: 0,
    effect: (lvl) => { state.clickPower = 1 + lvl; },
    getEffectText: (lvl) => `클릭당 ${1 + lvl} 코인`,
  },
  {
    id: "droid",
    name: "채굴 드론",
    desc: "초당 코인 +0.6",
    icon: "🛸",
    baseCost: 350,
    costMult: 1.4,
    level: 0,
    effect: () => updateCPS(),
    getEffectText: (lvl) => `초당 +${(lvl * 0.6).toFixed(1)}`,
  },
  {
    id: "miner",
    name: "AI 광부",
    desc: "초당 코인 +3.5",
    icon: "👷",
    baseCost: 1200,
    costMult: 1.42,
    level: 0,
    effect: () => updateCPS(),
    getEffectText: (lvl) => `초당 +${(lvl * 3.5).toFixed(1)}`,
  },
  {
    id: "laser",
    name: "플라즈마 레이저",
    desc: "초당 코인 +18",
    icon: "⚡",
    baseCost: 6500,
    costMult: 1.48,
    level: 0,
    effect: () => updateCPS(),
    getEffectText: (lvl) => `초당 +${lvl * 18}`,
  },
  {
    id: "factory",
    name: "메가 채굴 공장",
    desc: "초당 코인 +90",
    icon: "🏭",
    baseCost: 30000,
    costMult: 1.52,
    level: 0,
    effect: () => updateCPS(),
    getEffectText: (lvl) => `초당 +${lvl * 90}`,
  },
  {
    id: "quantum",
    name: "코어 증폭기",
    desc: "모든 수익 x1.6",
    icon: "🌌",
    baseCost: 100000,
    costMult: 2.1,
    level: 0,
    maxLevel: 6,
    effect: () => updateCPS(),
    getEffectText: (lvl) => `전체 x${(1.6 ** lvl).toFixed(2)}`,
  },
];

// ==================== Three.js 3D 컴퓨터 채굴기 설정 ====================
let scene, camera, renderer, rigGroup, fanMesh1, fanMesh2, ledLight;
let targetScale = 1;

function init3D() {
  const container = document.getElementById("canvasContainer");
  
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.set(0, 1, 5.5);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(260, 260);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);

  const pointLight = new THREE.PointLight(0xfbbf24, 2, 10);
  pointLight.position.set(0, 0, 2);
  scene.add(pointLight);

  rigGroup = new THREE.Group();
  scene.add(rigGroup);

  const caseGeo = new THREE.BoxGeometry(2.4, 1.6, 1.2);
  const caseMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.9,
    roughness: 0.3
  });
  const serverCase = new THREE.Mesh(caseGeo, caseMat);
  rigGroup.add(serverCase);

  const gpuGeo = new THREE.BoxGeometry(2.0, 0.3, 0.9);
  const gpuMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0x0284c7,
    emissiveIntensity: 0.3
  });
  
  const gpu1 = new THREE.Mesh(gpuGeo, gpuMat);
  gpu1.position.set(0, 0.3, 0);
  rigGroup.add(gpu1);

  const gpu2 = new THREE.Mesh(gpuGeo, gpuMat);
  gpu2.position.set(0, -0.3, 0);
  rigGroup.add(gpu2);

  const fanGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 16);
  const fanMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    metalness: 0.5,
    roughness: 0.1,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.5
  });

  fanMesh1 = new THREE.Mesh(fanGeo, fanMat);
  fanMesh1.rotation.x = Math.PI / 2;
  fanMesh1.position.set(-0.7, 0.3, 0.5);
  rigGroup.add(fanMesh1);

  fanMesh2 = new THREE.Mesh(fanGeo, fanMat);
  fanMesh2.rotation.x = Math.PI / 2;
  fanMesh2.position.set(0.7, 0.3, 0.5);
  rigGroup.add(fanMesh2);

  const ledGeo = new THREE.SphereGeometry(0.08, 16, 16);
  const ledMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
  ledLight = new THREE.Mesh(ledGeo, ledMat);
  ledLight.position.set(1.0, 0.6, 0.61);
  rigGroup.add(ledLight);

  rigGroup.rotation.x = 0.3;
  rigGroup.rotation.y = 0.5;

  animate3D();
}

function animate3D() {
  requestAnimationFrame(animate3D);

  if (rigGroup) {
    rigGroup.rotation.y += 0.01;

    if (fanMesh1 && fanMesh2) {
      fanMesh1.rotation.y += 0.2 + (state.autoClickPower * 0.05);
      fanMesh2.rotation.y += 0.2 + (state.autoClickPower * 0.05);
    }

    rigGroup.scale.x += (targetScale - rigGroup.scale.x) * 0.2;
    rigGroup.scale.y += (targetScale - rigGroup.scale.y) * 0.2;
    rigGroup.scale.z += (targetScale - rigGroup.scale.z) * 0.2;
    targetScale += (1 - targetScale) * 0.1;
  }

  renderer.render(scene, camera);
}

// ==================== 유틸 및 게임 로직 ====================
function formatNumber(num) {
  if (num < 1000) return Math.floor(num).toString();
  if (num < 1_000_000) return (num / 1000).toFixed(1) + "K";
  if (num < 1_000_000_000) return (num / 1_000_000).toFixed(2) + "M";
  if (num < 1_000_000_000_000) return (num / 1_000_000_000).toFixed(2) + "B";
  return (num / 1_000_000_000_000).toFixed(2) + "T";
}

function getCost(upgrade) {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, upgrade.level));
}

function getMultiplier() {
  const multUpg = upgrades.find(u => u.id === "quantum");
  return Math.pow(1.6, multUpg.level);
}

function updateCPS() {
  let base = 0;
  base += upgrades.find(u => u.id === "droid").level * 0.6;
  base += upgrades.find(u => u.id === "miner").level * 3.5;
  base += upgrades.find(u => u.id === "laser").level * 18;
  base += upgrades.find(u => u.id === "factory").level * 90;
  state.cps = base * getMultiplier();
}

function updateAutoClick() {
  const autobotUpg = upgrades.find(u => u.id === "autobot");
  state.autoClickPower = autobotUpg ? autobotUpg.level : 0;
}

// ==================== 저장 / 불러오기 ====================
function save() {
  const data = {
    coins: state.coins,
    totalMined: state.totalMined,
    totalClicks: state.totalClicks,
    maxCombo: state.maxCombo,
    playTime: state.playTime,
    upgrades: upgrades.map(u => ({ id: u.id, level: u.level })),
  };
  localStorage.setItem("pcRigMinerSaveAuto", JSON.stringify(data));
}

function load() {
  const raw = localStorage.getItem("pcRigMinerSaveAuto");
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    state.coins = data.coins || 0;
    state.totalMined = data.totalMined || 0;
    state.totalClicks = data.totalClicks || 0;
    state.maxCombo = data.maxCombo || 0;
    state.playTime = data.playTime || 0;
    if (data.upgrades) {
      data.upgrades.forEach(saved => {
        const upg = upgrades.find(u => u.id === saved.id);
        if (upg) {
          upg.level = saved.level || 0;
          if (upg.effect) upg.effect(upg.level);
        }
      });
    }
    updateCPS();
    updateAutoClick();
  } catch (e) {
    console.warn("세이브 로드 실패", e);
  }
}

// ==================== UI 업데이트 ====================
const coinCountEl = document.getElementById("coinCount");
const cpsEl = document.getElementById("cps");
const cpcEl = document.getElementById("cpc");
const upgradeListEl = document.getElementById("upgradeList");
const toastEl = document.getElementById("toast");
const comboBadgeEl = document.getElementById("comboBadge");
const comboCountEl = document.getElementById("comboCount");

function updateUI() {
  coinCountEl.textContent = formatNumber(state.coins);
  cpsEl.textContent = formatNumber(state.cps + (state.autoClickPower * state.clickPower * getMultiplier()));
  cpcEl.textContent = formatNumber(state.clickPower * getMultiplier());

  if (state.combo > 1) {
    comboBadgeEl.classList.remove("hidden");
    comboCountEl.textContent = state.combo;
  } else {
    comboBadgeEl.classList.add("hidden");
  }

  document.querySelectorAll(".upgrade-card").forEach((card, i) => {
    const upg = upgrades[i];
    const cost = getCost(upg);
    const btn = card.querySelector(".upgrade-buy");
    const levelEl = card.querySelector(".upgrade-level");
    const descEl = card.querySelector(".upgrade-desc");

    levelEl.textContent = `레벨 ${upg.level}`;
    descEl.textContent = upg.getEffectText(upg.level);

    if (upg.maxLevel && upg.level >= upg.maxLevel) {
      btn.textContent = "MAX";
      btn.disabled = true;
      btn.classList.remove("affordable");
    } else {
      btn.textContent = formatNumber(cost);
      btn.disabled = state.coins < cost;
      if (state.coins >= cost) {
        btn.classList.add("affordable");
      } else {
        btn.classList.remove("affordable");
      }
    }
  });
}

function showToast(text) {
  toastEl.textContent = text;
  toastEl.classList.remove("hidden");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toastEl.classList.add("hidden");
  }, 1200);
}

// ==================== 채굴 및 콤보 로직 ====================
function mine(x, y, isAuto = false) {
  if (!isAuto) {
    const now = Date.now();
    if (now - state.lastClickTime < 400) {
      state.combo = Math.min(state.combo + 1, 20);
    } else {
      state.combo = 1;
    }
    state.lastClickTime = now;

    if (state.combo > state.maxCombo) {
      state.maxCombo = state.combo;
    }
    state.totalClicks++;
    targetScale = 0.85;
  }

  const comboBonus = isAuto ? 1 : (1 + (state.combo - 1) * 0.05);
  const gain = state.clickPower * getMultiplier() * comboBonus;
  
  state.coins += gain;
  state.totalMined += gain;

  if (!isAuto) {
    createParticle(x, y, `+${formatNumber(gain)}`, state.combo > 5 ? "#f59e0b" : "#38bdf8");
  }
  updateUI();
  save();
}

function createParticle(x, y, text, color) {
  const el = document.createElement("div");
  el.className = "particle";
  el.textContent = text;
  el.style.left = x + "px";
  el.style.top = y + "px";
  el.style.color = color;
  document.getElementById("particles").appendChild(el);
  setTimeout(() => el.remove(), 700);
}

// ==================== 업그레이드 구매 ====================
function buyUpgrade(index) {
  const upg = upgrades[index];
  if (upg.maxLevel && upg.level >= upg.maxLevel) return;

  const cost = getCost(upg);
  if (state.coins < cost) return;

  state.coins -= cost;
  upg.level++;
  if (upg.effect) upg.effect(upg.level);

  showToast(`${upg.name} 강화 완료! (Lv.${upg.level})`);
  updateUI();
  save();
}

function renderUpgrades() {
  upgradeListEl.innerHTML = "";
  upgrades.forEach((upg, i) => {
    const card = document.createElement("div");
    card.className = "upgrade-card";
    card.innerHTML = `
      <div class="upgrade-icon">${upg.icon}</div>
      <div class="upgrade-info">
        <div class="upgrade-name">${upg.name}</div>
        <div class="upgrade-desc">${upg.getEffectText(upg.level)}</div>
        <div class="upgrade-level">레벨 ${upg.level}</div>
      </div>
      <button class="upgrade-buy" data-index="${i}">${formatNumber(getCost(upg))}</button>
    `;
    card.querySelector(".upgrade-buy").addEventListener("click", (e) => {
      e.stopPropagation();
      buyUpgrade(i);
    });
    card.addEventListener("click", () => buyUpgrade(i));
    upgradeListEl.appendChild(card);
  });
}

// ==================== 모달 및 이벤트 리스너 ====================
const container = document.getElementById("canvasContainer");
const statsModal = document.getElementById("statsModal");
const openStatsBtn = document.getElementById("openStatsBtn");
const closeStatsBtn = document.getElementById("closeStatsBtn");
const saveBtn = document.getElementById("saveBtn");

function handleMine(e) {
  e.preventDefault();
  let x, y;
  if (e.touches && e.touches[0]) {
    x = e.touches[0].clientX;
    y = e.touches[0].clientY;
  } else {
    x = e.clientX;
    y = e.clientY;
  }
  const rect = document.getElementById("particles").getBoundingClientRect();
  mine(x - rect.left, y - rect.top, false);
}

container.addEventListener("click", handleMine);
container.addEventListener("touchstart", handleMine, { passive: false });

openStatsBtn.addEventListener("click", () => {
  document.getElementById("statTotalMined").textContent = formatNumber(state.totalMined);
  document.getElementById("statTotalClicks").textContent = formatNumber(state.totalClicks);
  document.getElementById("statMaxCombo").textContent = `x${state.maxCombo}`;
  
  const mins = Math.floor(state.playTime / 60);
  const secs = state.playTime % 60;
  document.getElementById("statPlayTime").textContent = mins > 0 ? `${mins}분 ${secs}초` : `${secs}초`;

  statsModal.classList.remove("hidden");
});

closeStatsBtn.addEventListener("click", () => {
  statsModal.classList.add("hidden");
});

statsModal.addEventListener("click", (e) => {
  if (e.target === statsModal) {
    statsModal.classList.add("hidden");
  }
});

saveBtn.addEventListener("click", () => {
  save();
  showToast("게임이 수동 저장되었습니다!");
});

document.querySelectorAll(".bottom-nav .nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    if(btn.id !== "openStatsBtn" && btn.id !== "saveBtn") {
      document.querySelectorAll(".bottom-nav .nav-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    }
  });
});

// ==================== 게임 루프 및 오토 클릭 처리 ====================
let lastTime = Date.now();
let autoClickTimer = 0;

function gameLoop() {
  const now = Date.now();
  const delta = (now - lastTime) / 1000;
  lastTime = now;

  // 초당 채굴(CPS) 반영
  if (state.cps > 0) {
    const gain = state.cps * delta;
    state.coins += gain;
    state.totalMined += gain;
  }

  // 오토 마이너 봇 자동 클릭 반영 (초당 state.autoClickPower 만큼 클릭 시뮬레이션)
  if (state.autoClickPower > 0) {
    autoClickTimer += delta;
    const interval = 1 / state.autoClickPower;
    if (autoClickTimer >= interval) {
      const clicksToTrigger = Math.floor(autoClickTimer / interval);
      autoClickTimer %= interval;
      for (let c = 0; c < clicksToTrigger; c++) {
        mine(0, 0, true);
      }
    }
  }

  if (state.combo > 0 && now - state.lastClickTime > 1500) {
    state.combo = 0;
    updateUI();
  }

  updateUI();
  requestAnimationFrame(gameLoop);
}

setInterval(() => {
  state.playTime++;
}, 1000);

// ==================== 초기화 ====================
load();
init3D();
renderUpgrades();
updateUI();
gameLoop();

setInterval(save, 10000);
window.addEventListener("beforeunload", save);