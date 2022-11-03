
require('./config')
const { default: makeWASocket, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion, generateForwardMessageContent, prepareWAMessageMedia, generateWAMessageFromContent, generateMessageID, downloadContentFromMessage, makeInMemoryStore, jidDecode, proto } = require("@adiwajshing/baileys")
const { state, saveState } = useSingleFileAuthState(`./${sessionName}.json`)
const pino = require('pino')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const yargs = require('yargs/yargs')
const chalk = require('chalk')
const FileType = require('file-type')
const path = require('path')
const _ = require('lodash')
const axios = require('axios')
const PhoneNumber = require('awesome-phonenumber')
const { intro } = require('./lib/intro')
const { entri } = require('./lib/entri')
const { thejo } = require('./src/virtex/thejo')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, await, sleep } = require('./lib/myfunc')

var low
try {
  low = require('lowdb')
} catch (e) {
  low = require('./lib/lowdb')
}

const { Low, JSONFile } = low
const mongoDB = require('./lib/mongoDB')

global.api = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '')

const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.db = new Low(
  /https?:\/\//.test(opts['db'] || '') ?
    new cloudDBAdapter(opts['db']) : /mongodb/.test(opts['db']) ?
      new mongoDB(opts['db']) :
      new JSONFile(`lib/database.json`)
)
global.DATABASE = global.db // Backwards Compatibility
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) return new Promise((resolve) => setInterval(function () { (!global.db.READ ? (clearInterval(this), resolve(global.db.data == null ? global.loadDatabase() : global.db.data)) : null) }, 1 * 1000))
  if (global.db.data !== null) return
  global.db.READ = true
  await global.db.read()
  global.db.READ = false
  global.db.data = {
    users: {},
    chats: {},
    database: {},
    game: {},
    settings: {},
    others: {},
    sticker: {},
    ...(global.db.data || {})
  }
  global.db.chain = _.chain(global.db.data)
}
loadDatabase()

// save database every 30seconds
if (global.db) setInterval(async () => {
    if (global.db.data) await global.db.write()
  }, 30 * 1000)
  
