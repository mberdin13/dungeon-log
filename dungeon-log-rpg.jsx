import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sword, Wand2, Zap, Heart, Droplet, Coins, Backpack, Store, User,
  Flame, Skull, Trees, Mountain, Landmark, Moon, ChevronRight, ShieldHalf,
  LogOut, KeyRound, Users, Trophy, Swords, PiggyBank, PawPrint, Sparkles, RefreshCw,
} from "lucide-react";

// ---------------------------------------------------------------------------
// GAME DATA
// ---------------------------------------------------------------------------

const CLASSES = {
  warrior: {
    id: "warrior", name: "Warrior", Icon: Sword,
    tagline: "Steel and stubbornness. Takes hits, keeps swinging.",
    baseHp: 120, baseMp: 20, baseAtk: 14, baseDef: 12,
    growth: { hp: 14, mp: 3, atk: 2, def: 2 },
    skill: { name: "Power Strike", cost: 10, mult: 1.8, desc: "A heavy blow with your blade." },
  },
  mage: {
    id: "mage", name: "Mage", Icon: Wand2,
    tagline: "Fragile. Devastating. Reads the fine print on scrolls.",
    baseHp: 75, baseMp: 70, baseAtk: 18, baseDef: 5,
    growth: { hp: 8, mp: 8, atk: 3, def: 1 },
    skill: { name: "Fireball", cost: 15, mult: 2.6, desc: "Hurl a bolt of arcane fire." },
  },
  rogue: {
    id: "rogue", name: "Rogue", Icon: Zap,
    tagline: "Quick hands, quicker feet. Prefers not to be hit at all.",
    baseHp: 95, baseMp: 35, baseAtk: 16, baseDef: 7,
    growth: { hp: 10, mp: 4, atk: 3, def: 1 },
    skill: { name: "Shadow Strike", cost: 12, mult: 2.2, desc: "Strike from the shadows for heavy damage." },
  },
};

const ZONES = [
  { id: "forest", name: "Whispering Forest", minLevel: 1, factor: 1.0, Icon: Trees,
    enemies: ["Giant Rat", "Wild Boar", "Forest Spider", "Bandit Scout"],
    boss: "Thornback the Elder Boar",
    intro: ["The trees close in overhead, filtering the light to green.", "Something rustles in the undergrowth ahead."] },
  { id: "caverns", name: "Damp Caverns", minLevel: 5, factor: 1.35, Icon: Mountain,
    enemies: ["Cave Bat", "Slime", "Goblin Miner", "Rock Lurker"],
    boss: "Grimjaw the Cave Troll",
    intro: ["Water drips somewhere in the dark.", "Your torchlight catches something moving between the stones."] },
  { id: "ruins", name: "Sunken Ruins", minLevel: 10, factor: 1.75, Icon: Landmark,
    enemies: ["Skeleton Warrior", "Ruin Wraith", "Cursed Statue", "Tomb Rat"],
    boss: "The Drowned King",
    intro: ["Broken columns rise from stagnant water.", "The air here is older than it should be."] },
  { id: "crypt", name: "Bone Crypt", minLevel: 15, factor: 2.25, Icon: Skull,
    enemies: ["Zombie", "Crypt Ghoul", "Bone Golem", "Wailing Spirit"],
    boss: "Mortessa, Keeper of Bones",
    intro: ["The walls are stacked floor to ceiling with the dead.", "A cold draft carries the smell of old dust."] },
  { id: "volcano", name: "Ashen Volcano", minLevel: 20, factor: 2.85, Icon: Flame,
    enemies: ["Fire Imp", "Magma Hound", "Ash Wraith", "Ember Golem"],
    boss: "Vulkar the Cinder Lord",
    intro: ["Heat rolls off the rock in shimmering waves.", "Cinders drift down like black snow."] },
  { id: "abyss", name: "The Abyss", minLevel: 25, factor: 3.6, Icon: Moon,
    enemies: ["Void Stalker", "Nightmare Fiend", "Abyssal Horror", "Chaos Spawn"],
    boss: "Nyxareth, the Devourer",
    intro: ["There is no floor here, only the feeling of one.", "The dark watches back."] },
];

const WEAPONS = {
  starter:    { name: "Worn Dagger",   atk: 0,  price: 0,   minLevel: 1 },
  iron:       { name: "Iron Blade",    atk: 5,  price: 50,  minLevel: 1 },
  steel:      { name: "Steel Saber",   atk: 12, price: 150, minLevel: 5 },
  mythril:    { name: "Mythril Edge",  atk: 22, price: 400, minLevel: 12 },
  dragonfang: { name: "Dragonfang",    atk: 35, price: 900, minLevel: 20 },
};

const ARMORS = {
  starter:     { name: "Traveler's Garb", def: 0,  price: 0,   minLevel: 1 },
  leather:     { name: "Leather Vest",    def: 4,  price: 50,  minLevel: 1 },
  chain:       { name: "Chainmail",       def: 10, price: 150, minLevel: 5 },
  plate:       { name: "Plate Armor",     def: 18, price: 400, minLevel: 12 },
  dragonscale: { name: "Dragonscale",     def: 30, price: 900, minLevel: 20 },
};

const POTIONS = {
  health:        { name: "Health Potion",         heal: 40,    price: 15, minLevel: 1 },
  greaterHealth: { name: "Greater Health Potion",  heal: 90,    price: 45, minLevel: 8 },
  mana:          { name: "Mana Potion",            restore: 30, price: 15, minLevel: 1 },
  greaterMana:   { name: "Greater Mana Potion",     restore: 70, price: 45, minLevel: 8 },
};

const TRINKETS = {
  wardedPouch: { name: "Warded Pouch", desc: "Blocks the next attempt to steal your gold.", price: 80, minLevel: 3, maxCharges: 5 },
};

const GODS = [
  { id: "solari", name: "Solari, the Sunbringer", domain: "War & Strength", Icon: Flame },
  { id: "nyxa", name: "Nyxa, Lady of Shadows", domain: "Stealth & Fortune", Icon: Moon },
  { id: "terrus", name: "Terrus, the Unshaken", domain: "Earth & Defense", Icon: Mountain },
  { id: "aureth", name: "Aureth, the Golden Coin", domain: "Wealth & Luck", Icon: Coins },
  { id: "vaelin", name: "Vaelin, the Wild Hunt", domain: "Hunting & Growth", Icon: Trees },
];

const BLESSING_POOL = [
  { id: "atk", mult: 1.3, desc: "+30% ATK for your next 5 battles." },
  { id: "def", mult: 1.3, desc: "+30% DEF for your next 5 battles." },
  { id: "luck", mult: 1.5, desc: "+50% gold from your next 5 battles." },
  { id: "xp", mult: 1.5, desc: "+50% XP from your next 5 battles." },
  { id: "heal", desc: "Full restoration of HP and MP." },
];

const PET_SPECIES = [
  { id: "wolf", name: "Wolf Pup" },
  { id: "cat", name: "Cat" },
  { id: "hawk", name: "Hawk" },
  { id: "slime", name: "Slime" },
];

const DEFAULT_PASSWORD = "bowdowntomark";

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

const xpToNext = (level) => Math.floor(70 * Math.pow(level, 1.35)) + 30;
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const rand = (a, b) => a + Math.random() * (b - a);

function sanitizeHandle(raw) {
  return (raw || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "_").slice(0, 40);
}

async function sha256Hex(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await window.crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function totalAtk(player) {
  return player.baseAtk + (WEAPONS[player.equippedWeapon]?.atk || 0);
}
function totalDef(player) {
  return player.baseDef + (ARMORS[player.equippedArmor]?.def || 0);
}

function petStatFromTs(ts, decayPerHour) {
  if (!ts) return 50;
  const hrs = (Date.now() - ts) / 3600000;
  return clamp(100 - hrs * decayPerHour, 0, 100);
}
function petMood(pet) {
  if (!pet) return 0;
  const h = petStatFromTs(pet.lastFed, 4);
  const j = petStatFromTs(pet.lastWalked, 3);
  const c = petStatFromTs(pet.lastBathed, 2);
  return Math.round((h + j + c) / 3);
}

// Effective combat stats: gear + active blessing + pet mood bonus
function computeCombatStats(player) {
  let atk = totalAtk(player);
  let def = totalDef(player);
  if (player.blessing?.type === "atk") atk *= player.blessing.mult;
  if (player.blessing?.type === "def") def *= player.blessing.mult;
  if (player.pet) {
    const moodMult = 1 + (petMood(player.pet) / 100) * 0.08;
    atk *= moodMult;
    def *= moodMult;
  }
  return { atk: Math.round(atk), def: Math.round(def) };
}

function newPlayer(name, classId) {
  const c = CLASSES[classId];
  return {
    name, classId,
    level: 1, xp: 0,
    hp: c.baseHp, maxHp: c.baseHp,
    mp: c.baseMp, maxMp: c.baseMp,
    baseAtk: c.baseAtk, baseDef: c.baseDef,
    gold: 40, bankGold: 0,
    equippedWeapon: "starter", equippedArmor: "starter",
    ownedWeapons: ["starter"], ownedArmors: ["starter"],
    bankedWeapons: [], bankedArmors: [],
    potions: { health: 2, greaterHealth: 0, mana: 1, greaterMana: 0 },
    antiTheftCharges: 0,
    godId: null, lastPrayerDate: null, blessing: null,
    guildId: null,
    wins: 0, losses: 0,
    pet: null,
  };
}

// Applies xp gain, returns { player, messages }
function applyXp(player, xpGain) {
  let p = { ...player, xp: player.xp + xpGain };
  const messages = [];
  const c = CLASSES[p.classId];
  while (p.xp >= xpToNext(p.level)) {
    p.xp -= xpToNext(p.level);
    p.level += 1;
    p.maxHp += c.growth.hp;
    p.maxMp += c.growth.mp;
    p.baseAtk += c.growth.atk;
    p.baseDef += c.growth.def;
    p.hp = p.maxHp;
    p.mp = p.maxMp;
    messages.push(`LEVEL UP! You are now level ${p.level}.`);
  }
  return { player: p, messages };
}

function generateEnemy(zone, playerLevel) {
  const isBoss = Math.random() < 0.1;
  const baseName = zone.enemies[Math.floor(Math.random() * zone.enemies.length)];
  const f = zone.factor;
  const bossMult = isBoss ? 2.3 : 1;
  const hp = Math.floor((24 + playerLevel * 9) * f * bossMult * rand(0.9, 1.1));
  const atk = Math.floor((5 + playerLevel * 2.1) * f * (isBoss ? 1.5 : 1) * rand(0.9, 1.1));
  const def = Math.floor((2 + playerLevel * 1.1) * f * (isBoss ? 1.4 : 1) * rand(0.9, 1.1));
  const xp = Math.floor((18 + playerLevel * 6) * f * (isBoss ? 3 : 1));
  const gold = Math.floor((12 + playerLevel * 4) * f * (isBoss ? 3 : 1));
  return { name: isBoss ? zone.boss : baseName, hp, maxHp: hp, atk, def, xp, gold, isBoss };
}

let logId = 0;
const mkLog = (text, type = "info") => ({ id: ++logId, text, type });

const LOG_COLORS = {
  info: "#8a7c68",
  dmg: "#c96a5a",
  heal: "#7fa864",
  loot: "#c9a04a",
  levelup: "#e0a848",
  crit: "#e0664f",
};

// ---------------------------------------------------------------------------
// SMALL UI PIECES
// ---------------------------------------------------------------------------

function StatBar({ value, max, colorFrom, colorTo, label, height = 10 }) {
  const pct = clamp((value / Math.max(1, max)) * 100, 0, 100);
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-0.5" style={{ color: "#a8987f", fontFamily: "'JetBrains Mono', monospace" }}>
        <span>{label}</span>
        <span>{Math.max(0, Math.round(value))} / {Math.round(max)}</span>
      </div>
      <div style={{ height, background: "#241c14", borderRadius: 3, overflow: "hidden", border: "1px solid #3a2e20" }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: `linear-gradient(90deg, ${colorFrom}, ${colorTo})`,
          transition: "width 400ms ease",
        }} />
      </div>
    </div>
  );
}

