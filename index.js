// 引用 linebot SDK
const linebot = require('./lib/linebot');
// 用於辨識Line Channel的資訊
const bot = linebot({
    channelId: process.env.CHANNEL_ID,
    channelSecret: process.env.CHANNEL_SECRET,
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
});

// 引用 imgur SDK
const {
    ImgurClient
} = require('imgur');
// browser script include // your client ID
const imgurClient = new ImgurClient({
    clientId: process.env.IMGUR_CLIENTID,
    clientSecret: process.env.IMGUR_CLIENT_SECRET,
    refreshToken: process.env.IMGUR_REFRESH_TOKEN
});
async function uploadFromBinary(binary) {
    try {
        let base64 = Buffer.from(binary).toString('base64');
        const response = await imgurClient.upload({
            image: base64,
            type: 'base64',
            album: process.env.IMGUR_ALBUM_ID
        });
        if (response.status !== 200) {
            console.log(response.data);
            return '';
        } else {
            return response.data.link;
        }
    } catch {
        return '';
    }
}

var sqlDb = require("mssql"); // SQL 2016^
// SOMEE 連線字串
const SOMEE_CNX = {
    password: process.env.SOMEE_DB_PWD,
    database: process.env.SOMEE_DB,
    stream: false,
    options: {
        trustServerCertificate: true,
        enableArithAbort: true,
        encrypt: true,
        abortTransactionOnError: false,
    },
    pool: {
        max: 1,
        min: 0,
    },
    port: 1433,
    user: process.env.SOMEE_DB_ID,
    server: process.env.SOMEE_DB_URL,
}

let CHANNELAddSql = "INSERT INTO [dbo].[CHANNEL]([CHANNELID],[TYPE],[NOTE])";
let CHANNELQureySql = "select [CHANNELID] from [dbo].[CHANNEL]";



