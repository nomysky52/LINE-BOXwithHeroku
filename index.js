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
    switch (event.message.type) {
        case 'text':
            switch (event.message.text) {
                case 'Me':
                    event.source.profile().then(function (profile) {
                        return event.reply('Hello ' + profile.displayName + ' ' + profile.userId);
                    });
                    break;
                case 'Member':
                    event.source.member().then(function (member) {
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
                    bot.push('U17448c796a01b715d293c34810985a4c', ['Hey!', 'สวัสดี ' + String.fromCharCode(0xD83D, 0xDE01)]);
                    break;
                case 'Push2':
                    bot.push('Cba71ba25dafbd6a1472c655fe22979e2', 'Push to group');
                    break;
                case 'Multicast':
                    bot.push(['U17448c796a01b715d293c34810985a4c', 'Cba71ba25dafbd6a1472c655fe22979e2'], 'Multicast!');
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
                    bot.push(channelId: process.env.CHANNEL_NO, ['userId:' + event.source.userId + '\n' + '  groupId:' + event.source.groupId + '\n' + ':' +event.message.text]);
                    break;
            }
            break;
        case 'image':
            // 紀錄 userId 傳了 image
            bot.push(channelId: process.env.CHANNEL_NO, ['userId:' + event.source.userId + '\n' + '  groupId:' + event.source.groupId + '\n' + ':' + event.message.type]);

            //event.message.content().then(function (data) {
            //    const s = data.toString('hex').substring(0, 32);
            //    return event.reply('Nice picture! ' + s);
            //    }).catch(function (err) {
            //    return event.reply(err.toString());
            //});
            break;
        case 'video':
            // 紀錄 userId 傳了 video
            bot.push(channelId: process.env.CHANNEL_NO, ['userId:' + event.source.userId + '\n' + '  groupId:' + event.source.groupId + '\n' + ':' + event.message.type]);
            break;
        case 'audio':
            // 紀錄 userId 傳了 audio
            bot.push(channelId: process.env.CHANNEL_NO, ['userId:' + event.source.userId + '\n' + '  groupId:' + event.source.groupId + '\n' + ':' + event.message.type]);
            break;
        case 'file':
            // 紀錄 userId 傳了 file
            bot.push(channelId: process.env.CHANNEL_NO, ['userId:' + event.source.userId + '\n' + '  groupId:' + event.source.groupId + '\n' + ':' + event.message.type]);
            break;
        case 'location':
            // 紀錄 userId 傳了 location
            bot.push(channelId: process.env.CHANNEL_NO, ['userId:' + event.source.userId + '\n' + '  groupId:' + event.source.groupId + '\n' + ':' + event.message.type ,'Lat:' + event.message.latitude , 'Long:' + event.message.longitude]);
            break;
        case 'sticker':
            // 紀錄 userId 傳了 sticker
            bot.push(channelId: process.env.CHANNEL_NO, ['userId:' + event.source.userId + '\n' + '  groupId:' + event.source.groupId + '\n' + ':' + event.message.type + '\n' + event.message.packageId + ':' + event.message.stickerId ]);
            // 傳送貼圖
            // bot.push(channelId: process.env.CHANNEL_NO, {
                // type: 'sticker',
                // packageId: event.message.packageId, // Line 有限制只能使用前4套貼圖，也就是說 packageId 的值必須在 1 到 4 之間。
                // stickerId: event.message.stickerId
            // });
            break;
        default:
            // 紀錄 userId 傳了 未知類別
            bot.push(channelId: process.env.CHANNEL_NO, ['userId:' + event.source.userId + '\n' + '  groupId:' + event.source.groupId + '\n' + ':' + event.message.type]);
            break;
    }
});

// 當添加為朋友（或未阻止）時 觸發
bot.on('follow', function (event) { 
    bot.push(channelId: process.env.CHANNEL_NO, ['[follow]' + '\n' + 'userId:' + event.source.userId]);
});

// 當取消關注（或封鎖）時 觸發
bot.on('unfollow', function (event) { 
    bot.push(channelId: process.env.CHANNEL_NO, ['[unfollow]' + '\n' + 'userId:' + event.source.userId]);
});

// 當群組加入成員時 觸發
bot.on('memberJoined', function (event) {
});

// 當群組離開成員時 觸發
bot.on('memberLeft', function (event) {
});

// 當加入邀請時 觸發
bot.on('join', function (event) {
    bot.push(channelId: process.env.CHANNEL_NO, ['[join]' + '\n' + 'userId:' + event.source.userId + '\n' + '  groupId:' + event.source.groupId]);
});

// 當離開群組時 觸發
bot.on('leave', function (event) {
    bot.push(channelId: process.env.CHANNEL_NO, ['[leave]' + '\n' + 'userId:' + event.source.userId + '\n' + '  groupId:' + event.source.groupId]);
});

// 
bot.on('postback', function (event) {
    bot.push(channelId: process.env.CHANNEL_NO, ['[postback]' + '\n' + 'userId:' + event.source.userId + '\n' + '  groupId:' + event.source.groupId]);
});

// 
bot.on('beacon',   function (event) {
    bot.push(channelId: process.env.CHANNEL_NO, ['[beacon]' + '\n' + 'userId:' + event.source.userId + '\n' + '  groupId:' + event.source.groupId]);
});

// Bot所監聽的webhook路徑與port
bot.listen('/linewebhook', process.env.PORT || 80, function () {
  console.log('LineBot is running.');
});