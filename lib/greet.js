const fs = require('fs')
module.exports = async (jdgn, Client, client) =>{
try {
			const dataGc = JSON.parse(fs.readFileSync('./lib/json/dataGc.json'))
			from = jdgn.jid
			if (!dataGc[from] || !dataGc[from].welcome && !dataGc[from].leave) return
			const mdata = await client.groupMetadata(from)
			jdgn.participants.forEach(async num =>{
			if (num == client.user.jid) return
			if (jdgn.action == 'add') {
				stst = await client.getStatus(`${num.split('@')[0]}@c.us`)
				stst = stst.status == 401 ? '' : stst.status
				ppimg = await client.getProfilePicture(`${num.split('@')[0]}@c.us`).catch(() => ppimg = 'https://i.postimg.cc/0QvnZRjs/20220218-211032.png')
				teks = `*welcome to ${mdata.subject}*\n\n●▬▬▬▬▬▬▬๑۩✰۩๑▬▬▬▬▬▬▬▬●\n ➣・@${num.split('@')[0]}\n ➣・ ${stst}\n ➣・${mdata.subject}\n●▬▬▬▬▬▬▬๑۩✰۩๑▬▬▬▬▬▬▬▬●\n\nSelamat Datang 🎊🎉🥳!`
				let pushname = client.contacts[num].vname || client.contacts[num].notify || num.split('@')[0] 
				Client.sendFileFromUrl(jdgn.jid, ppimg, 'user.jpg', teks, null, {contextInfo: {"mentionedJid": Client.getMentionedJidList(teks), "stanzaId":"xxxx","participant":"0@s.whatsapp.net","quotedMessage":{"groupInviteMessage":{"groupJid":from,"inviteCode":"OKOKLAH","inviteExpiration":9999,"groupName":from,"caption":`${pushname} telah join ${mdata.subject}`}},"remoteJid":num}})
			} else if (jdgn.action == 'remove') {
				stst = await client.getStatus(`${num.split('@')[0]}@c.us`)
				stst = stst.status == 401 ? '' : stst.status
				var ppimg;
				ppimg = await client.getProfilePicture(`${num.split('@')[0]}@c.us`).catch(() => ppimg = 'https://i.postimg.cc/vBtsyYLB/20220218-235647.png')
				teks = `*GOOD BYE*\n\n●▬▬▬▬▬▬▬๑۩✰۩๑▬▬▬▬▬▬▬▬●\n ➣・@${num.split('@')[0]} \n ➣・ ${stst}\n ➣・ ${mdata.subject}\n●▬▬▬▬▬▬▬๑۩✰۩๑▬▬▬▬▬▬▬▬●\n\nSelamat tinggal 😭 :(`
				let pushname = client.contacts[num].vname || client.contacts[num].notify || num.split('@')[0] 
				Client.sendFileFromUrl(jdgn.jid, ppimg, 'user.jpg', teks, null, {contextInfo: {"mentionedJid": Client.getMentionedJidList(teks), "stanzaId":"xxxx","participant":"0@s.whatsapp.net","quotedMessage":{"groupInviteMessage":{"groupJid":from,"inviteCode":"OKOKLAH","inviteExpiration":9999,"groupName":from,"caption":`${pushname} telah keluar ${mdata.subject}`}},"remoteJid":num}})
			}
			})
		} catch (e) {
			console.log(e)
		}
				}