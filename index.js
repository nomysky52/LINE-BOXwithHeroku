// 引用linebot SDK
const linebot = require('./lib/linebot');

// 匯入Check
//const pgcheck = require('./check');

// 引用 postgresql SDK
const pg = require('pg');

// DBClient設定檔
const config = {
    host: 'ec2-174-129-240-67.compute-1.amazonaws.com',
    user: 'iamwdodmqbebsj',     
    password: 'bce81014516027375e326d0e5970a1d4fab3cb0c2e973dc35c295832dce4dd38',
    database: 'd8a8qp0fsn155i',
    port: 5432
};

// 用於辨識Line Channel的資訊
const bot = linebot({
    channelId: process.env.CHANNEL_ID,
    channelSecret: process.env.CHANNEL_SECRET,
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
});
// 當有人傳送訊息給Bot時 觸發
bot.on('message', function(event) {
    var messagepush = 'userId:' + event.source.userId + '\n';
    // var displayName = event.source.profile().then(function (profile) {
        // // messagepush = messagepush + 'displayName:' + profile.displayName + '\n';
        // bot.push(process.env.CHANNEL_NO, 'displayName:' + profile.displayName + '\n');
        // return profile.displayName;
    // });
    
    if(typeof event.source.groupId !== "undefined")
    {
        messagepush = messagepush + 'groupId:' + event.source.groupId + '\n'
    }

    switch (event.message.type) {
        case 'text':
            if(event.source.groupId === process.env.CHANNEL_RECEIVE)
            {// 接收群組
                switch (event.message.text) {
                    default:
                        //廣播
                        bot.broadcast(event.message.text);
                        break;
                }
                break;
            }
            else if(event.source.userId === process.env.CHANNEL_NO)
            {
                if(typeof event.source.groupId !== "undefined")
                {
					if(event.message.text !== '素食說明')
					{
                        event.reply(messagepush + ':' + event.message.text);
                        break;
					}
                }
                else
                {
                    event.reply(messagepush + ':' + event.message.text);
                    break;
                }
            }
            switch (event.message.text) {                
                case '素食說明':
                    event.reply(['[包裝食品的素食標示-2014.11.05修編]' + '\n' 
+ '素食產品標示分為「全素或純素」、「蛋素」、「奶素」、「奶蛋素」及「植物五辛素」五類' + '\n' + '\n'
+ '全素或純素：不含奶蛋、也不含五辛（蔥、蒜、韭、薤菜及興蕖）的純植物性食品。' + '\n'
+ '蛋素：全素或純素及蛋製品。' + '\n'
+ '奶素：全素或純素及奶製品。' + '\n'
+ '奶蛋素：全素或純素及奶蛋製品。' + '\n'
+ '植物五辛素：指食用植物性食物，但可含五辛（蔥、蒜、韭、薤菜及興蕖）或奶蛋。' + '\n'
,'二十二碳六烯酸（DHA）和二十碳五烯酸（EPA）是從魚油萃取而來，而魚油萃取過程中，魚已被犧牲。屬於葷食。'
,'食用天然色素胭脂紅是從胭脂蟲提煉而來，而食用天然色素胭脂紅提煉過程中，胭脂蟲已被犧牲。屬於葷食。'
,'素食者有分為' + '\n' 
+ '(1)嚴格素食者/純素主義者( Vegan / veganism )：' + '\n' 
+ '不吃所有的肉、魚、海產、家禽、蛋、奶。' + '\n' 
+ '有宗教信仰的素食者，大部分是這類。' + '\n' 
+ '此外，他們不飲酒，更不食用五辛植物（蔥、蒜、韭、薤菜及興蕖）。' + '\n' + '\n' 
+ '(2)奶素食者 / 乳品素食者( Lacto-Vegetarian / Lacto-vegetarianism )：' + '\n' 
+ '不吃所有的肉、魚、海產、家禽、蛋。' + '\n' 
+ '這類奶素食者以南亞國家( 如印度 )大士為多。' + '\n' + '\n' 
+ '(3)蛋素食者( Ovo-Vegetarian / Ovo-vegetarianism )：' + '\n' 
+ '不吃所有的肉、魚、海產、家禽、奶。' + '\n' + '\n' 
+ '(4)蛋奶素食者( Ovo-Lacto-Vegetarian / Lacto-ovo-vegetarianism )：' + '\n' 
+ '不吃所有的肉、魚、海產、家禽，但吃蛋類和奶類( 如芝士、乳酪等 )。' + '\n' 
+ '部分蛋奶素食者，蛋類只吃雞蛋。' + '\n' + '\n' 
+ '(5)植物五辛素者( vegetarian )：' + '\n' 
+ '指食用植物性食物，但可含五辛（蔥、蒜、韭、薤菜及興蕖）或奶蛋。' + '\n' + '\n' 
+ '(6)魚素食者( pescetarian )：' + '\n' 
+ '不吃除了魚、海產以外的肉類，還有家禽、蛋不吃。' + '\n' 
+ '這類魚素食者以日本國家大士為多。' + '\n' + '\n'
, '想了解五辛，可輸入"植物五辛"。'
]);
                    break;
                case '植物五辛':
                    event.reply('何謂植物五辛？' + '\n' 
+ '植物五辛包括「蔥、蒜、韭、蕎及興渠」五類植物' + '\n' 
+ '蔥：含青蔥、紅蔥、革蔥、慈蔥、蘭蔥...等等蔥類。' + '\n' 
+ '蒜：含大蒜、蒜苗...等等蒜類。' + '\n' 
+ '韭：含韭菜、韭黃、韭菜花...等等韭類。' + '\n' 
+ '蕎：即為蕗蕎或薤菜（「薤」念ㄒㄧㄝˋ），閩南話稱為蕗藠、藠頭，阿美族稱之為火蔥。' + '\n' 
+ '興渠：即為洋蔥。');
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
            bot.push(process.env.CHANNEL_NO, messagepush);
            bot.push(process.env.CHANNEL_NO, JSON.stringify(event));

            // event.message.content().then(function (data) {
               // const s = data.toString('hex').substring(0, 32);
               // return bot.push(process.env.CHANNEL_NO, 'Nice picture! ' + s);
               // }).catch(function (err) {
               // return bot.push(process.env.CHANNEL_NO, err.toString());
            // });
            break;
        case 'video':
            // 紀錄 userId 傳了 video
            //messagepush = messagepush + ':' + event.message.type
            bot.push(process.env.CHANNEL_NO, messagepush);
            bot.push(process.env.CHANNEL_NO, JSON.stringify(event));
            break;
        case 'audio':
            // 紀錄 userId 傳了 audio
            //messagepush = messagepush + ':' + event.message.type
            bot.push(process.env.CHANNEL_NO, messagepush);
            bot.push(process.env.CHANNEL_NO, JSON.stringify(event));
            break;
        case 'file':
            // 紀錄 userId 傳了 file
            //messagepush = messagepush + ':' + event.message.type
            bot.push(process.env.CHANNEL_NO, messagepush);
            bot.push(process.env.CHANNEL_NO, JSON.stringify(event));
            break;
        case 'location':
            // 紀錄 userId 傳了 location
            //messagepush = messagepush + ':' + event.message.type
            bot.push(process.env.CHANNEL_NO, [messagepush, 'Lat:' + event.message.latitude, 'Long:' + event.message.longitude]);
            bot.push(process.env.CHANNEL_NO, JSON.stringify(event));
            break;
        // 收到貼圖    
        case 'sticker':
            // 紀錄 userId 傳了 sticker
            //messagepush = messagepush + ':' + event.message.type
            bot.push(process.env.CHANNEL_NO, messagepush + '\n' + event.message.packageId + ':' + event.message.stickerId);

            //// 傳送貼圖
            // bot.push(process.env.CHANNEL_NO, {
                // type: 'sticker',
                // packageId: 1, // event.message.packageId, // Line 有限制只能使用前4套貼圖，也就是說 packageId 的值必須在 1 到 4 之間。
                // stickerId: 1  // event.message.stickerId
            // });
            if(event.source.userId === process.env.CHANNEL_NO)
            {
                const client = new pg.Client(config)
                client.connect(err => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log('Connected to PostgreSQL database');
                    }
                });
                
                event.reply('OK');
                // checkchannel(event.source.userId);
                // pgcheck.checkchannel(event.source.userId).then(function () {
                // event.reply(JSON.stringify(this));
                // }
            };
            break;
        default:
            // 紀錄 userId 傳了 未知類別
            //messagepush = messagepush + ':' + event.message.type
            bot.push(process.env.CHANNEL_NO, messagepush);
            bot.push(process.env.CHANNEL_NO, JSON.stringify(event));
            break;
    }
});