// 當有人傳送訊息給Bot時 觸發
bot.on('message', function(event) {
    //來源者
    var messagepush = 'userId:' + event.source.userId + '\n';
    //來源群組
    if (typeof event.source.groupId !== "undefined") {
        messagepush = messagepush + 'groupId:' + event.source.groupId + '\n';
        event.source.Group().then(
            function(group) {
                if (group) { // 來源群組 紀錄
                    MSSQL_RUN("IF NOT EXISTS(" + CHANNELQureySql + " where [CHANNELID] = '" + event.source.groupId + "')" + CHANNELAddSql + "VALUES('" + event.source.groupId + "',2,N'" + group.groupName + "')ELSE IF EXISTS(" + CHANNELQureySql + " where [CHANNELID] = '" + event.source.userId + "' and [NOTE] != N'" + group.groupName + "')UPDATE [dbo].[CHANNEL] SET [TYPE] = 2, [NOTE] = N'" + group.groupName + "' WHERE [CHANNELID] = '" + event.source.userId + "' ;SELECT 'OK' as [status],'" + event.source.groupId + "' as [groupId]")
                } else {
                    MSSQL_RUN("IF NOT EXISTS(" + CHANNELQureySql + " where [CHANNELID] = '" + event.source.groupId + "')" + CHANNELAddSql + "VALUES('" + event.source.groupId + "',2,N'');SELECT 'OK' as [status],'" + event.source.groupId + "' as [groupId]")
                }
            }
        );
    }
    //來源ROOM
    if (typeof event.source.roomId !== "undefined") {
        messagepush = messagepush + 'roomId:' + event.source.roomId + '\n';
        // 來源ROOM 紀錄
        MSSQL_RUN("IF NOT EXISTS(" + CHANNELQureySql + " where [CHANNELID] = '" + event.source.roomId + "')" + CHANNELAddSql + "VALUES('" + event.source.roomId + "',3,N'');SELECT 'OK' as [status],'" + event.source.roomId + "' as [roomId]")
    }
    // 紀錄 
    event.source.profile().then(
        function(profile) {
            SET_PROFILE(event.source.userId, profile);
        }
    );

    switch (event.message.type) {
        case 'text':
            if (event.source.groupId === process.env.CHANNEL_RECEIVE) { // 接收群組[笑笑接收]
                switch (event.message.text) {
                    default:
                        //廣播
                        console.log(messagepush + '廣播:' + event.message.text);
                        bot.broadcast(event.message.text);
                        break;
                }
                break;
            } else if (event.source.userId === process.env.CHANNEL_NO) { // 開發者 密技
                switch (event.message.text) {
                    case 'run':
                        PD_RUN(event, 'SELECT top (20) [List] FROM [dbo].[PrettyDerbyView]');
                        break;
                    case 'profile': // 輸出群組
                        event.source.profile().then(function(profile) {
                            return event.reply(JSON.stringify(profile));
                        });
                        break;
                    case 'follower': // 輸出群組
                        event.source.getFollowers().then(function(follower) {
                            return event.reply(JSON.stringify(follower));
                        });
                        break;
                    case 'Picture': // 輸出照片
                        event.reply({
                            type: 'image',
                            originalContentUrl: 'https://farm9.staticflickr.com/8689/16968169827_c0ab54a550_z.jpg',
                            previewImageUrl: 'https://farm9.staticflickr.com/8689/16968169827_c0ab54a550_z.jpg'
                        });
                        break;
                    case 'test': // 輸出 測試
                        event.source.member().then(function(member) {
                            return event.reply(JSON.stringify(member));
                        });
                        break;
                    case 'Location': // 給予地圖
                        // event.reply({
                        // type: 'location',
                        // title: 'LINE Plus Corporation',
                        // address: '1 Empire tower, Sathorn, Bangkok 10120, Thailand',
                        // latitude: 13.7202068,
                        // longitude: 100.5298698
                        // });
                        break;
                        // Access to this API is not available for your account
                    case 'member': // 改付費功能
                        event.source.member().then(function(member) {
                            // bot.push(process.env.channel_no, json.stringify(member));
                            return event.reply(json.stringify(member));
                        });
                        break;
                    default:
                        break;
                }
            }
            switch (event.message.text) {
                case '說明':
                    event.reply(['輸入以下「關鍵字」' + '\n', '「素食者分類」:' + '\n' + '介紹一般素食者的區分。' + '\n' +
                        '「素食標示」:' + '\n' + '介紹[包裝食品宣稱為素食標示-2014.11.05修編]要點。' + '\n' +
                        '「植物五辛」:' + '\n' + '介紹何為植物五辛?' + '\n', {
                            type: 'template',
                            altText: 'What is vegetarianism?',
                            template: {
                                type: 'confirm',
                                text: '素食?',
                                actions: [{
                                    type: 'message',
                                    label: '何謂素食者?',
                                    text: '素食者分類'
                                }, {
                                    type: 'message',
                                    label: '何謂植物五辛?',
                                    text: '植物五辛'
                                }]
                            }
                        }
                    ]);
                    break;
                case '素食者分類':
                    event.reply(['素食者有分為' + '\n' +
                        '(1)嚴格素食者/純素主義者( Vegan / veganism )：' + '\n' +
                        '不吃所有的肉、魚、海產、家禽、蛋、奶。' + '\n' +
                        '有宗教信仰的素食者，大部分是這類。' + '\n' +
                        '此外，他們不飲酒，更不食用五辛植物（蔥、蒜、韭、薤菜及興蕖）。' + '\n' + '\n' +
                        '(2)奶素食者 / 乳品素食者( Lacto-Vegetarian / Lacto-vegetarianism )：' + '\n' +
                        '不吃所有的肉、魚、海產、家禽、蛋。' + '\n' +
                        '這類奶素食者以南亞國家( 如印度 )大士為多。' + '\n' + '\n' +
                        '(3)蛋素食者( Ovo-Vegetarian / Ovo-vegetarianism )：' + '\n' +
                        '不吃所有的肉、魚、海產、家禽、奶。' + '\n' + '\n' +
                        '(4)蛋奶素食者( Ovo-Lacto-Vegetarian / Lacto-ovo-vegetarianism )：' + '\n' +
                        '不吃所有的肉、魚、海產、家禽，但吃蛋類和奶類( 如芝士、乳酪等 )。' + '\n' +
                        '部分蛋奶素食者，蛋類只吃雞蛋。' + '\n' + '\n' +
                        '(5)植物五辛素者( vegetarian )：' + '\n' +
                        '指食用植物性食物，但可含五辛（蔥、蒜、韭、薤菜及興蕖）或奶蛋。' + '\n' + '\n' +
                        '(6)方便素、鍋邊素者：' + '\n' +
                        '是指整盤葷菜只挑青菜類、豆類等天然非肉類等來吃。' + '\n' + '\n' +
                        '(7)魚素食者 / 海鮮素者( pescetarian )：' + '\n' +
                        '不吃除了魚、海產以外的肉類，還有家禽、蛋不吃。' + '\n' +
                        '這類魚素食者以日本國家大士為多。' + '\n' + '\n', '素食標示分為「全素或純素」、「蛋素」、「奶素」、「奶蛋素」及「植物五辛素」五類，想了解可輸入"素食標示"。', '想了解五辛，可輸入"植物五辛"。'
                    ]);
                    break;
                case '素食標示':
                    event.reply(['台灣[包裝食品宣稱為素食標示-2014.11.05修編]' + '\n' +
                        '素食產品標示分為「全素或純素」、「蛋素」、「奶素」、「奶蛋素」及「植物五辛素」五類' + '\n' + '\n' +
                        '全素或純素：不含奶蛋、也不含五辛（蔥、蒜、韭、薤菜及興蕖）的純植物性食品。' + '\n' +
                        '蛋素：全素或純素及蛋製品。' + '\n' +
                        '奶素：全素或純素及奶製品。' + '\n' +
                        '奶蛋素：全素或純素及奶蛋製品。' + '\n' +
                        '植物五辛素：指食用植物性食物，但可含五辛（蔥、蒜、韭、薤菜及興蕖）或奶蛋。' + '\n', '二十二碳六烯酸（DHA）和二十碳五烯酸（EPA）是從魚油萃取而來，而魚油萃取過程中，魚已被犧牲。屬於葷食。', '食用天然色素胭脂紅是從胭脂蟲提煉而來，而食用天然色素胭脂紅提煉過程中，胭脂蟲已被犧牲。屬於葷食。'
                    ]);
                    break;
                case '植物五辛':
                    event.reply(['何謂植物五辛？' + '\n' +
                        '植物五辛包括「蔥、蒜、韭、蕎及興渠」五類植物' + '\n' +
                        '蔥：含青蔥、紅蔥、革蔥、慈蔥、蘭蔥...等等蔥類。' + '\n' +
                        '蒜：含大蒜、蒜苗...等等蒜類。' + '\n' +
                        '韭：含韭菜、韭黃、韭菜花...等等韭類。' + '\n' +
                        '蕎：即為蕗蕎或薤菜（「薤」念ㄒㄧㄝˋ），閩南話稱為蕗藠、藠頭，阿美族稱之為火蔥。' + '\n' +
                        '興渠：即為洋蔥。'
                    ]);
                    break;
                case '為甚麼吃素?':
                    event.reply(['有些人會說，如果你不忍心看到那些動物受苦，那你為什麼忍心殺害蔬菜或是水果，還有細菌？' + '\n' +
                        '對很多人來說，Vegetarian、Vegan並不是什麼零跟一的問題' + '\n' +
                        '我們不想傷害動物，是因為我們可以清楚的感受到那些動物的痛苦，' + '\n' +
                        '我們都是先從關心自己本身開始，將同理心一點一點的擴散出去的，' + '\n' +
                        '我們學會了愛護我們自己，然後開始理解到家人、朋友們的感受；' + '\n' +
                        '然後開始理解到其他台灣人的感受；' + '\n' +
                        '然後開始瞭解到其他種族、民族的感受，' + '\n' +
                        '然後自然而然地對動物們也同樣的將心比心。' + '\n' +
                        '這不是階層式的感受，一定要先怎樣然後怎樣。' + '\n'
                    ]);
                    break;
                case 'Version':
                    event.reply('nomyskylinebot@' + require('./package.json').version);
                    break;
                    // case '標記':
                    // event.source.member().then(function (member) {
                    // bot.push(process.env.CHANNEL_NO, JSON.stringify(member));
                    // return event.reply(JSON.stringify(member));
                    // });
                    // break;
                default:
                    var replytext = findKeyWords(event.message.text);
                    if (replytext !== "") {
                        event.reply(replytext);
                    }
                    // 回傳 userId 說了甚麼
                    // console.log(messagepush + ':' + event.message.text);
                    else if (event.source.userId !== process.env.CHANNEL_NO) {
                        bot.push(process.env.CHANNEL_NO, messagepush + ':' + event.message.text);
                    }
                    break;
            }
            break;
        case 'image':
            // 紀錄 userId 傳了 image
            // console.log('image :' + JSON.stringify(event));
            event.message.contentdata().then(function(contentdata) {
                const result = uploadFromBinary(contentdata);
            });
            // event.reply({
            // type: 'image',
            // originalContentUrl: 'https://farm9.staticflickr.com/8689/16968169827_c0ab54a550_z.jpg#',
            // previewImageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSMabEh5Dastr1BpkFPlaO7bI4X27XO5nxlj3YMtGAD-J5dJTpb&usqp=CAU'
            // });
            break;
        case 'video':
            // 紀錄 userId 傳了 video
            // messagepush = messagepush + ':' + event.message.type
            bot.push(process.env.CHANNEL_NO, JSON.stringify(event));
            break;
        case 'audio':
            // 紀錄 userId 傳了 audio
            // messagepush = messagepush + ':' + event.message.type
            // bot.push(process.env.CHANNEL_NO, messagepush);
            bot.push(process.env.CHANNEL_NO, JSON.stringify(event));
            break;
        case 'file':
            // 紀錄 userId 傳了 file
            // messagepush = messagepush + ':' + event.message.type
            // bot.push(process.env.CHANNEL_NO, messagepush);
            bot.push(process.env.CHANNEL_NO, JSON.stringify(event));
            break;
        case 'location':
            // 紀錄 userId 傳了 location
            // messagepush = messagepush + ':' + event.message.type
            // bot.push(process.env.CHANNEL_NO, [messagepush, 'Lat:' + event.message.latitude, 'Long:' + event.message.longitude]);
            // bot.push(process.env.CHANNEL_NO, JSON.stringify(event));
            break;
            // 收到貼圖    
            // case 'sticker':
            // //// 傳送貼圖
            // // bot.push(process.env.CHANNEL_NO, {
            // // type: 'sticker',
            // // packageId: 1, // event.message.packageId, // Line 有限制只能使用前4套貼圖，也就是說 packageId 的值必須在 1 到 4 之間。
            // // stickerId: 1  // event.message.stickerId
            // // });
            // if (event.source.userId === process.env.CHANNEL_NO) {
            // var channel = MSSQL_RUN('select * from [dbo].[CHANNEL]');
            // console.log(channel);
            // bot.push("Ub1068b48b44f7ef5a1ca5a12070f1225", "早安");
            // }
            // break;
        default:
            // 紀錄 userId 傳了 未知類別
            bot.push(process.env.CHANNEL_NO, JSON.stringify(event));
            break;
    }
});

