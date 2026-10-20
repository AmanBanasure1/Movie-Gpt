const chat = document.getElementById("chat");
const form = document.getElementById("chatForm");
const input = document.getElementById("msg");
const sendBtn = document.getElementById("sendBtn");
const chips = document.getElementById("chips");

let history = [];

function addBubble(text, cls) {
  const d = document.createElement("div");
  d.className = "bubble " + cls;
  d.textContent = text;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
  return d;
}

function welcome() {
  addBubble("Namaste! Main MovieGPT hoon 🎬 Bollywood, Hollywood, South, OTT ya web series, kuch bhi puchho.", "bot");
}

async function send(text) {
  text = text.trim();
  if (!text) return;
  chips.hidden = true;
  addBubble(text, "user");
  history.push({ role: "user", text });
  input.value = "";
  sendBtn.disabled = true;
  const wait = addBubble("Soch raha hoon...", "bot");

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history.slice(-12) })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed.");
    wait.textContent = data.text;
    history.push({ role: "model", text: data.text });
  } catch (e) {
    wait.textContent = "Error: " + e.message;
    wait.classList.add("error");
    history.pop();
  } finally {
    sendBtn.disabled = false;
    chat.scrollTop = chat.scrollHeight;
    input.focus();
  }
}

form.addEventListener("submit", e => { e.preventDefault(); send(input.value); });
chips.addEventListener("click", e => { if (e.target.tagName === "BUTTON") send(e.target.textContent); });
document.getElementById("clearBtn").addEventListener("click", () => {
  history = []; chat.innerHTML = ""; chips.hidden = false; welcome();
});

welcome();
