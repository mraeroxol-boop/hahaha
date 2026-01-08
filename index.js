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
  "I lost diamonds.",
  "Skill issue.",
  "Lag killed me.",
  "Herobrine blocked me.",
  "Villagers judged me.",
  "Bed exploded.",
  "I trusted sand.",
  "Pickaxe broke.",
  "Dog pushed me.",
  "Void waved.",
  "Water saved me.",
  "Night skipped me.",
  "Enderman stole my block.",
  "I forgot coords.",
  "I punched a tree.",
  "Gold pick moment.",
  "Lava moment."
]

const facts = [
  "Creepers were a pig bug.",
  "Minecraft released in 2009.",
  "Beds explode in Nether.",
  "Endermen hate water.",
  "Ghasts sound like cats.",
  "Villagers gossip.",
  "Gold mines faster.",
  "Foxes can hold items."
]

const eightBall = [
  "Yes", "No", "Maybe", "Definitely", "Never", "Ask later"
]

const fortunes = [
  "Luck is on your side.",
  "Something good is coming.",
  "Today is average.",
  "Unexpected event soon.",
  "You will find diamonds."
]

/* ================= COMMAND DESCRIPTIONS ================= */
const descriptions = {
  help: "Shows basic commands",
  help2: "Shows fun commands",
  help3: "Shows utility commands",
  explain: "Explains any command",

  seen: "Shows when a player was last seen",
  firstjoin: "Shows first join time",
  firstmsg: "Shows first message time",
  mostplaytime: "Most active player",
  mymostplaytime: "Your activity score",
  online: "Shows online players",
  uptime: "Bot uptime",
  ping: "Bot replies Pong",
  time: "Shows server time",
  date: "Shows today date",
  version: "Bot version",

  joke: "Random joke",
  fact: "Random Minecraft fact",
  noobrate: "Random noob percent",
  rate: "Random rating",
  luck: "Luck percentage",
  iq: "Fake IQ",
  flip: "Coin flip",
  dice: "Roll dice",
  "8ball": "Magic 8ball",
  fortune: "Random fortune",
  random: "Random number",
  yesno: "Yes or no",

  say: "Bot says text",
  sayto: "Private message player",
  repeat: "Repeat text",
  whisperme: "Bot whispers you",
  gpt: "Placeholder AI reply",
  afkcheck: "Checks anti-AFK",
  memory: "Saved player count",
  save: "Force save",
  stats: "Player stats",
  activity: "Player activity",
  seenme: "Your last seen",
  botname: "Bot username",
  owner: "Bot owner",
  about: "About the bot",
  storage: "Shows data file size",
  lastrestart: "Last restart time",
  welcome: "Welcome message preview"
}
/* ======================================================= */

let bot

