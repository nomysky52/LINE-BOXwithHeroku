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
    // 使用 event.reply(要回傳的訊息) 方法 將訊息回傳給使用者
    // event.message.text是使用者傳給bot的訊息
    event.reply(event.message.text).then(function (data) {
        // 當訊息成功回傳後的處理
        console.log('message', '[' + event.message.id + ':' + event.source.userId+']' + event.message.text + '@#$%^' + data);
    }).catch(function (error) {
        // 當訊息回傳失敗後的處理
        console.log('Error', error);
    });
});

// 當添加為朋友（或未阻止）時 觸發
bot.on('follow', function (event) { 
});

// 當取消關注（或封鎖）時 觸發
bot.on('unfollow', function (event) { 
});

// 當群組加入成員時 觸發
bot.on('memberJoined', function (event) {
});

// 當群組離開成員時 觸發
bot.on('memberLeft', function (event) {
});

// 當加入邀請時 觸發
bot.on('join', function (event) {
});

// 當離開群組時 觸發
bot.on('leave', function (event) {
});

// 
bot.on('postback', function (event) {
});

// 
bot.on('beacon',   function (event) {
});

// Bot所監聽的webhook路徑與port
bot.listen('/linewebhook', process.env.PORT || 80, function () {
  console.log('LineBot is running.');
});