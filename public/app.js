const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

/* ---------- State ---------- */
const state = {
  step: 0,        // 0..4
  color: null,    // hex
  label: null,    // "Joy", etc.
  texture: null,  // "fluid" | "sparkly" | "structured" | "chaotic"
  energy: null,   // "dreaming" | "building" | "reflecting" | "exploring"
  purpose: null,  // "giver" | "taker" | "pleaser" | "builder" | "seeker"
  sound: (localStorage.getItem("cq-sound") ?? "on") === "on"
};

/* ---------- Progress (welcome + 4 rounds = 5 positions) ---------- */
function setProgress(step){
  state.step = step;
  const pct = [0, 25, 50, 75, 100][step] ?? 0;
  $("#progress span").style.width = pct + "%";
}

/* ---------- Background tint ---------- */
function setBgTint(hex){
  document.documentElement.style.setProperty("--accent", hex);
  $(".bg-gradient").style.filter = `blur(140px) opacity(.28) hue-rotate(${Math.floor(Math.random()*360)}deg)`;
}

/* ---------- Simple chime ---------- */
let audioCtx;
function chime(freq=660, dur=0.08){
  if(!state.sound) return;
  try{
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "sine"; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.15, audioCtx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    o.connect(g).connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + dur);
  }catch(_e){}
}

/* ---------- Cursor sparkles ---------- */
const particleLayer = $(".particles");
document.addEventListener("mousemove", (e)=>{
  const s = document.createElement("span");
  s.className = "spark";
  const size = 4 + Math.random()*6;
  s.style.width = size+"px"; s.style.height = size+"px";
  s.style.left = (e.clientX - size/2) + "px";
  s.style.top  = (e.clientY - size/2) + "px";
  s.style.position="fixed";
  s.style.background = "#ffffff55";
  s.style.borderRadius = "999px";
  s.style.pointerEvents = "none";
  s.style.filter = "blur(0.5px)";
  s.style.transition = "transform .6s ease, opacity .6s ease";
  particleLayer.appendChild(s);
  requestAnimationFrame(()=>{
    s.style.transform = `translate(${(Math.random()*20-10)}px, ${-18 - Math.random()*12}px)`;
    s.style.opacity = "0";
  });
  setTimeout(()=> s.remove(), 650);
});

/* ---------- Confetti ---------- */
function confettiBurst(color){
  const n = 26;
  for(let i=0;i<n;i++){
    const el = document.createElement("i");
    el.style.position="fixed";
    el.style.left = (window.innerWidth*0.5) + "px";
    el.style.top  = (window.innerHeight*0.25) + "px";
    el.style.width = "8px"; el.style.height = "14px";
    el.style.background = i%3? color : "#fff";
    el.style.transform = `translate(${(Math.random()*2-1)*10}px,-10px) rotate(${Math.random()*360}deg)`;
    el.style.borderRadius = "2px";
    el.style.boxShadow = "0 0 8px #0006";
    el.style.pointerEvents="none";
    el.style.transition = "transform 900ms cubic-bezier(.2,.8,.2,1), opacity 900ms";
    document.body.appendChild(el);
    const dx = (Math.random()*2-1)* (window.innerWidth*0.6);
    const dy = (window.innerHeight*0.8) + Math.random()*120;
    requestAnimationFrame(()=>{
      el.style.transform = `translate(${dx}px, ${dy}px) rotate(${Math.random()*720}deg)`;
      el.style.opacity = "0";
    });
    setTimeout(()=> el.remove(), 1000);
  }
}