function Panel({ children, style, className }) {
  return (
    <div className={className} style={{ background: "#241c15", border: "1px solid #3d2f21", borderRadius: 6, ...style }}>
      {children}
    </div>
  );
}

function actionBtnStyle(color, disabled) {
  return {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    background: "#1e1710", border: `1px solid ${disabled ? "#3d2f21" : color}`,
    borderRadius: 6, padding: "11px 0", color: disabled ? "#4a3f30" : color,
    fontSize: 12, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'JetBrains Mono', monospace",
  };
}

function StatLine({ label, value, color }) {
  return (
    <div>
      <div style={{ color: "#6b5f4c", fontSize: 10 }}>{label.toUpperCase()}</div>
      <div style={{ color, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function GearRow({ item, equipped, statLabel, statVal, onEquip, onStore, storable }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1e1710", border: "1px solid #3d2f21", borderRadius: 5, padding: "8px 10px" }}>
      <div style={{ fontSize: 12 }}>
        {item.name} <span style={{ color: "#6b5f4c" }}>+{statVal} {statLabel}</span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {equipped ? (
          <span style={{ fontSize: 11, color: "#7fa864" }}>Equipped</span>
        ) : (
          <>
            <button onClick={onEquip} style={{ fontSize: 11, background: "transparent", border: "1px solid #3d2f21", borderRadius: 4, padding: "4px 10px", color: "#cc7a3c", cursor: "pointer" }}>
              Equip
            </button>
            {storable && (
              <button onClick={onStore} style={{ fontSize: 11, background: "transparent", border: "1px solid #3d2f21", borderRadius: 4, padding: "4px 10px", color: "#6b9bc9", cursor: "pointer" }}>
                Store
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ShopRow({ name, desc, price, locked, minLevel, canAfford, onBuy, owned }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1e1710", border: "1px solid #3d2f21", borderRadius: 5, padding: "8px 10px" }}>
      <div style={{ fontSize: 12 }}>
        <div>{name}</div>
        <div style={{ color: "#6b5f4c", fontSize: 10 }}>{desc}{locked ? ` · requires Lv${minLevel}` : ""}</div>
      </div>
      {owned ? (
        <span style={{ fontSize: 11, color: "#7fa864" }}>Owned</span>
      ) : (
        <button
          onClick={onBuy}
          disabled={locked || !canAfford}
          style={{
            fontSize: 11, display: "flex", alignItems: "center", gap: 4,
            background: "transparent", border: "1px solid #3d2f21", borderRadius: 4, padding: "5px 10px",
            color: locked || !canAfford ? "#4a3f30" : "#c9a04a", cursor: locked || !canAfford ? "not-allowed" : "pointer",
          }}
        >
          <Coins size={11} /> {price}
        </button>
      )}
    </div>
  );
}

function PlayerRow({ row, self, children }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      background: self ? "#2f2418" : "#1e1710", border: self ? "1px solid #cc7a3c" : "1px solid #3d2f21",
      borderRadius: 5, padding: "8px 10px", gap: 8, flexWrap: "wrap",
    }}>
      <div style={{ fontSize: 12 }}>
        <span style={{ fontWeight: 600 }}>{row.name}</span>
        <span style={{ color: "#6b5f4c" }}> · Lv.{row.level}</span>
        {row.guildId && <span style={{ color: "#6b9bc9" }}> · [{row.guildId}]</span>}
        <div style={{ color: "#6b5f4c", fontSize: 10 }}>
          {row.gold} gold · {row.wins || 0}W / {row.losses || 0}L
        </div>
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------

export default function DungeonLogRPG() {
  const [screen, setScreen] = useState("login"); // login | create | game
  const [account, setAccount] = useState(null);
  const [passwordHash, setPasswordHash] = useState(null);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");

  const [player, setPlayer] = useState(null);
  const [zoneId, setZoneId] = useState("forest");
  const [combat, setCombat] = useState(null);
  const [log, setLog] = useState([mkLog("Welcome, adventurer. The dungeon awaits.", "info")]);
  const [tab, setTab] = useState("adventure");
  const [nameInput, setNameInput] = useState("");
  const [classChoice, setClassChoice] = useState("warrior");
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwMsg, setPwMsg] = useState("");

  const [players, setPlayers] = useState([]);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [pvpTarget, setPvpTarget] = useState("");
  const [pvpBusy, setPvpBusy] = useState(false);

  const [guildList, setGuildList] = useState([]);
  const [guildsLoading, setGuildsLoading] = useState(false);
  const [newGuildName, setNewGuildName] = useState("");
  const [newGuildMotto, setNewGuildMotto] = useState("");
  const [myGuild, setMyGuild] = useState(null);

  const [depositAmt, setDepositAmt] = useState("");
  const [withdrawAmt, setWithdrawAmt] = useState("");

  const [petName, setPetName] = useState("");
  const [petSpecies, setPetSpecies] = useState("wolf");

  const [, forceTick] = useState(0);
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [log]);

  // Heartbeat so pet/blessing displays stay fresh without a manual action
  useEffect(() => {
    if (screen !== "game") return;
    const id = setInterval(() => forceTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, [screen]);

  const saveKey = (handle) => `player:${handle}`;

  const saveGame = useCallback(async (p, z, handle, hashOverride) => {
    try {
      const rec = { passwordHash: hashOverride ?? passwordHash, player: p, zoneId: z };
      await window.storage.set(saveKey(handle || account), JSON.stringify(rec), true);
    } catch (e) {
      // ignore save errors, non-critical
    }
  }, [account, passwordHash]);

  const addLog = (arr, text, type) => arr.push(mkLog(text, type));

  // ---- login / accounts ----
  async function handleLogin() {
    const handle = sanitizeHandle(loginUsername);
    if (!handle) { setLoginError("Enter a username."); return; }
    if (!loginPassword) { setLoginError("Enter a password."); return; }
    setLoggingIn(true);
    setLoginError("");
    setForgotMsg("");
    try {
      const res = await window.storage.get(saveKey(handle), true);
      const hash = await sha256Hex(loginPassword);
      if (res && res.value) {
        const data = JSON.parse(res.value);
        if (data.passwordHash && hash === data.passwordHash) {
          setAccount(handle);
          setPasswordHash(data.passwordHash);
          setPlayer(data.player);
          setZoneId(data.zoneId || "forest");
          setScreen("game");
          setLog([mkLog(`Welcome back, ${data.player.name}.`, "info")]);
        } else {
          setLoginError("Incorrect password.");
        }
      } else {
        // new account
        setAccount(handle);
        setPasswordHash(hash);
        setScreen("create");
      }
    } catch (e) {
      const hash = await sha256Hex(loginPassword);
      setAccount(handle);
      setPasswordHash(hash);
      setScreen("create");
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleForgot() {
    const handle = sanitizeHandle(loginUsername);
    if (!handle) { setLoginError("Enter your username first, then tap Forgot password."); return; }
    setLoggingIn(true);
    setLoginError("");
    try {
      const res = await window.storage.get(saveKey(handle), true);
      if (!res || !res.value) {
        setLoginError("No account found with that username.");
        setLoggingIn(false);
        return;
      }
      const data = JSON.parse(res.value);
      const hash = await sha256Hex(DEFAULT_PASSWORD);
      data.passwordHash = hash;
      await window.storage.set(saveKey(handle), JSON.stringify(data), true);
      try {
        await window.storage.set(`admin_notice:${handle}:${Date.now()}`, JSON.stringify({ handle, at: new Date().toISOString() }), true);
      } catch (e) { /* best-effort admin log only */ }
      setForgotMsg(`Password reset. Log in as "${handle}" with password: ${DEFAULT_PASSWORD}`);
      setShowForgot(false);
    } catch (e) {
      setLoginError("Something went wrong. Try again.");
    } finally {
      setLoggingIn(false);
    }
  }

  function logOut() {
    setAccount(null);
    setPasswordHash(null);
    setPlayer(null);
    setCombat(null);
    setLoginUsername("");
    setLoginPassword("");
    setLoginError("");
    setForgotMsg("");
    setConfirmReset(false);
    setScreen("login");
  }

  async function changePassword() {
    setPwMsg("");
    if (!pwCurrent || !pwNew) { setPwMsg("Fill in both fields."); return; }
    if (pwNew.length < 4) { setPwMsg("New password must be at least 4 characters."); return; }
    const curHash = await sha256Hex(pwCurrent);
    if (curHash !== passwordHash) { setPwMsg("Current password is incorrect."); return; }
    const newHash = await sha256Hex(pwNew);
    setPasswordHash(newHash);
    await saveGame(player, zoneId, account, newHash);
    setPwMsg("Password updated.");
    setPwCurrent("");
    setPwNew("");
  }

  // ---- character creation ----
  function beginAdventure() {
    const name = nameInput.trim() || "Wanderer";
    const p = newPlayer(name, classChoice);
    setPlayer(p);
    setZoneId("forest");
    setScreen("game");
    setLog([mkLog(`${name} the ${CLASSES[classChoice].name} steps into the Whispering Forest.`, "info")]);
    saveGame(p, "forest", account, passwordHash);
  }

  function resetGame() {
    setPlayer(null);
    setScreen("create");
    setCombat(null);
    setNameInput("");
    setConfirmReset(false);
  }

  // ---- exploring ----
  function explore() {
    if (combat || !player) return;
    const zone = ZONES.find((z) => z.id === zoneId);
    const enemy = generateEnemy(zone, player.level);
    const newLogArr = [...log];
    addLog(newLogArr, zone.intro[Math.floor(Math.random() * zone.intro.length)], "info");
    addLog(newLogArr, enemy.isBoss ? `${enemy.name} emerges to bar your path!` : `A ${enemy.name} appears!`, enemy.isBoss ? "levelup" : "info");
    setLog(newLogArr.slice(-60));
    setCombat({ enemy });
    setTab("adventure");
  }

  function rest() {
    if (!player || combat) return;
    const cost = player.level * 5;
    if (player.gold < cost) return;
    const p = { ...player, gold: player.gold - cost, hp: player.maxHp, mp: player.maxMp };
    setPlayer(p);
    setLog([...log, mkLog(`You rest at camp for ${cost} gold. HP and MP fully restored.`, "heal")].slice(-60));
    saveGame(p, zoneId);
  }

  // ---- combat resolution ----
  function finishBlessing(p) {
    if (p.blessing) {
      const left = p.blessing.battlesLeft - 1;
      p.blessing = left > 0 ? { ...p.blessing, battlesLeft: left } : null;
    }
    return p;
  }

  function resolveTurn(playerActionLog, enemyDelta, playerDelta, fled) {
    const newLogArr = [...log, ...playerActionLog];
    let p = { ...player };
    let enemy = combat ? { ...combat.enemy } : null;

    if (playerDelta.mpChange) p.mp = clamp(p.mp + playerDelta.mpChange, 0, p.maxMp);
    if (playerDelta.hpChange) p.hp = clamp(p.hp + playerDelta.hpChange, 0, p.maxHp);

    if (fled) {
      addLog(newLogArr, "You slip away into the dark.", "info");
      setLog(newLogArr.slice(-60));
      setPlayer(p);
      setCombat(null);
      saveGame(p, zoneId);
      return;
    }

    if (enemy) enemy.hp = clamp(enemy.hp + (enemyDelta.hpChange || 0), 0, enemy.maxHp);

    if (enemy && enemy.hp <= 0) {
      addLog(newLogArr, `${enemy.name} is defeated!`, "dmg");
      let goldGain = enemy.gold;
      let xpGain = enemy.xp;
      if (p.blessing?.type === "luck") goldGain = Math.round(goldGain * p.blessing.mult);
      if (p.blessing?.type === "xp") xpGain = Math.round(xpGain * p.blessing.mult);
      addLog(newLogArr, `+${xpGain} XP  +${goldGain} gold`, "loot");
      p.gold += goldGain;
      const { player: leveled, messages } = applyXp(p, xpGain);
      p = leveled;
      messages.forEach((m) => addLog(newLogArr, m, "levelup"));
      p = finishBlessing(p);
      setLog(newLogArr.slice(-60));
      setPlayer(p);
      setCombat(null);
      saveGame(p, zoneId);
      return;
    }

    if (enemy) {
      const stats = computeCombatStats(p);
      const dmg = Math.max(1, Math.round(enemy.atk * rand(0.85, 1.15) - stats.def * 0.5));
      p.hp = clamp(p.hp - dmg, 0, p.maxHp);
      addLog(newLogArr, `${enemy.name} hits you for ${dmg} damage.`, "dmg");

      if (p.hp <= 0) {
        const lost = Math.floor(p.gold * 0.15);
        p.gold -= lost;
        p.hp = Math.max(1, Math.floor(p.maxHp * 0.3));
        addLog(newLogArr, `You collapse! You crawl back to camp, ${lost} gold lighter.`, "dmg");
        p = finishBlessing(p);
        setLog(newLogArr.slice(-60));
        setPlayer(p);
        setCombat(null);
        saveGame(p, zoneId);
        return;
      }
    }

    setLog(newLogArr.slice(-60));
    setPlayer(p);
    setCombat(enemy ? { enemy } : null);
  }

  function doAttack() {
    if (!combat || !player) return;
    const stats = computeCombatStats(player);
    const dmg = Math.max(1, Math.round(stats.atk * rand(0.85, 1.15) - combat.enemy.def * 0.5));
    const isCrit = Math.random() < 0.12;
    const finalDmg = isCrit ? Math.round(dmg * 1.6) : dmg;
    const lines = [mkLog(isCrit ? `Critical hit! You strike ${combat.enemy.name} for ${finalDmg} damage.` : `You strike ${combat.enemy.name} for ${finalDmg} damage.`, isCrit ? "crit" : "dmg")];
    resolveTurn(lines, { hpChange: -finalDmg }, {});
  }

  function doSkill() {
    if (!combat || !player) return;
    const c = CLASSES[player.classId];
    if (player.mp < c.skill.cost) return;
    const stats = computeCombatStats(player);
    const dmg = Math.max(1, Math.round(stats.atk * c.skill.mult * rand(0.9, 1.1) - combat.enemy.def * 0.5));
    const lines = [mkLog(`You cast ${c.skill.name}! ${combat.enemy.name} takes ${dmg} damage.`, "crit")];
    resolveTurn(lines, { hpChange: -dmg }, { mpChange: -c.skill.cost });
  }

  function doFlee() {
    if (!combat || !player) return;
    const success = Math.random() < 0.6;
    if (success) resolveTurn([], {}, {}, true);
    else resolveTurn([mkLog("You try to flee, but there's no escape!", "info")], {}, {});
  }

  function usePotionInCombat(id) {
    if (!combat || !player) return;
    if ((player.potions[id] || 0) <= 0) return;
    const pot = POTIONS[id];
    const lines = [];
    const delta = {};
    if (pot.heal) { delta.hpChange = pot.heal; addLog(lines, `You drink a ${pot.name}, recovering ${pot.heal} HP.`, "heal"); }
    else { delta.mpChange = pot.restore; addLog(lines, `You drink a ${pot.name}, recovering ${pot.restore} MP.`, "heal"); }
    const p = { ...player, potions: { ...player.potions, [id]: player.potions[id] - 1 } };
    setPlayer(p);
    setShowItemPicker(false);
    resolveTurn(lines, {}, delta);
  }

  function usePotionOutOfCombat(id) {
    if (!player || combat) return;
    if ((player.potions[id] || 0) <= 0) return;
    const pot = POTIONS[id];
    let p = { ...player, potions: { ...player.potions, [id]: player.potions[id] - 1 } };
    let text;
    if (pot.heal) { p.hp = clamp(p.hp + pot.heal, 0, p.maxHp); text = `You drink a ${pot.name}, recovering ${pot.heal} HP.`; }
    else { p.mp = clamp(p.mp + pot.restore, 0, p.maxMp); text = `You drink a ${pot.name}, recovering ${pot.restore} MP.`; }
    setPlayer(p);
    setLog([...log, mkLog(text, "heal")].slice(-60));
    saveGame(p, zoneId);
  }

  function buyItem(kind, id) {
    if (!player) return;
    const table = kind === "weapon" ? WEAPONS : kind === "armor" ? ARMORS : kind === "trinket" ? TRINKETS : POTIONS;
    const item = table[id];
    if (!item || player.gold < item.price || player.level < item.minLevel) return;
    let p = { ...player, gold: player.gold - item.price };
    let text;
    if (kind === "potion") {
      p.potions = { ...p.potions, [id]: (p.potions[id] || 0) + 1 };
      text = `Bought ${item.name}.`;
    } else if (kind === "weapon") {
      if (!p.ownedWeapons.includes(id)) p.ownedWeapons = [...p.ownedWeapons, id];
      p.equippedWeapon = id;
      text = `Bought and equipped ${item.name}.`;
    } else if (kind === "armor") {
      if (!p.ownedArmors.includes(id)) p.ownedArmors = [...p.ownedArmors, id];
      p.equippedArmor = id;
      text = `Bought and equipped ${item.name}.`;
    } else {
      p.antiTheftCharges = clamp((p.antiTheftCharges || 0) + 1, 0, item.maxCharges);
      text = `Bought ${item.name}. (${p.antiTheftCharges} charge${p.antiTheftCharges === 1 ? "" : "s"})`;
    }
    setPlayer(p);
    setLog([...log, mkLog(text, "loot")].slice(-60));
    saveGame(p, zoneId);
  }

  function equipGear(kind, id) {
    if (!player) return;
    let p = { ...player };
    if (kind === "weapon") p.equippedWeapon = id;
    else p.equippedArmor = id;
    setPlayer(p);
    saveGame(p, zoneId);
  }

  function storeGear(kind, id) {
    if (!player) return;
    let p = { ...player };
    if (kind === "weapon") {
      if (p.equippedWeapon === id) return;
      p.ownedWeapons = p.ownedWeapons.filter((x) => x !== id);
      p.bankedWeapons = [...(p.bankedWeapons || []), id];
    } else {
      if (p.equippedArmor === id) return;
      p.ownedArmors = p.ownedArmors.filter((x) => x !== id);
      p.bankedArmors = [...(p.bankedArmors || []), id];
    }
    setPlayer(p);
    saveGame(p, zoneId);
  }

  function withdrawGear(kind, id) {
    if (!player) return;
    let p = { ...player };
    if (kind === "weapon") {
      p.bankedWeapons = p.bankedWeapons.filter((x) => x !== id);
      p.ownedWeapons = [...p.ownedWeapons, id];
    } else {
      p.bankedArmors = p.bankedArmors.filter((x) => x !== id);
      p.ownedArmors = [...p.ownedArmors, id];
    }
    setPlayer(p);
    saveGame(p, zoneId);
  }

  function depositGold() {
    const amt = Math.floor(Number(depositAmt) || 0);
    if (!player || amt <= 0 || amt > player.gold) return;
    const p = { ...player, gold: player.gold - amt, bankGold: (player.bankGold || 0) + amt };
    setPlayer(p);
    setDepositAmt("");
    saveGame(p, zoneId);
  }

  function withdrawGold() {
    const amt = Math.floor(Number(withdrawAmt) || 0);
    if (!player || amt <= 0 || amt > (player.bankGold || 0)) return;
    const p = { ...player, gold: player.gold + amt, bankGold: player.bankGold - amt };
    setPlayer(p);
    setWithdrawAmt("");
    saveGame(p, zoneId);
  }

  // ---- god / prayer ----
  function chooseGod(godId) {
    if (!player) return;
    const p = { ...player, godId };
    setPlayer(p);
    saveGame(p, zoneId);
  }

  function pray() {
    if (!player || !player.godId) return;
    const today = new Date().toISOString().slice(0, 10);
    if (player.lastPrayerDate === today) return;
    const god = GODS.find((g) => g.id === player.godId);
    let p = { ...player, lastPrayerDate: today };
    const newLogArr = [...log];
    const roll = Math.random();
    if (roll < 0.35) {
      addLog(newLogArr, `You pray to ${god.name}... but the heavens remain silent today.`, "info");
    } else {
      const b = BLESSING_POOL[Math.floor(Math.random() * BLESSING_POOL.length)];
      if (b.id === "heal") {
        p.hp = p.maxHp;
        p.mp = p.maxMp;
        addLog(newLogArr, `${god.name} answers! You are fully restored.`, "heal");
      } else {
        p.blessing = { type: b.id, mult: b.mult, battlesLeft: 5 };
        addLog(newLogArr, `${god.name} answers! ${b.desc}`, "levelup");
      }
    }
    setPlayer(p);
    setLog(newLogArr.slice(-60));
    saveGame(p, zoneId);
  }

  // ---- players / leaderboard / pvp ----
  async function loadPlayers() {
    setPlayersLoading(true);
    try {
      const listRes = await window.storage.list("player:", true);
      const keys = (listRes && listRes.keys) || [];
      const rows = [];
      for (const k of keys) {
        try {
          const res = await window.storage.get(k, true);
          if (res && res.value) {
            const data = JSON.parse(res.value);
            if (data.player) {
              rows.push({
                handle: k.replace("player:", ""),
                name: data.player.name,
                level: data.player.level,
                gold: (data.player.gold || 0) + (data.player.bankGold || 0),
                guildId: data.player.guildId,
                wins: data.player.wins || 0,
                losses: data.player.losses || 0,
              });
            }
          }
        } catch (e) { /* skip unreadable record */ }
      }
      rows.sort((a, b) => b.level - a.level || b.gold - a.gold);
      setPlayers(rows);
    } catch (e) {
      // listing failed — leave players as-is
    } finally {
      setPlayersLoading(false);
    }
  }

  async function duel(targetHandle) {
    const handle = sanitizeHandle(targetHandle);
    if (!handle || handle === account || !player) return;
    setPvpBusy(true);
    try {
      const res = await window.storage.get(saveKey(handle), true);
      if (!res || !res.value) { setLog([...log, mkLog(`No adventurer named "${handle}" was found.`, "info")].slice(-60)); return; }
      const oppRecord = JSON.parse(res.value);
      const opp = oppRecord.player;
      const myStats = computeCombatStats(player);
      const oppStats = computeCombatStats(opp);
      const myPower = myStats.atk + myStats.def * 0.6 + player.level * 2 + rand(0, 20);
      const oppPower = oppStats.atk + oppStats.def * 0.6 + opp.level * 2 + rand(0, 20);
      const iWin = myPower >= oppPower;
      let p = { ...player };
      const newLogArr = [...log];
      if (iWin) {
        const reward = 15 + player.level * 2;
        p.wins = (p.wins || 0) + 1;
        p.gold += reward;
        addLog(newLogArr, `You challenge ${opp.name} to a duel and win! (+${reward} gold)`, "loot");
        oppRecord.player = { ...opp, losses: (opp.losses || 0) + 1 };
      } else {
        p.losses = (p.losses || 0) + 1;
        addLog(newLogArr, `You challenge ${opp.name} to a duel and lose.`, "dmg");
        oppRecord.player = { ...opp, wins: (opp.wins || 0) + 1 };
      }
      setPlayer(p);
      setLog(newLogArr.slice(-60));
      saveGame(p, zoneId);
      await window.storage.set(saveKey(handle), JSON.stringify(oppRecord), true).catch(() => {});
    } finally {
      setPvpBusy(false);
    }
  }

  async function pickpocket(targetHandle) {
    const handle = sanitizeHandle(targetHandle);
    if (!handle || handle === account || !player) return;
    setPvpBusy(true);
    try {
      const res = await window.storage.get(saveKey(handle), true);
      if (!res || !res.value) { setLog([...log, mkLog(`No adventurer named "${handle}" was found.`, "info")].slice(-60)); return; }
      const oppRecord = JSON.parse(res.value);
      const opp = oppRecord.player;
      const chance = clamp(50 + (player.level - opp.level) * 2, 10, 85);
      const newLogArr = [...log];
      if (Math.random() * 100 > chance) {
        addLog(newLogArr, `You try to pick ${opp.name}'s pocket but fumble and slip away unnoticed.`, "info");
        setLog(newLogArr.slice(-60));
        return;
      }
      if ((opp.antiTheftCharges || 0) > 0) {
        oppRecord.player = { ...opp, antiTheftCharges: opp.antiTheftCharges - 1 };
        addLog(newLogArr, `${opp.name}'s Warded Pouch glows and blocks your theft!`, "info");
        await window.storage.set(saveKey(handle), JSON.stringify(oppRecord), true).catch(() => {});
        setLog(newLogArr.slice(-60));
        return;
      }
      const stolen = Math.min(Math.floor((opp.gold || 0) * 0.15), 200);
      if (stolen <= 0) {
        addLog(newLogArr, `${opp.name} has nothing worth stealing on hand.`, "info");
        setLog(newLogArr.slice(-60));
        return;
      }
      oppRecord.player = { ...opp, gold: opp.gold - stolen };
      const p = { ...player, gold: player.gold + stolen };
      addLog(newLogArr, `You lift ${stolen} gold from ${opp.name}'s purse!`, "loot");
      setPlayer(p);
      setLog(newLogArr.slice(-60));
      saveGame(p, zoneId);
      await window.storage.set(saveKey(handle), JSON.stringify(oppRecord), true).catch(() => {});
    } finally {
      setPvpBusy(false);
    }
  }

  // ---- guilds ----
  async function loadGuilds() {
    setGuildsLoading(true);
    try {
      const listRes = await window.storage.list("guild:", true);
      const keys = (listRes && listRes.keys) || [];
      const rows = [];
      for (const k of keys) {
        try {
          const res = await window.storage.get(k, true);
          if (res && res.value) rows.push({ id: k.replace("guild:", ""), ...JSON.parse(res.value) });
        } catch (e) { /* skip */ }
      }
      setGuildList(rows);
      if (player?.guildId) setMyGuild(rows.find((g) => g.id === player.guildId) || null);
    } finally {
      setGuildsLoading(false);
    }
  }

  async function createGuild() {
    if (!player || !newGuildName.trim()) return;
    const cost = 200;
    if (player.gold < cost) { setLog([...log, mkLog("You need 200 gold to found a guild.", "info")].slice(-60)); return; }
    const guildId = sanitizeHandle(newGuildName);
    if (!guildId) return;
    try {
      const existing = await window.storage.get(`guild:${guildId}`, true);
      if (existing && existing.value) { setLog([...log, mkLog("A guild with that name already exists.", "info")].slice(-60)); return; }
    } catch (e) { /* doesn't exist, continue */ }
    const record = { name: newGuildName.trim().slice(0, 30), founder: account, members: [account], motto: newGuildMotto.trim().slice(0, 80), createdAt: Date.now() };
    await window.storage.set(`guild:${guildId}`, JSON.stringify(record), true).catch(() => {});
    const p = { ...player, gold: player.gold - cost, guildId };
    setPlayer(p);
    setNewGuildName("");
    setNewGuildMotto("");
    saveGame(p, zoneId);
    loadGuilds();
  }

  async function joinGuild(guildId) {
    if (!player) return;
    try {
      const res = await window.storage.get(`guild:${guildId}`, true);
      if (!res || !res.value) return;
      const record = JSON.parse(res.value);
      if (!record.members.includes(account)) record.members = [...record.members, account];
      await window.storage.set(`guild:${guildId}`, JSON.stringify(record), true);
      const p = { ...player, guildId };
      setPlayer(p);
      saveGame(p, zoneId);
      loadGuilds();
    } catch (e) { /* ignore */ }
  }

  async function leaveGuild() {
    if (!player || !player.guildId) return;
    const guildId = player.guildId;
    try {
      const res = await window.storage.get(`guild:${guildId}`, true);
      if (res && res.value) {
        const record = JSON.parse(res.value);
        record.members = record.members.filter((m) => m !== account);
        if (record.members.length === 0) await window.storage.delete(`guild:${guildId}`, true);
        else await window.storage.set(`guild:${guildId}`, JSON.stringify(record), true);
      }
    } catch (e) { /* ignore */ }
    const p = { ...player, guildId: null };
    setPlayer(p);
    setMyGuild(null);
    saveGame(p, zoneId);
    loadGuilds();
  }

  // ---- pet ----
  function adoptPet() {
    if (!player || player.pet) return;
    const species = PET_SPECIES.find((s) => s.id === petSpecies);
    const now = Date.now();
    const p = { ...player, pet: { name: petName.trim() || species.name, species: species.id, lastFed: now, lastWalked: now, lastBathed: now } };
    setPlayer(p);
    setPetName("");
    saveGame(p, zoneId);
  }
  function feedPet() {
    if (!player?.pet || player.gold < 8) return;
    const p = { ...player, gold: player.gold - 8, pet: { ...player.pet, lastFed: Date.now() } };
    setPlayer(p);
    saveGame(p, zoneId);
  }
  function walkPet() {
    if (!player?.pet) return;
    const p = { ...player, pet: { ...player.pet, lastWalked: Date.now() } };
    setPlayer(p);
    saveGame(p, zoneId);
  }
  function bathePet() {
    if (!player?.pet || player.gold < 5) return;
    const p = { ...player, gold: player.gold - 5, pet: { ...player.pet, lastBathed: Date.now() } };
    setPlayer(p);
    saveGame(p, zoneId);
  }

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  const fontImport = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
      * { box-sizing: border-box; }
      .dlrpg-scroll::-webkit-scrollbar { width: 6px; }
      .dlrpg-scroll::-webkit-scrollbar-thumb { background: #4a3a28; border-radius: 3px; }
      .dlrpg-scroll::-webkit-scrollbar-track { background: transparent; }
    `}</style>
  );

  if (screen === "login") {
    return (
      <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at top, #241a12 0%, #150f0a 70%)", color: "#e8dcc0", fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        {fontImport}
        <div style={{ maxWidth: 380, width: "100%" }}>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 34, textAlign: "center", color: "#d9c391", letterSpacing: 1, marginBottom: 4 }}>
            DUNGEON LOG
          </h1>
          <p style={{ textAlign: "center", color: "#8a7c68", fontSize: 12, marginBottom: 28, letterSpacing: 0.5 }}>
            a text adventure in the old style
          </p>
          <Panel style={{ padding: 20 }}>
            <label style={{ fontSize: 11, color: "#a8987f", display: "block", marginBottom: 6 }}>USERNAME</label>
            <input
              value={loginUsername}
              onChange={(e) => { setLoginUsername(e.target.value); setLoginError(""); setForgotMsg(""); }}
              placeholder="Your adventurer name..."
              style={{ width: "100%", background: "#241c15", border: "1px solid #3d2f21", borderRadius: 6, padding: "10px 12px", color: "#e8dcc0", fontFamily: "'JetBrains Mono', monospace", fontSize: 14, marginBottom: 12, outline: "none" }}
            />
            <label style={{ fontSize: 11, color: "#a8987f", display: "block", marginBottom: 6 }}>PASSWORD</label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => { setLoginPassword(e.target.value); setLoginError(""); setForgotMsg(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
              placeholder="••••••••"
              style={{ width: "100%", background: "#241c15", border: "1px solid #3d2f21", borderRadius: 6, padding: "10px 12px", color: "#e8dcc0", fontFamily: "'JetBrains Mono', monospace", fontSize: 14, marginBottom: 10, outline: "none" }}
            />
            <p style={{ fontSize: 10.5, color: "#6b5f4c", lineHeight: 1.5, marginBottom: 12 }}>
              First time? Just pick a username and password — that becomes your account. Log in with the same pair anytime to continue where you left off.
            </p>
            {loginError && <p style={{ fontSize: 11, color: "#c96a5a", marginBottom: 10 }}>{loginError}</p>}
            {forgotMsg && <p style={{ fontSize: 11, color: "#7fa864", marginBottom: 10 }}>{forgotMsg}</p>}

            <button onClick={handleLogin} disabled={loggingIn} style={{ width: "100%", background: "#cc7a3c", color: "#1a1510", border: "none", borderRadius: 6, padding: "12px 0", fontWeight: 700, fontSize: 13, cursor: loggingIn ? "default" : "pointer", fontFamily: "'Cinzel', serif", letterSpacing: 0.5, opacity: loggingIn ? 0.7 : 1, marginBottom: 10 }}>
              {loggingIn ? "..." : "LOG IN"}
            </button>

            {!showForgot ? (
              <button onClick={() => setShowForgot(true)} style={{ width: "100%", background: "transparent", border: "none", color: "#6b9bc9", fontSize: 11, cursor: "pointer" }}>
                Forgot password?
              </button>
            ) : (
              <div style={{ marginTop: 6, padding: 10, background: "#1e1710", border: "1px solid #3d2f21", borderRadius: 6 }}>
                <p style={{ fontSize: 10.5, color: "#a8987f", marginBottom: 8 }}>
                  This resets the password for "{sanitizeHandle(loginUsername) || "..."}" to <b>{DEFAULT_PASSWORD}</b> immediately. There's no email step here — a browser game can't send real email — so treat this as your notice.
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={handleForgot} disabled={loggingIn} style={{ flex: 1, background: "#8a3030", border: "none", borderRadius: 5, padding: "8px 0", color: "#f0e0d0", fontSize: 11, cursor: "pointer" }}>Reset it</button>
                  <button onClick={() => setShowForgot(false)} style={{ flex: 1, background: "transparent", border: "1px solid #3d2f21", borderRadius: 5, padding: "8px 0", color: "#a8987f", fontSize: 11, cursor: "pointer" }}>Cancel</button>
                </div>
              </div>
            )}
          </Panel>
        </div>
      </div>
    );
  }

  if (screen === "create") {
    const c = CLASSES[classChoice];
    return (
      <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at top, #241a12 0%, #150f0a 70%)", color: "#e8dcc0", fontFamily: "'JetBrains Mono', monospace", padding: "32px 16px" }}>
        {fontImport}
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 34, textAlign: "center", color: "#d9c391", letterSpacing: 1, marginBottom: 4 }}>
            DUNGEON LOG
          </h1>
          <p style={{ textAlign: "center", color: "#8a7c68", fontSize: 12, marginBottom: 28, letterSpacing: 0.5 }}>
            new adventurer · {account}
          </p>

          <label style={{ fontSize: 11, color: "#a8987f", display: "block", marginBottom: 6 }}>CHARACTER NAME</label>
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value.slice(0, 18))}
            placeholder="Enter a name..."
            style={{ width: "100%", background: "#241c15", border: "1px solid #3d2f21", borderRadius: 6, padding: "10px 12px", color: "#e8dcc0", fontFamily: "'JetBrains Mono', monospace", fontSize: 14, marginBottom: 22, outline: "none" }}
          />

          <label style={{ fontSize: 11, color: "#a8987f", display: "block", marginBottom: 8 }}>CHOOSE YOUR CLASS</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
            {Object.values(CLASSES).map((cls) => {
              const Icon = cls.Icon;
              const active = classChoice === cls.id;
              return (
                <button key={cls.id} onClick={() => setClassChoice(cls.id)} style={{ background: active ? "#2f2418" : "#1e1710", border: active ? "1px solid #cc7a3c" : "1px solid #3d2f21", borderRadius: 6, padding: "16px 8px", cursor: "pointer", color: active ? "#e8dcc0" : "#8a7c68", transition: "all 150ms", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <Icon size={22} color={active ? "#cc7a3c" : "#8a7c68"} />
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{cls.name}</span>
                </button>
              );
            })}
          </div>

          <Panel style={{ padding: 16, marginBottom: 24 }}>
            <p style={{ fontSize: 12, color: "#a8987f", marginBottom: 12, lineHeight: 1.5 }}>{c.tagline}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, fontSize: 11 }}>
              <div><span style={{ color: "#6b5f4c" }}>HP</span><br /><span style={{ color: "#c96a5a" }}>{c.baseHp}</span></div>
              <div><span style={{ color: "#6b5f4c" }}>MP</span><br /><span style={{ color: "#6b9bc9" }}>{c.baseMp}</span></div>
              <div><span style={{ color: "#6b5f4c" }}>ATK</span><br /><span style={{ color: "#cc7a3c" }}>{c.baseAtk}</span></div>
              <div><span style={{ color: "#6b5f4c" }}>DEF</span><br /><span style={{ color: "#7fa864" }}>{c.baseDef}</span></div>
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #3d2f21", fontSize: 11 }}>
              <span style={{ color: "#e0a848", fontWeight: 600 }}>{c.skill.name}</span>
              <span style={{ color: "#6b5f4c" }}> ({c.skill.cost} MP) — </span>
              <span style={{ color: "#a8987f" }}>{c.skill.desc}</span>
            </div>
          </Panel>

          <button onClick={beginAdventure} style={{ width: "100%", background: "#cc7a3c", color: "#1a1510", border: "none", borderRadius: 6, padding: "13px 0", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Cinzel', serif", letterSpacing: 0.5 }}>
            BEGIN ADVENTURE
          </button>
        </div>
      </div>
    );
  }

  // ---- main game screen ----
  const zone = ZONES.find((z) => z.id === zoneId);
  const c = CLASSES[player.classId];
  const unlockedZones = ZONES.filter((z) => player.level >= z.minLevel);
  const restCost = player.level * 5;
  const mood = petMood(player.pet);

  const TABS = [
    { id: "adventure", label: "Adventure", Icon: c.Icon },
    { id: "inventory", label: "Inventory", Icon: Backpack },
    { id: "shop", label: "Shop", Icon: Store },
    { id: "bank", label: "Bank", Icon: PiggyBank },
    { id: "guild", label: "Guild", Icon: Users },
    { id: "pvp", label: "PvP", Icon: Swords },
    { id: "god", label: "God", Icon: Sparkles },
    { id: "pet", label: "Pet", Icon: PawPrint },
    { id: "leaderboard", label: "Ranks", Icon: Trophy },
    { id: "character", label: "You", Icon: User },
  ];

  const disabledTab = (id) => !!combat && id !== "adventure";
  const lockedNote = <Panel style={{ padding: 20, textAlign: "center", color: "#6b5f4c", fontSize: 12 }}>Finish your battle first.</Panel>;

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at top, #241a12 0%, #150f0a 70%)", color: "#e8dcc0", fontFamily: "'JetBrains Mono', monospace" }}>
      {fontImport}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 14px 40px" }}>

        {/* Status bar */}
        <Panel style={{ padding: 14, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <c.Icon size={18} color="#cc7a3c" />
              <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 16, color: "#e8dcc0" }}>{player.name}</span>
              <span style={{ fontSize: 11, color: "#6b5f4c" }}>Lv.{player.level} {c.name}</span>
              {player.guildId && <span style={{ fontSize: 11, color: "#6b9bc9" }}>[{player.guildId}]</span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#c9a04a", fontSize: 13, fontWeight: 600 }}>
              <Coins size={14} /> {player.gold}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
            <StatBar value={player.hp} max={player.maxHp} colorFrom="#8a3030" colorTo="#c96a5a" label="HP" />
            <StatBar value={player.mp} max={player.maxMp} colorFrom="#2f5d80" colorTo="#6b9bc9" label="MP" />
          </div>
          <StatBar value={player.xp} max={xpToNext(player.level)} colorFrom="#7a5a1e" colorTo="#e0a848" label="XP" height={6} />
          {player.blessing && (
            <div style={{ marginTop: 8, fontSize: 10.5, color: "#e0a848" }}>
              ✦ Blessing active ({player.blessing.type}) — {player.blessing.battlesLeft} battle{player.blessing.battlesLeft === 1 ? "" : "s"} left
            </div>
          )}
        </Panel>

        {/* Tabs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 14 }}>
          {TABS.map((t) => {
            const active = tab === t.id;
            const Icon = t.Icon;
            const dis = disabledTab(t.id);
            return (
              <button key={t.id} onClick={() => setTab(t.id)} disabled={dis} style={{ flex: "1 1 18%", minWidth: 62, padding: "9px 2px", background: active ? "#2f2418" : "transparent", border: "none", borderBottom: active ? "2px solid #cc7a3c" : "2px solid transparent", color: dis ? "#4a3f30" : active ? "#e8dcc0" : "#8a7c68", fontSize: 10.5, cursor: dis ? "not-allowed" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, fontFamily: "'JetBrains Mono', monospace" }}>
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ADVENTURE TAB */}
        {tab === "adventure" && (
          <>
            {!combat && (
              <Panel style={{ padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: "#a8987f", marginBottom: 8 }}>ZONE</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  {ZONES.map((z) => {
                    const unlocked = player.level >= z.minLevel;
                    const active = z.id === zoneId;
                    const Icon = z.Icon;
                    return (
                      <button key={z.id} disabled={!unlocked} onClick={() => setZoneId(z.id)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 5, background: active ? "#3a2b1a" : "#1e1710", border: active ? "1px solid #cc7a3c" : "1px solid #3d2f21", color: unlocked ? (active ? "#e8dcc0" : "#a8987f") : "#4a3f30", fontSize: 11, cursor: unlocked ? "pointer" : "not-allowed" }}>
                        <Icon size={12} />
                        {z.name}
                        {!unlocked && <span style={{ color: "#5a4d3a" }}>· Lv{z.minLevel}</span>}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={explore} style={{ flex: 2, background: "#cc7a3c", color: "#1a1510", border: "none", borderRadius: 6, padding: "12px 0", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    EXPLORE
                  </button>
                  <button onClick={rest} disabled={player.gold < restCost} style={{ flex: 1, background: "transparent", border: "1px solid #3d2f21", borderRadius: 6, color: player.gold < restCost ? "#4a3f30" : "#7fa864", fontSize: 12, cursor: player.gold < restCost ? "not-allowed" : "pointer" }}>
                    Rest ({restCost}g)
                  </button>
                </div>
              </Panel>
            )}

            {combat && (
              <Panel style={{ padding: 14, marginBottom: 14, borderColor: combat.enemy.isBoss ? "#8a3f2a" : "#3d2f21" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {combat.enemy.isBoss && <Flame size={14} color="#cc7a3c" />}
                    <span style={{ fontWeight: 700, fontSize: 14, color: combat.enemy.isBoss ? "#e0a848" : "#e8dcc0" }}>{combat.enemy.name}</span>
                  </div>
                </div>
                <StatBar value={combat.enemy.hp} max={combat.enemy.maxHp} colorFrom="#8a3030" colorTo="#c96a5a" label="Enemy HP" />
              </Panel>
            )}

            <Panel className="dlrpg-scroll" style={{ padding: 12, height: 220, overflowY: "auto", marginBottom: 14, fontSize: 12, lineHeight: 1.6 }}>
              {log.map((l) => (
                <div key={l.id} style={{ color: LOG_COLORS[l.type], fontWeight: l.type === "levelup" || l.type === "crit" ? 600 : 400 }}>
                  {l.text}
                </div>
              ))}
              <div ref={logEndRef} />
            </Panel>

            {combat && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <button onClick={doAttack} style={actionBtnStyle("#cc7a3c")}>
                  <Sword size={14} /> Attack
                </button>
                <button onClick={doSkill} disabled={player.mp < c.skill.cost} style={actionBtnStyle(player.mp < c.skill.cost ? "#3d2f21" : "#6b9bc9", player.mp < c.skill.cost)}>
                  <Zap size={14} /> {c.skill.name} ({c.skill.cost}MP)
                </button>
                <button onClick={() => setShowItemPicker((s) => !s)} style={actionBtnStyle("#7fa864")}>
                  <Droplet size={14} /> Item
                </button>
                <button onClick={doFlee} style={actionBtnStyle("#8a7c68")}>
                  <ChevronRight size={14} /> Flee
                </button>
              </div>
            )}

            {combat && showItemPicker && (
              <Panel style={{ padding: 10, marginTop: 8 }}>
                {Object.entries(POTIONS).filter(([id]) => player.potions[id] > 0).length === 0 && (
                  <div style={{ fontSize: 11, color: "#6b5f4c" }}>No usable items.</div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {Object.entries(POTIONS).map(([id, pot]) =>
                    player.potions[id] > 0 ? (
                      <button key={id} onClick={() => usePotionInCombat(id)} style={{ display: "flex", justifyContent: "space-between", background: "#1e1710", border: "1px solid #3d2f21", borderRadius: 5, padding: "8px 10px", color: "#e8dcc0", fontSize: 12, cursor: "pointer" }}>
                        <span>{pot.name} x{player.potions[id]}</span>
                        <span style={{ color: "#7fa864" }}>{pot.heal ? `+${pot.heal} HP` : `+${pot.restore} MP`}</span>
                      </button>
                    ) : null
                  )}
                </div>
              </Panel>
            )}
          </>
        )}

        {/* INVENTORY TAB */}
        {tab === "inventory" && (combat ? lockedNote : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Panel style={{ padding: 14 }}>
              <div style={{ fontSize: 11, color: "#a8987f", marginBottom: 10 }}>POTIONS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {Object.entries(POTIONS).map(([id, pot]) => (
                  <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1e1710", border: "1px solid #3d2f21", borderRadius: 5, padding: "8px 10px" }}>
                    <div style={{ fontSize: 12 }}>{pot.name} <span style={{ color: "#6b5f4c" }}>x{player.potions[id] || 0}</span></div>
                    <button onClick={() => usePotionOutOfCombat(id)} disabled={!player.potions[id]} style={{ fontSize: 11, background: "transparent", border: "1px solid #3d2f21", borderRadius: 4, padding: "4px 10px", color: player.potions[id] ? "#7fa864" : "#4a3f30", cursor: player.potions[id] ? "pointer" : "not-allowed" }}>Use</button>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel style={{ padding: 14 }}>
              <div style={{ fontSize: 11, color: "#a8987f", marginBottom: 10 }}>WEAPONS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {player.ownedWeapons.map((id) => (
                  <GearRow key={id} item={WEAPONS[id]} equipped={player.equippedWeapon === id} statLabel="ATK" statVal={WEAPONS[id].atk} onEquip={() => equipGear("weapon", id)} onStore={() => storeGear("weapon", id)} storable={id !== "starter"} />
                ))}
              </div>
            </Panel>

            <Panel style={{ padding: 14 }}>
              <div style={{ fontSize: 11, color: "#a8987f", marginBottom: 10 }}>ARMOR</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {player.ownedArmors.map((id) => (
                  <GearRow key={id} item={ARMORS[id]} equipped={player.equippedArmor === id} statLabel="DEF" statVal={ARMORS[id].def} onEquip={() => equipGear("armor", id)} onStore={() => storeGear("armor", id)} storable={id !== "starter"} />
                ))}
              </div>
            </Panel>

            <Panel style={{ padding: 14 }}>
              <div style={{ fontSize: 11, color: "#a8987f", marginBottom: 10 }}>TRINKETS</div>
              <div style={{ fontSize: 12, color: "#a8987f" }}>
                Warded Pouch charges: <span style={{ color: "#7fa864", fontWeight: 600 }}>{player.antiTheftCharges || 0}</span>
              </div>
            </Panel>
          </div>
        ))}

        {/* SHOP TAB */}
        {tab === "shop" && (combat ? lockedNote : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Panel style={{ padding: 14 }}>
              <div style={{ fontSize: 11, color: "#a8987f", marginBottom: 10 }}>POTIONS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {Object.entries(POTIONS).map(([id, item]) => (
                  <ShopRow key={id} name={item.name} desc={item.heal ? `+${item.heal} HP` : `+${item.restore} MP`} price={item.price} locked={player.level < item.minLevel} minLevel={item.minLevel} canAfford={player.gold >= item.price} onBuy={() => buyItem("potion", id)} owned={false} />
                ))}
              </div>
            </Panel>
            <Panel style={{ padding: 14 }}>
              <div style={{ fontSize: 11, color: "#a8987f", marginBottom: 10 }}>WEAPONS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {Object.entries(WEAPONS).filter(([id]) => id !== "starter").map(([id, item]) => (
                  <ShopRow key={id} name={item.name} desc={`+${item.atk} ATK`} price={item.price} locked={player.level < item.minLevel} minLevel={item.minLevel} canAfford={player.gold >= item.price} onBuy={() => buyItem("weapon", id)} owned={player.ownedWeapons.includes(id) || (player.bankedWeapons || []).includes(id)} />
                ))}
              </div>
            </Panel>
            <Panel style={{ padding: 14 }}>
              <div style={{ fontSize: 11, color: "#a8987f", marginBottom: 10 }}>ARMOR</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {Object.entries(ARMORS).filter(([id]) => id !== "starter").map(([id, item]) => (
                  <ShopRow key={id} name={item.name} desc={`+${item.def} DEF`} price={item.price} locked={player.level < item.minLevel} minLevel={item.minLevel} canAfford={player.gold >= item.price} onBuy={() => buyItem("armor", id)} owned={player.ownedArmors.includes(id) || (player.bankedArmors || []).includes(id)} />
                ))}
              </div>
            </Panel>
            <Panel style={{ padding: 14 }}>
              <div style={{ fontSize: 11, color: "#a8987f", marginBottom: 10 }}>TRINKETS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {Object.entries(TRINKETS).map(([id, item]) => (
                  <ShopRow key={id} name={item.name} desc={item.desc} price={item.price} locked={player.level < item.minLevel} minLevel={item.minLevel} canAfford={player.gold >= item.price} onBuy={() => buyItem("trinket", id)} owned={false} />
                ))}
              </div>
            </Panel>
          </div>
        ))}

        {/* BANK TAB */}
        {tab === "bank" && (combat ? lockedNote : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Panel style={{ padding: 14 }}>
              <div style={{ fontSize: 11, color: "#a8987f", marginBottom: 10 }}>GOLD VAULT</div>
              <p style={{ fontSize: 10.5, color: "#6b5f4c", marginBottom: 10 }}>Banked gold can't be stolen in PvP.</p>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 12 }}>
                <span>On hand: <b style={{ color: "#c9a04a" }}>{player.gold}</b></span>
                <span>Banked: <b style={{ color: "#c9a04a" }}>{player.bankGold || 0}</b></span>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input value={depositAmt} onChange={(e) => setDepositAmt(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Amount" style={{ flex: 1, background: "#1e1710", border: "1px solid #3d2f21", borderRadius: 5, padding: "8px 10px", color: "#e8dcc0", fontSize: 12 }} />
                <button onClick={depositGold} style={{ padding: "8px 14px", background: "transparent", border: "1px solid #7fa864", borderRadius: 5, color: "#7fa864", fontSize: 12, cursor: "pointer" }}>Deposit</button>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={withdrawAmt} onChange={(e) => setWithdrawAmt(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Amount" style={{ flex: 1, background: "#1e1710", border: "1px solid #3d2f21", borderRadius: 5, padding: "8px 10px", color: "#e8dcc0", fontSize: 12 }} />
                <button onClick={withdrawGold} style={{ padding: "8px 14px", background: "transparent", border: "1px solid #cc7a3c", borderRadius: 5, color: "#cc7a3c", fontSize: 12, cursor: "pointer" }}>Withdraw</button>
              </div>
            </Panel>

            <Panel style={{ padding: 14 }}>
              <div style={{ fontSize: 11, color: "#a8987f", marginBottom: 10 }}>STORED GEAR</div>
              {(player.bankedWeapons || []).length === 0 && (player.bankedArmors || []).length === 0 && (
                <p style={{ fontSize: 11, color: "#6b5f4c" }}>Nothing stashed. Store spare gear from the Inventory tab.</p>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {(player.bankedWeapons || []).map((id) => (
                  <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1e1710", border: "1px solid #3d2f21", borderRadius: 5, padding: "8px 10px" }}>
                    <span style={{ fontSize: 12 }}>{WEAPONS[id].name} <span style={{ color: "#6b5f4c" }}>+{WEAPONS[id].atk} ATK</span></span>
                    <button onClick={() => withdrawGear("weapon", id)} style={{ fontSize: 11, background: "transparent", border: "1px solid #3d2f21", borderRadius: 4, padding: "4px 10px", color: "#cc7a3c", cursor: "pointer" }}>Withdraw</button>
                  </div>
                ))}
                {(player.bankedArmors || []).map((id) => (
                  <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1e1710", border: "1px solid #3d2f21", borderRadius: 5, padding: "8px 10px" }}>
                    <span style={{ fontSize: 12 }}>{ARMORS[id].name} <span style={{ color: "#6b5f4c" }}>+{ARMORS[id].def} DEF</span></span>
                    <button onClick={() => withdrawGear("armor", id)} style={{ fontSize: 11, background: "transparent", border: "1px solid #3d2f21", borderRadius: 4, padding: "4px 10px", color: "#cc7a3c", cursor: "pointer" }}>Withdraw</button>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        ))}

        {/* GUILD TAB */}
        {tab === "guild" && (combat ? lockedNote : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {player.guildId ? (
              <Panel style={{ padding: 14 }}>
                <div style={{ fontSize: 11, color: "#a8987f", marginBottom: 6 }}>YOUR GUILD</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{myGuild?.name || player.guildId}</div>
                {myGuild?.motto && <div style={{ fontSize: 11, color: "#a8987f", fontStyle: "italic", marginBottom: 8 }}>"{myGuild.motto}"</div>}
                <div style={{ fontSize: 11, color: "#6b5f4c", marginBottom: 10 }}>
                  Founder: {myGuild?.founder || "?"} · Members: {myGuild?.members?.length || 1}
                </div>
                <div style={{ fontSize: 11, color: "#a8987f", marginBottom: 12 }}>
                  {(myGuild?.members || []).join(", ")}
                </div>
                <button onClick={loadGuilds} style={{ ...actionBtnStyle("#6b9bc9"), marginBottom: 8, width: "100%" }}>
                  <RefreshCw size={13} /> Refresh
                </button>
                <button onClick={leaveGuild} style={{ width: "100%", background: "transparent", border: "1px solid #5a3030", borderRadius: 6, padding: "10px 0", color: "#a05050", fontSize: 12, cursor: "pointer" }}>
                  Leave Guild
                </button>
              </Panel>
            ) : (
              <>
                <Panel style={{ padding: 14 }}>
                  <div style={{ fontSize: 11, color: "#a8987f", marginBottom: 10 }}>FOUND A GUILD (200 gold)</div>
                  <input value={newGuildName} onChange={(e) => setNewGuildName(e.target.value.slice(0, 30))} placeholder="Guild name" style={{ width: "100%", background: "#1e1710", border: "1px solid #3d2f21", borderRadius: 5, padding: "8px 10px", color: "#e8dcc0", fontSize: 12, marginBottom: 8 }} />
                  <input value={newGuildMotto} onChange={(e) => setNewGuildMotto(e.target.value.slice(0, 80))} placeholder="Motto (optional)" style={{ width: "100%", background: "#1e1710", border: "1px solid #3d2f21", borderRadius: 5, padding: "8px 10px", color: "#e8dcc0", fontSize: 12, marginBottom: 10 }} />
                  <button onClick={createGuild} disabled={player.gold < 200 || !newGuildName.trim()} style={{ width: "100%", background: "transparent", border: "1px solid #7fa864", borderRadius: 6, padding: "10px 0", color: player.gold < 200 ? "#4a3f30" : "#7fa864", fontSize: 12, cursor: player.gold < 200 ? "not-allowed" : "pointer" }}>
                    Found Guild
                  </button>
                </Panel>
                <Panel style={{ padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: "#a8987f" }}>EXISTING GUILDS</div>
                    <button onClick={loadGuilds} style={{ background: "transparent", border: "none", color: "#6b9bc9", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                      <RefreshCw size={12} /> {guildsLoading ? "..." : "Refresh"}
                    </button>
                  </div>
                  {guildList.length === 0 && <p style={{ fontSize: 11, color: "#6b5f4c" }}>No guilds found yet. Be the first to found one!</p>}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {guildList.map((g) => (
                      <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1e1710", border: "1px solid #3d2f21", borderRadius: 5, padding: "8px 10px" }}>
                        <div style={{ fontSize: 12 }}>
                          {g.name} <span style={{ color: "#6b5f4c" }}>· {g.members?.length || 0} members</span>
                        </div>
                        <button onClick={() => joinGuild(g.id)} style={{ fontSize: 11, background: "transparent", border: "1px solid #3d2f21", borderRadius: 4, padding: "4px 10px", color: "#cc7a3c", cursor: "pointer" }}>Join</button>
                      </div>
                    ))}
                  </div>
                </Panel>
              </>
            )}
          </div>
        ))}

        {/* PVP TAB */}
        {tab === "pvp" && (combat ? lockedNote : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Panel style={{ padding: 14 }}>
              <div style={{ fontSize: 11, color: "#a8987f", marginBottom: 10 }}>CHALLENGE BY NAME</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input value={pvpTarget} onChange={(e) => setPvpTarget(e.target.value)} placeholder="Opponent's username" style={{ flex: 1, background: "#1e1710", border: "1px solid #3d2f21", borderRadius: 5, padding: "8px 10px", color: "#e8dcc0", fontSize: 12 }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <button onClick={() => duel(pvpTarget)} disabled={pvpBusy || !pvpTarget.trim()} style={actionBtnStyle("#cc7a3c", pvpBusy || !pvpTarget.trim())}>
                  <Swords size={13} /> Duel
                </button>
                <button onClick={() => pickpocket(pvpTarget)} disabled={pvpBusy || !pvpTarget.trim()} style={actionBtnStyle("#6b9bc9", pvpBusy || !pvpTarget.trim())}>
                  <Coins size={13} /> Pickpocket
                </button>
              </div>
            </Panel>

            <Panel style={{ padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "#a8987f" }}>KNOWN ADVENTURERS</div>
                <button onClick={loadPlayers} style={{ background: "transparent", border: "none", color: "#6b9bc9", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                  <RefreshCw size={12} /> {playersLoading ? "..." : "Refresh"}
                </button>
              </div>
              {players.length === 0 && <p style={{ fontSize: 11, color: "#6b5f4c" }}>Tap refresh to look for other players.</p>}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {players.filter((r) => r.handle !== account).map((row) => (
                  <PlayerRow key={row.handle} row={row}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => duel(row.handle)} disabled={pvpBusy} style={{ fontSize: 11, background: "transparent", border: "1px solid #3d2f21", borderRadius: 4, padding: "4px 8px", color: "#cc7a3c", cursor: "pointer" }}>Duel</button>
                      <button onClick={() => pickpocket(row.handle)} disabled={pvpBusy} style={{ fontSize: 11, background: "transparent", border: "1px solid #3d2f21", borderRadius: 4, padding: "4px 8px", color: "#6b9bc9", cursor: "pointer" }}>Steal</button>
                    </div>
                  </PlayerRow>
                ))}
              </div>
            </Panel>
          </div>
        ))}

        {/* GOD TAB */}
        {tab === "god" && (combat ? lockedNote : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {!player.godId ? (
              <Panel style={{ padding: 14 }}>
                <div style={{ fontSize: 11, color: "#a8987f", marginBottom: 10 }}>CHOOSE A GOD TO FOLLOW</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {GODS.map((g) => {
                    const Icon = g.Icon;
                    return (
                      <button key={g.id} onClick={() => chooseGod(g.id)} style={{ display: "flex", alignItems: "center", gap: 10, background: "#1e1710", border: "1px solid #3d2f21", borderRadius: 6, padding: "10px 12px", color: "#e8dcc0", cursor: "pointer", textAlign: "left" }}>
                        <Icon size={18} color="#cc7a3c" />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{g.name}</div>
                          <div style={{ fontSize: 10.5, color: "#6b5f4c" }}>{g.domain}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Panel>
            ) : (
              <Panel style={{ padding: 16 }}>
                {(() => {
                  const god = GODS.find((g) => g.id === player.godId);
                  const Icon = god.Icon;
                  const today = new Date().toISOString().slice(0, 10);
                  const prayedToday = player.lastPrayerDate === today;
                  return (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <Icon size={24} color="#cc7a3c" />
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700 }}>{god.name}</div>
                          <div style={{ fontSize: 11, color: "#6b5f4c" }}>{god.domain}</div>
                        </div>
                      </div>
                      <button onClick={pray} disabled={prayedToday} style={{ width: "100%", background: prayedToday ? "transparent" : "#cc7a3c", border: prayedToday ? "1px solid #3d2f21" : "none", borderRadius: 6, padding: "12px 0", color: prayedToday ? "#4a3f30" : "#1a1510", fontWeight: 700, fontSize: 13, cursor: prayedToday ? "not-allowed" : "pointer", marginBottom: 10 }}>
                        {prayedToday ? "You have prayed today" : "Pray"}
                      </button>
                      <p style={{ fontSize: 10.5, color: "#6b5f4c", marginBottom: 12 }}>One prayer per day. Sometimes the gods answer with a blessing; sometimes they're silent.</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {GODS.filter((g) => g.id !== player.godId).map((g) => (
                          <button key={g.id} onClick={() => chooseGod(g.id)} style={{ fontSize: 11, background: "transparent", border: "1px solid #3d2f21", borderRadius: 4, padding: "6px 10px", color: "#6b5f4c", cursor: "pointer", textAlign: "left" }}>
                            Switch to {g.name}
                          </button>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </Panel>
            )}
          </div>
        ))}

        {/* PET TAB */}
        {tab === "pet" && (combat ? lockedNote : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {!player.pet ? (
              <Panel style={{ padding: 14 }}>
                <div style={{ fontSize: 11, color: "#a8987f", marginBottom: 10 }}>ADOPT A PET</div>
                <input value={petName} onChange={(e) => setPetName(e.target.value.slice(0, 16))} placeholder="Pet name" style={{ width: "100%", background: "#1e1710", border: "1px solid #3d2f21", borderRadius: 5, padding: "8px 10px", color: "#e8dcc0", fontSize: 12, marginBottom: 8 }} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 12 }}>
                  {PET_SPECIES.map((s) => (
                    <button key={s.id} onClick={() => setPetSpecies(s.id)} style={{ padding: "8px 4px", background: petSpecies === s.id ? "#2f2418" : "#1e1710", border: petSpecies === s.id ? "1px solid #cc7a3c" : "1px solid #3d2f21", borderRadius: 5, color: petSpecies === s.id ? "#e8dcc0" : "#8a7c68", fontSize: 11, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <PawPrint size={14} />
                      {s.name}
                    </button>
                  ))}
                </div>
                <button onClick={adoptPet} style={{ width: "100%", background: "#cc7a3c", border: "none", borderRadius: 6, padding: "10px 0", color: "#1a1510", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Adopt</button>
              </Panel>
            ) : (
              <Panel style={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <PawPrint size={24} color="#cc7a3c" />
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{player.pet.name}</div>
                    <div style={{ fontSize: 11, color: "#6b5f4c" }}>{PET_SPECIES.find((s) => s.id === player.pet.species)?.name} · Mood {mood}%</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                  <StatBar value={petStatFromTs(player.pet.lastFed, 4)} max={100} colorFrom="#7a5a1e" colorTo="#e0a848" label="Hunger" />
                  <StatBar value={petStatFromTs(player.pet.lastWalked, 3)} max={100} colorFrom="#2f5d80" colorTo="#6b9bc9" label="Happiness" />
                  <StatBar value={petStatFromTs(player.pet.lastBathed, 2)} max={100} colorFrom="#3a5a2e" colorTo="#7fa864" label="Cleanliness" />
                </div>
                <p style={{ fontSize: 10.5, color: "#6b5f4c", marginBottom: 12 }}>
                  A happy, fed, clean pet gives up to +8% ATK/DEF in battle. Neglect just fades the bonus — your pet's never in danger.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  <button onClick={feedPet} disabled={player.gold < 8} style={actionBtnStyle(player.gold < 8 ? "#3d2f21" : "#e0a848", player.gold < 8)}>Feed (8g)</button>
                  <button onClick={walkPet} style={actionBtnStyle("#6b9bc9")}>Walk</button>
                  <button onClick={bathePet} disabled={player.gold < 5} style={actionBtnStyle(player.gold < 5 ? "#3d2f21" : "#7fa864", player.gold < 5)}>Bathe (5g)</button>
                </div>
              </Panel>
            )}
          </div>
        ))}

        {/* LEADERBOARD TAB */}
        {tab === "leaderboard" && (combat ? lockedNote : (
          <Panel style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "#a8987f" }}>LEADERBOARD</div>
              <button onClick={loadPlayers} style={{ background: "transparent", border: "none", color: "#6b9bc9", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                <RefreshCw size={12} /> {playersLoading ? "..." : "Refresh"}
              </button>
            </div>
            {players.length === 0 && <p style={{ fontSize: 11, color: "#6b5f4c" }}>Tap refresh to load rankings.</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {players.map((row, i) => (
                <PlayerRow key={row.handle} row={row} self={row.handle === account}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#e0a848" }}>#{i + 1}</span>
                </PlayerRow>
              ))}
            </div>
          </Panel>
        ))}

        {/* CHARACTER TAB */}
        {tab === "character" && (combat ? lockedNote : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Panel style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <c.Icon size={26} color="#cc7a3c" />
                <div>
                  <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 17 }}>{player.name}</div>
                  <div style={{ fontSize: 11, color: "#6b5f4c" }}>Level {player.level} {c.name}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12 }}>
                <StatLine label="Health" value={`${player.hp} / ${player.maxHp}`} color="#c96a5a" />
                <StatLine label="Mana" value={`${player.mp} / ${player.maxMp}`} color="#6b9bc9" />
                <StatLine label="Attack" value={`${totalAtk(player)} gear (${computeCombatStats(player).atk} effective)`} color="#cc7a3c" />
                <StatLine label="Defense" value={`${totalDef(player)} gear (${computeCombatStats(player).def} effective)`} color="#7fa864" />
                <StatLine label="Gold" value={`${player.gold} on hand / ${player.bankGold || 0} banked`} color="#c9a04a" />
                <StatLine label="Record" value={`${player.wins || 0}W - ${player.losses || 0}L`} color="#e0a848" />
              </div>
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #3d2f21", fontSize: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                <div><span style={{ color: "#6b5f4c" }}>Weapon: </span>{WEAPONS[player.equippedWeapon].name}</div>
                <div><span style={{ color: "#6b5f4c" }}>Armor: </span>{ARMORS[player.equippedArmor].name}</div>
                <div><span style={{ color: "#6b5f4c" }}>Guild: </span>{player.guildId || "None"}</div>
                <div><span style={{ color: "#6b5f4c" }}>God: </span>{player.godId ? GODS.find((g) => g.id === player.godId)?.name : "None"}</div>
              </div>
            </Panel>

            <Panel style={{ padding: 14 }}>
              <div style={{ fontSize: 11, color: "#a8987f", marginBottom: 10 }}>CHANGE PASSWORD</div>
              <input type="password" value={pwCurrent} onChange={(e) => setPwCurrent(e.target.value)} placeholder="Current password" style={{ width: "100%", background: "#1e1710", border: "1px solid #3d2f21", borderRadius: 5, padding: "8px 10px", color: "#e8dcc0", fontSize: 12, marginBottom: 8 }} />
              <input type="password" value={pwNew} onChange={(e) => setPwNew(e.target.value)} placeholder="New password" style={{ width: "100%", background: "#1e1710", border: "1px solid #3d2f21", borderRadius: 5, padding: "8px 10px", color: "#e8dcc0", fontSize: 12, marginBottom: 8 }} />
              {pwMsg && <p style={{ fontSize: 11, color: pwMsg === "Password updated." ? "#7fa864" : "#c96a5a", marginBottom: 8 }}>{pwMsg}</p>}
              <button onClick={changePassword} style={{ width: "100%", background: "transparent", border: "1px solid #6b9bc9", borderRadius: 6, padding: "9px 0", color: "#6b9bc9", fontSize: 12, cursor: "pointer" }}>
                Update Password
              </button>
            </Panel>

            <Panel style={{ padding: 14 }}>
              <div style={{ fontSize: 10.5, color: "#6b5f4c", marginBottom: 10 }}>Logged in as <span style={{ color: "#a8987f" }}>{account}</span></div>
              <button onClick={logOut} style={{ width: "100%", background: "transparent", border: "1px solid #3d2f21", borderRadius: 6, padding: "10px 0", color: "#a8987f", fontSize: 12, cursor: "pointer", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <LogOut size={13} /> Log Out
              </button>
              {!confirmReset ? (
                <button onClick={() => setConfirmReset(true)} style={{ width: "100%", background: "transparent", border: "1px solid #5a3030", borderRadius: 6, padding: "10px 0", color: "#a05050", fontSize: 12, cursor: "pointer" }}>
                  Start a New Game
                </button>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={resetGame} style={{ flex: 1, background: "#8a3030", border: "none", borderRadius: 6, padding: "10px 0", color: "#f0e0d0", fontSize: 12, cursor: "pointer" }}>Confirm Delete</button>
                  <button onClick={() => setConfirmReset(false)} style={{ flex: 1, background: "transparent", border: "1px solid #3d2f21", borderRadius: 6, padding: "10px 0", color: "#a8987f", fontSize: 12, cursor: "pointer" }}>Cancel</button>
                </div>
              )}
            </Panel>
          </div>
        ))}
      </div>
    </div>
  );
}
