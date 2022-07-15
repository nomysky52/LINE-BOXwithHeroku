'use strict'; // Required to use class in node v4

import EventEmitter from "events";
import crypto from "crypto";
import http from "http";
import fetch from "node-fetch";
import bodyParser from "body-parser";

class LineBot extends EventEmitter 
{
    // 構造函數/建構子
    constructor(options) {
        super();
        this.options = options || {};
        this.options.channelId = options.channelId || '';
        this.options.channelSecret = options.channelSecret || '';
        this.options.channelAccessToken = options.channelAccessToken || '';
        if (this.options.verify === undefined) {
            this.options.verify = true;
        }
        this.headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + this.options.channelAccessToken
        };
        this.endpoint = 'https://api.line.me/v2/bot';
        this.dataendpoint = 'https://api-data.line.me/v2/bot';
    }
    // 核實/校驗
    verify(rawBody, signature) {
        // SHA-256 密碼雜湊函式演算法
        const hash = crypto.createHmac('sha256', this.options.channelSecret)
                           .update(rawBody, 'utf8')
                           .digest('base64');
        // Constant-time comparison to prevent timing attack.
        if (hash.length !== signature.length) {
            return false;
        }
        let res = 0;
        for (let i = 0; i < hash.length; i++) {
            res |= (hash.charCodeAt(i) ^ signature.charCodeAt(i));
        }
        return res === 0;
    }
    // 解析 內容
    parse(body) {
        const that = this;
        if (!body || !body.events) {
            return;
        }
        console.log('body : ' + JSON.stringify(body));
        body.events.forEach(function(event) {
            console.log('event : ' + JSON.stringify(event));
            // event.type(message/unsend/follow/unfollow/join/leave/memberJoined/memberLeft/postback/videoPlayComplete/beacon/accountLink/things)
            event.reply = function (message) {
                return that.reply(event.replyToken, message);
            };
            if (event.source) {
                // event.source.type(user/group/room)
                event.source.profile = function() {
                    if (event.source.type === 'group') {
                        return that.getGroupMemberProfile(event.source.groupId, event.source.userId);
                    }
                    if (event.source.type === 'room') {
                        return that.getRoomMemberProfile(event.source.roomId, event.source.userId);
                    }
                    return that.getUserProfile(event.source.userId);
                };
                event.source.member = function() {
                    if (event.source.type === 'group') {
                        return that.getGroupMember(event.source.groupId);
                    }
                    if (event.source.type === 'room') {
                        return that.getRoomMember(event.source.roomId);
                    }
                };
            }
            if (event.message) {
                // event.message.type(text/image/video/audio/file/location/sticker)
                // 訊息內容
                event.message.content = function() {
                    return that.getMessageContent(event.message.id);
                };
                // 訊息內容資料
                event.message.contentdata = function() {
                    return that.getMessageContentData(event.message.id);
                };
            }
            process.nextTick(function() {
                that.emit(event.type, event);
            });
        });
    }
    // 建立訊息
    static createMessages(message) {
        if (typeof message === 'string') {
            return [{ type: 'text', text: message }];
        }
        if (Array.isArray(message)) {
            return message.map(function(m) {
                if (typeof m === 'string') {
                    return { type: 'text', text: m };
                }
                return m;
            });
        }
        return [message];
    }
    // 回應
    reply(replyToken, message) {
        const url = '/message/reply';
        const body = {
            replyToken: replyToken,
            messages: LineBot.createMessages(message)
        };
        console.log('POST ' + url);
        console.log(body);
        return this.post(url, body).then(res => res.json()).then((result) => {
            console.log('result : ' + JSON.stringify(result));
            return result;
        });
    }
    // 傳送
    push(to, message) {
        const url = '/message/push';
        if (Array.isArray(to)) {
            return Promise.all(to.map(recipient => this.push(recipient, message)));
        }
        const body = {
            to: to,
            messages: LineBot.createMessages(message)
        };
        console.log('POST ' + url);
        console.log(body);
        return this.post(url, body).then(res => res.json()).then((result) => {
            console.log('result : ' + JSON.stringify(result));
            return result;
        });
    }
    // 多播消息
    multicast(to, message) {
        const url = '/message/multicast';
        const body = {
            to: to,
            messages: LineBot.createMessages(message)
        };
        console.log('POST ' + url);
        console.log(body);
        return this.post(url, body).then(res => res.json()).then((result) => {
            console.log('result : ' + JSON.stringify(result));
            return result;
        });
    }
    // 窄播消息
    narrowcast(to, message, limitmax, filter) {
        const url = '/message/narrowcast';
        if(filter) {
            const body = {
                to: to,
                messages: LineBot.createMessages(message),
                filter: filter,
                limit: {
                    max: limitmax
                }
            };
        }
        else {
            const body = {
                to: to,
                messages: LineBot.createMessages(message),
                limit: {
                    max: limitmax
                }
            };
        }
        console.log('POST ' + url);
        console.log(body);
        return this.post(url, body).then(res => res.json()).then((result) => {
            console.log('result : ' + JSON.stringify(result));
            return result;
        });
    }
    // 廣播
    broadcast(message){
        const url = '/message/broadcast';
        const body = {
            messages: LineBot.createMessages(message)
        };
        console.log('POST ' + url);
        console.log(body);
        return this.post(url, body).then(res => res.json()).then((result) => {
            console.log('result : ' + JSON.stringify(result));
            return result;
        });
    }

    // 取得訊息內容
    getMessageContent(messageId) {
        const url = `/message/${messageId}/content`;
        console.log('GET ' + url);
        return this.get(url).then(res => res.buffer()).then((buffer) => {
        console.log('hex : ' + buffer.toString('hex'));
            return buffer;
        });
    }
    // 取得訊息內容資料
    getMessageContentData(messageId) {
        const url = `/message/${messageId}/content`;
        console.log('GET ' + url);
        return this.getdata(url).then(res => res.buffer()).then((buffer) => {
        console.log('hex : ' + buffer.toString('hex'));
            return buffer;
        });
    }
    // 獲取本月發送消息的目標限制
    quota(){
        const url = '/message/quota';
        console.log('POST ' + url);
        return this.post(url).then(res => res.json()).then((result) => {
            console.log('result : ' + JSON.stringify(result));
            return result;
        });
    }
    // 獲取本月發送的消息數
    consumption(){
        const url = '/message/quota/consumption';
        console.log('GET ' + url);
        return this.get(url).then(res => res.json()).then((result) => {
            console.log('result : ' + JSON.stringify(result));
            return result;
        });
    }

    getUserProfile(userId) {
        const url = `/profile/${userId}`;
        console.log('GET ' + url);
        return this.get(url).then(res => res.json()).then((profile) => {
            console.log('profile : ' + JSON.stringify(profile));
            return profile;
        });
    }

    getGroupMemberProfile(groupId, userId) {
        const url = `/group/${groupId}/member/${userId}`;
        console.log('GET ' + url);
        return this.get(url).then(res => res.json()).then((profile) => {
        console.log('profile : ' + JSON.stringify(profile));
            profile.groupId = groupId;
            return profile;
        });
    }

    getGroupMember(groupId, next) {
        const url = `/group/${groupId}/members/ids` + (next ? `?start=${next}` : '');
        console.log('GET ' + url);
        return this.get(url).then(res => res.json()).then((groupMember) => {
            //debug('%O', groupMember);
            if (groupMember.next) {
                return this.getGroupMember(groupId, groupMember.next).then((nextGroupMember) => {
                    groupMember.memberIds = groupMember.memberIds.concat(nextGroupMember.memberIds);
                    delete groupMember.next;
                    return groupMember;
                });
            }
            delete groupMember.next;
            return groupMember;
        });
    }

    leaveGroup(groupId) {
        const url = `/group/${groupId}/leave`;
        console.log('POST ' + url);
        return this.post(url).then(res => res.json()).then((result) => {
            console.log('result : ' + JSON.stringify(result));
            return result;
        });
    }

    getRoomMemberProfile(roomId, userId) {
        const url = `/room/${roomId}/member/${userId}`;
        console.log('GET ' + url);
        return this.get(url).then(res => res.json()).then((profile) => {
            console.log('profile : ' + JSON.stringify(profile));
            profile.roomId = roomId;
            return profile;
        });
    }

    getRoomMember(roomId, next) {
        const url = `/room/${roomId}/members/ids` + (next ? `?start=${next}` : '');
        console.log('GET ' + url);
        return this.get(url).then(res => res.json()).then((roomMember) => {
            //debug('%O', roomMember);
            if (roomMember.next) {
                return this.getRoomMember(roomId, roomMember.next).then((nextRoomMember) => {
                    roomMember.memberIds = roomMember.memberIds.concat(nextRoomMember.memberIds);
                    delete roomMember.next;
                    return roomMember;
                });
            }
            delete roomMember.next;
            return roomMember;
        });
    }

    leaveRoom(roomId) {
        const url = `/room/${roomId}/leave`;
        console.log('POST ' + url);
        return this.post(url).then(res => res.json()).then((result) => {
            console.log('result : ' + JSON.stringify(result));
            return result;
        });
    }

    get(path) {
        const url = this.endpoint + path;
        const options = { method: 'GET', headers: this.headers };
        return fetch(url, options);
    }
    getdata(path) {
        const url = this.dataendpoint + path;
        const options = { method: 'GET', headers: this.headers };
        return fetch(url, options);
    }

    post(path, body) {
        const url = this.endpoint + path;
        const options = { method: 'POST', headers: this.headers, body: JSON.stringify(body) };
        return fetch(url, options);
    }

    // Optional Express.js middleware
    parser() {
        const parser = bodyParser.json({
            verify: function (req, res, buf, encoding) {
                req.rawBody = buf.toString(encoding);
            }
        });
        return (req, res) => {
            parser(req, res, () => {
                if (this.options.verify && !this.verify(req.rawBody, req.get('X-Line-Signature'))) {
                    return res.sendStatus(400);
                }
                this.parse(req.body);
                return res.json({});
            });
        };
    }

    // Optional built-in http server
    listen(path, port, callback) {
        const parser = bodyParser.json({
            verify: function (req, res, buf, encoding) {
                req.rawBody = buf.toString(encoding);
            }
        });
        const server = http.createServer((req, res) => {
            const signature = req.headers['x-line-signature']; // Must be lowercase
            res.setHeader('X-Powered-By', 'linebot');
            if (req.method === 'POST' && req.url === path) {
            parser(req, res, () => {
                if (this.options.verify && !this.verify(req.rawBody, signature)) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'text/html; charset=utf-8');
                    return res.end('Bad request');
                }
                this.parse(req.body);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.end('{}');
            });
            } else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                return res.end('Not found');
            }
        });
        return server.listen(port, callback);
    }

} // class LineBot

