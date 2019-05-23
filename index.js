// 引用linebot SDK
const linebot = require('./lib/linebot');

// 用於辨識Line Channel的資訊
const bot = linebot({
    channelId: process.env.CHANNEL_ID,
    channelSecret: process.env.CHANNEL_SECRET,
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
});
// 當有人傳送訊息給Bot時 觸發
bot.on('message', function(event) {
    var messagepush = 'userId:' + event.source.userId + '\n';
	var displayName = event.source.profile().then(function (profile) {
		return JSON.stringify(profile.displayName);
    });
	messagepush = messagepush + 'displayName:' + displayName + '\n';
	
    if(typeof event.source.groupId !== "undefined")
	{
		messagepush = messagepush + 'groupId:' + event.source.groupId + '\n'
	}

    switch (event.message.type) {
        case 'text':
            switch (event.message.text) {
                case 'Me':
                    event.source.profile().then(function (profile) {
                        bot.push(process.env.CHANNEL_NO, JSON.stringify(profile));
                        return event.reply('Hello ' + profile.displayName + ' ' + profile.userId);
                    });
                    break;
                case 'Member':
                    event.source.member().then(function (member) {
                        bot.push(process.env.CHANNEL_NO, JSON.stringify(member));
                        return event.reply(JSON.stringify(member));
                    });
                    break;
                case 'Picture':
                    event.reply({
                        type: 'image',
                        originalContentUrl: 'https://d.line-scdn.net/stf/line-lp/family/en-US/190X190_line_me.png',
                        previewImageUrl: 'https://d.line-scdn.net/stf/line-lp/family/en-US/190X190_line_me.png'
                    });
                    break;
                case 'Location':
                    event.reply({
                        type: 'location',
                        title: 'LINE Plus Corporation',
                        address: '1 Empire tower, Sathorn, Bangkok 10120, Thailand',
                        latitude: 13.7202068,
                        longitude: 100.5298698
                    });
                    break;
                case 'Push':
					messagepush = messagepush + String.fromCharCode(0xD83D, 0xDE01)
                    bot.push(process.env.CHANNEL_NO, messagepush);
                    break;
                case 'Push2':
                    bot.push(process.env.CHANNEL_NO, 'Push to group');
                    break;
                case 'Multicast':
                    bot.push(process.env.CHANNEL_NO, 'Multicast!');
                    break;
                case 'Broadcast':
                    bot.broadcast('Broadcast!');
                    break;
                case 'Confirm':
                    event.reply({
                        type: 'template',
                        altText: 'this is a confirm template',
                        template: {
                        type: 'confirm',
                        text: 'Are you sure?',
                        actions: [{
                            type: 'message',
                            label: 'Yes',
                            text: 'yes'
                            }, {
                            type: 'message',
                            label: 'No',
                            text: 'no'
                            }]
                        }
                    });
                break;
                case 'Multiple':
                    return event.reply(['Line 1', 'Line 2', 'Line 3', 'Line 4', 'Line 5']);
                    break;
                case 'Version':
                    event.reply('linebot@' + require('../package.json').version);
                    break;
                default:
                    // 回傳 userId 說了甚麼
                    messagepush = messagepush + ':' + event.message.text
                    bot.push(process.env.CHANNEL_NO, messagepush);
                    break;
            }
            break;
        case 'image':
            // 紀錄 userId 傳了 image
            //messagepush = messagepush + ':' + event.message.type
            //bot.push(process.env.CHANNEL_NO, messagepush);
            bot.push(process.env.CHANNEL_NO, JSON.stringify(event));

            //event.message.content().then(function (data) {
            //    const s = data.toString('hex').substring(0, 32);
            //    return event.reply('Nice picture! ' + s);
            //    }).catch(function (err) {
            //    return event.reply(err.toString());
            //});
            break;
        case 'video':
            // 紀錄 userId 傳了 video
            //messagepush = messagepush + ':' + event.message.type
            //bot.push(process.env.CHANNEL_NO, messagepush);
            bot.push(process.env.CHANNEL_NO, JSON.stringify(event));
            break;
        case 'audio':
            // 紀錄 userId 傳了 audio
            //messagepush = messagepush + ':' + event.message.type
            //bot.push(process.env.CHANNEL_NO, messagepush);
            bot.push(process.env.CHANNEL_NO, JSON.stringify(event));
            break;
        case 'file':
            // 紀錄 userId 傳了 file
            //messagepush = messagepush + ':' + event.message.type
            //bot.push(process.env.CHANNEL_NO, messagepush);
            bot.push(process.env.CHANNEL_NO, JSON.stringify(event));
            break;
        case 'location':
            // 紀錄 userId 傳了 location
            //messagepush = messagepush + ':' + event.message.type
            //bot.push(process.env.CHANNEL_NO, [messagepush, 'Lat:' + event.message.latitude, 'Long:' + event.message.longitude]);
            bot.push(process.env.CHANNEL_NO, JSON.stringify(event));
            break;
        // 收到貼圖    
		case 'sticker':
            // 紀錄 userId 傳了 sticker
            messagepush = messagepush + ':' + event.message.type
            bot.push(process.env.CHANNEL_NO, messagepush + '\n' + event.message.packageId + ':' + event.message.stickerId);

            //// 傳送貼圖
            // bot.push(process.env.CHANNEL_NO, {
                // type: 'sticker',
                // packageId: 1, // event.message.packageId, // Line 有限制只能使用前4套貼圖，也就是說 packageId 的值必須在 1 到 4 之間。
                // stickerId: 1  // event.message.stickerId
            // });
            break;
        default:
            // 紀錄 userId 傳了 未知類別
            //messagepush = messagepush + ':' + event.message.type
            //bot.push(process.env.CHANNEL_NO, messagepush);
            bot.push(process.env.CHANNEL_NO, JSON.stringify(event));
            break;
    }
});

