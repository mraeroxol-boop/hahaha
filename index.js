const mineflayer = require('mineflayer')
const axios = require('axios')
const sharp = require('sharp')
const { Vec3 } = require('vec3')

/* ================= CONFIG ================= */

const BOT_NAME = 'builder'
const SERVER_IP = 'YOUR.SERVER.IP'   // ← CHANGE THIS
const SERVER_PORT = 25565             // ← CHANGE IF NEEDED
const MC_VERSION = '1.21.1'
const MAP_SIZE = 128

/* ============== WOOL PALETTE ============== */

const WOOL_PALETTE = [
  { block: 'white_wool', rgb: [234,236,237] },
  { block: 'light_gray_wool', rgb: [142,142,134] },
  { block: 'gray_wool', rgb: [62,68,71] },
  { block: 'black_wool', rgb: [21,21,26] },
  { block: 'red_wool', rgb: [161,39,34] },
  { block: 'orange_wool', rgb: [240,118,19] },
  { block: 'yellow_wool', rgb: [249,198,39] },
  { block: 'lime_wool', rgb: [112,185,25] },
  { block: 'green_wool', rgb: [84,109,27] },
  { block: 'light_blue_wool', rgb: [58,175,217] },
  { block: 'blue_wool', rgb: [53,57,157] },
  { block: 'purple_wool', rgb: [123,47,190] },
  { block: 'pink_wool', rgb: [237,141,172] },
  { block: 'brown_wool', rgb: [114,71,40] }
]

/* ============== COLOR MATCHING ============== */

function dist(a, b) {
  return Math.sqrt(
    (a[0]-b[0])**2 +
    (a[1]-b[1])**2 +
    (a[2]-b[2])**2
  )
}

function closestWool(rgb) {
  let best = WOOL_PALETTE[0]
  let min = Infinity
  for (const w of WOOL_PALETTE) {
    const d = dist(rgb, w.rgb)
    if (d < min) {
      min = d
      best = w
    }
  }
  return best.block
}

/* ============== IMAGE PROCESSING ============== */

async function imageToPixels(url) {
  console.log('[INFO] Downloading image:', url)

  const res = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 20000
  })

  console.log('[INFO] Image downloaded, bytes:', res.data.length)

  const img = await sharp(res.data)
    .resize(MAP_SIZE, MAP_SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0 } })
    .raw()
    .toBuffer()

  const pixels = []
  for (let z = 0; z < MAP_SIZE; z++) {
    pixels[z] = []
    for (let x = 0; x < MAP_SIZE; x++) {
      const i = (z * MAP_SIZE + x) * 3
      const rgb = [img[i], img[i+1], img[i+2]]
      pixels[z][x] = closestWool(rgb)
    }
  }
  return pixels
}

/* ================= BUILD LOGIC ================= */

async function buildMap(bot, pixels) {
  const start = bot.entity.position.floored()

  bot.chat('Giving wool...')
  for (const w of WOOL_PALETTE) {
    bot.chat(`/give ${BOT_NAME} minecraft:${w.block} 64`)
  }

  bot.chat('Placing blocks...')

  for (let z = 0; z < MAP_SIZE; z++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      const blockName = pixels[z][x]
      const placePos = start.offset(x, -1, -z)
      const ref = bot.blockAt(placePos.offset(0, -1, 0))
      if (!ref) continue

      const item = bot.registry.itemsByName[blockName]
      if (!item) continue

      await bot.equip(item.id, 'hand')
      await bot.placeBlock(ref, new Vec3(0, 1, 0))
    }
  }
}

/* ================= BOT SETUP ================= */

const bot = mineflayer.createBot({
  host: aeroxolserver.aternos.me,
  port: 19266,
  username: BOT_NAME,
  version: 1.21.1
})

bot.once('spawn', () => {
  console.log('[INFO] Bot spawned')
  bot.chat(`/gamemode creative ${BOT_NAME}`)
  bot.chat('Map art bot ready. Use ?map <image_url>')
})

/* ============ CHAT LISTENER (FIXED) ============ */
/* THIS IS WHY YOUR OLD VERSION DID NOTHING */

bot.on('messagestr', async (message) => {
  console.log('[CHAT]', message)

  if (!message.startsWith('?map ')) return

  const url = message.split(' ')[1]
  if (!url) {
    bot.chat('Invalid map command.')
    return
  }

  try {
    bot.chat('Processing image...')
    const pixels = await imageToPixels(url)
    bot.chat('Building 1x1 map art...')
    await buildMap(bot, pixels)
    bot.chat('Done. Give me a map and right-click.')
  } catch (err) {
    console.error('[ERROR]', err)
    bot.chat('Failed to create map art.')
  }
})
