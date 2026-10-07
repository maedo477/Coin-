// ==================== 게임 상태 ====================
const state = {
  coins: 0,
  totalMined: 0,
  clickPower: 1,
  cps: 0,
  autoClickPower: 0, 
  combo: 0,
  maxCombo: 0,
  totalClicks: 0,
  playTime: 0,
  lastClickTime: 0,
  tokens: 0,
  buffTimer: 0,
  isBuffActive: false,
  
  serverTemp: 40,
  coolingLevel: 0,
  cryptoStock: 100,
  cryptoHoldings: 0,
  rackLevel: 1,
  poolLevel: 0,

  customizations: {
    caseSkin: 0,
    fanColor: 0,
  },

  factoryParts: {
    wafer: 0,
    copper: 0,
    heatsink: 0,
    aiChip: 0
  }
};

// 업그레이드 정의
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

// 자동화 공장 부품 정의
const factoryPartsDef = [
  { id: "wafer", name: "실리콘 웨이퍼 라인", desc: "초당 코인 자동 생산 (+2 CPS / 레벨)", icon: "💿", baseCost: 500, costMult: 1.45 },
  { id: "copper", name: "구리 배선 조립기", desc: "클릭당 추가 코인 획득 (+1.5 CPC / 레벨)", icon: "🧵", baseCost: 1200, costMult: 1.5 },
  { id: "heatsink", name: "고효율 방열판 압출기", desc: "서버 과열 속도 완화 및 냉각 효율 증가", icon: "🧊", baseCost: 3000, costMult: 1.55 },
  { id: "aiChip", name: "차세대 AI 칩셋 라인", desc: "전체 채굴 수익 배율 폭증 (+10% / 레벨)", icon: "🧠", baseCost: 15000, costMult: 1.8 }
];

// 커스텀 샵 아이템 정의
const customItems = [
  { id: "skin_gold", type: "caseSkin", value: 1, name: "사이버 골드 케이스", desc: "고급스러운 황금빛 케이스 (전체 수익 +5%)", cost: 5000, color: 0xd97706 },
  { id: "skin_carbon", type: "caseSkin", value: 2, name: "탄소섬유 블랙 케이스", desc: "단단하고 세련된 블랙 (전체 수익 +10%)", cost: 25000, color: 0x0f172a },
  { id: "fan_red", type: "fanColor", value: 1, name: "네온 레드 쿨링팬", desc: "강렬한 붉은빛 LED (전체 수익 +5%)", cost: 3000, color: 0xef4444 },
  { id: "fan_green", type: "fanColor", value: 2, name: "에메랄드 그린 팬", desc: "싱그러운 녹색빛 LED (전체 수익 +8%)", cost: 15000, color: 0x22c55e },
];

// 업적 정의
const achievements = [
  { id: "click_10", name: "첫 걸음", desc: "탭 10회 달성하기", check: () => state.totalClicks >= 10, reward: 50, claimed: false },
  { id: "click_100", name: "열정적인 광부", desc: "탭 100회 달성하기", check: () => state.totalClicks >= 100, reward: 500, claimed: false },
  { id: "mine_1k", name: "첫 번째 고지", desc: "누적 1,000 코인 채굴", check: () => state.totalMined >= 1000, reward: 1000, claimed: false },
  { id: "bot_5", name: "자동화의 서막", desc: "오토 마이너 봇 레벨 5 달성", check: () => upgrades[0].level >= 5, reward: 2000, claimed: false },
  { id: "fork_1", name: "첫 환생", desc: "블록체인 하드포크 1회 실행", check: () => state.tokens > 0, reward: 10000, claimed: false }
];

// ==================== Three.js 3D 컴퓨터 채굴기 설정 ====================
let scene, camera, renderer, rigGroup, fanMesh1, fanMesh2, ledLight, fanMat, caseMat;
let targetScale = 1;