// 當添加為朋友（或未阻止）時 觸發
bot.on('follow', function (event) {
    // var messagepush = 'userId:' + event.source.userId
    // if(typeof event.source.groupId !== "undefined")
	// {
		// messagepush = messagepush + 'groupId:' + event.source.groupId + '\n'
	// }
    // bot.push(process.env.CHANNEL_NO, '[follow]' + messagepush);
    bot.push(process.env.CHANNEL_NO, '[follow]' + '\n'+ JSON.stringify(event));
});

// 當取消關注（或封鎖）時 觸發
bot.on('unfollow', function (event) {
    // var messagepush = 'userId:' + event.source.userId
    // if(typeof event.source.groupId !== "undefined")
	// {
		// messagepush = messagepush + 'groupId:' + event.source.groupId + '\n'
	// }
    // bot.push(process.env.CHANNEL_NO, '[unfollow]' + messagepush);
    bot.push(process.env.CHANNEL_NO, '[unfollow]' + '\n'+ JSON.stringify(event));
});

// 當群組加入成員時 觸發
bot.on('memberJoined', function (event) {
    bot.push(process.env.CHANNEL_NO, '[memberJoined]' + '\n'+ JSON.stringify(event));
});

// 當群組離開成員時 觸發
bot.on('memberLeft', function (event) {
    bot.push(process.env.CHANNEL_NO, '[memberLeft]' + '\n'+ JSON.stringify(event));
});

// 當加入邀請時 觸發
bot.on('join', function (event) {
    // var messagepush = 'userId:' + event.source.userId
    // if(typeof event.source.groupId !== "undefined")
	// {
		// messagepush = messagepush + 'groupId:' + event.source.groupId + '\n'
	// }
    // bot.push(process.env.CHANNEL_NO, '[join]' + messagepush);
    bot.push(process.env.CHANNEL_NO, '[join]' + '\n'+ JSON.stringify(event));
});

// 當離開群組時 觸發
bot.on('leave', function (event) {
    // var messagepush = 'userId:' + event.source.userId
    // if(typeof event.source.groupId !== "undefined")
	// {
		// messagepush = messagepush + 'groupId:' + event.source.groupId + '\n'
	// }
    // bot.push(process.env.CHANNEL_NO, '[leave]' + messagepush);
    bot.push(process.env.CHANNEL_NO, '[leave]' + '\n'+ JSON.stringify(event));
});

// 
bot.on('postback', function (event) {
    // var messagepush = 'userId:' + event.source.userId
    // if(typeof event.source.groupId !== "undefined")
	// {
		// messagepush = messagepush + 'groupId:' + event.source.groupId + '\n'
	// }
    // bot.push(process.env.CHANNEL_NO, '[postback]' + messagepush);
    bot.push(process.env.CHANNEL_NO, '[postback]' + '\n'+ JSON.stringify(event));
});

// 
bot.on('beacon',   function (event) {
    // var messagepush = 'userId:' + event.source.userId
    // if(typeof event.source.groupId !== "undefined")
	// {
		// messagepush = messagepush + 'groupId:' + event.source.groupId + '\n'
	// }
    // bot.push(process.env.CHANNEL_NO, '[beacon]' + messagepush);
    bot.push(process.env.CHANNEL_NO, '[beacon]' + '\n'+ JSON.stringify(event));
});

// Bot所監聽的webhook路徑與port
bot.listen('/linewebhook', process.env.PORT || 80, function () {
  console.log('LineBot is running.');
});