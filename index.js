const mineflayer = require('mineflayer')
const express = require('express')

/* ================= CONFIG ================= */
const BOT_NAME = 'helperbot'
const SERVER_IP = 'aeroxolserver.aternos.me'
const SERVER_PORT = 19266
const MC_VERSION = '1.21.1'
const WEB_PORT = 3000
const RECONNECT_DELAY = 5000
/* ========================================== */

let bot
const seen = {}
const botStart = Date.now()

/* ============== EXPRESS WEB SERVER (UPTIMEROBOT) ============== */
const app = express()

app.get('/', (req, res) => {
  res.status(200).send('HelperBot is alive')
})

app.listen(WEB_PORT, () => {
  console.log(`[WEB] Express running on port ${WEB_PORT}`)
})

/* ================= BOT FUNCTION ================= */
function startBot() {
  bot = mineflayer.createBot({
    host: SERVER_IP,
    port: SERVER_PORT,
    username: BOT_NAME,
    version: MC_VERSION
  })

  bot.once('spawn', () => {
    console.log('[BOT] Spawned successfully')
    bot.chat('HelperBot online. Type ?help')

    // Spam message every 10 minutes
    setInterval(() => {
      bot.chat('If you want to see commands type ?help')
    }, 10 * 60 * 1000)
  })

  /* ============ SEEN TRACKING ============ */
  bot.on('playerJoined', p => seen[p.username] = Date.now())
  bot.on('playerLeft', p => seen[p.username] = Date.now())

  /* ============ CHAT COMMANDS ============ */
  bot.on('chat', (username, message) => {
    if (username === bot.username) return
    if (!message.startsWith('?')) return

    const args = message.slice(1).split(' ')
    const cmd = args.shift().toLowerCase()
    seen[username] = Date.now()

    if (cmd === 'help') {
      bot.chat('?help ?seen <player> ?ping ?uptime ?coords ?online ?botname')
    }

    else if (cmd === 'seen') {
      const t = args[0]
      if (!t || !seen[t]) {
        bot.chat('Player not seen yet.')
      } else {
        const mins = Math.floor((Date.now() - seen[t]) / 60000)
        bot.chat(`${t} was last seen ${mins} minutes ago`)
      }
    }

    else if (cmd === 'ping') {
      bot.chat('Pong!')
    }

    else if (cmd === 'uptime') {
      const mins = Math.floor((Date.now() - botStart) / 60000)
      bot.chat(`Bot uptime: ${mins} minutes`)
    }

    else if (cmd === 'coords') {
      const p = bot.entity.position
      bot.chat(`Coords: ${p.x.toFixed(1)} ${p.y.toFixed(1)} ${p.z.toFixed(1)}`)
    }

    else if (cmd === 'online') {
      const list = Object.keys(bot.players)
      bot.chat(`Online (${list.length}): ${list.join(', ')}`)
    }

    else if (cmd === 'botname') {
      bot.chat(`My name is ${BOT_NAME}`)
    }
  })

  /* ============ AUTO RECONNECT ============ */
  bot.on('end', reason => {
    console.log('[BOT] Disconnected:', reason)
    setTimeout(startBot, RECONNECT_DELAY)
  })

  bot.on('kicked', reason => {
    console.log('[BOT] Kicked:', reason)
  })

  bot.on('error', err => {
    console.log('[BOT] Error:', err.message)
  })
}

startBot()