/* ---------- Signature render ---------- */
function renderSignature(){
  const box = $("#signature");
  box.innerHTML = "";
  const base = state.color || "#8ab4ff";

  const vary = (hex, amt)=>{
    const n = parseInt(hex.slice(1),16);
    let r=(n>>16)&255, g=(n>>8)&255, b=n&255;
    r=Math.max(0,Math.min(255,r+amt));
    g=Math.max(0,Math.min(255,g+amt));
    b=Math.max(0,Math.min(255,b+amt));
    return `#${((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}`;
  };

  const textureMap = {
    fluid:    {shadow:"0 0 24px #ffffff22 inset", scale:1.02},
    sparkly:  {shadow:"0 0 0 transparent, 0 0 16px #fff3", scale:1.0},
    structured:{shadow:"0 0 0 #000 inset, 0 0 0 #000", scale:1.0},
    chaotic:  {shadow:"0 0 20px #000a inset, 0 0 0 #000", scale:1.06}
  };

  const energyMap = {
    dreaming:  (i)=> i%2===0 ? vary(base,18) : vary(base,-8),
    building:  (i)=> vary(base, (i%3===0?28:-12)),
    reflecting:(i)=> i<10 ? vary(base,-14) : vary(base,20),
    exploring: (i)=> vary(base, Math.floor(Math.random()*44)-22)
  };

  for(let i=0;i<30;i++){
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.style.background = energyMap[state.energy || "dreaming"](i);
    const t = textureMap[state.texture || "fluid"];
    cell.style.boxShadow = t.shadow;
    cell.style.transform = `scale(${t.scale})`;
    box.appendChild(cell);
  }

  const name = ({Joy:"Radiant", Calm:"Serene", Passion:"Fierce", Growth:"Emergent"})[state.label] || "Chromatic";
  const energyTitle = ({dreaming:"Dreamer", building:"Builder", reflecting:"Seeker", exploring:"Explorer"})[state.energy] || "Creator";
  const purposeNoun = ({
    giver:"Giver",
    taker:"Taker",
    pleaser:"Pleaser",
    builder:"Builder",
    seeker:"Seeker"
  })[state.purpose] || "Creator";

  $("#blurb").textContent =
    `${name} ${energyTitle} — in ${state.label || "Color"} mode with ${state.texture || "fluid"} texture, ` +
    `walking the long road as a ${purposeNoun}.`;

  confettiBurst(base);
}

/* ---------- Screen nav ---------- */
function show(id){
  $$(".screen").forEach(s => s.classList.remove("active"));
  $(id).classList.add("active");
  setProgress({
    "#screen-welcome":0,
    "#screen-round1":1,
    "#screen-round2":2,
    "#screen-round3":3,
    "#screen-round4":4,
    "#screen-result":4
  }[id] ?? 0);
}

/* ---------- Event wiring ---------- */
document.addEventListener("click", (e)=>{
  const t = e.target;

  if (t.matches('[data-action="start"]')){
    chime(720,.1);
    show("#screen-round1");
  }
  if (t.matches("#screen-round1 .chip")){
    state.color = t.dataset.color;
    state.label = t.dataset.label;
    setBgTint(state.color);
    chime(760,.07);
    show("#screen-round2");
  }
  if (t.matches("#screen-round2 .chip")){
    state.texture = t.dataset.texture;
    document.querySelector(".particles").style.opacity = ".30";
    chime(660,.07);
    show("#screen-round3");
  }
  if (t.matches("#screen-round3 .chip")){
    state.energy = t.dataset.energy;
    chime(580,.08);
    show("#screen-round4");
  }
  if (t.matches("#screen-round4 .chip")){
    state.purpose = t.dataset.purpose;
    chime(520,.09);
    renderSignature();
    show("#screen-result");
  }
  if (t.matches('[data-action="replay"]')){
    state.color = state.label = state.texture = state.energy = state.purpose = null;
    document.querySelector(".particles").style.opacity = ".22";
    chime(600,.06);
    show("#screen-round1");
  }
  if (t.matches('[data-action="surprise"]')){
    surprise();
  }
  if (t.matches('#soundToggle')){
    state.sound = !state.sound;
    t.setAttribute("aria-pressed", String(state.sound));
    t.textContent = state.sound ? "🔊 Sound" : "🔈 Sound";
    localStorage.setItem("cq-sound", state.sound ? "on" : "off");
  }
});

/* Surprise path with long-term purpose */
function surprise(){
  const colors = [
    {hex:"#ffd166", label:"Joy"},
    {hex:"#6ecbff", label:"Calm"},
    {hex:"#ff6b6b", label:"Passion"},
    {hex:"#6ee7b7", label:"Growth"}
  ];
  const textures = ["fluid","sparkly","structured","chaotic"];
  const energies = ["dreaming","building","reflecting","exploring"];
  const purposes = ["giver","taker","pleaser","builder","seeker"];

  const c = colors[Math.floor(Math.random()*colors.length)];
  state.color = c.hex; state.label = c.label;
  state.texture = textures[Math.floor(Math.random()*textures.length)];
  state.energy  = energies[Math.floor(Math.random()*energies.length)];
  state.purpose = purposes[Math.floor(Math.random()*purposes.length)];
  setBgTint(state.color);
  renderSignature();
  show("#screen-result");
}

/* init */
(function init(){
  const btn = $("#soundToggle");
  btn.setAttribute("aria-pressed", String(state.sound));
  btn.textContent = state.sound ? "🔊 Sound" : "🔈 Sound";
  setProgress(0);
})();