function init3D() {
  const container = document.getElementById("canvasContainer");
  if (!container) return;
  
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

  rigGroup = new THREE.Group();
  scene.add(rigGroup);

  const caseGeo = new THREE.BoxGeometry(2.4, 1.6, 1.2);
  caseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.3 });
  const serverCase = new THREE.Mesh(caseGeo, caseMat);
  rigGroup.add(serverCase);

  const gpuGeo = new THREE.BoxGeometry(2.0, 0.3, 0.9);
  const gpuMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2, emissive: 0x0284c7, emissiveIntensity: 0.3 });
  const gpu1 = new THREE.Mesh(gpuGeo, gpuMat);
  gpu1.position.set(0, 0.3, 0);
  rigGroup.add(gpu1);

  const gpu2 = new THREE.Mesh(gpuGeo, gpuMat);
  gpu2.position.set(0, -0.3, 0);
  rigGroup.add(gpu2);

  const fanGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 16);
  fanMat = new THREE.MeshStandardMaterial({
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

  applyCustomVisuals();
  animate3D();
}

function applyCustomVisuals() {
  if (caseMat) {
    if (state.customizations.caseSkin === 1) caseMat.color.setHex(0xd97706);
    else if (state.customizations.caseSkin === 2) caseMat.color.setHex(0x0f172a);
    else caseMat.color.setHex(0x1e293b);
  }
  if (fanMat) {
    let fanColorHex = 0x38bdf8;
    if (state.customizations.fanColor === 1) fanColorHex = 0xef4444;
    else if (state.customizations.fanColor === 2) fanColorHex = 0x22c55e;
    
    fanMat.color.setHex(fanColorHex);
    fanMat.emissive.setHex(fanColorHex);
  }
}

function animate3D() {
  requestAnimationFrame(animate3D);

  if (rigGroup) {
    rigGroup.rotation.y += 0.01;

    const speedBonus = 0.2 + (state.autoClickPower * 0.03) + (state.cps * 0.001) + (state.isBuffActive ? 0.5 : 0);
    if (fanMesh1 && fanMesh2) {
      fanMesh1.rotation.y += speedBonus;
      fanMesh2.rotation.y += speedBonus;
    }

    if (fanMat && state.customizations.fanColor === 0) {
      const hue = (Date.now() * 0.05) % 360;
      if (state.tokens > 0 || state.isBuffActive) {
        fanMat.emissive.setHSL(hue / 360, 1.0, 0.5);
      }
    }

    rigGroup.scale.x += (targetScale - rigGroup.scale.x) * 0.2;
    rigGroup.scale.y += (targetScale - rigGroup.scale.y) * 0.2;
    rigGroup.scale.z += (targetScale - rigGroup.scale.z) * 0.2;
    targetScale += (1 - targetScale) * 0.1;
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

// ==================== 유틸 및 수치 계산 ====================
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

function getFactoryPartCost(partDef, level) {
  return Math.floor(partDef.baseCost * Math.pow(partDef.costMult, level));
}

function getMultiplier() {
  const multUpg = upgrades.find(u => u.id === "quantum");
  const quantumMult = Math.pow(1.6, multUpg ? multUpg.level : 0);
  const tokenMult = 1 + (state.tokens * 0.5);
  const buffMult = state.isBuffActive ? 3.0 : 1.0;
  
  const tempPenalty = state.serverTemp >= 85 ? 0.3 : 1.0;
  const rackMult = 1 + ((state.rackLevel - 1) * 0.2);
  const poolMult = 1 + (state.poolLevel * 0.15);

  let customMult = 1.0;
  if (state.customizations.caseSkin === 1) customMult += 0.05;
  if (state.customizations.caseSkin === 2) customMult += 0.10;
  if (state.customizations.fanColor === 1) customMult += 0.05;
  if (state.customizations.fanColor === 2) customMult += 0.08;

  const aiChipMult = 1 + (state.factoryParts.aiChip * 0.10);

  return quantumMult * tokenMult * buffMult * tempPenalty * rackMult * poolMult * customMult * aiChipMult;
}

function getClickPowerTotal() {
  const base = state.clickPower;
  const copperBonus = state.factoryParts.copper * 1.5;
  return (base + copperBonus) * getMultiplier();
}

function updateCPS() {
  let base = 0;
  base += upgrades.find(u => u.id === "droid").level * 0.6;
  base += upgrades.find(u => u.id === "miner").level * 3.5;
  base += upgrades.find(u => u.id === "laser").level * 18;
  base += upgrades.find(u => u.id === "factory").level * 90;
  base += state.factoryParts.wafer * 2.0;

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
    tokens: state.tokens,
    cryptoHoldings: state.cryptoHoldings,
    cryptoStock: state.cryptoStock,
    rackLevel: state.rackLevel,
    poolLevel: state.poolLevel,
    coolingLevel: state.coolingLevel,
    customizations: state.customizations,
    factoryParts: state.factoryParts,
    upgrades: upgrades.map(u => ({ id: u.id, level: u.level })),
    achievements: achievements.map(a => ({ id: a.id, claimed: a.claimed }))
  };
  localStorage.setItem("pcRigMinerUltimateSave", JSON.stringify(data));
}

function load() {
  const raw = localStorage.getItem("pcRigMinerUltimateSave");
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    state.coins = data.coins || 0;
    state.totalMined = data.totalMined || 0;
    state.totalClicks = data.totalClicks || 0;
    state.maxCombo = data.maxCombo || 0;
    state.playTime = data.playTime || 0;
    state.tokens = data.tokens || 0;
    state.cryptoHoldings = data.cryptoHoldings || 0;
    state.cryptoStock = data.cryptoStock || 100;
    state.rackLevel = data.rackLevel || 1;
    state.poolLevel = data.poolLevel || 0;
    state.coolingLevel = data.coolingLevel || 0;
    if (data.customizations) state.customizations = data.customizations;
    if (data.factoryParts) state.factoryParts = data.factoryParts;
    if (data.upgrades) {
      data.upgrades.forEach(saved => {
        const upg = upgrades.find(u => u.id === saved.id);
        if (upg) {
          upg.level = saved.level || 0;
          if (upg.effect) upg.effect(upg.level);
        }
      });
    }
    if (data.achievements) {
      data.achievements.forEach(saved => {
        const ach = achievements.find(a => a.id === saved.id);
        if (ach) ach.claimed = saved.claimed;
      });
    }
    updateCPS();
    updateAutoClick();
  } catch (e) {
    console.warn("세이브 로드 실패", e);
  }
}

// ==================== 세이브 파일 내보내기 / 불러오기 ====================
function exportSaveFile() {
  save();
  const raw = localStorage.getItem("pcRigMinerUltimateSave");
  if (!raw) {
    showToast("저장된 데이터가 없습니다!");
    return;
  }
  const blob = new Blob([raw], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "miner_save.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("세이브 파일 다운로드 완료!");
}

function importSaveFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const content = e.target.result;
      JSON.parse(content); // 유효한 JSON인지 검증
      localStorage.setItem("pcRigMinerUltimateSave", content);
      load();
      applyCustomVisuals();
      renderUpgrades();
      updateUI();
      showToast("세이브 파일 연동 성공!");
      document.getElementById("statsModal").classList.add("hidden");
    } catch (err) {
      showToast("잘못된 세이브 파일입니다!");
    }
  };
  reader.readAsText(file);
}