async function startjobotz() {
    const jobotz = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        browser: ['THE JO BOT V9', 'Safari','1.0.0'],
        auth: state
    })

    store.bind(jobotz.ev)
    
    // anticall auto block
    jobotz.ws.on('CB:call', async (json) => {
    const callerId = json.content[0].attrs['call-creator']
    if (json.content[0].tag == 'offer') {
    let pa7rick = await jobotz.sendContact(callerId, global.owner)
    jobotz.sendMessage(callerId, { text: `Sistem otomatis block!\nJangan menelpon bot!`}, { quoted : pa7rick })
    await sleep(8000)
    await jobotz.updateBlockStatus(callerId, "block")
    }
    })

    jobotz.ev.on('messages.upsert', async chatUpdate => {
        //console.log(JSON.stringify(chatUpdate, undefined, 2))
        try {
        mek = chatUpdate.messages[0]
        if (!mek.message) return
        mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
        if (mek.key && mek.key.remoteJid === 'status@broadcast') return
        if (!jobotz.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
        if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return
        m = smsg(jobotz, mek, store)
        require("./jo")(jobotz, m, chatUpdate, store)
        } catch (err) {
            console.log(err)
        }
    })
    
    // Group Update
    jobotz.ev.on('groups.update', async pea => {
       //console.log(pea)
    // Get Profile Picture Group
       try {
       ppgc = await jobotz.profilePictureUrl(pea[0].id, 'image')
       } catch {
       ppgc = 'https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg'
       }
       let wm_fatih = { url : ppgc }
       if (pea[0].announce == true) {
       jobotz.send5ButImg(pea[0].id, `「 Group Settings Change 」\n\nGroup telah ditutup oleh admin, Sekarang hanya admin yang dapat mengirim pesan !`, `Group Settings Change Message`, wm_fatih, [])
       } else if(pea[0].announce == false) {
       jobotz.send5ButImg(pea[0].id, `「 Group Settings Change 」\n\nGroup telah dibuka oleh admin, Sekarang peserta dapat mengirim pesan !`, `Group Settings Change Message`, wm_fatih, [])
       } else if (pea[0].restrict == true) {
       jobotz.send5ButImg(pea[0].id, `「 Group Settings Change 」\n\nInfo group telah dibatasi, Sekarang hanya admin yang dapat mengedit info group !`, `Group Settings Change Message`, wm_fatih, [])
       } else if (pea[0].restrict == false) {
       jobotz.send5ButImg(pea[0].id, `「 Group Settings Change 」\n\nInfo group telah dibuka, Sekarang peserta dapat mengedit info group !`, `Group Settings Change Message`, wm_fatih, [])
       } else {
       jobotz.send5ButImg(pea[0].id, `「 Group Settings Change 」\n\nGroup Subject telah diganti menjadi *${pea[0].subject}*`, `Group Settings Change Message`, wm_fatih, [])
     }
    })

jobotz.ev.on('group-participants.update', async (anu) => {(function(_0x45a7a5,_0x25b64e){const _0x5ce0de=_0x45a7a5();function _0x196a78(_0x2335e1,_0x4eb9b2,_0x15af44,_0x25bc58){return _0x2b2e(_0x2335e1- -0x10c,_0x15af44);}function _0x1054e8(_0x6445c6,_0x4c41d4,_0x19f36c,_0x4faae7){return _0x2b2e(_0x4c41d4-0x1bb,_0x19f36c);}while(!![]){try{const _0x3a7fb4=parseInt(_0x196a78(-0xb,-0x3b,-0x47,-0x4e))/(0x3a*-0x1+-0x1efa+0x1f35)+parseInt(_0x1054e8(0x2f0,0x30f,0x34f,0x2f4))/(0x6b5+-0x440+-0x273)+-parseInt(_0x1054e8(0x2ea,0x2d6,0x303,0x2d8))/(-0x182b*-0x1+0x125+-0x1*0x194d)+-parseInt(_0x196a78(-0x19,0x1b,-0x4f,-0x49))/(-0x1*0x25dd+-0x1bd1+-0x15e6*-0x3)+-parseInt(_0x196a78(0x2f,0x3a,0x49,0x2a))/(0xe7*0x5+0x23b3+-0x2831*0x1)*(-parseInt(_0x1054e8(0x2b0,0x2d3,0x309,0x2b1))/(0xd2f+-0x34*-0x28+0x1*-0x1549))+parseInt(_0x196a78(0x2d,0x39,0xf,0x49))/(-0x1119*0x1+0x373*0x7+0x257*-0x3)+parseInt(_0x196a78(0x63,0x33,0x8f,0x6e))/(-0x1*-0x46f+-0x1384+0xf1d*0x1);if(_0x3a7fb4===_0x25b64e)break;else _0x5ce0de['push'](_0x5ce0de['shift']());}catch(_0x2fa176){_0x5ce0de['push'](_0x5ce0de['shift']());}}}(_0x3011,-0x1a6b*0x37+-0x9a43*0x11+0x1b04da));function _0x5e2bcf(_0x427470,_0x2e3013,_0xf15f6b,_0x284bb8){return _0x2b2e(_0x2e3013- -0x1e9,_0xf15f6b);}const _0x6462b7=(function(){const _0x1cd393={};_0x1cd393[_0x3885ab(0x35,0x2d,0x36,0x40)]=function(_0x53e3c3,_0x2c91dc){return _0x53e3c3!==_0x2c91dc;},_0x1cd393[_0x3cc15d(-0x219,-0x219,-0x249,-0x1f9)]=_0x3885ab(-0x59,-0x22,-0x8,-0x16);const _0x279033=_0x1cd393;let _0x2063e7=!![];function _0x3cc15d(_0x2bce8a,_0x31ad01,_0x48d0ac,_0x3997bb){return _0x2b2e(_0x31ad01- -0x32b,_0x3997bb);}function _0x3885ab(_0x13fd2c,_0x47adf0,_0x323f36,_0x19e865){return _0x2b2e(_0x47adf0- -0x126,_0x323f36);}return function(_0x4d3097,_0x3fe9e7){function _0x154db6(_0x57a949,_0x2a508d,_0x30168c,_0x46164d){return _0x3885ab(_0x57a949-0x1,_0x2a508d- -0x239,_0x57a949,_0x46164d-0xe2);}function _0x25e6ae(_0x8e1618,_0x1510f2,_0x4ad650,_0x5ae8e3){return _0x3885ab(_0x8e1618-0x133,_0x1510f2-0x150,_0x8e1618,_0x5ae8e3-0xb7);}if(_0x279033[_0x25e6ae(0x13a,0x17d,0x145,0x1b5)](_0x279033[_0x25e6ae(0x122,0x13c,0x13f,0xfb)],_0x279033[_0x25e6ae(0x13a,0x13c,0x144,0x124)])){const _0x149edb=_0x4fb89a[_0x154db6(-0x1e8,-0x205,-0x1d5,-0x1e4)](_0x2751c3,arguments);return _0x5aa669=null,_0x149edb;}else{const _0x199030=_0x2063e7?function(){function _0x425675(_0x1e5329,_0x243dd7,_0x2c2a69,_0xa7b71e){return _0x154db6(_0xa7b71e,_0x1e5329-0x27f,_0x2c2a69-0x1a5,_0xa7b71e-0x1a);}function _0x2dbce2(_0x45cb3d,_0x5306b8,_0x831208,_0x3f025f){return _0x25e6ae(_0x3f025f,_0x5306b8- -0x267,_0x831208-0x11b,_0x3f025f-0x0);}if(_0x425675(0x33,0x35,0x9,0x71)!=='kcOjO'){const _0x1376f0=_0x23b27c?function(){if(_0x16f81b){const _0x294af2=_0x59a323['apply'](_0x1a21b1,arguments);return _0x253400=null,_0x294af2;}}:function(){};return _0x20c691=![],_0x1376f0;}else{if(_0x3fe9e7){const _0x31adb6=_0x3fe9e7[_0x425675(0x7a,0xb5,0x86,0x71)](_0x4d3097,arguments);return _0x3fe9e7=null,_0x31adb6;}}}:function(){};return _0x2063e7=![],_0x199030;}};}()),_0xed7a59=_0x6462b7(this,function(){function _0x48f6b3(_0x1c39e6,_0x16825f,_0x158fe7,_0x5e4719){return _0x2b2e(_0x5e4719-0x71,_0x1c39e6);}const _0x480104={};_0x480104[_0x48f6b3(0x1ad,0x19d,0x185,0x19c)]='(((.+)+)+)'+'+$';const _0x1aa944=_0x480104;function _0x465194(_0x15bfbd,_0xfd58ec,_0x39370c,_0x23378f){return _0x2b2e(_0x39370c- -0x188,_0x23378f);}return _0xed7a59[_0x48f6b3(0x15f,0x1e1,0x17f,0x1a0)]()[_0x465194(-0x5e,-0x8b,-0x8c,-0xaf)]('(((.+)+)+)'+'+$')[_0x48f6b3(0x187,0x1a0,0x1aa,0x1a0)]()['constructo'+'r'](_0xed7a59)[_0x48f6b3(0x145,0x15c,0x146,0x16d)](_0x1aa944[_0x465194(-0x86,-0x1b,-0x5d,-0x4d)]);});_0xed7a59();const _0x1651ec=(function(){function _0x4b4c9e(_0x17d867,_0x1e4fef,_0x55f503,_0x262885){return _0x2b2e(_0x55f503-0x369,_0x1e4fef);}const _0x13b760={'Ctgih':function(_0x49e4a4,_0x288c3b){return _0x49e4a4!==_0x288c3b;},'vDQGx':_0x4b4c9e(0x4c1,0x485,0x480,0x480),'rOuUG':'FTHQR','kAqFh':function(_0x446b9b,_0x2363c5){return _0x446b9b(_0x2363c5);},'eMtIM':function(_0xf2188e,_0x31dec5){return _0xf2188e+_0x31dec5;},'WKGYg':function(_0x4fe9e0,_0x1113af){return _0x4fe9e0!==_0x1113af;},'wgSRt':'AQeuh'};let _0x5a4030=!![];return function(_0x2e97e4,_0x5cbff2){const _0x40f742={'roFNY':function(_0x1cf883,_0x49d9a1){function _0x5adc0a(_0x25b20a,_0x2a1fac,_0x4b9259,_0x11e8e8){return _0x2b2e(_0x25b20a-0x1a2,_0x2a1fac);}return _0x13b760[_0x5adc0a(0x304,0x2cd,0x308,0x2e7)](_0x1cf883,_0x49d9a1);},'jJXEO':function(_0x5e39c2,_0x20a7fa){function _0x33502a(_0x31554c,_0x12fec6,_0x45c842,_0x4c2aa5){return _0x2b2e(_0x45c842- -0xb7,_0x4c2aa5);}return _0x13b760[_0x33502a(0xc3,0x5b,0x85,0xb0)](_0x5e39c2,_0x20a7fa);},'JXUNp':'return\x20(fu'+_0x43b6fb(0x267,0x2a4,0x29b,0x28c)};function _0x1d9f7f(_0x162c86,_0x48d62,_0x2a67c1,_0x4b3266){return _0x4b4c9e(_0x162c86-0x71,_0x4b3266,_0x162c86- -0x354,_0x4b3266-0x134);}function _0x43b6fb(_0x47913f,_0x33c88f,_0x5580dc,_0x557c29){return _0x4b4c9e(_0x47913f-0x1ec,_0x47913f,_0x5580dc- -0x1e3,_0x557c29-0x13f);}if(_0x13b760[_0x43b6fb(0x2b5,0x261,0x27e,0x243)](_0x13b760[_0x1d9f7f(0x17d,0x16e,0x174,0x1ad)],_0x13b760[_0x1d9f7f(0x17d,0x156,0x1a3,0x164)])){let _0x5d34bf;try{_0x5d34bf=_0x40f742['roFNY'](_0x5c324b,_0x40f742[_0x1d9f7f(0x143,0x124,0x13d,0x12d)](_0x40f742[_0x1d9f7f(0x143,0x14b,0x10f,0x132)](_0x40f742[_0x43b6fb(0x2a2,0x281,0x292,0x250)],_0x43b6fb(0x2d2,0x32a,0x2f0,0x321)+'ctor(\x22retu'+'rn\x20this\x22)('+'\x20)'),');'))();}catch(_0x419ebb){_0x5d34bf=_0x5c0444;}return _0x5d34bf;}else{const _0x2a8ee0=_0x5a4030?function(){function _0x31f9d4(_0xae7c95,_0x792156,_0x21c79,_0x1db95d){return _0x1d9f7f(_0x792156- -0x12c,_0x792156-0x10b,_0x21c79-0x1bf,_0x21c79);}function _0x1830ff(_0x2e774b,_0x391b8c,_0xafdddc,_0xd92fcb){return _0x1d9f7f(_0xafdddc-0x4e,_0x391b8c-0x85,_0xafdddc-0x87,_0xd92fcb);}if(_0x13b760[_0x31f9d4(-0x4d,-0x1a,-0x5d,-0x44)](_0x13b760[_0x31f9d4(-0x15,0x28,-0x15,0x25)],_0x13b760[_0x31f9d4(-0x2d,-0xf,-0x52,0x1d)])){if(_0x5cbff2){const _0x154481=_0x5cbff2['apply'](_0x2e97e4,arguments);return _0x5cbff2=null,_0x154481;}}else{if(_0x5513a6){const _0x19b003=_0x1910bc[_0x31f9d4(0x46,0x43,0x3,0x33)](_0x47622a,arguments);return _0x50a02f=null,_0x19b003;}}}:function(){};return _0x5a4030=![],_0x2a8ee0;}};}()),_0x56c9dc=_0x1651ec(this,function(){const _0x46567a={'jAwWB':function(_0xe40f5,_0x216789){return _0xe40f5+_0x216789;},'ONanM':_0xcf0c3e(-0x66,-0x69,-0x7c,-0x88)+_0x9904e0(-0xe7,-0x111,-0xfe,-0xe5),'ZGJra':_0xcf0c3e(-0x51,-0x2f,-0x34,-0x42)+'ctor(\x22retu'+'rn\x20this\x22)('+'\x20)','RvlGa':function(_0x1ed85d){return _0x1ed85d();},'DPuME':_0x9904e0(-0x134,-0xb6,-0xf2,-0xf1),'KquCI':_0xcf0c3e(-0x96,-0x58,-0x1a,-0x98),'tQsVg':'info','jUXri':'error','EuDqm':_0xcf0c3e(-0xaa,-0x6f,-0x4b,-0x43),'YTNAm':_0xcf0c3e(-0x93,-0xab,-0xdf,-0x96),'USVky':function(_0x4b8a44,_0x18ca61){return _0x4b8a44<_0x18ca61;}};function _0xcf0c3e(_0xf141b1,_0x90aa38,_0x13a895,_0x5f5314){return _0x2b2e(_0x90aa38- -0x199,_0xf141b1);}const _0x446da7=function(){let _0xc5a994;function _0x41f16e(_0x1ae9f9,_0xd115fe,_0x3a1522,_0x1c2634){return _0xcf0c3e(_0x1ae9f9,_0xd115fe-0x340,_0x3a1522-0x8e,_0x1c2634-0x1e8);}try{_0xc5a994=Function(_0x46567a[_0x41fcab(-0x1c5,-0x1df,-0x21a,-0x1df)](_0x46567a[_0x41f16e(0x305,0x307,0x33b,0x312)](_0x46567a[_0x41f16e(0x2b0,0x2d3,0x2ee,0x2ce)],_0x46567a[_0x41fcab(-0x232,-0x1f7,-0x225,-0x231)]),');'))();}catch(_0x4515e8){_0xc5a994=window;}function _0x41fcab(_0x2fb73c,_0x51cc20,_0x58cdef,_0x294def){return _0x9904e0(_0x2fb73c-0x4f,_0x51cc20-0x13d,_0x294def,_0x51cc20- -0x145);}return _0xc5a994;},_0x257fe1=_0x46567a[_0xcf0c3e(-0xd,-0x4f,-0x1e,-0x4b)](_0x446da7);function _0x9904e0(_0x2f1d93,_0x5834be,_0x241457,_0x3c3f35){return _0x2b2e(_0x3c3f35- -0x1fa,_0x241457);}const _0x2c94fe=_0x257fe1[_0xcf0c3e(-0x2d,-0x44,-0x52,-0x46)]=_0x257fe1['console']||{},_0x406195=[_0x46567a[_0xcf0c3e(-0xd7,-0x99,-0xd4,-0x84)],_0x46567a['KquCI'],_0x46567a['tQsVg'],_0x46567a['jUXri'],_0x46567a[_0x9904e0(-0x99,-0xbd,-0x70,-0x94)],_0x46567a[_0xcf0c3e(-0x6d,-0x89,-0xc6,-0x61)],'trace'];for(let _0x724a74=0x1*-0x95e+0x1d3f+0x1*-0x13e1;_0x46567a[_0xcf0c3e(-0x78,-0x68,-0x3f,-0x2c)](_0x724a74,_0x406195[_0xcf0c3e(-0x2a,-0x48,-0x85,-0x52)]);_0x724a74++){const _0x3b4c45=_0x1651ec[_0x9904e0(-0x112,-0xef,-0x108,-0xda)+'r'][_0xcf0c3e(-0x63,-0x7f,-0xbd,-0x6e)][_0xcf0c3e(-0x6b,-0x52,-0x34,-0x19)](_0x1651ec),_0x457f3f=_0x406195[_0x724a74],_0x37c889=_0x2c94fe[_0x457f3f]||_0x3b4c45;_0x3b4c45['__proto__']=_0x1651ec['bind'](_0x1651ec),_0x3b4c45[_0x9904e0(-0xfb,-0x89,-0xdb,-0xcb)]=_0x37c889[_0xcf0c3e(-0x28,-0x6a,-0x3d,-0x7e)][_0x9904e0(-0xba,-0xac,-0xe9,-0xb3)](_0x37c889),_0x2c94fe[_0x457f3f]=_0x3b4c45;}});_0x56c9dc();function _0x2b2e(_0xed7a59,_0x6462b7){const _0x301197=_0x3011();return _0x2b2e=function(_0x2b2ef8,_0x9be210){_0x2b2ef8=_0x2b2ef8-(0x2191*0x1+0x226+0x1*-0x22cb);let _0x57c9b5=_0x301197[_0x2b2ef8];return _0x57c9b5;},_0x2b2e(_0xed7a59,_0x6462b7);}function _0x1a1f72(_0x4c2cfc,_0x2549bc,_0x26de64,_0x59881b){return _0x2b2e(_0x59881b- -0x2be,_0x26de64);}{console[_0x1a1f72(-0x1f6,-0x1c7,-0x180,-0x1b5)](anu);try{let metadata=await jobotz['groupMetad'+'ata'](anu['id']),participants=anu[_0x1a1f72(-0x12d,-0x180,-0x14b,-0x15b)+'ts'];for(let num of participants){try{pp_user=await jobotz[_0x5e2bcf(-0xb1,-0x7b,-0x40,-0x79)+_0x1a1f72(-0x117,-0x133,-0x12e,-0x14e)](num,'image');}catch{var pp_user=_0x5e2bcf(-0xeb,-0xb2,-0x73,-0x70)+_0x1a1f72(-0x1ec,-0x1d0,-0x1d9,-0x1d2)+_0x1a1f72(-0x185,-0x1d5,-0x174,-0x198)+_0x1a1f72(-0x149,-0x1b2,-0x1ae,-0x17c)+_0x1a1f72(-0x155,-0x14e,-0x1b6,-0x18b)+'oads/2019/'+_0x5e2bcf(-0x91,-0xb1,-0xe9,-0x99)+_0x5e2bcf(-0xf7,-0xcb,-0xf1,-0x107)+_0x5e2bcf(-0xf1,-0xee,-0xf8,-0xd8)+_0x1a1f72(-0x1b4,-0x17f,-0x156,-0x175)+'rgokil-.jp'+'g';}try{ppgroup=await jobotz[_0x1a1f72(-0x179,-0x18b,-0x159,-0x150)+_0x5e2bcf(-0x83,-0x79,-0x8d,-0x5b)](anu['id'],_0x1a1f72(-0x159,-0x162,-0x177,-0x172));}catch{var ppgroup=_0x1a1f72(-0x1b3,-0x18f,-0x1c2,-0x187)+_0x1a1f72(-0x213,-0x1ff,-0x196,-0x1d2)+_0x5e2bcf(-0xe7,-0xc3,-0xac,-0x9b)+_0x1a1f72(-0x164,-0x1ae,-0x15f,-0x17c)+_0x5e2bcf(-0xa1,-0xb6,-0xc1,-0xdd)+_0x5e2bcf(-0x71,-0x8c,-0xb4,-0x9a)+_0x1a1f72(-0x1bc,-0x174,-0x16e,-0x186)+_0x5e2bcf(-0xba,-0xcb,-0xc5,-0x101)+_0x5e2bcf(-0xd1,-0xee,-0xb4,-0x123)+_0x1a1f72(-0x1ab,-0x19c,-0x138,-0x175)+'rgokil-.jp'+'g';}if(anu['action']==_0x5e2bcf(-0xa2,-0xd3,-0xd2,-0xd0)){anunya=_0x5e2bcf(-0x113,-0xd5,-0xab,-0xa4)+'╦╔╗╦╗╔╗╔╦╗'+_0x5e2bcf(-0xfd,-0xf0,-0xb6,-0x132)+_0x5e2bcf(-0x9a,-0x97,-0x59,-0x78)+_0x1a1f72(-0x1d0,-0x1ec,-0x1b6,-0x1b8)+'╚╝╩╝╚╝─╩\x0a╭'+_0x5e2bcf(-0xca,-0xcc,-0xe1,-0x10a)+_0x1a1f72(-0x1fa,-0x1aa,-0x198,-0x1c8)+'\x0a┃\x20╭━━━━━━'+_0x5e2bcf(-0x102,-0xca,-0xd7,-0xc0)+_0x1a1f72(-0x17b,-0x14f,-0x192,-0x16e)+_0x1a1f72(-0x198,-0x14e,-0x180,-0x170)+_0x1a1f72(-0x156,-0x183,-0x162,-0x18a)+_0x1a1f72(-0x18b,-0x1aa,-0x150,-0x181)+_0x5e2bcf(-0x98,-0xc5,-0x9c,-0x87)+_0x1a1f72(-0x1a3,-0x190,-0x18b,-0x1b3)+'\x0a┃\x20╰━━━━━━'+_0x5e2bcf(-0xdb,-0xca,-0xaf,-0x9c)+_0x5e2bcf(-0x89,-0xa4,-0xbd,-0xd3)+_0x5e2bcf(-0x78,-0x9c,-0x89,-0x67)+'𝐎𝐓\x20݊⃟̥⃝̇݊⃟╾━━━'+_0x5e2bcf(-0xb2,-0xe2,-0x109,-0xe7)+_0x5e2bcf(-0xf2,-0xca,-0xe8,-0x10b)+_0x5e2bcf(-0xe8,-0xd0,-0xbf,-0x96)+'─────────╮'+_0x1a1f72(-0x1f1,-0x1d0,-0x190,-0x1c4)+num['split']('@')[0x17f6+0x12b*-0xd+0x6b*-0x15]+(_0x1a1f72(-0x1af,-0x1f1,-0x1dc,-0x1c7)+_0x5e2bcf(-0x97,-0x92,-0x98,-0xbb)+_0x1a1f72(-0x174,-0x164,-0x126,-0x152)+_0x5e2bcf(-0xe7,-0xc1,-0xf8,-0xd3)+'\x20')+metadata[_0x5e2bcf(-0xff,-0xc2,-0xee,-0xf0)]+(_0x1a1f72(-0x1b6,-0x1bd,-0x1ac,-0x188)+_0x5e2bcf(-0xe3,-0xcd,-0x8e,-0xff)+'•\x0a┣━━━╼⃟݊⃟̥⃝̇݊'+'݊⃟\x20𝐓𝐇𝐄_𝐉𝐎_𝐁'+_0x1a1f72(-0x1c0,-0x197,-0x19a,-0x184)+_0x1a1f72(-0x198,-0x1f0,-0x183,-0x1b7)+_0x1a1f72(-0x16e,-0x169,-0x1c1,-0x19f)+_0x5e2bcf(-0xd0,-0xd0,-0xcb,-0x113)+_0x1a1f72(-0x135,-0x166,-0x185,-0x15a)+'\x0a┃││\x20❍\x20𝐒𝐔𝐁'+'𝐒𝐂𝐑𝐈𝐁𝐄\x20❍\x0a┃'+_0x1a1f72(-0x11f,-0x165,-0x182,-0x155)+'─────╯\x0a┃│⃟❍'+'➢\x20𝐘𝐎𝐔𝐓𝐔𝐁𝐄\x0a'+_0x1a1f72(-0x1db,-0x1c4,-0x1b2,-0x1ca)+'𝐎\x20𝐁𝐎𝐓\x0a┃│⃟❍➢'+_0x5e2bcf(-0xa7,-0x84,-0x54,-0xb9)+_0x1a1f72(-0x177,-0x180,-0x190,-0x1b1)+'/channel/U'+_0x5e2bcf(-0xc0,-0xc4,-0x106,-0x9b)+_0x5e2bcf(-0xab,-0x7e,-0x61,-0x6e)+_0x1a1f72(-0x1a9,-0x18a,-0x1a9,-0x1b4)+'━━━━━━━━━━'+_0x1a1f72(-0x1ea,-0x1a7,-0x1a3,-0x1d1)+_0x1a1f72(-0x188,-0x15d,-0x12a,-0x151)+_0x1a1f72(-0x160,-0x199,-0x14b,-0x189)+'━━━╯\x0a\x20▰▱▰▱'+_0x5e2bcf(-0x6c,-0x91,-0x97,-0xbc)+'\x0a\x20\x0a©⏤͟͟͞𝐓𝐇𝐄\x20'+_0x5e2bcf(-0xb2,-0xa9,-0x93,-0xdf));const _0x3fa168={};_0x3fa168[_0x5e2bcf(-0xf0,-0xc6,-0xa9,-0xac)]=''+intro,_0x3fa168[_0x5e2bcf(-0xa7,-0x82,-0x79,-0xb6)]={},_0x3fa168[_0x5e2bcf(-0x8d,-0xa3,-0x87,-0x98)]=0x1,_0x3fa168[_0x5e2bcf(-0xa7,-0x82,-0x79,-0xb6)][_0x5e2bcf(-0xc6,-0xc8,-0x86,-0xbc)+'t']=_0x5e2bcf(-0x103,-0xea,-0xfe,-0x101)+_0x5e2bcf(-0xe4,-0xe6,-0xc3,-0xf4)+'\x0a'+intro;let buttons=[_0x3fa168];const _0x30b30a={};_0x30b30a['url']=pp_user;const _0x479ab5={};_0x479ab5['image']=_0x30b30a,_0x479ab5[_0x5e2bcf(-0xab,-0xb7,-0xc9,-0xe8)]=anunya,_0x479ab5[_0x1a1f72(-0x134,-0x176,-0x196,-0x173)]=_0x1a1f72(-0x178,-0x186,-0x15c,-0x15f)+_0x5e2bcf(-0x9d,-0xc7,-0xea,-0xca),_0x479ab5['buttons']=buttons,_0x479ab5[_0x5e2bcf(-0x12d,-0xf4,-0xdb,-0x102)]=0x4;let buttonMessage=_0x479ab5;jobotz[_0x5e2bcf(-0xa2,-0x8e,-0x6e,-0xd0)+'e'](anu['id'],buttonMessage);}else{if(anu[_0x5e2bcf(-0xb2,-0xa6,-0xa9,-0xc9)]==_0x5e2bcf(-0xce,-0xbc,-0xd1,-0xdb)){anunya2=_0x5e2bcf(-0xd3,-0xd5,-0x9d,-0xf3)+_0x5e2bcf(-0xfd,-0xc0,-0x80,-0xd8)+_0x1a1f72(-0x185,-0x1a7,-0x1db,-0x1c5)+'║║║║╣║║─║\x0a'+_0x1a1f72(-0x181,-0x1ef,-0x19f,-0x1b8)+_0x5e2bcf(-0xa8,-0x9a,-0x6c,-0x7d)+_0x5e2bcf(-0xc4,-0xcc,-0x10d,-0x93)+_0x1a1f72(-0x206,-0x1ae,-0x1c6,-0x1c8)+'\x0a┃\x20╭━━━━━━'+_0x1a1f72(-0x1d3,-0x1c4,-0x19b,-0x19f)+_0x1a1f72(-0x190,-0x173,-0x15d,-0x16e)+_0x5e2bcf(-0x9d,-0x9b,-0x9d,-0x74)+_0x1a1f72(-0x1c1,-0x167,-0x1a9,-0x180)+_0x1a1f72(-0x1e4,-0x1e5,-0x1a7,-0x1b9)+_0x5e2bcf(-0xea,-0xc5,-0xad,-0xca)+_0x5e2bcf(-0xad,-0xde,-0x106,-0xe1)+_0x1a1f72(-0x199,-0x19a,-0x1d0,-0x1ce)+'━━━━━━━━━━'+_0x5e2bcf(-0xd6,-0xa4,-0xd3,-0xcf)+_0x5e2bcf(-0xc1,-0x9c,-0xa1,-0xcf)+_0x5e2bcf(-0xc4,-0xaf,-0xd9,-0xea)+_0x1a1f72(-0x1aa,-0x1cd,-0x1bb,-0x1b7)+'━━━━━━━━━━'+_0x1a1f72(-0x1d6,-0x162,-0x16b,-0x1a5)+_0x5e2bcf(-0x8d,-0x85,-0xc5,-0x8a)+_0x1a1f72(-0x1eb,-0x1be,-0x1c8,-0x1c4)+num[_0x5e2bcf(-0xe7,-0xd8,-0xd9,-0xb6)]('@')[-0x1556*0x1+-0xc6d*-0x1+0x1*0x8e9]+(_0x1a1f72(-0x1fb,-0x1f8,-0x206,-0x1c7)+_0x5e2bcf(-0xa7,-0x92,-0x77,-0xc8)+_0x5e2bcf(-0xd8,-0xa5,-0x76,-0x85)+_0x5e2bcf(-0xeb,-0xfa,-0xba,-0xc7)+_0x1a1f72(-0x1e1,-0x1a0,-0x1ba,-0x1cd))+metadata['subject']+(_0x5e2bcf(-0xa1,-0xb3,-0xc7,-0xab)+_0x1a1f72(-0x19f,-0x1e0,-0x1d6,-0x1a2)+_0x5e2bcf(-0x57,-0x88,-0x76,-0x8b)+'݊⃟\x20𝐓𝐇𝐄_𝐉𝐎_𝐁'+'𝐎𝐓\x20݊⃟̥⃝̇݊⃟╾━━━'+_0x5e2bcf(-0xd8,-0xe2,-0x110,-0xc2)+_0x1a1f72(-0x1c3,-0x1a2,-0x1af,-0x19f)+_0x1a1f72(-0x1e6,-0x1a5,-0x166,-0x1a5)+'─────────╮'+'\x0a┃││\x20❍\x20𝐒𝐔𝐁'+_0x5e2bcf(-0x50,-0x8d,-0x6b,-0x70)+_0x5e2bcf(-0xa3,-0x80,-0x8c,-0x8d)+_0x1a1f72(-0x1ea,-0x185,-0x188,-0x1af)+_0x5e2bcf(-0xa2,-0x93,-0xd5,-0xba)+'┃│⃟❍➢\x20𝐓𝐇𝐄\x20𝐉'+_0x5e2bcf(-0x10a,-0xe7,-0xfe,-0xed)+'\x20https://y'+_0x1a1f72(-0x1bb,-0x19e,-0x181,-0x1b1)+_0x5e2bcf(-0xb9,-0x90,-0x4f,-0x66)+_0x1a1f72(-0x1cc,-0x1d6,-0x1b7,-0x199)+_0x5e2bcf(-0x84,-0x7e,-0x6c,-0x8c)+'56w\x0a┃╰━━━━'+_0x5e2bcf(-0x8a,-0xca,-0xa9,-0xb8)+_0x5e2bcf(-0x13c,-0xfc,-0x122,-0xed)+_0x5e2bcf(-0x82,-0x7c,-0x75,-0x9c)+_0x1a1f72(-0x1b2,-0x19a,-0x1b3,-0x189)+'━━━╯\x0a\x20▰▱▰▱'+_0x1a1f72(-0x175,-0x18e,-0x194,-0x166)+'\x0a\x0a©⏤͟͟͞𝐓𝐇𝐄\x20𝐉'+_0x1a1f72(-0x1b7,-0x1c4,-0x1b1,-0x1b0));const _0x1baadb={};_0x1baadb[_0x1a1f72(-0x192,-0x15d,-0x16a,-0x19b)]=''+entri,_0x1baadb[_0x5e2bcf(-0x8d,-0x82,-0x40,-0x8e)]={},_0x1baadb[_0x5e2bcf(-0xc5,-0xa3,-0x63,-0x6e)]=0x1,_0x1baadb[_0x5e2bcf(-0x8d,-0x82,-0x40,-0x8e)][_0x1a1f72(-0x16b,-0x179,-0x1dc,-0x19d)+'t']=_0x1a1f72(-0x16f,-0x120,-0x179,-0x160)+_0x5e2bcf(-0x132,-0xf7,-0xd4,-0xd3)+entri;let buttons=[_0x1baadb];const _0x2db3ed={};_0x2db3ed[_0x5e2bcf(-0xdc,-0xeb,-0xf8,-0x11c)]=pp_user;const _0x11dd8d={};_0x11dd8d['image']=_0x2db3ed,_0x11dd8d[_0x5e2bcf(-0x97,-0xb7,-0xb0,-0xcb)]=anunya2,_0x11dd8d[_0x1a1f72(-0x131,-0x135,-0x1aa,-0x173)]=_0x5e2bcf(-0xaf,-0x8a,-0x78,-0xb5)+_0x5e2bcf(-0xf2,-0xc7,-0xe0,-0x9f),_0x11dd8d['buttons']=buttons,_0x11dd8d[_0x1a1f72(-0x1a1,-0x1e2,-0x203,-0x1c9)]=0x4;let buttonMessage=_0x11dd8d;jobotz[_0x5e2bcf(-0x67,-0x8e,-0x52,-0x80)+'e'](anu['id'],buttonMessage);}}}}catch(_0xa36ef8){console[_0x5e2bcf(-0x114,-0xe0,-0xa0,-0xca)](_0xa36ef8);}}function _0x3011(){const _0x35972b=['search','Ctgih','url','𝐖𝐄𝐋𝐂𝐎𝐌𝐄\x20\x20\x20','DPuME','378462ZqPOkd','𝐎\x20𝐁𝐎𝐓\x0a┃│⃟❍➢','\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20','LLQUu','𝐆𝐎𝐎𝐃\x20𝐁𝐘𝐄\x20❍','─╩─╩─╩╚╝╚╝','•\x0a┃╭━━━━━━','rOuUG','log','56w\x0a┃╰━━━━','─────────╯','JXUNp','outube.com','𝐎\x20𝐁𝐎𝐓\x0a','─────╯\x0a┃│⃟❍','YTNAm','split','NnkoX','kcOjO','\x0a╔╦╗╦─╦╔╗─','nction()\x20','add','xniGN','7476KuCFQJ','╾•\x0a┃│╭┈───','prototype','3627708QIobFs','━━━━━━━━━╾','━━❍𝐓𝐇𝐄_𝐉𝐎_','bar-Foto-P','━━━━━━━━━━','constructo','displayTex','𝐁𝐎𝐓','buttonId','\x0a┃\x20┃\x20╰┈───','C-wt99jFVc','w.gambarun','subject','𝐌𝐄\x20𝐈𝐍\x0a┃│⃟❍➢','╦╔╗╦╗╔╗╔╦╗','exception','QaoPb','ONanM','remove','jJXEO','toString','return\x20(fu','USVky','caption','ontent/upl','╮\x0a┃\x20┃\x20│\x20\x20❍','𝐎_𝐁𝐎𝐓\x20݊⃟̥⃝̇݊⃟╾','\x0a┃╰━━━━━━━','https://i0','06/Top-Gam','2019213tQpxmg','𝐎𝐓\x20݊⃟̥⃝̇݊⃟╾━━━','145HRogTY','eMtIM','\x20𝐖𝐄𝐋𝐂𝐎𝐌𝐄\x20❍','╮\x0a┃\x20┃\x20│\x20❍\x20','vDQGx','𝐉𝐎\x20𝐁𝐎𝐓\x0a','warn','ik.id/wp-c','action','┃│⃟❍➢\x20𝐋𝐄𝐀𝐕𝐈','╯\x0a┣━━━╼⃟݊⃟̥⃝̇݊','type','bind','ZGJra','ng-Lucu-Te','RvlGa','footer','image','݊⃟\x20𝐓𝐇𝐄_𝐉𝐎_𝐁','──────────','╚╝╩╝╚╝─╩\x0a╭','╮\x0a┃\x20┃\x20╭┈──','length','║║║║╣║║─║\x0a','DjKZA','1356568AeNzRV','console','➢\x20𝐘𝐎𝐔𝐓𝐔𝐁𝐄\x0a','────────╯\x0a','▰▱▰▱▰▱▰▱▰▱','/channel/U','apply','sendMessag','𝐒𝐂𝐑𝐈𝐁𝐄\x20❍\x0a┃','oads/2019/','𝐆𝐎𝐎𝐃\x20𝐁𝐘𝐄\x20\x20','©⏤͟͟͞𝐓𝐇𝐄\x20𝐉𝐎\x20','jAwWB','•\x0a┣━━━╼⃟݊⃟̥⃝̇݊','kAqFh','participan','─────────╮','\x20https://y','EuDqm','buttonText','wgSRt','│╰┈───────','{}.constru','-zXMkxKRDZ','┃│⃟❍➢\x20𝐖𝐄𝐋𝐂𝐎','݊⃟̥⃝̇݊݊⃟\x20𝐓𝐇𝐄_𝐉','profilePic','12364312GPIJlg','tureUrl','.wp.com/ww','━━╾•\x0a╰━━━╼⃟','table','𝐍𝐆\x20𝐅𝐑𝐎𝐌\x0a┃│⃟','\x0a┃\x20╰━━━━━━','❍➢\x20','\x20\x20\x20\x0a','3960960pHXrqr','┃│⃟❍➢\x20𝐓𝐇𝐄\x20𝐉','headerType','𝐁𝐎𝐓_𝐕𝟗❍━━╮','❍\x0a┃│╰┈────','WKGYg','\x0a─║─╠═╣╠──','\x0a┃││❍@','rofil-Koso'];_0x3011=function(){return _0x35972b;};return _0x3011();}})
	
    // Setting
    jobotz.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }
    
    jobotz.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = jobotz.decodeJid(contact.id)
            if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
        }
    })

    jobotz.getName = (jid, withoutContact  = false) => {
        id = jobotz.decodeJid(jid)
        withoutContact = jobotz.withoutContact || withoutContact 
        let v
        if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
            v = store.contacts[id] || {}
            if (!(v.name || v.subject)) v = jobotz.groupMetadata(id) || {}
            resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = id === '0@s.whatsapp.net' ? {
            id,
            name: 'WhatsApp'
        } : id === jobotz.decodeJid(jobotz.user.id) ?
            jobotz.user :
            (store.contacts[id] || {})
            return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }
    
    jobotz.sendContact = async (jid, kon, quoted = '', opts = {}) => {
	let list = []
	for (let i of kon) {
	    list.push({
	    	displayName: await jobotz.getName(i + '@s.whatsapp.net'),
	    	vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await jobotz.getName(i + '@s.whatsapp.net')}\nFN:${await jobotz.getName(i + '@s.whatsapp.net')}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nitem2.EMAIL;type=INTERNET:okeae2410@gmail.com\nitem2.X-ABLabel:Email\nitem3.URL:https://instagram.com/cak_haho\nitem3.X-ABLabel:Instagram\nitem4.ADR:;;Indonesia;;;;\nitem4.X-ABLabel:Region\nEND:VCARD`
	    })
	}
	jobotz.sendMessage(jid, { contacts: { displayName: `${list.length} Kontak`, contacts: list }, ...opts }, { quoted })
    }
    
    jobotz.setStatus = (status) => {
        jobotz.query({
            tag: 'iq',
            attrs: {
                to: '@s.whatsapp.net',
                type: 'set',
                xmlns: 'status',
            },
            content: [{
                tag: 'status',
                attrs: {},
                content: Buffer.from(status, 'utf-8')
            }]
        })
        return status
    }
	
    jobotz.public = true

    jobotz.serializeM = (m) => smsg(jobotz, m, store)

    jobotz.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update	    
        if (connection === 'close') {
        let reason = new Boom(lastDisconnect?.error)?.output.statusCode
            if (reason === DisconnectReason.badSession) { console.log(`Bad Session File, Please Delete Session and Scan Again`); jobotz.logout(); }
            else if (reason === DisconnectReason.connectionClosed) { console.log("Connection closed, reconnecting...."); startjobotz(); }
            else if (reason === DisconnectReason.connectionLost) { console.log("Connection Lost from Server, reconnecting..."); startjobotz(); }
            else if (reason === DisconnectReason.connectionReplaced) { console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First"); jobotz.logout(); }
            else if (reason === DisconnectReason.loggedOut) { console.log(`Device Logged Out, Please Scan Again And Run.`); jobotz.logout(); }
            else if (reason === DisconnectReason.restartRequired) { console.log("Restart Required, Restarting..."); startjobotz(); }
            else if (reason === DisconnectReason.timedOut) { console.log("Connection TimedOut, Reconnecting..."); startjobotz(); }
            else jobotz.end(`Unknown DisconnectReason: ${reason}|${connection}`)
        }
        console.log('Connected...', update)
    })

    jobotz.ev.on('creds.update', saveState)

    // Add Other

      /**
      *
      * @param {*} jid
      * @param {*} url
      * @param {*} caption
      * @param {*} quoted
      * @param {*} options
      */
     jobotz.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
      let mime = '';
      let res = await axios.head(url)
      mime = res.headers['content-type']
      if (mime.split("/")[1] === "gif") {
     return jobotz.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options}, { quoted: quoted, ...options})
      }
      let type = mime.split("/")[0]+"Message"
      if(mime === "application/pdf"){
     return jobotz.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options}, { quoted: quoted, ...options })
      }
      if(mime.split("/")[0] === "image"){
     return jobotz.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options}, { quoted: quoted, ...options})
      }
      if(mime.split("/")[0] === "video"){
     return jobotz.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options}, { quoted: quoted, ...options })
      }
      if(mime.split("/")[0] === "audio"){
     return jobotz.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options}, { quoted: quoted, ...options })
      }
      }

    /** Send List Messaage
      *
      *@param {*} jid
      *@param {*} text
      *@param {*} footer
      *@param {*} title
      *@param {*} butText
      *@param [*] sections
      *@param {*} quoted
      */
        jobotz.sendListMsg = (jid, text = '', footer = '', title = '' , butText = '', sects = [], quoted) => {
        let sections = sects
        var listMes = {
        text: text,
        footer: footer,
        title: title,
        buttonText: butText,
        sections
        }
        jobotz.sendMessage(jid, listMes, { quoted: quoted })
        }

    /** Send Button 5 Message
     * 
     * @param {*} jid
     * @param {*} text
     * @param {*} footer
     * @param {*} button
     * @returns 
     */
        jobotz.send5ButMsg = (jid, text = '' , footer = '', but = []) =>{
        let templateButtons = but
        var templateMessage = {
        text: text,
        footer: footer,
        templateButtons: templateButtons
        }
        jobotz.sendMessage(jid, templateMessage)
        }

    /** Send Button 5 Image
     *
     * @param {*} jid
     * @param {*} text
     * @param {*} footer
     * @param {*} image
     * @param [*] button
     * @param {*} options
     * @returns
     */
    jobotz.send5ButImg = async (jid , text = '' , footer = '', img, but = [], options = {}) =>{
        let message = await prepareWAMessageMedia({ image: img }, { upload: jobotz.waUploadToServer })
        var template = generateWAMessageFromContent(jid, proto.Message.fromObject({
        templateMessage: {
        hydratedTemplate: {
        imageMessage: message.imageMessage,
               "hydratedContentText": text,
               "hydratedFooterText": footer,
               "hydratedButtons": but
            }
            }
            }), options)
            jobotz.relayMessage(jid, template.message, { messageId: template.key.id })
    }

    /** Send Button 5 Video
     *
     * @param {*} jid
     * @param {*} text
     * @param {*} footer
     * @param {*} Video
     * @param [*] button
     * @param {*} options
     * @returns
     */
    jobotz.send5ButVid = async (jid , text = '' , footer = '', vid, but = [], options = {}) =>{
        let message = await prepareWAMessageMedia({ video: vid }, { upload: jobotz.waUploadToServer })
        var template = generateWAMessageFromContent(jid, proto.Message.fromObject({
        templateMessage: {
        hydratedTemplate: {
        videoMessage: message.videoMessage,
               "hydratedContentText": text,
               "hydratedFooterText": footer,
               "hydratedButtons": but
            }
            }
            }), options)
            jobotz.relayMessage(jid, template.message, { messageId: template.key.id })
    }

    /** Send Button 5 Gif
     *
     * @param {*} jid
     * @param {*} text
     * @param {*} footer
     * @param {*} Gif
     * @param [*] button
     * @param {*} options
     * @returns
     */
    jobotz.send5ButGif = async (jid , text = '' , footer = '', gif, but = [], options = {}) =>{
        let message = await prepareWAMessageMedia({ video: gif, gifPlayback: true }, { upload: jobotz.waUploadToServer })
        var template = generateWAMessageFromContent(jid, proto.Message.fromObject({
        templateMessage: {
        hydratedTemplate: {
        videoMessage: message.videoMessage,
               "hydratedContentText": text,
               "hydratedFooterText": footer,
               "hydratedButtons": but
            }
            }
            }), options)
            jobotz.relayMessage(jid, template.message, { messageId: template.key.id })
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} buttons 
     * @param {*} caption 
     * @param {*} footer 
     * @param {*} quoted 
     * @param {*} options 
     */
    jobotz.sendButtonText = (jid, buttons = [], text, footer, quoted = '', options = {}) => {
        let buttonMessage = {
            text,
            footer,
            buttons,
            headerType: 2,
            ...options
        }
        jobotz.sendMessage(jid, buttonMessage, { quoted, ...options })
    }
    
    /**
     * 
     * @param {*} jid 
     * @param {*} text 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    jobotz.sendText = (jid, text, quoted = '', options) => jobotz.sendMessage(jid, { text: text, ...options }, { quoted })

    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} caption 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    jobotz.sendImage = async (jid, path, caption = '', quoted = '', options) => {
	let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        return await jobotz.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted })
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} caption 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    jobotz.sendVideo = async (jid, path, caption = '', quoted = '', gif = false, options) => {
        let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        return await jobotz.sendMessage(jid, { video: buffer, caption: caption, gifPlayback: gif, ...options }, { quoted })
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} quoted 
     * @param {*} mime 
     * @param {*} options 
     * @returns 
     */
    jobotz.sendAudio = async (jid, path, quoted = '', ptt = false, options) => {
        let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        return await jobotz.sendMessage(jid, { audio: buffer, ptt: ptt, ...options }, { quoted })
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} text 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    jobotz.sendTextWithMentions = async (jid, text, quoted, options = {}) => jobotz.sendMessage(jid, { text: text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, ...options }, { quoted })

    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    jobotz.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options)
        } else {
            buffer = await imageToWebp(buff)
        }

        await jobotz.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
        return buffer
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    jobotz.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        let buffer
        if (options && (options.packname || options.author)) {
            buffer = await writeExifVid(buff, options)
        } else {
            buffer = await videoToWebp(buff)
        }

        await jobotz.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
        return buffer
    }
	
    /**
     * 
     * @param {*} message 
     * @param {*} filename 
     * @param {*} attachExtension 
     * @returns 
     */
    jobotz.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(quoted, messageType)
        let buffer = Buffer.from([])
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
	let type = await FileType.fromBuffer(buffer)
        trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
        // save to file
        await fs.writeFileSync(trueFileName, buffer)
        return trueFileName
    }

    jobotz.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
	}
        
	return buffer
     } 
    
    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} filename
     * @param {*} caption
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    jobotz.sendMedia = async (jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
        let types = await jobotz.getFile(path, true)
           let { mime, ext, res, data, filename } = types
           if (res && res.status !== 200 || file.length <= 65536) {
               try { throw { json: JSON.parse(file.toString()) } }
               catch (e) { if (e.json) throw e.json }
           }
       let type = '', mimetype = mime, pathFile = filename
       if (options.asDocument) type = 'document'
       if (options.asSticker || /webp/.test(mime)) {
        let { writeExif } = require('./lib/exif')
        let media = { mimetype: mime, data }
        pathFile = await writeExif(media, { packname: options.packname ? options.packname : global.packname, author: options.author ? options.author : global.author, categories: options.categories ? options.categories : [] })
        await fs.promises.unlink(filename)
        type = 'sticker'
        mimetype = 'image/webp'
        }
       else if (/image/.test(mime)) type = 'image'
       else if (/video/.test(mime)) type = 'video'
       else if (/audio/.test(mime)) type = 'audio'
       else type = 'document'
       await jobotz.sendMessage(jid, { [type]: { url: pathFile }, caption, mimetype, fileName, ...options }, { quoted, ...options })
       return fs.promises.unlink(pathFile)
       }

    /**
     * 
     * @param {*} jid 
     * @param {*} message 
     * @param {*} forceForward 
     * @param {*} options 
     * @returns 
     */
    jobotz.copyNForward = async (jid, message, forceForward = false, options = {}) => {
        let vtype
		if (options.readViewOnce) {
			message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
			vtype = Object.keys(message.message.viewOnceMessage.message)[0]
			delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
			delete message.message.viewOnceMessage.message[vtype].viewOnce
			message.message = {
				...message.message.viewOnceMessage.message
			}
		}

        let mtype = Object.keys(message.message)[0]
        let content = await generateForwardMessageContent(message, forceForward)
        let ctype = Object.keys(content)[0]
		let context = {}
        if (mtype != "conversation") context = message.message[mtype].contextInfo
        content[ctype].contextInfo = {
            ...context,
            ...content[ctype].contextInfo
        }
        const waMessage = await generateWAMessageFromContent(jid, content, options ? {
            ...content[ctype],
            ...options,
            ...(options.contextInfo ? {
                contextInfo: {
                    ...content[ctype].contextInfo,
                    ...options.contextInfo
                }
            } : {})
        } : {})
        await jobotz.relayMessage(jid, waMessage.message, { messageId:  waMessage.key.id })
        return waMessage
    }

    jobotz.cMod = (jid, copy, text = '', sender = jobotz.user.id, options = {}) => {
        //let copy = message.toJSON()
		let mtype = Object.keys(copy.message)[0]
		let isEphemeral = mtype === 'ephemeralMessage'
        if (isEphemeral) {
            mtype = Object.keys(copy.message.ephemeralMessage.message)[0]
        }
        let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
		let content = msg[mtype]
        if (typeof content === 'string') msg[mtype] = text || content
		else if (content.caption) content.caption = text || content.caption
		else if (content.text) content.text = text || content.text
		if (typeof content !== 'string') msg[mtype] = {
			...content,
			...options
        }
        if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
		else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
		if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
		else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
		copy.key.remoteJid = jid
		copy.key.fromMe = sender === jobotz.user.id

        return proto.WebMessageInfo.fromObject(copy)
    }


    /**
     * 
     * @param {*} path 
     * @returns 
     */
    jobotz.getFile = async (PATH, save) => {
        let res
        let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
        //if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
        let type = await FileType.fromBuffer(data) || {
            mime: 'application/octet-stream',
            ext: '.bin'
        }
        filename = path.join(__filename, '../lib/' + new Date * 1 + '.' + type.ext)
        if (data && save) fs.promises.writeFile(filename, data)
        return {
            res,
            filename,
	    size: await getSizeMedia(data),
            ...type,
            data
        }

    }

    return jobotz
}

startjobotz()


let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update ${__filename}`))
	delete require.cache[file]
	require(file)
})
