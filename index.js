const mineflayer = require('mineflayer')
const express = require('express')
const fs = require('fs')

/* ================= CONFIG ================= */
const BOT_NAME = 'helperbot'
const SERVER_IP = 'aeroxolserver.aternos.me'
const SERVER_PORT = 19266
const VERSION = '1.21.1'
const WEB_PORT = 3000
const DATA_FILE = './data.json'
const RECONNECT_DELAY = 15000
/* ========================================= */

/* ================= EXPRESS ================= */
const app = express()
app.get('/', (_, res) => res.send('HelperBot alive'))
app.listen(WEB_PORT)
/* ========================================= */

/* ================= DATA ================= */
let data = {
  players: {},
  lastRestart: Date.now()
}

if (fs.existsSync(DATA_FILE)) {
  try {
    data = JSON.parse(fs.readFileSync(DATA_FILE))
  } catch {}
}

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

setInterval(saveData, 5 * 60 * 1000)
/* ========================================= */

/* ================= CONTENT ================= */
const jokes = [
  "I mined straight down.",
  "Creeper hugged me.",
  "Gravel won.",
  "Skill issue.",
  "Lag killed me.",
  "Bed exploded.",
  "Villagers judged me.",
  "I forgot coords."
]

const facts = [
  "Creepers were a pig bug.",
  "Minecraft released in 2009.",
  "Beds explode in Nether.",
  "Endermen hate water."
]

const descriptions = {
  help: "Shows basic commands",
  help2: "Shows fun commands",
  help3: "Shows utility commands",
  explain: "Explains any command",
  ping: "Bot replies Pong",
  joke: "Random joke",
  fact: "Random Minecraft fact",
  say: "Bot says text",
  seen: "Shows when a player was last seen"
}

/* ========================================= */

let bot
let helpInterval = null
let afkInterval = null
let lastHandled = {} // dedupe map

function startIntervals() {
  if (helpInterval) clearInterval(helpInterval)
  if (afkInterval) clearInterval(afkInterval)

  helpInterval = setInterval(() => {
    if (bot?.entity) {
      bot.chat('If you want all commands type ?help or ?help2')
    }
  }, 5 * 60 * 1000)

  afkInterval = setInterval(() => {
    if (!bot?.entity) return
    bot.look(Math.random() * Math.PI * 2, 0, true)
    bot.setControlState('jump', true)
    setTimeout(() => bot.setControlState('jump', false), 300)
  }, 60 * 1000)
}

function startBot() {
  bot = mineflayer.createBot({
    host: SERVER_IP,
    port: SERVER_PORT,
    username: BOT_NAME,
    version: VERSION
  })

  bot.once('spawn', () => {
    console.log('[BOT] Spawned')
    bot.chat('HelperBot online. Type ?help')
    startIntervals()
  })

  bot.on('playerJoined', p => {
    if (!data.players[p.username]) {
      data.players[p.username] = {
        firstJoin: Date.now(),
        lastSeen: Date.now(),
        activity: 0
      }
    }
    bot.chat(`/whisper ${p.username} Hi :)`)
  })

  /* ===== NORMAL JAVA + CONSOLE CHAT ===== */
  bot.on('chat', (username, message) => {
    handleIncoming(username, message)
  })

  /* ===== WHISPERS ===== */
  bot.on('whisper', (username, message) => {
    handleIncoming(username, message)
  })

  /* ===== MOBILE / PLUGIN FALLBACK ===== */
  bot.on('message', jsonMsg => {
    const text = jsonMsg.toString()

    // ignore system messages
    if (!text.includes('?')) return

    const match = text.match(/<(.+?)>\s(.+)/)
    if (!match) return

    handleIncoming(match[1], match[2])
  })

  bot.on('end', () => {
    console.log('[BOT] Disconnected, reconnecting...')
    if (helpInterval) clearInterval(helpInterval)
    if (afkInterval) clearInterval(afkInterval)
    setTimeout(startBot, RECONNECT_DELAY)
  })
}

function handleIncoming(username, message) {
  if (!username || username === bot.username) return

  const key = username + message
  if (lastHandled[key]) return
  lastHandled[key] = true
  setTimeout(() => delete lastHandled[key], 1000)

  if (!data.players[username]) {
    data.players[username] = {
      firstJoin: Date.now(),
      lastSeen: Date.now(),
      activity: 0
    }
  }

  const p = data.players[username]
  p.lastSeen = Date.now()
  p.activity++

  if (!message.startsWith('?')) return

  const args = message.slice(1).split(' ')
  const cmd = args.shift().toLowerCase()

  if (cmd === 'help') bot.chat('?help ?help2 ?help3 ?explain')
  else if (cmd === 'help2') bot.chat('?joke ?fact ?ping')
  else if (cmd === 'help3') bot.chat('?say ?seen')
  else if (cmd === 'explain') {
    const c = args[0]
    bot.chat(descriptions[c] ? `?${c} — ${descriptions[c]}` : 'Unknown command')
  }
  else if (cmd === 'ping') bot.chat('Pong!')
  else if (cmd === 'joke') bot.chat(jokes[Math.floor(Math.random()*jokes.length)])
  else if (cmd === 'fact') bot.chat(facts[Math.floor(Math.random()*facts.length)])
  else if (cmd === 'say') bot.chat(args.join(' '))
  else if (cmd === 'seen') bot.chat(`${username} seen before.`)
}

startBot()