// ==================== UI 업데이트 ====================
const coinCountEl = document.getElementById("coinCount");
const cpsEl = document.getElementById("cps");
const cpcEl = document.getElementById("cpc");
const tokenCountEl = document.getElementById("tokenCount");
const upgradeListEl = document.getElementById("upgradeList");
const toastEl = document.getElementById("toast");
const comboBadgeEl = document.getElementById("comboBadge");
const comboCountEl = document.getElementById("comboCount");
const buffBadgeEl = document.getElementById("buffBadge");
const buffTimeEl = document.getElementById("buffTime");

function updateUI() {
  if (coinCountEl) coinCountEl.textContent = formatNumber(state.coins);
  if (cpsEl) cpsEl.textContent = formatNumber(state.cps + (state.autoClickPower * getClickPowerTotal()));
  if (cpcEl) cpcEl.textContent = formatNumber(getClickPowerTotal());
  if (tokenCountEl) tokenCountEl.textContent = state.tokens;

  if (state.combo > 1) {
    if (comboBadgeEl) comboBadgeEl.classList.remove("hidden");
    if (comboCountEl) comboCountEl.textContent = state.combo;
  } else {
    if (comboBadgeEl) comboBadgeEl.classList.add("hidden");
  }

  if (state.isBuffActive) {
    if (buffBadgeEl) buffBadgeEl.classList.remove("hidden");
    if (buffTimeEl) buffTimeEl.textContent = Math.ceil(state.buffTimer);
  } else {
    if (buffBadgeEl) buffBadgeEl.classList.add("hidden");
  }

  document.querySelectorAll(".upgrade-card").forEach((card, i) => {
    const upg = upgrades[i];
    if (!upg) return;
    const cost = getCost(upg);
    const btn = card.querySelector(".upgrade-buy");
    const levelEl = card.querySelector(".upgrade-level");
    const descEl = card.querySelector(".upgrade-desc");

    if (levelEl) levelEl.textContent = `레벨 ${upg.level}`;
    if (descEl) descEl.textContent = upg.getEffectText(upg.level);

    if (btn) {
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
    }
  });

  checkAchievements();
}

