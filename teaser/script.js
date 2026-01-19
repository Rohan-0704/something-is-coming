// Unlock at 12:00 AM Feb 14 (viewer’s local time)
const OPEN_AT = new Date(2026, 1, 14, 0, 0, 0); // month 1 = Feb
// Main site link: repo root (one level up from /teaser/)
const MAIN_URL = "../";

function pad2(n){ return String(n).padStart(2,"0"); }

function tick(){
  const cd = document.getElementById("countdown");
  const openBtn = document.getElementById("openBtn");
  const openNote = document.getElementById("openNote");

  const now = new Date();
  let diff = OPEN_AT - now;

  if (diff <= 0){
    cd.textContent = "Unlocked 💗";
    if (openBtn){
      openBtn.classList.remove("disabled");
      openBtn.setAttribute("aria-disabled", "false");
      openBtn.href = MAIN_URL;
    }
    if (openNote) openNote.textContent = "It’s time. Open it 💌";
    return;
  }

  const d = Math.floor(diff / (24*60*60*1000));
  diff -= d * (24*60*60*1000);
  const h = Math.floor(diff / (60*60*1000));
  diff -= h * (60*60*1000);
  const m = Math.floor(diff / (60*1000));
  diff -= m * (60*1000);
  const s = Math.floor(diff / 1000);

  cd.textContent = `${d}d ${pad2(h)}h ${pad2(m)}m ${pad2(s)}s`;

  // ensure locked while counting down
  if (openBtn){
    openBtn.classList.add("disabled");
    openBtn.setAttribute("aria-disabled", "true");
    openBtn.href = "#";
  }
}

tick();
setInterval(tick, 250);
