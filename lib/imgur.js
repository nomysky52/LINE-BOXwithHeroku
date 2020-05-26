const clientId = 'e6cd0f108cc2191'; // 填入 App 的 Client ID
const channelAccessToken = '8b9bf5da010f978e77ae3813ea1c5113792d1e6a'; // 填入 token
const album = ''; // 若要指定傳到某個相簿，就填入相簿的 ID
// imgur
// Client ID:
// fcbd8a365917116
//e6cd0f108cc2191
// Client secret:
// 4a133e1b1249f93130b4620e4aff3a5be0724d7d
//04901adaba308a3c8b8f93af1ef268d7d253add6
//token
//8b9bf5da010f978e77ae3813ea1c5113792d1e6a
//315360000
//bearer
//023e38dd31abbfeb1ba630be63c06b500c3c6fa8
//131372915
//carzy1314love

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
			album: null, // 若要指定傳到某個相簿，就填入相簿的 ID
			file: buffer, // 準備拿 input type="file" 的值
			fs: {
				name: '', // input的圖檔名稱
				thumbnail: null, // input的圖片縮圖
				size: null // input的圖片大小
			},
			title: '', // 圖片標題
			des: '' // 圖片描述
		},
		headers: {
			Authorization: 'Bearer ' + channelAccessToken
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
