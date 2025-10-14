// ---- tiny analytics helper ----
function track(name, params = {}) {
  if (window.gtag) window.gtag("event", name, params);
}

// state
let base = null;                // "gin" | "vodka" | null
const mods = new Set();         // dry-vermouth, sweet-vermouth, bitters, simple
const garnishes = new Set();    // lemon, olive, cherry, cucumber

// elements
const glass = document.getElementById("glass");
const liquid = document.getElementById("liquid");
const surface = document.getElementById("surface");
const sparkles = document.getElementById("sparkles");
const signature = document.getElementById("signature");

// garnish elements
const garEls = {
  lemon:  document.getElementById("gar-lemon"),
  olive:  document.getElementById("gar-olive"),
  cherry: document.getElementById("gar-cherry"),
  cucumber: document.getElementById("gar-cuke"),
};

// helpers
function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
function hsl(h,s,l){ return `hsl(${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%)`; }

function recompute(){
  // base hue
  let hue = base === "gin" ? 210 : base === "vodka" ? 200 : 200;
  let darkness = 0.06;
  let sweetness = 0;
  let level = 0;

  // modifiers
  if (mods.has("dry-vermouth")) { hue += 15; level += 1; }
  if (mods.has("sweet-vermouth")){ hue += 35; sweetness += 0.2; level += 1; }
  if (mods.has("bitters"))       { hue -= 10; darkness += 0.18; level += 1; }
  if (mods.has("simple"))        { sweetness += 0.25; level += 1; }

  // garnishes: light influence + sparkle
  if (garnishes.has("lemon"))    { hue += 12; level += 0.3; }
  if (garnishes.has("olive"))    { hue -= 8;  level += 0.3; }
  if (garnishes.has("cherry"))   { hue -= 5;  level += 0.3; }
  if (garnishes.has("cucumber")) { hue -= 14; level += 0.3; }

  hue = ((hue % 360) + 360) % 360;
  const sat = clamp(40 + sweetness * 100, 40, 80);
  const light = clamp(55 - darkness * 100, 25, 55);
  const color = hsl(hue, sat, light);

  const baseLevel = base ? 0.35 : 0.0;
  const fillPct = Math.min(0.9, baseLevel + level * 0.12);

  // apply
  liquid.setAttribute("fill", color);
  const y = 210 - 160 * fillPct;
  liquid.setAttribute("y", y);
  surface.setAttribute("y", y);

  // sparkles
  const intensity = 0.4 + (sweetness * 0.8) + (garnishes.size * 0.08);
  sparkles.innerHTML = "";
  for (let i=0;i<22;i++){
    const cx = 80 + (i * 10) % 240 + (i % 3) * 6;
    const cy = (y - 5) + (i % 5) * 14;
    const c = document.createElementNS("http://www.w3.org/2000/svg","circle");
    c.setAttribute("cx", cx);
    c.setAttribute("cy", cy);
    c.setAttribute("r", "1.8");
    c.setAttribute("fill", "#fff");
    c.setAttribute("class", "sp");
    c.style.opacity = intensity;
    sparkles.appendChild(c);
  }

  // show garnishes
  Object.entries(garEls).forEach(([key, el])=>{
    el.hidden = !garnishes.has(key);
  });

  // signature text
  signature.textContent = buildSignature();
}

function buildSignature(){
  if (!base) return "Choose a base to begin.";
  const tags = [];
  if (base === "gin") tags.push("botanical");
  if (base === "vodka") tags.push("crystal-clean");
  if (mods.has("dry-vermouth")) tags.push("dry");
  if (mods.has("sweet-vermouth")) tags.push("amber-warm");
  if (mods.has("bitters")) tags.push("complex");
  if (mods.has("simple")) tags.push("silky");
  if (garnishes.has("lemon")) tags.push("citrus-bright");
  if (garnishes.has("olive")) tags.push("savory");
  if (garnishes.has("cherry")) tags.push("ruby-sweet");
  if (garnishes.has("cucumber")) tags.push("spa-fresh");

  let title = "Signature Mix";
  if (garnishes.has("olive") && mods.has("dry-vermouth")) title = "Classic Martini";
  if (mods.has("sweet-vermouth") && mods.has("bitters") && base === "vodka") title = "Vesper-ish Mood";
  if (garnishes.has("cherry") && mods.has("bitters")) title = "Playful Manhattan-Vibes";

  return `${title} — ${tags.length ? tags.join(" · ") : "minimal"}`;
}

// interactions
document.querySelectorAll("[data-base]").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll("[data-base]").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    base = btn.dataset.base;
    track("mixer_base",{ id: base });
    recompute();
  });
});

document.querySelectorAll("[data-mod]").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const id = btn.dataset.mod;
    if (mods.has(id)) { mods.delete(id); btn.classList.remove("active"); }
    else { mods.add(id); btn.classList.add("active"); }
    track("mixer_toggle",{ id, selected: mods.has(id) });
    recompute();
  });
});

document.querySelectorAll("[data-gar]").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const id = btn.dataset.gar;
    const key = id === "cucumber" ? "cucumber" : id; // map to element ids
    if (garnishes.has(key)) { garnishes.delete(key); btn.classList.remove("active"); }
    else { garnishes.add(key); btn.classList.add("active"); }
    track("mixer_toggle",{ id:key, selected: garnishes.has(key) });
    recompute();
  });
});

document.getElementById("btn-shake").addEventListener("click", ()=>{
  glass.classList.remove("shake"); void glass.offsetWidth; // restart animation
  glass.classList.add("shake");
  track("mixer_shake",{
    base,
    mods: Array.from(mods).join(","),
    garnishes: Array.from(garnishes).join(",")
  });
});

document.getElementById("btn-reset").addEventListener("click", ()=>{
  base = null; mods.clear(); garnishes.clear();
  document.querySelectorAll(".chip").forEach(b=>b.classList.remove("active"));
  Object.values(garEls).forEach(el=>el.hidden = true);
  track("mixer_reset");
  recompute();
});

// initial sparkles
recompute();