// function(channelid) {
    // const client = new pg.Client(config);
    // client.connect();
    // console.log('Connected to PostgreSQL database');
    
    // var query = client.query('SELECT "CHANNELID", "TYPE", "NOTE" FROM public."CHANNEL"');
    // query.on("row", function (row, result) {
        // result.addRow(row);
    // });

    // query.on("end", function (result) {
        // var jsonString = JSON.stringify(result.rows);
        // var jsonObj = JSON.parse(jsonString);
        // console.log(jsonString);
        // client.end();
        // context.succeed(jsonObj);
    // });
    // return this;
    // //const query = 'SELECT "CHANNELID", "TYPE", "NOTE" FROM public."CHANNEL"'// where "CHANNELID" = ' + channelid;

    // //return client.query(query);
// }

// 當添加為朋友（或未阻止）時 觸發
bot.on('follow', function (event) {
    // var messagepush = 'userId:' + event.source.userId
    // if(typeof event.source.groupId !== "undefined")
    // {
        // messagepush = messagepush + 'groupId:' + event.source.groupId + '\n'
    // }
    // bot.push(process.env.CHANNEL_NO, '[follow]' + messagepush);
    // bot.push(process.env.CHANNEL_NO, '[follow]' + '\n'+ JSON.stringify(event));

    event.reply(['我是笑笑' + '\n' + '歡迎 {Nickname} 成為笑友(happy)' + '\n' + '若不想接收提醒，不要封鎖我呦(oops)' + '\n' + '請點擊右上角更多的圖示再點擊關閉提醒', '輸入[ 素食說明 ]' + '\n' + '會跟你說素食的種類與注意事項呦。','輸入[ 植物五辛 ]會跟你說何謂「五辛」。', '願有個愉快的一天(happy)']);
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
    // bot.push(process.env.CHANNEL_NO, '[join]' + '\n'+ JSON.stringify(event));
    event.reply(['我是笑笑' + '\n' + '歡迎 {Nickname} 成為笑友(happy)' + '\n' + '若不想接收提醒，不要封鎖我呦(oops)' + '\n' + '請點擊右上角更多的圖示再點擊關閉提醒', '輸入[ 素食說明 ]' + '\n' + '會跟你說素食的種類與注意事項呦。','輸入[ 植物五辛 ]會跟你說何謂「五辛」。', '願有個愉快的一天(happy)']);
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