const chalk = require('chalk')
const axios = require('axios')
let FormData = require('form-data')


module.exports.filterGroupAdmin = (participants) => {
	listadmin = new Array();
	participants.forEach(a =>{
		a.isAdmin ? listadmin.push(a.jid) : ''
	})
	return listadmin
}
module.exports.urlshortner = async (url) => {
	const getdt = await axios.get(`https://tinyurl.com/api-create.php?url=${url}&alias=bots-${this.randomString(7)}`)
	return getdt.data
}
module.exports.randomString = (length) => {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyzsadw'
    let str = '';
	lengt = length || 9
    for (var i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * 65)];
    }
	return str
}
module.exports.getBuffer = async (url, opts) => {
	try {
		const reqdata = await axios({
      method: "get",
      url,
      headers: {
        'DNT': 1,
        'Upgrade-Insecure-Requests': 1,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36'
      },
      ...opts,
      responseType: 'arraybuffer'
    });
		return reqdata.data
	} catch (e) {
     throw e
	}
}
module.exports.color = (text, color) => {
    return chalk.keyword(color || 'green')(text)
}
module.exports.convertMp3 = (buffer, resBuffer) => new Promise(async (resolve, reject) =>{
  let dataForm = new FormData()
  dataForm.append("class", 'audio')
  dataForm.append("from", 'mp4')
  dataForm.append("to", 'mp3')
  dataForm.append("source", 'file')
  dataForm.append("file", buffer, 'file.mp4')
  const gethost = await axios.get('https://www.onlineconverter.com/get/host',{
     headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36',
      origin: 'https://www.onlineconverter.com',
    referer: 'https://www.onlineconverter.com/',
    }
  })
  axios(gethost.data,{
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36',
      "Content-Type": 'multipart/form-data',
      origin: 'https://www.onlineconverter.com',
    referer: 'https://www.onlineconverter.com/',
      ...dataForm.getHeaders()
    },
    data: dataForm.getBuffer()
  }).then(async ({data}) =>{
      const fileId = data.split('\u0000\u0000\u0000')[0].split('convert/')[1]
  await sleep(5000)
  const dlLink = gethost.data.split('send')[0]+fileId+'/download'
  if (resBuffer){
  axios.get(dlLink,{
    responseType: 'arraybuffer',
     headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36'
    }
  }).then(({data}) =>resolve(data)).catch(reject)
} else resolve(dlLink)
  }).catch(reject)
})

module.exports.parseMs = (milliseconds) => {
	if (typeof milliseconds !== 'number') throw new TypeError('Parameter must be filled with number');
	return {
		days: Math.trunc(milliseconds / 86400000),
		hours: Math.trunc(milliseconds / 3600000) % 24,
		minutes: Math.trunc(milliseconds / 60000) % 60,
		seconds: Math.trunc(milliseconds / 1000) % 60,
		milliseconds: Math.trunc(milliseconds) % 1000,
		microseconds: Math.trunc(milliseconds * 1000) % 1000,
		nanoseconds: Math.trunc(milliseconds * 1e6) % 1000
	};
}
const converters = {
	days: value => value * 864e5,
	hours: value => value * 36e5,
	minutes: value => value * 6e4,
	seconds: value => value * 1e3,
	milliseconds: value => value,
	microseconds: value => value / 1e3,
	nanoseconds: value => value / 1e6
};
module.exports.toMs = (objs) => {
	if (typeof objs !== 'object') throw new TypeError('parameter must be filled with object')
	let totalMilliseconds = 0;
	for (var [key, value] of Object.entries(objs)) {
		if (typeof value !== 'number') throw new TypeError(`Expected a \`number\` for key \`${key}\`, got \`${value}\` (${typeof value})`);
		const converter = converters[key];
		if (!converter) throw new Error(`Unsupported time key: ${key}`);
		totalMilliseconds += converter(value);
	}
	return totalMilliseconds;
};
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}