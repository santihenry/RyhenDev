// 1. IMPORTAMOS EL SDK OFICIAL DE GEMINI (ES6 Modules)
import { GoogleGenAI } from "https://esm.run";

let player = {};
let gameHistory = [];
let speechEnabled = true;
let currentConfig = {};

const SYSTEM_PROMPT = `Eres un Dungeon Master experto. Narra de forma inmersiva, coherente y avanza la historia. 
Evalúa las acciones del jugador según el resultado del dado D20 que se te proporciona. 
Si el resultado es bajo (menos de 8), describe un fallo o complicación; si es alto (15-20), describe un éxito rotundo.

IMPORTANTE: Debes responder ÚNICAMENTE con un objeto JSON válido que tenga esta estructura exacta, sin bloques de código markdown:
{
  "narrativa": "Tu narración de máximo 2 párrafos aquí.",
  "cambioHp": 0,
  "itemsNuevos": [],
  "itemsPerdidos": [],
  "oroModificado": 0
}`;

async function callGemini(prompt, textoOriginalJugador) {
  const apiKey = document.getElementById("api-key-input").value.trim();
  if (!apiKey) {
    addToLog(`<strong>Master:</strong> ❌ Ingresa tu API Key en la barra lateral.`, "danger");
    return null;
  }

  // Estructura de mensajes para el SDK oficial
  let contents = [
    { 
      role: "user", 
      parts: [{ text: `${SYSTEM_PROMPT}\nMundo: ${currentConfig.mundo}\nTono: ${currentConfig.tono}\nEstado Inicial del Jugador: ${JSON.stringify(player)}` }] 
    },
    { 
      role: "model", 
      parts: [{ text: "Entendido. Responderé estrictamente con la estructura JSON solicitada." }] 
    }
  ];

  gameHistory.forEach(msg => {
    contents.push({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    });
  });

  contents.push({ role: "user", parts: [{ text: prompt }] });

  try {
    // Inicializamos el cliente usando la librería oficial conectada a tu API Key gratuita
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        temperature: 0.75,
        responseMimeType: "application/json" // Forzamos formato JSON nativo desde los servidores de Google
      }
    });

    const rawText = response.text.trim();
    const jsonResponse = JSON.parse(rawText);
    let reply = (jsonResponse.narrativa || "").replace(/^(Master:|El Master:)\s*/i, '').trim();

    // Gestión automática del estado del personaje en memoria
    player.hp = Math.max(0, Math.min(player.maxHp, player.hp + (jsonResponse.cambioHp || 0)));
    player.gold = Math.max(0, player.gold + (jsonResponse.oroModificado || 0));
    
    if (jsonResponse.itemsNuevos && jsonResponse.itemsNuevos.length > 0) {
      jsonResponse.itemsNuevos.forEach(item => player.inventory.push(item));
    }
    if (jsonResponse.itemsPerdidos && jsonResponse.itemsPerdidos.length > 0) {
      player.inventory = player.inventory.filter(item => !jsonResponse.itemsPerdidos.includes(item));
    }

    // Persistencia del hilo argumental
    gameHistory.push({ role: "user", content: textoOriginalJugador });
    gameHistory.push({ role: "assistant", content: reply });
    if (gameHistory.length > 20) gameHistory.splice(0, 2);

    updateCharacterInfo();

    if (speechEnabled) speak(reply);
    return reply;

  } catch (e) {
    console.error("Detalles del error de la API:", e);
    return `<span style="color:#f87171;">Fallo del sistema: ${e.message}</span>`;
  }
}

function speak(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'es-ES';
    u.rate = 1.05;
    window.speechSynthesis.speak(u);
  }
}

