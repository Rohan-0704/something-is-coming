// ======================
// EDIT THESE
// ======================
const CORRECT_PIN = "0219";

const INTRO_LETTER = `I made this little card just for you —
a place for our moments, our laughs, and our love.

Turn the pages slowly… like a real book.`;

const PERSONAL_LETTER = `I love you.

(Write your full letter here — it will auto-fit.)
I’m grateful for you, proud of you, and crazy about you.

Always,
Rohan`;

const SEE_YOU_IN_DAYS = 9;
const ANNIVERSARY_TARGET = new Date(2026, 1, 19, 0, 0, 0); // Feb 19, 2026
// ======================

document.addEventListener("DOMContentLoaded", () => {
  const bgMusic = document.getElementById("bgMusic");
  const musicToggle = document.getElementById("musicToggle");
  const backBtn = document.getElementById("backBtn");
  const tapHint = document.getElementById("tapHint");

  const pinScene = document.getElementById("pinScene");
  const envelopeScene = document.getElementById("envelopeScene");
  const bookScene = document.getElementById("bookScene");

  const pinInput = document.getElementById("pinInput");
  const pinBtn = document.getElementById("pinBtn");
  const pinError = document.getElementById("pinError");

  const envelopeBtn = document.getElementById("envelopeBtn");
  const envelope = document.getElementById("envelope");

  const sheets = Array.from(document.querySelectorAll(".sheet"));

  const unwrapBtn = document.getElementById("unwrapBtn");
  const giftReveal = document.getElementById("giftReveal");
  const giftNextBtn = document.getElementById("giftNextBtn");
  const finalConfettiBtn = document.getElementById("finalConfettiBtn");

  // Countdown elements
  const seeDays = document.getElementById("seeDays");
  const seeHours = document.getElementById("seeHours");
  const seeMins = document.getElementById("seeMins");
  const seeSecs = document.getElementById("seeSecs");

  const anniDays = document.getElementById("anniDays");
  const anniHours = document.getElementById("anniHours");
  const anniMins = document.getElementById("anniMins");
  const anniSecs = document.getElementById("anniSecs");

  // Confetti
  const confettiCanvas = document.getElementById("confettiCanvas");
  const ctx = confettiCanvas.getContext("2d");
  let confettiPieces = [];
  let confettiRunning = false;

  // State
  let musicEnabled = false;
  let currentSheet = 0;
  let isTurning = false;
  let envelopeOpened = false;

  // Timings
  const PAGE_TURN_MS = 1900;
  const PAGE_TURN_LOCK_MS = PAGE_TURN_MS + 260;
  const PHOTO_REVEAL_DELAY_MS = 1350;

  function showScene(sceneEl){
    [pinScene, envelopeScene, bookScene].forEach(s => s.classList.remove("active"));
    sceneEl.classList.add("active");

    // show back button only in book
    if (sceneEl === bookScene) {
      backBtn.style.opacity = currentSheet === 0 ? "0.35" : "1";
      backBtn.style.pointerEvents = "auto";
    } else {
      backBtn.style.opacity = "0";
      backBtn.style.pointerEvents = "none";
    }
  }

  function fillText(){
    const d = new Date();
    const dateStr = d.toLocaleDateString(undefined, { year:'numeric', month:'long', day:'numeric' });
    document.querySelectorAll("[data-letter-date]").forEach(el => el.textContent = dateStr);
    document.querySelectorAll("[data-intro-letter]").forEach(el => el.textContent = INTRO_LETTER);
    document.querySelectorAll("[data-personal-letter]").forEach(el => el.textContent = PERSONAL_LETTER);
  }

  // Audio
  async function tryStartMusic(){
    try{
      bgMusic.volume = 0.75;
      await bgMusic.play();
      musicEnabled = true;
      musicToggle.textContent = "🔊 Music";
      return true;
    }catch{
      musicEnabled = false;
      musicToggle.textContent = "🔇 Music";
      return false;
    }
  }

  musicToggle.addEventListener("click", () => {
    if (!musicEnabled) tryStartMusic();
    else { bgMusic.pause(); musicEnabled = false; musicToggle.textContent = "🔇 Music"; }
  });

  // iPhone: first gesture unlock
  document.addEventListener("pointerdown", () => { tryStartMusic(); }, { once:true });

  // Hearts
  document.addEventListener("pointerdown", (e) => {
    const t = e.target;
    if (t && (t.tagName === "BUTTON" || t.closest("button") || t.tagName === "INPUT")) return;
    if (tapHint) tapHint.style.opacity = "0";
    for (let i=0;i<4;i++) spawnHeart(e.clientX + (Math.random()-0.5)*26, e.clientY + (Math.random()-0.5)*26);
  });

  function spawnHeart(x,y){
    const heart = document.createElement("div");
    heart.className = "heart";
    const size = 10 + Math.random()*16;
    heart.style.width = `${size}px`;
    heart.style.height = `${size}px`;
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.background = ["#ff2d55","#ff3b7a","#ff5aa5"][Math.floor(Math.random()*3)];
    document.body.appendChild(heart);

    const drift = (Math.random()-0.5)*90;
    const duration = 1100 + Math.random()*900;
    const toY = y - (170 + Math.random()*160);

    heart.animate(
      [{ transform:`translate(0,0) rotate(${Math.random()*120}deg)`, opacity:1 },
       { transform:`translate(${drift}px, ${toY-y}px) rotate(${360+Math.random()*360}deg)`, opacity:0 }],
      { duration, easing:"cubic-bezier(.2,.8,.2,1)" }
    );
    setTimeout(()=>heart.remove(), duration+60);
  }

  // Confetti
  function resizeConfetti(){
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    confettiCanvas.width = Math.floor(window.innerWidth * dpr);
    confettiCanvas.height = Math.floor(window.innerHeight * dpr);
    confettiCanvas.style.width = window.innerWidth + "px";
    confettiCanvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  window.addEventListener("resize", resizeConfetti);
  resizeConfetti();

  function heartPath(x, y, size){
    ctx.beginPath();
    const s = size;
    ctx.moveTo(x, y + s*0.35);
    ctx.bezierCurveTo(x, y, x - s*0.5, y, x - s*0.5, y + s*0.35);
    ctx.bezierCurveTo(x - s*0.5, y + s*0.7, x, y + s*0.95, x, y + s*1.2);
    ctx.bezierCurveTo(x, y + s*0.95, x + s*0.5, y + s*0.7, x + s*0.5, y + s*0.35);
    ctx.bezierCurveTo(x + s*0.5, y, x, y, x, y + s*0.35);
    ctx.closePath();
  }

  function createConfetti(count=260){
    const colors = ["#ff2d55","#ff3b7a","#ff5aa5","#ffd1dc","#ff1744","#ffb3c7"];
    for(let i=0;i<count;i++){
      const angle = (Math.random()*Math.PI);
      const speed = 6 + Math.random()*10;
      confettiPieces.push({
        x: window.innerWidth/2 + (Math.random()-0.5)*40,
        y: window.innerHeight*0.33 + (Math.random()-0.5)*40,
        vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
        vy: -Math.sin(angle) * speed - (6 + Math.random()*6),
        g: 0.28 + Math.random()*0.18,
        drag: 0.985,
        rot: Math.random()*Math.PI*2,
        vr: (Math.random()-0.5)*0.25,
        size: 6 + Math.random()*10,
        color: colors[(Math.random()*colors.length)|0],
        life: 220 + (Math.random()*120)|0
      });
    }
    if(!confettiRunning){
      confettiRunning = true;
      requestAnimationFrame(stepConfetti);
    }
  }

  function stepConfetti(){
    ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
    confettiPieces = confettiPieces.filter(p => p.life-- > 0);

    for(const p of confettiPieces){
      p.vx *= p.drag; p.vy *= p.drag; p.vy += p.g;
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;

      const alpha = Math.max(0, Math.min(1, p.life/160));
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      heartPath(0,0,p.size);
      ctx.fill();
      ctx.restore();
    }

    if(confettiPieces.length > 0) requestAnimationFrame(stepConfetti);
    else { confettiRunning = false; ctx.clearRect(0,0,window.innerWidth,window.innerHeight); }
  }

  // PIN
  function checkPin(){
    const val = (pinInput.value || "").trim();
    if (val === CORRECT_PIN){
      pinError.style.display = "none";
      showScene(envelopeScene);
      resetEnvelope();
      tryStartMusic();
    } else {
      pinError.style.display = "block";
      pinInput.value = "";
      pinInput.focus();
    }
  }
  pinBtn.addEventListener("pointerup", (e) => { e.preventDefault(); checkPin(); }, { passive:false });
  pinBtn.addEventListener("click", (e) => { e.preventDefault(); checkPin(); });
  pinInput.addEventListener("keydown", (e) => { if (e.key === "Enter") checkPin(); });

  function resetEnvelope(){
    envelopeOpened = false;
    envelope.classList.remove("open");
  }

  // Envelope open -> transition into book
  envelopeBtn.addEventListener("click", () => {
    if (envelopeOpened) return;
    envelopeOpened = true;

    tryStartMusic();
    envelope.classList.add("open");

    // let the letter slide out fully, then fade into book
    setTimeout(() => {
      showScene(bookScene);
      currentSheet = 0;
      renderBook();
    }, 1700);
  });

  // Book
  function renderBook(){
    const total = sheets.length;
    sheets.forEach((sheet, idx) => {
      sheet.style.zIndex = String(total - idx);
      if (idx < currentSheet) sheet.classList.add("flipped");
      else sheet.classList.remove("flipped");
      sheet.classList.remove("top");
    });
    sheets[currentSheet]?.classList.add("top");

    backBtn.style.opacity = currentSheet === 0 ? "0.35" : "1";
    backBtn.style.pointerEvents = "auto";
  }

  function next(){
    if (isTurning) return;
    if (currentSheet >= sheets.length - 1) return;
    isTurning = true;

    const turning = sheets[currentSheet];
    turning?.classList.add("turning");

    currentSheet += 1;
    renderBook();

    setTimeout(() => {
      turning?.classList.remove("turning");
      revealOnSheet(currentSheet);
      isTurning = false;
    }, PAGE_TURN_LOCK_MS);
  }

  function prev(){
    if (isTurning) return;
    if (currentSheet <= 0) return;
    isTurning = true;

    const turning = sheets[currentSheet - 1];
    turning?.classList.add("turning");

    currentSheet -= 1;
    renderBook();

    setTimeout(() => {
      turning?.classList.remove("turning");
      revealOnSheet(currentSheet);
      isTurning = false;
    }, PAGE_TURN_LOCK_MS);
  }

  backBtn.addEventListener("click", prev);

  // Global Next
  document.querySelectorAll("[data-next]").forEach(btn => {
    btn.addEventListener("click", (e) => { e.preventDefault(); next(); });
    btn.addEventListener("pointerup", (e) => { e.preventDefault(); next(); }, { passive:false });
  });

  // Gift Next (reliable)
  function giftGoNext(e){
    e.preventDefault();
    e.stopPropagation();
    next();
  }
  if (giftNextBtn){
    giftNextBtn.addEventListener("click", giftGoNext, true);
    giftNextBtn.addEventListener("pointerup", giftGoNext, true);
    giftNextBtn.addEventListener("touchend", giftGoNext, { passive:false });
  }

  // Photo reveal (strict order)
  function revealOnSheet(sheetIndex){
    const sheet = sheets[sheetIndex];
    const front = sheet?.querySelector(".page.face.front");
    if (!front) return;

    const grid = front.querySelector(".photo-grid");
    const nextBtn = front.querySelector(".nextBtn");
    if (!grid || !nextBtn) return;

    nextBtn.classList.add("hidden");

    const wraps = Array.from(grid.querySelectorAll(".pwrap"))
      .sort((a,b) => Number(a.dataset.i) - Number(b.dataset.i));

    wraps.forEach(w => w.classList.remove("show"));
    wraps.forEach((w, i) => setTimeout(() => w.classList.add("show"), i * PHOTO_REVEAL_DELAY_MS));

    const total = wraps.length * PHOTO_REVEAL_DELAY_MS + 900;
    setTimeout(() => nextBtn.classList.remove("hidden"), total);

    Array.from(grid.querySelectorAll(".polaroid")).forEach(p => {
      p.onclick = () => p.classList.toggle("flipped");
    });
  }

  // Gift open
  unwrapBtn?.addEventListener("click", () => {
    giftReveal.classList.add("show");
    createConfetti(340);
    unwrapBtn.disabled = true;
    unwrapBtn.textContent = "Opened 💝";
  });

  // Museum confetti
const museumToast = document.getElementById("museumToast");
const toastCloseBtn = document.getElementById("toastCloseBtn");

function showToast(){
  if (!museumToast) return;
  museumToast.classList.add("show");
  museumToast.setAttribute("aria-hidden", "false");
}

function hideToast(){
  if (!museumToast) return;
  museumToast.classList.remove("show");
  museumToast.setAttribute("aria-hidden", "true");
}

finalConfettiBtn?.addEventListener("click", () => {
  createConfetti(420);
  showToast();
});

toastCloseBtn?.addEventListener("click", hideToast);
museumToast?.addEventListener("click", (e) => {
  // click outside card closes
  if (e.target === museumToast) hideToast();
});


  // Countdowns
  const seeTarget = new Date(Date.now() + SEE_YOU_IN_DAYS * 24 * 60 * 60 * 1000);
  function pad2(n){ return String(n).padStart(2, "0"); }

  function updateCountdown(target, els){
    const now = new Date();
    let diff = Math.max(0, target - now);

    const d = Math.floor(diff / (24*60*60*1000));
    diff -= d * (24*60*60*1000);
    const h = Math.floor(diff / (60*60*1000));
    diff -= h * (60*60*1000);
    const m = Math.floor(diff / (60*1000));
    diff -= m * (60*1000);
    const s = Math.floor(diff / 1000);

    els.days.textContent = String(d);
    els.hours.textContent = pad2(h);
    els.mins.textContent = pad2(m);
    els.secs.textContent = pad2(s);
  }

  setInterval(() => {
    if (seeDays) updateCountdown(seeTarget, { days:seeDays, hours:seeHours, mins:seeMins, secs:seeSecs });
    if (anniDays) updateCountdown(ANNIVERSARY_TARGET, { days:anniDays, hours:anniHours, mins:anniMins, secs:anniSecs });
  }, 250);

  // Init
  fillText();
  showScene(pinScene);
  renderBook();
});