function findWords(messagetext, term) {
    return messagetext.includes(term);
}

function findKeyWords(messagetext) {
    if (findWords(messagetext, "morning"))
        return "Good Morning";
    else if (findWords(messagetext, "night"))
        return "Good Night";
    else if (findWords(messagetext, "早"))
        return "早安呦";
    else if (findWords(messagetext, "晚"))
        return "晚上好";
    else if (findWords(messagetext, "👀"))
        return "👀";
    else if (findWords(messagetext, "啾咪"))
        return "啾咪~";
    else if (findWords(messagetext, "不可以瑟瑟"))
        return "笑笑可以瑟瑟";
    else if (findWords(messagetext, "笑笑"))
        return "笑笑最快樂了";
    else if (findWords(messagetext, "啞啞"))
        return "啞啞最可愛了";
    else if (findWords(messagetext, "拉拉"))
        return "拉拉最美麗了";
    else if (findWords(messagetext, "咕雞"))
        return "咕雞最溫柔了";
    else if (findWords(messagetext, "安娜"))
        return "安娜最善良了";
    else if (findWords(messagetext, "阿培"))
        return "阿培最天真了";
    else if (findWords(messagetext, "娜娜"))
        return "娜娜很可愛呦";
    else if (findWords(messagetext, "馨予"))
        return "馨予很可愛呦";
    else
        return "";
}
// 當添加為朋友（或未阻止）時 觸發
bot.on('follow', function(event) {
    if (typeof event.source.groupId !== "undefined") {
        event.reply(['我是笑笑' + '\n' + '願有個愉快的一天']);

        //來源群組
        if (typeof event.source.groupId !== "undefined") {
            event.source.Group().then(
                function(group) {
                    if (group) { // 來源群組 紀錄
                        MSSQL_RUN("IF NOT EXISTS(" + CHANNELQureySql + " where [CHANNELID] = '" + event.source.groupId + "')" + CHANNELAddSql + "VALUES('" + event.source.groupId + "',2,N'" + group.groupName + "')ELSE IF EXISTS(" + CHANNELQureySql + " where [CHANNELID] = '" + event.source.userId + "' and [NOTE] != N'" + group.groupName + "')UPDATE [dbo].[CHANNEL] SET [TYPE] = 2, [NOTE] = N'" + group.groupName + "' WHERE [CHANNELID] = '" + event.source.userId + "' ;SELECT 'OK' as [status],'" + event.source.groupId + "' as [groupId]")
                    } else {
                        MSSQL_RUN("IF NOT EXISTS(" + CHANNELQureySql + " where [CHANNELID] = '" + event.source.groupId + "')" + CHANNELAddSql + "VALUES('" + event.source.groupId + "',2,N'');SELECT 'OK' as [status],'" + event.source.groupId + "' as [groupId]")
                    }
                }
            );
        }
    } else if (typeof event.source.roomId !== "undefined") {
        event.reply(['我是笑笑' + '\n' + '願有個愉快的一天']);
        // 來源ROOM 紀錄
        MSSQL_RUN("IF NOT EXISTS(" + CHANNELQureySql + " where [CHANNELID] = '" + event.source.roomId + "')" + CHANNELAddSql + "VALUES('" + event.source.roomId + "',3,N'');SELECT 'OK' as [status],'" + event.source.roomId + "' as [roomId]")
    } else {
        event.reply(['我是笑笑' + '\n' + '歡迎成為笑友 ' + '\n' + '若不想接收提醒，不要封鎖我呦' + '\n' + '請點擊右上角更多的圖示再點擊關閉提醒', '使用方法請填「說明」，願有個愉快的一天']);
        bot.push(event.source.userId, {
            type: 'template',
            altText: 'this is a confirm template',
            template: {
                type: 'confirm',
                text: '想了解素食?',
                actions: [{
                    type: 'message',
                    label: '何謂素食者?',
                    text: '素食說明'
                }, {
                    type: 'message',
                    label: '何謂植物五辛?',
                    text: '植物五辛'
                }]
            }
        });
        // 紀錄 
        event.source.profile().then(
            function(profile) {
                SET_PROFILE(event.source.userId, profile);
            }
        );
    }
});