function showToast(text) {
  if (!toastEl) return;
  toastEl.textContent = text;
  toastEl.classList.remove("hidden");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toastEl.classList.add("hidden");
  }, 1300);
}

// ==================== 채굴 및 콤보 로직 ====================
function mine(x, y, isAuto = false) {
  if (!isAuto) {
    const now = Date.now();
    if (now - state.lastClickTime < 400) {
      state.combo = Math.min(state.combo + 1, 25);
    } else {
      state.combo = 1;
    }
    state.lastClickTime = now;

    if (state.combo > state.maxCombo) {
      state.maxCombo = state.combo;
    }
    state.totalClicks++;
    targetScale = 0.85;

    state.serverTemp = Math.min(100, state.serverTemp + 0.8);
  }

  const comboBonus = isAuto ? 1 : (1 + (state.combo - 1) * 0.05);
  const gain = getClickPowerTotal() * comboBonus;
  
  state.coins += gain;
  state.totalMined += gain;

  if (!isAuto) {
    createParticle(x, y, `+${formatNumber(gain)}`, state.combo > 5 ? "#f59e0b" : "#38bdf8");
  }
  updateUI();
  save();
}

function createParticle(x, y, text, color) {
  const particlesContainer = document.getElementById("particles");
  if (!particlesContainer) return;
  const el = document.createElement("div");
  el.className = "particle";
  el.textContent = text;
  el.style.left = x + "px";
  el.style.top = y + "px";
  el.style.color = color;
  particlesContainer.appendChild(el);
  setTimeout(() => el.remove(), 700);
}