/* ====================== CONFIG Y INICIO ====================== */
function createConfigScreen() {
  document.getElementById("config-form").innerHTML = `
    <h2>🎮 Crea tu Aventura</h2>
    <label>Mundo</label>
    <select id="config-mundo">
      <option>Medieval fantástico</option>
      <option>Medieval oscuro</option>
      <option>Cyberpunk</option>
      <option>Apocalipsis zombie</option>
    </select>

    <label>Tono</label>
    <select id="config-tono">
      <option>Serio e inmersivo</option>
      <option>Oscuro</option>
      <option>Épico</option>
    </select>

    <button id="start-adventure-btn" class="start-btn">🚀 Comenzar Aventura</button>
  `;
  document.getElementById("start-adventure-btn").onclick = startAdventure;
}

function startAdventure() {
  currentConfig.mundo = document.getElementById("config-mundo").value;
  currentConfig.tono = document.getElementById("config-tono").value;

  document.getElementById("config-screen").classList.remove("active");
  document.getElementById("game-screen").classList.add("active");

  player = {
    name: "Eldrin",
    race: "Humano",
    class: "Guerrero",
    hp: 30, maxHp: 30,
    gold: 25,
    inventory: ["Espada corta", "Antorcha", "Poción de curación"]
  };

  document.getElementById("char-name-sidebar").textContent = player.name;
  updateCharacterInfo();

  addToLog(`<strong>Master:</strong> Has entrado en un mundo de <strong>${currentConfig.mundo}</strong> bajo un tono <strong>${currentConfig.tono}</strong>.`, "info");
  addToLog(`<strong>Master:</strong> Despiertas en este lugar... ¿Qué deseas hacer?`, "info");
}

function updateCharacterInfo() {
  document.getElementById("character-info").innerHTML = `
    <p><strong>${player.race} ${player.class}</strong></p>
    <hr>
    <p>❤️ PV: <strong>${player.hp}/${player.maxHp}</strong></p>
    <p>💰 Oro: <strong>${player.gold}</strong></p>
    <p><strong>Inventario:</strong></p>
    <ul>${player.inventory.map(i => `<li>${i}</li>`).join("")}</ul>
  `;
}

function addToLog(message, type = "") {
  const log = document.getElementById("log");
  const p = document.createElement("p");
  if (type === "danger") p.style.color = "#f87171";
  if (type === "info") p.style.color = "#60a5fa";
  p.innerHTML = message;
  log.appendChild(p);
  log.scrollTop = log.scrollHeight;
}

async function sendAction() {
  const input = document.getElementById("action-input");
  const text = input.value.trim();
  if (!text) return;

  const dado = Math.floor(Math.random() * 20) + 1;
  
  addToLog(`<strong>→ ${text}</strong> <span style="color:#f59e0b;">(🎲 Dado: D20 obtuvo ${dado})</span>`, "info");
  input.value = "";

  const thinking = document.createElement("p");
  thinking.textContent = "El Master está pensando...";
  thinking.style.fontStyle = "italic";
  document.getElementById("log").appendChild(thinking);

  const promptConMecanica = `Acción del jugador: "${text}". Mecánica de juego: El jugador tiró un dado de 20 caras (D20) para esta acción y sacó un: ${dado}. Aplica consecuencias físicas basadas en este valor.`;

  const reply = await callGemini(promptConMecanica, text);
  thinking.remove();
  
  if (reply) {
    if (reply.includes("Fallo del sistema:")) {
      addToLog(`<strong>Master:</strong> ${reply}`, "danger");
    } else {
      addToLog(`<strong>Master:</strong> ${reply}`);
    }
  }
}

// Mapeos al objeto Window requeridos debido al entorno aislado del módulo ES6
window.quickAction = function(action) {
  document.getElementById("action-input").value = action;
  sendAction();
};

window.toggleSpeech = function() {
  speechEnabled = !speechEnabled;
  const btn = document.getElementById("speech-btn");
  btn.textContent = speechEnabled ? "🔊 Voz Activada" : "🔇 Voz Desactivada";
};

window.resetAll = function() {
  if (confirm("¿Empezar una nueva aventura?")) location.reload();
};

window.sendAction = sendAction;

window.onload = createConfigScreen;