function createBot(options) {
    return new LineBot(options);
}

module.exports = createBot;
module.exports.LineBot = LineBot;

// 用於辨識Line Channel的資訊
const bot = LineBot({
    channelId: process.env.CHANNEL_ID,
    channelSecret: process.env.CHANNEL_SECRET,
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
});
// 當有人傳送訊息給Bot時 觸發
bot.on('message', function(event) {
    console.log('[bot.on]Run');
    //來源者
    var messagepush = 'userId:' + event.source.userId + '\n';
    //來源群組
    if(typeof event.source.groupId !== "undefined")
        messagepush = messagepush + 'groupId:' + event.source.groupId + '\n';
    //來源ROOM
    if(typeof event.source.roomId !== "undefined")
        messagepush = messagepush + 'roomId:' + event.source.roomId + '\n';
    console.log('event : ' + JSON.stringify(event));

    switch (event.message.type)
    {
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
            {// 開發者密技
                if(typeof event.source.groupId !== "undefined")
                {// 群組說話
                    if(event.source.groupId !== 'C7b558cc0f3c4b0672776b82c80c861f9')
                    {
                        console.log(messagepush + ':' + event.message.text);
                    }
                }
                else
                {
                    if(event.message.text == 'Confirm')
                    {
                        // message: 'must be 2 items', property: 'template/actions' 
                        event.reply({
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
                        break;
                    }
                    // Access to this API is not available for your account
                    // 改付費功能
                    else if(event.message.text == 'member')
                    {
                        event.source.member().then(function (member) {
                            // bot.push(process.env.channel_no, json.stringify(member));
                            return event.reply(json.stringify(member));
                        });
                        break;
                    }
                    else if(event.message.text == 'profile')
                    {
                        event.source.profile().then(function (profile) {
                            // bot.push(process.env.channel_no, json.stringify(profile));
                            return event.reply(json.stringify(profile));
                        });
                        break;
                    }
                    else if(event.message.text == 'Picture')
                    {
                        event.reply({
                            type: 'image',
                            originalContentUrl: 'https://farm9.staticflickr.com/8689/16968169827_c0ab54a550_z.jpg#',
                            previewImageUrl: 'https://farm9.staticflickr.com/8689/16968169827_c0ab54a550_z.jpg#'
                        });
                        break;
                    }
                    else if(event.message.text == 'test')
                    {
                        event.source.member().then(function (member) {
                            bot.push(process.env.CHANNEL_NO, JSON.stringify(member));
                        return event.reply(JSON.stringify(member));
                        });
                        bot.getUserProfile(event.source.userId);
                        event.reply(bot.getUserProfile(event.source.userId));
                        break;
                    }
                    // 給予地圖
                    // else if(event.message.text == 'Location')
                    // {
                        // event.reply({
                            // type: 'location',
                            // title: 'LINE Plus Corporation',
                            // address: '1 Empire tower, Sathorn, Bangkok 10120, Thailand',
                            // latitude: 13.7202068,
                            // longitude: 100.5298698
                        // });
                        // break;
                    // }
                }
            }

            switch (event.message.text) {
                case '說明':
                    event.reply(['輸入以下「關鍵字」' + '\n'
, '「素食者分類」:' + '\n' + '介紹一般素食者的區分。' + '\n' 
+ '「素食標示」:' + '\n' + '介紹[包裝食品宣稱為素食標示-2014.11.05修編]要點。' + '\n' 
+ '「植物五辛」:' + '\n' + '介紹何為植物五辛?' + '\n' 
]);
                    break;
                case '素食者分類':
                    event.reply(['素食者有分為' + '\n' 
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
+ '(6)方便素、鍋邊素者：' + '\n' 
+ '是指整盤葷菜只挑青菜類、豆類等天然非肉類等來吃。' + '\n' + '\n'
+ '(7)魚素食者 / 海鮮素者( pescetarian )：' + '\n' 
+ '不吃除了魚、海產以外的肉類，還有家禽、蛋不吃。' + '\n' 
+ '這類魚素食者以日本國家大士為多。' + '\n' + '\n'
, '素食標示分為「全素或純素」、「蛋素」、「奶素」、「奶蛋素」及「植物五辛素」五類，想了解可輸入"素食標示"。'
, '想了解五辛，可輸入"植物五辛"。'
]);
                    break;
                case '素食標示':
                event.reply(['台灣[包裝食品宣稱為素食標示-2014.11.05修編]' + '\n' 
+ '素食產品標示分為「全素或純素」、「蛋素」、「奶素」、「奶蛋素」及「植物五辛素」五類' + '\n' + '\n'
+ '全素或純素：不含奶蛋、也不含五辛（蔥、蒜、韭、薤菜及興蕖）的純植物性食品。' + '\n'
+ '蛋素：全素或純素及蛋製品。' + '\n'
+ '奶素：全素或純素及奶製品。' + '\n'
+ '奶蛋素：全素或純素及奶蛋製品。' + '\n'
+ '植物五辛素：指食用植物性食物，但可含五辛（蔥、蒜、韭、薤菜及興蕖）或奶蛋。' + '\n'
,'二十二碳六烯酸（DHA）和二十碳五烯酸（EPA）是從魚油萃取而來，而魚油萃取過程中，魚已被犧牲。屬於葷食。'
,'食用天然色素胭脂紅是從胭脂蟲提煉而來，而食用天然色素胭脂紅提煉過程中，胭脂蟲已被犧牲。屬於葷食。'
]);
                    break;
                case '植物五辛':
                    event.reply(['何謂植物五辛？' + '\n' 
+ '植物五辛包括「蔥、蒜、韭、蕎及興渠」五類植物' + '\n' 
+ '蔥：含青蔥、紅蔥、革蔥、慈蔥、蘭蔥...等等蔥類。' + '\n' 
+ '蒜：含大蒜、蒜苗...等等蒜類。' + '\n' 
+ '韭：含韭菜、韭黃、韭菜花...等等韭類。' + '\n' 
+ '蕎：即為蕗蕎或薤菜（「薤」念ㄒㄧㄝˋ），閩南話稱為蕗藠、藠頭，阿美族稱之為火蔥。' + '\n' 
+ '興渠：即為洋蔥。'
]);
                    break;
                case '為甚麼吃素?':
                    event.reply(['有些人會說，如果你不忍心看到那些動物受苦，那你為什麼忍心殺害蔬菜或是水果，還有細菌？' + '\n' 
+ '對很多人來說，Vegetarian、Vegan並不是什麼零跟一的問題' + '\n' 
+ '我們不想傷害動物，是因為我們可以清楚的感受到那些動物的痛苦，' + '\n' 
+ '我們都是先從關心自己本身開始，將同理心一點一點的擴散出去的，' + '\n' 
+ '我們學會了愛護我們自己，然後開始理解到家人、朋友們的感受；' + '\n' 
+ '然後開始理解到其他台灣人的感受；' + '\n' 
+ '然後開始瞭解到其他種族、民族的感受，' + '\n' 
+ '然後自然而然地對動物們也同樣的將心比心。' + '\n' 
+ '這不是階層式的感受，一定要先怎樣然後怎樣。' + '\n' 
]);
                    break;
                case '笑笑':
                    event.reply('我愛妳');
                    break;
                case '啞啞':
                    event.reply('我愛你');
                    break;
                case '禮仁是帥哥':
                    event.reply('國道豬 是 禮仁');
                    break;
                case 'Version':
                    event.reply('nomyskylinebot@' + require('../package.json').version);
                    break;
                // case '標記':
                    // event.source.member().then(function (member) {
                        // bot.push(process.env.CHANNEL_NO, JSON.stringify(member));
                        // return event.reply(JSON.stringify(member));
                    // });
                    // break;
                default:
                    // 回傳 userId 說了甚麼
                    if(event.source.groupId !== 'C7b558cc0f3c4b0672776b82c80c861f9')
                    {
                        messagepush = messagepush + ':' + event.message.text;
                        console.log(messagepush);
                        bot.push(process.env.CHANNEL_NO, messagepush);
                    }
                    break;
            }
            break;
        case 'image':
            // 紀錄 userId 傳了 image
            // messagepush = messagepush + ':' + event.message.type
            // bot.push(process.env.CHANNEL_NO, messagepush);
            event.message.content().then(function (content) {
                buffer = content;
                // bot.push(process.env.CHANNEL_NO, JSON.stringify(content));
                imgurbot.imgurUpload(event.message.id, buffer).then(function (imgurUpload) {
                        return event.reply(JSON.stringify(imgurUpload));
                });
            });
            // event.reply({
                // type: 'image',
                // originalContentUrl: 'https://farm9.staticflickr.com/8689/16968169827_c0ab54a550_z.jpg#',
                // previewImageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSMabEh5Dastr1BpkFPlaO7bI4X27XO5nxlj3YMtGAD-J5dJTpb&usqp=CAU'
            // });
            
            // bot.push(process.env.CHANNEL_NO, JSON.stringify(event));
            break;
        case 'video':
            // 紀錄 userId 傳了 video
            // messagepush = messagepush + ':' + event.message.type
            // bot.push(process.env.CHANNEL_NO, messagepush);
            // bot.push(process.env.CHANNEL_NO, JSON.stringify(event));
            break;
        case 'audio':
            // 紀錄 userId 傳了 audio
            // messagepush = messagepush + ':' + event.message.type
            // bot.push(process.env.CHANNEL_NO, messagepush);
            // bot.push(process.env.CHANNEL_NO, JSON.stringify(event));
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
        case 'sticker':
            //// 傳送貼圖
            // bot.push(process.env.CHANNEL_NO, {
                // type: 'sticker',
                // packageId: 1, // event.message.packageId, // Line 有限制只能使用前4套貼圖，也就是說 packageId 的值必須在 1 到 4 之間。
                // stickerId: 1  // event.message.stickerId
            // });
            if(event.source.userId === process.env.CHANNEL_NO)
            {
                var channel = GET_SOMEE_MS('select * from [dbo].[CHANNEL]');
                console.log(channel);
                bot.push("U6555a5471b6e355c3694449e7e52c7f9", "早安");
            }
            break;
        default:
            // 紀錄 userId 傳了 未知類別
            bot.push(process.env.CHANNEL_NO, JSON.stringify(event));
            break;
    }
});

// 當添加為朋友（或未阻止）時 觸發
bot.on('follow', function (event) {
    if(typeof event.source.groupId !== "undefined")
    {
        bot.push(process.env.CHANNEL_NO, '[follow]' + '\n'+ JSON.stringify(event));
        event.reply(['我是笑笑' + '\n' + '歡迎成為笑友 ' + '\n' + '若不想接收提醒，不要封鎖我呦' + '\n' + '請點擊右上角更多的圖示再點擊關閉提醒' + '\n' + '願有個愉快的一天'
        ]);
    }
    else
    {
        bot.push(process.env.CHANNEL_NO, '[follow]' + '\n'+ JSON.stringify(event));
        event.reply(['我是笑笑' + '\n' + '歡迎成為笑友 ' + '\n' + '若不想接收提醒，不要封鎖我呦' + '\n' + '請點擊右上角更多的圖示再點擊關閉提醒'
            , '使用方法請填「說明」，願有個愉快的一天'
        ]);
        bot.push(event.source.userId , {
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
    }
});

// 當取消關注（或封鎖）時 觸發
bot.on('unfollow', function (event) {
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

// 當加入群組邀請時 觸發
bot.on('join', function (event) {
    bot.push(process.env.CHANNEL_NO, '[follow]' + '\n'+ JSON.stringify(event));
        event.reply(['我是笑笑' + '\n' + '歡迎成為笑友 ' + '\n' + '若不想接收提醒，不要封鎖我呦' + '\n' + '請點擊右上角更多的圖示再點擊關閉提醒' + '\n' + '願有個愉快的一天'
    ]);
});

// 當離開群組時 觸發
bot.on('leave', function (event) {
    bot.push(process.env.CHANNEL_NO, '[leave]' + '\n'+ JSON.stringify(event));
});

// 
bot.on('postback', function (event) {
    bot.push(process.env.CHANNEL_NO, '[postback]' + '\n'+ JSON.stringify(event));
});

// 
bot.on('beacon',   function (event) {
    bot.push(process.env.CHANNEL_NO, '[beacon]' + '\n'+ JSON.stringify(event));
});

// Bot所監聽的webhook路徑與port
bot.listen('/linewebhook', process.env.PORT || 80, function () {
  console.log('LineBot is running.');
});