// 當取消關注（或封鎖）時 觸發
bot.on('unfollow', function(event) {
    bot.push(process.env.CHANNEL_NO, '[unfollow]' + '\n' + JSON.stringify(event));
});

// 當群組加入成員時 觸發
bot.on('memberJoined', function(event) {
    bot.push(process.env.CHANNEL_NO, '[memberJoined]' + '\n' + JSON.stringify(event));
});

// 當群組離開成員時 觸發
bot.on('memberLeft', function(event) {
    bot.push(process.env.CHANNEL_NO, '[memberLeft]' + '\n' + JSON.stringify(event));
});

// 當加入群組邀請時 觸發
bot.on('join', function(event) {
    bot.push(process.env.CHANNEL_NO, '[follow]' + '\n' + JSON.stringify(event));
    event.reply(['我是笑笑' + '\n' + '歡迎成為笑友 ' + '\n' + '若不想接收提醒，不要封鎖我呦' + '\n' + '請點擊右上角更多的圖示再點擊關閉提醒' + '\n' + '願有個愉快的一天']);
});

// 當離開群組時 觸發
bot.on('leave', function(event) {
    bot.push(process.env.CHANNEL_NO, '[leave]' + '\n' + JSON.stringify(event));
});

// 
bot.on('postback', function(event) {
    bot.push(process.env.CHANNEL_NO, '[postback]' + '\n' + JSON.stringify(event));
});

