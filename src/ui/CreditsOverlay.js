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
  const panel = document.createElement("div");
  panel.className = "credits-panel";
  panel.innerHTML = "<h2>Credits</h2>";

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

  panel.append(list, close);
  dialog.appendChild(panel);
  document.body.append(credit, dialog);
  credit.querySelector("button").addEventListener("click", () => dialog.showModal());
}
