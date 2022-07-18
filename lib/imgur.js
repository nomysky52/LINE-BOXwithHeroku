'use strict'; // Required to use class in node v4
//<script type="text/javascript" src="https://code.jquery.com/jquery-3.3.1.js"></script>

const clientId = '51b32e444651ba9'; // 填入 App 的 Client ID
const channelAccessToken = 'f2da6bd06c6be002bcc84b11af489ea63d9d209e'; // 填入 token
const album = ''; // 若要指定傳到某個相簿，就填入相簿的 ID

const EventEmitter = require('events');
const crypto = require('crypto');
const http = require('http');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

class Imgur extends EventEmitter {
	//constructor(options) {
		//super();
		// this.options = options || {};
		// this.options.clientId = options.clientId || '';
		// this.options.channelAccessToken = options.channelAccessToken || '';
		// this.headers = {
			// Accept: 'application/json',
			// 'Content-Type': 'application/json',
			// Authorization: 'Bearer ' + this.options.channelAccessToken
		// };
		// this.endpoint = 'https://api.imgur.com/3/image';
		//console.log(options);
	//}
	parse(body) {
		const that = this;
		if (!body) {
			return;
		}
		body.forEach(function() {
			body.imgurUpload = function (imgurname,buffer) {
				return that.imgurUpload(imgurname,buffer);
			};
		});
	}
	imgurUpload(imgurname,buffer)
	{
		const url = 'https://api.imgur.com/3/image';
		const options = { method: 'POST'
			, headers: {
				Authorization: 'Client-ID ' + clientId
			}, body: {
				image: buffer,
				album: null,
				type: 'file',
				name: imgurname + '.jpg',
				title: imgurname,
				description: '',
			}, formData: {
				type: 'file',
				image: buffer
			}
		};
		return fetch(url, options);
	}
}
function imgurUpload(buffer)
{
	$.ajax({
		url: "https://api.imgur.com/3/image/",
		type: 'POST',
		async: false,
		crossDomain: true,
		processData: false,
		contentType: false,
		data: {
			album: null,         // 若要指定傳到某個相簿，就填入相簿的 ID
			file: buffer,        // 準備拿 input type="file" 的值
			fs: {
				name: '',        // input的圖檔名稱
				thumbnail: null, // input的圖片縮圖
				size: null       // input的圖片大小
			},
			title: '',           // 圖片標題
			des: ''              // 圖片描述
		},
		headers: {
			Authorization: 'Bearer ' + channelAccessToken,
            Accept: 'application/json'
		},
		mimeType: 'multipart/form-data',
        success: function (result) {
			if(result.StatusCode == 1) // 取得成功
			{
				console.log('OK'+result); // 可以看見上傳成功後回的值
			}
			else // 上傳失敗
			{
				console.log(result); // 上傳失敗後回的值
			}
        },
        error: function (data, status, xhr) 
        { // 其他錯誤
			console.log('Error:'+  data.status +':'+ data.statusText + '['+ data.responseText +']');
			console.log('Error:'+  status +':'+ xhr);
		}
    });
}

function createBot(options) {
	return new Imgur(options);
}

module.exports = createBot;
module.exports.Imgur = Imgur;