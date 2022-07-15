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
        // super();
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