const CREDIT_ENTRIES = [
  { caption: "OtoLogic", url: "https://otologic.jp/" },
  { caption: "arunangshubanerjee@pixabay", url: "https://pixabay.com/sound-effects/household-loopable-bathing-sound-gentle-water-movement-and-splashing-ambience-336621/" },
  { caption: "ノタの森", url: "http://notanomori.net/" },
  { caption: "u_moo3yn7s9y@pixabay", url: "https://pixabay.com/ja/users/u_moo3yn7s9y-43362546/" },
];

export function mountCreditsOverlay(entries = CREDIT_ENTRIES) {
  if (document.querySelector(".site-credit")) return;

  const unique = [...new Map(entries.map(entry => [entry.caption, entry])).values()];
  const credit = document.createElement("div");
  credit.className = "site-credit";
  credit.innerHTML = '<em>©2026 かとちん,</em> <button type="button">Others</button>';

  const dialog = document.createElement("dialog");
  dialog.className = "credits-dialog";
  dialog.tabIndex = -1;
  const title = document.createElement("h2");
  title.className = "credits-title";
  title.textContent = "Credit";
  const panel = document.createElement("div");
  panel.className = "credits-panel";
  const viewport = document.createElement("div");
  viewport.className = "credits-viewport";
  const roll = document.createElement("div");
  roll.className = "credits-roll";
  const section = document.createElement("section");
  const heading = document.createElement("h3");
  heading.textContent = "SE・BGM";

  const list = document.createElement("ul");
  for (const entry of unique) {
    const item = document.createElement("li");
    if (entry.url) {
      const link = document.createElement("a");
      link.href = entry.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = entry.caption;
      item.appendChild(link);
    } else {
      item.textContent = entry.caption;
    }
    list.appendChild(item);
  }

  const close = document.createElement("button");
  close.className = "credits-close";
  close.type = "button";
  close.textContent = "Close";
  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });

  section.append(heading,list);
  roll.appendChild(section);
  viewport.appendChild(roll);
  panel.append(viewport,close);
  dialog.append(title,panel);
  document.body.append(credit, dialog);
  let stopRoll=()=>{};
  const open=()=>{
    dialog.showModal();
    dialog.focus({preventScroll:true});
    requestAnimationFrame(()=>{stopRoll=startCreditRoll(viewport);});
  };
  const stopForInteraction=()=>stopRoll();
  viewport.addEventListener("pointerdown",stopForInteraction,{passive:true});
  viewport.addEventListener("wheel",stopForInteraction,{passive:true});
  dialog.addEventListener("close",()=>stopRoll());
  credit.querySelector("button").addEventListener("click",open);
}

function startCreditRoll(viewport){
  let frame=0,timer=0,cancelled=false,lastTime=0;
  viewport.scrollTop=0;
  const maxScroll=viewport.scrollHeight-viewport.clientHeight;
  if(maxScroll<=1)return()=>{};

  const tick=time=>{
    if(cancelled)return;
    if(!lastTime)lastTime=time;
    viewport.scrollTop=Math.min(maxScroll,viewport.scrollTop+(time-lastTime)*.018);
    lastTime=time;
    if(viewport.scrollTop>=maxScroll-.5){
      timer=window.setTimeout(()=>{
        viewport.scrollTop=0;lastTime=0;
        timer=window.setTimeout(()=>{frame=requestAnimationFrame(tick);},1000);
      },1800);
      return;
    }
    frame=requestAnimationFrame(tick);
  };
  timer=window.setTimeout(()=>{frame=requestAnimationFrame(tick);},1400);
  return()=>{cancelled=true;cancelAnimationFrame(frame);window.clearTimeout(timer);};
}
