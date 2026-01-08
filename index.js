const mineflayer = require('mineflayer')

/* ================= CONFIG ================= */

const BOT_NAME = 'helperbot'
const SERVER_IP = '.aeroxolserver.aternos.me' // CHANGE THIS
const SERVER_PORT = 19266
const MC_VERSION = '1.21.1'
const PREFIX = '?'

/* =============== DATA ================= */

const lastSeen = {}
const startTime = Date.now()

/* =============== BOT ================= */

const bot = mineflayer.createBot({
  host: aeroxolserver.aternos.me,
  port: 19266,
  username: BOT_NAME,
  version: 1.21.1
})

bot.once('spawn', () => {
  console.log('[INFO] helperbot online')
  bot.chat('HelperBot online. Type ?help')

  // spam message every 10 minutes
  setInterval(() => {
    bot.chat('If you want to see all commands type ?help')
  }, 10 * 60 * 1000)
})

/* =========== PLAYER TRACKING =========== */

bot.on('playerJoined', (p) => {
  lastSeen[p.username] = Date.now()
})

bot.on('playerLeft', (p) => {
  lastSeen[p.username] = Date.now()
})

/* ============== COMMANDS ============== */

const commands = {
  help: () => {
    bot.chat('Commands (page 1/2):')
    bot.chat('?help, ?seen <p>, ?ping, ?uptime, ?online, ?players, ?coords')
    bot.chat('?time, ?date, ?version, ?botname, ?owner, ?rules, ?discord')
    bot.chat('?website, ?motd, ?ip, ?server, ?faq, ?vote, ?store')
    bot.chat('Type ?help2 for more')
  },

  help2: () => {
    bot.chat('Commands (page 2/2):')
    bot.chat('?day, ?night, ?tps, ?memory, ?cpu, ?ram, ?java')
    bot.chat('?whoami, ?seenme, ?firstseen <p>, ?uptimebot')
    bot.chat('?math <a+b>, ?echo <text>, ?random, ?roll')
  },

  seen: (args) => {
    const p = args[0]
    if (!p) return bot.chat('Usage: ?seen <player>')
    if (!lastSeen[p]) return bot.chat(`I have never seen ${p}.`)
    bot.chat(`${p} was last seen ${formatTime(Date.now() - lastSeen[p])} ago.`)
  },

  seenme: (args, user) => {
    if (!lastSeen[user]) return bot.chat('I have never seen you before.')
    bot.chat(`You were last seen ${formatTime(Date.now() - lastSeen[user])} ago.`)
  },

  firstseen: (args) => {
    const p = args[0]
    if (!p || !lastSeen[p]) return bot.chat('No data.')
    bot.chat(`${p} was first recorded by me earlier.`)
  },

  ping: () => bot.chat('Pong!'),
  uptime: () => bot.chat(`Uptime: ${formatTime(Date.now() - startTime)}`),
  uptimebot: () => bot.chat(`Bot uptime: ${formatTime(Date.now() - startTime)}`),
  online: () => bot.chat(`Online players: ${Object.keys(bot.players).length}`),
  players: () => bot.chat(`Players: ${Object.keys(bot.players).join(', ') || 'none'}`),
  coords: () => {
    const p = bot.entity.position
    bot.chat(`Coords: ${p.x.toFixed(1)} ${p.y.toFixed(1)} ${p.z.toFixed(1)}`)
  },
  time: () => bot.chat(`Server time: ${new Date().toLocaleTimeString()}`),
  date: () => bot.chat(`Date: ${new Date().toLocaleDateString()}`),
  version: () => bot.chat(`Minecraft version: ${MC_VERSION}`),
  botname: () => bot.chat(`My name is ${BOT_NAME}`),
  owner: () => bot.chat('Owner: alifthepro123'),
  rules: () => bot.chat('Rules: No griefing, no cheating, be respectful'),
  discord: () => bot.chat('Discord: discord.gg/example'),
  website: () => bot.chat('Website: mraeroxol-boop.github.io'),
  motd: () => bot.chat('Welcome to the server!'),
  ip: () => bot.chat(`Server IP: ${SERVER_IP}`),
  server: () => bot.chat('Java Edition server'),
  faq: () => bot.chat('FAQ: Ask staff if unsure'),
  vote: () => bot.chat('Vote link: example.com/vote'),
  store: () => bot.chat('Store: example.com/store'),
  day: () => bot.chat('Day length: 20 minutes'),
  night: () => bot.chat('Night length: 7 minutes'),
  tps: () => bot.chat('TPS: depends on server'),
  memory: () => bot.chat(`Memory: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(1)} MB`),
  cpu: () => bot.chat('CPU usage: server side'),
  ram: () => bot.chat(`RAM usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`),
  java: () => bot.chat(`Node.js: ${process.version}`),
  whoami: (args, user) => bot.chat(`You are ${user}`),
  math: (args) => {
    try {
      const res = eval(args.join(''))
      bot.chat(`Result: ${res}`)
    } catch {
      bot.chat('Invalid math.')
    }
  },
  echo: (args) => bot.chat(args.join(' ') || 'Nothing to echo'),
  random: () => bot.chat(`Random: ${Math.floor(Math.random() * 100)}`),
  roll: () => bot.chat(`Dice roll: ${1 + Math.floor(Math.random() * 6)}`)
}

/* ============ CHAT HANDLER ============ */

bot.on('messagestr', (message) => {
  if (!message.startsWith(PREFIX)) return

  const parts = message.slice(1).split(' ')
  const cmd = parts.shift().toLowerCase()
  const user = message.split(':')[0]

  if (commands[cmd]) {
    commands[cmd](parts, user)
  }
})

/* ============ UTIL ============ */

function formatTime(ms) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (d) return `${d}d ${h % 24}h`
  if (h) return `${h}h ${m % 60}m`
  if (m) return `${m}m ${s % 60}s`
  return `${s}s`
}

/* ============ SAFETY ============ */

bot.on('end', () => {
  console.log('[WARN] Disconnected')
})

bot.on('error', (e) => {
  console.log('[ERROR]', e.message)
})