// ==================== 업그레이드 구매 ====================
function buyUpgrade(index) {
  const upg = upgrades[index];
  if (!upg || (upg.maxLevel && upg.level >= upg.maxLevel)) return;

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
  if (!upgradeListEl) return;
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

// ==================== 공장 부품 생산 샵 렌더링 ====================
function renderFactoryShop() {
  const container = document.getElementById("factoryListContainer");
  if (!container) return;
  container.innerHTML = "";

  factoryPartsDef.forEach((part) => {
    const currentLevel = state.factoryParts[part.id];
    const cost = getFactoryPartCost(part, currentLevel);
    const card = document.createElement("div");
    card.className = "factory-card";
    card.innerHTML = `
      <div class="upgrade-icon">${part.icon}</div>
      <div class="factory-info">
        <div class="factory-name">${part.name} (Lv.${currentLevel})</div>
        <div class="factory-desc">${part.desc}</div>
      </div>
      <button class="upgrade-buy ${state.coins >= cost ? 'affordable' : ''}">${formatNumber(cost)}</button>
    `;

    card.querySelector("button").addEventListener("click", () => {
      if (state.coins < cost) {
        showToast("코인이 부족합니다!");
        return;
      }
      state.coins -= cost;
      state.factoryParts[part.id]++;
      updateCPS();
      showToast(`${part.name} 라인 증설 완료! (Lv.${state.factoryParts[part.id]})`);
      renderFactoryShop();
      updateUI();
      save();
    });

    container.appendChild(card);
  });
}

// ==================== 커스텀 샵 렌더링 및 구매 ====================
function renderCustomShop() {
  const container = document.getElementById("customListContainer");
  if (!container) return;
  container.innerHTML = "";

  customItems.forEach((item) => {
    const isOwned = state.customizations[item.type] === item.value;
    const card = document.createElement("div");
    card.className = `custom-card ${isOwned ? 'purchased' : ''}`;
    card.innerHTML = `
      <div class="custom-info">
        <div class="custom-name">${item.name} ${isOwned ? '✅ (장착중)' : ''}</div>
        <div class="custom-desc">${item.desc}</div>
      </div>
      <button class="upgrade-buy ${state.coins >= item.cost || isOwned ? 'affordable' : ''}" ${isOwned ? 'disabled' : ''}>
        ${isOwned ? '보유중' : formatNumber(item.cost)}
      </button>
    `;

    card.querySelector("button").addEventListener("click", () => {
      if (isOwned) return;
      if (state.coins < item.cost) {
        showToast("코인이 부족합니다!");
        return;
      }
      state.coins -= item.cost;
      state.customizations[item.type] = item.value;
      applyCustomVisuals();
      showToast(`${item.name} 장착 완료!`);
      renderCustomShop();
      updateUI();
      save();
    });

    container.appendChild(card);
  });
}

// ==================== 시스템 업데이트 로직 ====================
function updateTemperature(delta) {
  const heatGeneration = (state.cps * 0.005) + 0.1;
  const heatsinkBonus = state.factoryParts.heatsink * 0.2;
  const coolingPower = 0.5 + (state.coolingLevel * 0.3) + heatsinkBonus;
  state.serverTemp = Math.min(100, Math.max(30, state.serverTemp + (heatGeneration * delta) - (coolingPower * delta)));

  if (state.serverTemp >= 85) {
    showToast("🔥 서버 과열 경보! 효율이 70% 감소했습니다!");
  }
}

function updateCryptoMarket() {
  const fluctuation = (Math.random() * 0.45) - 0.20;
  state.cryptoStock = Math.max(10, Math.floor(state.cryptoStock * (1 + fluctuation)));
}
setInterval(updateCryptoMarket, 15000);

// ==================== 무작위 드롭 아이템 (오버클럭 캡슐) ====================
function spawnDropItem() {
  const container = document.getElementById("dropContainer");
  if (!container || container.children.length > 0) return;

  const item = document.createElement("div");
  item.className = "drop-item";
  item.textContent = "⚡";
  item.style.left = Math.floor(Math.random() * 70 + 15) + "%";
  item.style.top = Math.floor(Math.random() * 50 + 25) + "%";

  const activateBuff = (e) => {
    if (e) e.stopPropagation();
    state.isBuffActive = true;
    state.buffTimer = 12;
    showToast("⚡ 오버클럭 활성화! 수익 3배 증가!");
    item.remove();
  };

  item.addEventListener("click", activateBuff);
  item.addEventListener("touchstart", activateBuff, { passive: true });

  container.appendChild(item);

  setTimeout(() => {
    if (item.parentElement) item.remove();
  }, 6000);
}
setInterval(spawnDropItem, 25000);

// ==================== 업적 시스템 ====================
function checkAchievements() {
  achievements.forEach(ach => {
    if (!ach.claimed && ach.check()) {
      ach.claimed = true;
      state.coins += ach.reward;
      showToast(`🏆 업적 달성: ${ach.name} (+${formatNumber(ach.reward)} 코인)`);
    }
  });
}

function renderAchievements() {
  const container = document.getElementById("achieveListContainer");
  if (!container) return;
  container.innerHTML = "";
  achievements.forEach(ach => {
    const card = document.createElement("div");
    card.className = `achieve-card ${ach.claimed ? 'completed' : ''}`;
    card.innerHTML = `
      <div class="achieve-info">
        <div class="achieve-name">${ach.name} ${ach.claimed ? '✅' : ''}</div>
        <div class="achieve-desc">${ach.desc} (보상: +${formatNumber(ach.reward)})</div>
      </div>
    `;
    container.appendChild(card);
  });
}

// ==================== 하드포크 (환생 시스템) ====================
function executeHardFork() {
  const gain = Math.floor(Math.sqrt(state.totalMined / 50000));
  if (gain <= 0) {
    showToast("최소 50,000 코인 이상 채굴해야 하드포크가 가능합니다!");
    return;
  }

  state.tokens += gain;
  state.coins = 0;
  state.totalMined = 0;
  state.clickPower = 1;
  upgrades.forEach(u => {
    u.level = 0;
    if (u.effect) u.effect(0);
  });
  updateCPS();
  updateAutoClick();
  const forkModal = document.getElementById("forkModal");
  if (forkModal) forkModal.classList.add("hidden");
  showToast(`🔄 하드포크 성공! 해시 토큰 +${gain}개 획득!`);
  save();
}

// ==================== 랜섬웨어 미니 이벤트 ====================
let ransomClicksLeft = 15;
let ransomTimer = null;

function triggerRansomwareEvent() {
  const alertEl = document.getElementById("ransomAlert");
  if (alertEl && Math.random() < 0.35 && alertEl.classList.contains("hidden")) {
    ransomClicksLeft = 15;
    const rc = document.getElementById("ransomClicks");
    if (rc) rc.textContent = ransomClicksLeft;
    alertEl.classList.remove("hidden");

    let sec = 5;
    ransomTimer = setInterval(() => {
      sec--;
      if (sec <= 0) {
        clearInterval(ransomTimer);
        alertEl.classList.add("hidden");
        state.coins = Math.max(0, state.coins * 0.9);
        showToast("🚨 랜섬웨어 감염! 코인 10%를 탈취당했습니다!");
      }
    }, 1000);
  }
}
setInterval(triggerRansomwareEvent, 50000);

const ransomBtn = document.getElementById("ransomBtn");
if (ransomBtn) {
  const handleRansomClick = (e) => {
    e.stopPropagation();
    ransomClicksLeft--;
    const rc = document.getElementById("ransomClicks");
    if (rc) rc.textContent = ransomClicksLeft;
    if (ransomClicksLeft <= 0) {
      clearInterval(ransomTimer);
      const alertEl = document.getElementById("ransomAlert");
      if (alertEl) alertEl.classList.add("hidden");
      const rewardBonus = 500 * (1 + state.tokens);
      state.coins += rewardBonus;
      showToast(`🛡️ 랜섬웨어 방어 성공! 보상 +${formatNumber(rewardBonus)} 코인`);
    }
  };
  ransomBtn.addEventListener("click", handleRansomClick);
  ransomBtn.addEventListener("touchstart", handleRansomClick, { passive: true });
}

// ==================== 이벤트 리스너 및 모달 관리 ====================
const container = document.getElementById("canvasContainer");
const statsModal = document.getElementById("statsModal");
const openStatsBtn = document.getElementById("openStatsBtn");
const closeStatsBtn = document.getElementById("closeStatsBtn");

const factoryModal = document.getElementById("factoryModal");
const openFactoryBtn = document.getElementById("openFactoryBtn");
const closeFactoryBtn = document.getElementById("closeFactoryBtn");

const marketModal = document.getElementById("marketModal");
const openMarketBtn = document.getElementById("openMarketBtn");
const closeMarketBtn = document.getElementById("closeMarketBtn");
const buyCryptoBtn = document.getElementById("buyCryptoBtn");
const sellCryptoBtn = document.getElementById("sellCryptoBtn");

const customModal = document.getElementById("customModal");
const openCustomBtn = document.getElementById("openCustomBtn");
const closeCustomBtn = document.getElementById("closeCustomBtn");

const achieveModal = document.getElementById("achieveModal");
const openAchieveBtn = document.getElementById("openAchieveBtn");
const closeAchieveBtn = document.getElementById("closeAchieveBtn");

const forkModal = document.getElementById("forkModal");
const openForkBtn = document.getElementById("openForkBtn");
const closeForkBtn = document.getElementById("closeForkBtn");
const executeForkBtn = document.getElementById("executeForkBtn");

const saveBtn = document.getElementById("saveBtn");
const exportSaveBtn = document.getElementById("exportSaveBtn");
const importSaveBtn = document.getElementById("importSaveBtn");
const importFile = document.getElementById("importFile");

function handleMine(e) {
  if (statsModal && !statsModal.classList.contains("hidden")) return;
  if (factoryModal && !factoryModal.classList.contains("hidden")) return;
  if (marketModal && !marketModal.classList.contains("hidden")) return;
  if (customModal && !customModal.classList.contains("hidden")) return;
  if (achieveModal && !achieveModal.classList.contains("hidden")) return;
  if (forkModal && !forkModal.classList.contains("hidden")) return;

  let x, y;
  if (e.touches && e.touches[0]) {
    x = e.touches[0].clientX;
    y = e.touches[0].clientY;
  } else {
    x = e.clientX;
    y = e.clientY;
  }
  const particlesContainer = document.getElementById("particles");
  const rect = particlesContainer ? particlesContainer.getBoundingClientRect() : { left: 0, top: 0 };
  mine(x - rect.left, y - rect.top, false);
}

if (container) {
  container.addEventListener("pointerdown", handleMine);
}

if (openFactoryBtn) {
  openFactoryBtn.addEventListener("click", () => {
    renderFactoryShop();
    factoryModal.classList.remove("hidden");
  });
}
if (closeFactoryBtn) {
  closeFactoryBtn.addEventListener("click", () => factoryModal.classList.add("hidden"));
}

if (openMarketBtn) {
  openMarketBtn.addEventListener("click", () => {
    document.getElementById("marketStockPrice").textContent = formatNumber(state.cryptoStock) + " 코인";
    document.getElementById("marketHoldings").textContent = formatNumber(state.cryptoHoldings) + "개";
    marketModal.classList.remove("hidden");
  });
}
if (closeMarketBtn) {
  closeMarketBtn.addEventListener("click", () => marketModal.classList.add("hidden"));
}

if (buyCryptoBtn) {
  buyCryptoBtn.addEventListener("click", () => {
    const cost = state.cryptoStock;
    if (state.coins < cost) {
      showToast("코인이 부족합니다!");
      return;
    }
    state.coins -= cost;
    state.cryptoHoldings++;
    showToast("가상 코인 1개 매수 완료!");
    document.getElementById("marketStockPrice").textContent = formatNumber(state.cryptoStock) + " 코인";
    document.getElementById("marketHoldings").textContent = formatNumber(state.cryptoHoldings) + "개";
    updateUI();
  });
}

if (sellCryptoBtn) {
  sellCryptoBtn.addEventListener("click", () => {
    if (state.cryptoHoldings <= 0) {
      showToast("보유 중인 가상 코인이 없습니다!");
      return;
    }
    const profit = state.cryptoStock;
    state.coins += profit;
    state.cryptoHoldings--;
    showToast(`가상 코인 1개 매도! (+${formatNumber(profit)} 코인)`);
    document.getElementById("marketStockPrice").textContent = formatNumber(state.cryptoStock) + " 코인";
    document.getElementById("marketHoldings").textContent = formatNumber(state.cryptoHoldings) + "개";
    updateUI();
  });
}

if (openCustomBtn) {
  openCustomBtn.addEventListener("click", () => {
    renderCustomShop();
    customModal.classList.remove("hidden");
  });
}
if (closeCustomBtn) {
  closeCustomBtn.addEventListener("click", () => customModal.classList.add("hidden"));
}

if (openStatsBtn) {
  openStatsBtn.addEventListener("click", () => {
    const stm = document.getElementById("statTotalMined");
    const stc = document.getElementById("statTotalClicks");
    const smc = document.getElementById("statMaxCombo");
    const spt = document.getElementById("statPlayTime");

    if (stm) stm.textContent = formatNumber(state.totalMined);
    if (stc) stc.textContent = formatNumber(state.totalClicks);
    if (smc) smc.textContent = `x${state.maxCombo}`;
    
    const mins = Math.floor(state.playTime / 60);
    const secs = state.playTime % 60;
    if (spt) spt.textContent = mins > 0 ? `${mins}분 ${secs}초` : `${secs}초`;
    if (statsModal) statsModal.classList.remove("hidden");
  });
}
if (closeStatsBtn) closeStatsBtn.addEventListener("click", () => statsModal.classList.add("hidden"));

if (openAchieveBtn) {
  openAchieveBtn.addEventListener("click", () => {
    renderAchievements();
    if (achieveModal) achieveModal.classList.remove("hidden");
  });
}
if (closeAchieveBtn) closeAchieveBtn.addEventListener("click", () => achieveModal.classList.add("hidden"));

if (openForkBtn) {
  openForkBtn.addEventListener("click", () => {
    const fcc = document.getElementById("forkCurrentCoins");
    const fgt = document.getElementById("forkGainTokens");
    if (fcc) fcc.textContent = formatNumber(state.coins);
    const gain = Math.floor(Math.sqrt(state.totalMined / 50000));
    if (fgt) fgt.textContent = `${gain}개`;
    if (forkModal) forkModal.classList.remove("hidden");
  });
}
if (closeForkBtn) closeForkBtn.addEventListener("click", () => forkModal.classList.add("hidden"));
if (executeForkBtn) executeForkBtn.addEventListener("click", executeHardFork);

if (saveBtn) {
  saveBtn.addEventListener("click", () => {
    save();
    showToast("게임이 수동 저장되었습니다!");
  });
}

if (exportSaveBtn) {
  exportSaveBtn.addEventListener("click", exportSaveFile);
}

if (importSaveBtn && importFile) {
  importSaveBtn.addEventListener("click", () => importFile.click());
  importFile.addEventListener("change", importSaveFile);
}

// ==================== 게임 루프 및 타이머 ====================
let lastTime = Date.now();
let autoClickTimer = 0;

function gameLoop() {
  const now = Date.now();
  const delta = (now - lastTime) / 1000;
  lastTime = now;

  updateTemperature(delta);

  if (state.cps > 0) {
    const gain = state.cps * delta;
    state.coins += gain;
    state.totalMined += gain;
  }

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

  if (state.isBuffActive) {
    state.buffTimer -= delta;
    if (state.buffTimer <= 0) {
      state.isBuffActive = false;
      showToast("⚡ 오버클럭 버프가 종료되었습니다.");
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