// 
bot.on('beacon', function(event) {
    bot.push(process.env.CHANNEL_NO, '[beacon]' + '\n' + JSON.stringify(event));
});

// Bot所監聽的webhook路徑與port
bot.listen('/linewebhook', process.env.PORT || 80, function() {
    console.log('LineBot is running.');
});

// 語法下派
async function PD_RUN(event, sql) {
    if (sql) {
        console.log('--PD_RUN--' + '\n' + 'sql : ' + sql);
        try {
            const client = new sqlDb.ConnectionPool(SOMEE_CNX);

            // console.time('connect')
            const pool = await client.connect();
            // console.timeEnd('connect')

            const request = pool.request();

            // console.time('query')
            const query = await request.query(sql, function(err, result) {
                if (result) {
                    if (result.recordset) {
                        console.log('PD_RUN result.recordset :');
                        console.log(result.recordset);
						event.reply(JSON.stringify(result.recordset));
                    }
                }
            })
            // console.timeEnd('query')
        } finally {
            try {
                await client.close()
            } catch {}
        }
    }
}
// 語法下派
async function MSSQL_RUN(sql) {
    if (sql) {
        //console.log('--MSSQL_RUN--' + '\n' + 'sql : ' + sql);
        try {
            const client = new sqlDb.ConnectionPool(SOMEE_CNX);

            //console.time('connect')
            const pool = await client.connect();
            //console.timeEnd('connect')

            const request = pool.request();

            //console.time('query')
            const query = await request.query(sql, function(err, result) {
                if (result) {
                    if (result.recordset) {
                        console.log('MSSQL_RUN result.recordset :');
                        console.log(result.recordset);
                    }
                }
            })
            //console.timeEnd('query')
        } catch {
            console.log('--MSSQL_RUN--:Error' + '\n' + 'sql : ' + sql);
		} 
		finally {
            try {
                await client.close()
            } catch {}
        }
    }
}
// 設定 LINE 資訊至 DB
async function SET_PROFILE(userId, profile) {
    if (userId) {
        if (profile) {
            MSSQL_RUN("IF NOT EXISTS(" + CHANNELQureySql + " where [CHANNELID] = '" + userId + "')" + CHANNELAddSql + "VALUES('" + userId + "',1,N'" + profile.displayName + "') ELSE IF EXISTS(" + CHANNELQureySql + " where [CHANNELID] = '" + userId + "' and [NOTE] != N'" + profile.displayName + "')UPDATE [dbo].[CHANNEL] SET [TYPE] = 1, [NOTE] = N'" + profile.displayName + "' WHERE [CHANNELID] = '" + userId + "' ;SELECT 'OK' as [status],'" + userId + "' as [userId]");
            // console.log('UserName :' + profile.displayName);
            // console.log('profiledata :' + JSON.stringify(profile));
            if (profile.pictureUrl) { // 大頭貼 紀錄
                try {
                    const client = new sqlDb.ConnectionPool(SOMEE_CNX);

                    // console.time('connect')
                    const pool = await client.connect();
                    // console.timeEnd('connect')

                    const request = pool.request();

                    const sql = "select 'OK' as [status],[CHANNELID] from [dbo].[CHANNEL_PICTUREURL] where [CHANNELID] = '" + userId + "' and [PICTUREURL] = '" + profile.pictureUrl + "'";

                    // console.time('query')
                    const query = await request.query(sql, function(err, result) {
                        if (result) {
                            if (result.recordset) {
                                // console.log('SET_PROFILE result.recordset :');
                                // console.log(result.recordset);
                                if (typeof result.recordset.length !== 'undefined') {
                                    console.log('SET_PROFILE result.recordset.length :' + result.recordset.length);
                                    if (result.recordset.length === 0) {
                                        if (userId !== process.env.CHANNEL_NO) { // 傳送照片
                                            bot.push(process.env.CHANNEL_NO, {
                                                type: 'image',
                                                originalContentUrl: profile.pictureUrl,
                                                previewImageUrl: profile.pictureUrl
                                            });
                                        }
                                        MSSQL_RUN("IF EXISTS(select [CHANNELID] from [dbo].[CHANNEL_PICTUREURL] where [CHANNELID] = '" + userId + "' and [PICTUREURL] != '" + profile.pictureUrl + "')UPDATE [dbo].[CHANNEL_PICTUREURL] SET [PICTUREURL] = '" + profile.pictureUrl + "' WHERE [CHANNELID] = '" + userId + "' ELSE IF NOT EXISTS(select [CHANNELID] from [dbo].[CHANNEL_PICTUREURL] where [CHANNELID] = '" + userId + "' and [PICTUREURL] = '" + profile.pictureUrl + "')INSERT INTO [dbo].[CHANNEL_PICTUREURL]([CHANNELID],[PICTUREURL])VALUES('" + userId + "',N'" + profile.pictureUrl + "');SELECT 'OK' as [status],'" + userId + "' as [userId],'" + profile.pictureUrl + "' as [pictureUrl]");
                                    }
                                }
                            }
                        }
                    })
                    // console.timeEnd('query')
                } finally {
                    try {
                        await client.close()
                    } catch {}
                }
            }
        } else {
            MSSQL_RUN("IF NOT EXISTS(" + CHANNELQureySql + " where [CHANNELID] = '" + userId + "')" + CHANNELAddSql + "VALUES('" + userId + "',9999,N'');SELECT 'OK' as [status],'" + userId + "' as [userId]");
        }
    }
}