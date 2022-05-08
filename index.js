const {
    WAConnection,
    MessageType,
    Presence,
    MessageOptions,
    Mimetype,
    WALocationMessage,
    WA_MESSAGE_STUB_TYPES,
    messageStubType,
    ReconnectMode,
    ProxyAgent,
    waChatKey,
    WAMessageProto,
	prepareMessageFromContent,
    relayWAMessage,
} = require("@adiwajshing/baileys");
const fs = require('fs');
const moment = require('moment-timezone');
const afkJs = require('./lib/afk')
const yargs = require('yargs/yargs')
const vn = JSON.parse(fs.readFileSync('./lib/json/vn.json'))
const ClientJs = require('./lib/client');
const cron = require('node-cron');
global.configs = JSON.parse(fs.readFileSync('./config.json'));
let dataUser = JSON.parse(fs.readFileSync('./lib/json/dataUser.json'))
global.vn = JSON.parse(fs.readFileSync('./lib/json/vn.json'))
global.tebakgambar = {}
moment.tz.setDefault('Asia/Jakarta').locale('id');
const { color } = require('./lib/func')
const Crypto = require('crypto')

const starts = async (sesName) => {
    try {
        const Client = new ClientJs(global.configs, sesName || global.configs.defaultSessionName)
		const client = Client.mainClient
		require("./lib/http-server")(client)
        Client.starts()
		detectChange('./handler.js', (mdl) =>{
			try{
			Client.cmd.removeAllListeners()
			Client.handlerStick.removeAllListeners()
			require('./handler')(client, Client)
			console.log(color('[ INFO ]', 'cyan'), `${mdl} update terdeteksi!`)
			} catch (err) {
             console.error(err)
           }
		})
		require('./handler')(client, Client)
		
        client.on('CB:Presence', asd => {
        	asd = asd[1]
            if (!asd.id.endsWith('@g.us')) return
            if((asd.type == 'composing' || asd.type == 'recording') && afkJs.detectingAfk(asd.id, asd.participant)) {
            Client.sendText(asd.id, `@${asd.participant.split('@')[0]} terdeteksi melakukan aktivitas!, status *afk* mu telah dihapus\n\nhttps://wa.me/c/6289630985223`)
                }
        })
		client.on('CB:Call', json => {
			client.query({json: ["action","call",["call",{"from":client.user.jid,"to":json[1].from,"id":generateMessageID()},[["reject",{"call-id":json[1].id,"call-creator":json[1].from,"count":"0"},null]]]]}).then(() =>{
			setTimeout(async () =>{
			if (Client.blocklist.includes(json[1].from)) return
			client.blockUser(json[1].from, 'add')   
			}, 3000)
		}).catch()  
		})
        client.on('new-msg', (message) => {
            if(message.key && message.key.remoteJid == 'status@broadcast') return
            if(message.key.fromMe && !Client.self || !message.key.fromMe && Client.self) return
			let dataGc = JSON.parse(fs.readFileSync('./lib/json/dataGc.json'))
			const body = message.body
			const from = message.key.remoteJid
            const isGroup = from.endsWith('@g.us')
            const sender = isGroup ? message.participant : from
			if (global.tebakgambar[from] && global.tebakgambar[from].id && global.tebakgambar[from].jawaban.toLowerCase() == body.toLowerCase()) Client.reply(from, `[YES] TEBAK GAMBAR BERHASIL DIJAWAB OLEH @${sender.split("@")[0]}\n\nhttps://shiroweb-dashboard.221447.repl.co`, message).then(() => global.tebakgambar[from] = {}) 
			if (global.vn.includes(body)) Client.sendPtt(from, `./lib/vn/${body}.mp3`, message)
			if (isGroup && !dataGc[from]){
				dataGc[from] = {afk:{}}
				fs.writeFileSync('./lib/json/dataGc.json', JSON.stringify(dataGc, null, 2))
			}
            if (isGroup && dataGc[from].antitagall && !message.isAdmin && (message.mentionedJidList.length == message.groupMembers.length || message.mentionedJidList.length-1 == message.groupMembers.length)){
                Client.reply(from, '@${sender.split("@")[0]}\nTagall Terdeteksi\n\nhttps://wa.me/c/6289630985223', message)
                client.groupRemove(from, [sender]).catch(() => Client.reply(from, `Jadikan bot admin agar bisa menggunakan fitur antitagall\n\nhttps://wa.me/c/6289630985223`, message))
            }
            if (isGroup && dataGc[from].antiviewonce && message.type == 'viewOnceMessage'){
                var msg = {...message}
                msg.message = message.message.viewOnceMessage.message
                msg.message[Object.keys(msg.message)[0]].viewOnce = false
                Client.reply(from, '@${sender.split("@")[0]}\mViewOnce Terdeteksi!\n\nhttps://wa.me/c/6289630985223', message)
                client.forwardMessage(from, msg)
            }
			if (isGroup && !message.isAdmin && dataGc[from].antilink && /chat\.whatsapp\.com/gi.test(body)){
				let dtclink = body.match(/chat.whatsapp.com\/(?:invite\/)?([0-9A-Za-z]{18,26})/gi) || []
				dtclink.forEach(async l => {
					checks = await Client.checkInviteLink(l)
					if(checks.status == 200){
						Client.reply(from, '@${sender.split("@")[0]}\nGroup link Terdeteksi!\n\nhttps://wa.me/c/6289630985223`, message)
						client.groupRemove(from, [sender]).catch(() => Client.reply(from, `Jadikan bot admin agar bisa menggunakan fitur antilink\n\nhttps://wa.me/c/6289630985223`, message))
					}
				})
			}
			if (!dataUser[sender]){
				dataUser[sender] = {limit: 0, premium: false}
				fs.writeFileSync('./lib/json/dataUser.json', JSON.stringify(dataUser))
			}
            if(isGroup) {
                if(afkJs.detectingAfk(from, sender)) Client.sendText(from, `@${sender.split('@')[0]} sekarang tidak afk!\n\nhttps://shiroweb-dashboard.221447.repl.co`)
                if(message.message.extendedTextMessage && message.message.extendedTextMessage.contextInfo && message.message.extendedTextMessage.contextInfo.mentionedJid) {
                    jids = message.message.extendedTextMessage.contextInfo.mentionedJid
                    jids.forEach(jid => {
                        takeData = afkJs.tagDetect(from, jid)
                        if(!takeData) return
                        duration = moment.duration(moment(takeData.time).diff(moment()))
                        Client.reply(from, `@${jid.split('@')[0]} sedang afk\nReason: ${takeData.reason}\nTime: ${duration.days()} Hari ${duration.hours()} Jam ${duration.minutes()} Menit ${duration.seconds()} detik\n\nhttps://wa.me/c/6289630985223`)
                    })
                }
            }
        })
		client.on('group-participants-update', (jdgn) => require('./lib/greet.js')(jdgn, Client, client))
    } catch (e) {
        console.error(e)
    }
}

cron.schedule('0 0 * * *', () => {
    for (users in dataUser){
		dataUser[users].limit = 0
	}
    fs.writeFileSync('./lib/json/dataUser.json', JSON.stringify(dataUser))
    console.log(color('[ INFO ]', 'cyan'), 'LIMIT DI RESET!')
});
detectChange('./lib/text.js', (mdl) => console.log(color('[ INFO ]', 'cyan'), `${mdl} perubahan terdeteksi!`))
detectChange('./lib/greet.js', (mdl) => console.log(color('[ INFO ]', 'cyan'), `${mdl} perubahan terdeteksi!`))
detectChange('./handler.js', (mdl) => console.log(color('[ INFO ]', 'cyan'), `${mdl} perubahan terdeteksi!`))
detectChange('./index.js', (mdl) => console.log(color('[ INFO ]', 'cyan'), `${mdl} perubahan terdeteksi!`))
detectChange('./lib/afk.js', (mdl) => console.log(color('[ INFO ]', 'cyan'), `${mdl} perubahan terdeteksi!`))
detectChange('./SECURITY.md', (mdl) => console.log(color('[ INFO ]', 'cyan'), `${mdl} Kontol amat ganti isinya!`))
detectChange('./SESSION.md', (mdl) => console.log(color('[ INFO ]', 'cyan'), `${mdl} Kontol amat di ganti isinya!`))
detectChange('./lib/client.js', (mdl) => console.log(color('[ INFO ]', 'cyan'), `${mdl} perubahan terdeteksi!`))
detectChange('./lib/func.js', (mdl) => console.log(color('[ INFO ]', 'cyan'), `${mdl} perubahan terdeteksi!`))
detectChange('./lib/http-server.js', (mdl) => console.log(color('[ INFO ]', 'cyan'), `${mdl} perubahan terdeteksi!`))
detectChange('./lib/log.js', (mdl) => console.log(color('[ INFO ]', 'cyan'), `${mdl} perubahan terdeteksi!`))
detectChange('./lib/json/dataUser.json', (mdl) => console.log(color('[ INFO ]', 'cyan'), `${mdl} perubahan terdeteksi!`))
detectChange('./by-22.1447', (mdl) => console.log(color('[ INFO ]', 'cyan'), `${mdl} kontol!`))
detectChange('./public/Follow-instagram-@22.1447', (mdl) => console.log(color('[ INFO ]', 'cyan'), `${mdl} kontol!`))
detectChange('./Shirobot@22.1447', (mdl) => console.log(color('[ INFO ]', 'cyan'), `${mdl} perubahan terdeteksi kontol!`))
detectChange('./lib/By-スマイル-', (mdl) => console.log(color('[ INFO ]', 'cyan'), `${mdl} perubahan terdeteksi!`))
detectChange('./lib/json/By-スマイル-@22.1447-', (mdl) => console.log(color('[ INFO ]', 'cyan'), `${mdl} perubahan terdeteksi!`))
detectChange('./lib/vn/Shirobot@スマイル', (mdl) => console.log(color('[ INFO ]', 'cyan'), `${mdl} perubahan terdeteksi!`))
detectChange('./lib/temp/Shirobot@Uunkn0wnN', (mdl) => console.log(color('[ INFO ]', 'cyan'), `${mdl} perubahan terdeteksi!`))
detectChange('./lib/json/dataGc.json', (mdl) => console.log(color('[ INFO ]', 'cyan'), `${mdl} perubahan terdeteksi!`))
detectChange('./lib/json/vn.json', (mdl) => console.log(color('[ INFO ]', 'cyan'), `${mdl} perubahan terdeteksi!`))
detectChange('./E3CE1T.json', (mdl) => console.log(color('[ INFO ]', 'cyan'), `${mdl} perubahan terdeteksi!`))
detectChange('./app.json', (mdl) => console.log(color('[ INFO ]', 'cyan'), `${mdl} perubahan terdeteksi!`))
detectChange('./config.json', (mdl) => console.log(color('[ INFO ]', 'cyan'), `${mdl} perubahan terdeteksi!`))
detectChange('./README.md', (mdl) => console.log(color('[ INFO ]', 'cyan'), `${mdl} perubahan terdeteksi!`))
function detectChange(module, cb){ 
	fs.watchFile(require.resolve(module), () => {
	 delete require.cache[require.resolve(module)]
	 if (cb) cb(module)
    })
}
const randomBytes = (length) => {
    return Crypto.randomBytes(length)
}
global.generateMessageID = () => {
    return '3EB0' + randomBytes(7).toString('hex').toUpperCase()
}
global.optn = yargs(process.argv.slice(2)).exitProcess(false).parse()
starts(process.argv[2])