function startBot() {
  bot = mineflayer.createBot({
    host: SERVER_IP,
    port: SERVER_PORT,
    username: BOT_NAME,
    version: VERSION
  })

  bot.once('spawn', () => {
    console.log('[BOT] Spawned')
    bot.chat('HelperBot online. Type ?help or ?help2')

    /* Help reminder */
    setInterval(() => {
      bot.chat('If you want all commands type ?help or ?help2')
    }, 5 * 60 * 1000)

    /* Anti-AFK always ON */
    setInterval(() => {
      if (!bot.entity) return
      bot.look(Math.random() * Math.PI * 2, 0, true)
      bot.setControlState('jump', true)
      setTimeout(() => bot.setControlState('jump', false), 300)
    }, 60000)
  })

  bot.on('playerJoined', p => {
    if (!data.players[p.username]) {
      data.players[p.username] = {
        firstJoin: Date.now(),
        firstMsg: null,
        lastSeen: null,
        activity: 0
      }
    }
    bot.chat(`/whisper ${p.username} Hi :)`)
  })

  bot.on('chat', (username, message) => {
    if (username === bot.username) return
    if (!data.players[username]) {
      data.players[username] = {
        firstJoin: Date.now(),
        firstMsg: Date.now(),
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

    /* HELP */
    if (cmd === 'help') {
      bot.chat(Object.keys(descriptions).slice(0, 15).join(', '))
    }
    else if (cmd === 'help2') {
      bot.chat(Object.keys(descriptions).slice(15, 30).join(', '))
    }
    else if (cmd === 'help3') {
      bot.chat(Object.keys(descriptions).slice(30).join(', '))
    }
    else if (cmd === 'explain') {
      const c = args[0]
      bot.chat(descriptions[c] ? `?${c} — ${descriptions[c]}` : 'Unknown command')
    }

    /* INFO */
    else if (cmd === 'seen') bot.chat('Seen before.')
    else if (cmd === 'firstjoin') bot.chat('Joined before.')
    else if (cmd === 'firstmsg') bot.chat('Messaged before.')
    else if (cmd === 'mostplaytime') {
      const top = Object.entries(data.players).sort((a,b)=>b[1].activity-a[1].activity)[0]
      if (top) bot.chat(`Most active: ${top[0]}`)
    }
    else if (cmd === 'mymostplaytime') bot.chat(`Your activity: ${p.activity}`)
    else if (cmd === 'online') bot.chat(Object.keys(bot.players).join(', '))
    else if (cmd === 'uptime') bot.chat(`${Math.floor((Date.now()-data.lastRestart)/60000)} minutes`)
    else if (cmd === 'ping') bot.chat('Pong!')
    else if (cmd === 'time') bot.chat(new Date().toLocaleTimeString())
    else if (cmd === 'date') bot.chat(new Date().toLocaleDateString())
    else if (cmd === 'version') bot.chat('HelperBot v1.0')

    /* FUN */
    else if (cmd === 'joke') bot.chat(jokes[Math.floor(Math.random()*jokes.length)])
    else if (cmd === 'fact') bot.chat(facts[Math.floor(Math.random()*facts.length)])
    else if (cmd === 'noobrate') bot.chat(`${args[0]||username} is ${Math.floor(Math.random()*100)+1}% noob`)
    else if (cmd === 'rate') bot.chat(`${args[0]||username} rated ${Math.floor(Math.random()*100)+1}`)
    else if (cmd === 'luck') bot.chat(`Luck: ${Math.floor(Math.random()*100)+1}%`)
    else if (cmd === 'iq') bot.chat(`IQ: ${Math.floor(Math.random()*160)+40}`)
    else if (cmd === 'flip') bot.chat(Math.random()<0.5?'Heads':'Tails')
    else if (cmd === 'dice') bot.chat(`Rolled ${Math.floor(Math.random()*6)+1}`)
    else if (cmd === '8ball') bot.chat(eightBall[Math.floor(Math.random()*eightBall.length)])
    else if (cmd === 'fortune') bot.chat(fortunes[Math.floor(Math.random()*fortunes.length)])
    else if (cmd === 'random') bot.chat(`${Math.floor(Math.random()*1000)}`)

    /* UTILITY */
    else if (cmd === 'say') bot.chat(args.join(' '))
    else if (cmd === 'sayto') bot.chat(`/whisper ${args.shift()} ${args.join(' ')}`)
    else if (cmd === 'repeat') bot.chat(args.join(' '))
    else if (cmd === 'whisperme') bot.chat(`/whisper ${username} ${args.join(' ')}`)
    else if (cmd === 'gpt') bot.chat('I am still learning 🙂')
    else if (cmd === 'afkcheck') bot.chat('Anti-AFK is running')
    else if (cmd === 'memory') bot.chat(`Saved players: ${Object.keys(data.players).length}`)
    else if (cmd === 'save') { saveData(); bot.chat('Saved.') }
    else if (cmd === 'stats') bot.chat(`Activity: ${p.activity}`)
    else if (cmd === 'activity') bot.chat(`${args[0]||username} activity stored`)
    else if (cmd === 'seenme') bot.chat('You were seen.')
    else if (cmd === 'botname') bot.chat(bot.username)
    else if (cmd === 'owner') bot.chat('Owner: aeroxol')
    else if (cmd === 'about') bot.chat('HelperBot – helper & fun bot')
    else if (cmd === 'storage') bot.chat(`${fs.statSync(DATA_FILE).size} bytes`)
    else if (cmd === 'lastrestart') bot.chat(new Date(data.lastRestart).toLocaleString())
    else if (cmd === 'welcome') bot.chat('Hi :)')
  })

  bot.on('end', () => {
    console.log('[BOT] Disconnected, reconnecting...')
    setTimeout(startBot, RECONNECT_DELAY)
  })
}

startBot()
