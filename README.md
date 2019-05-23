# BasicLINE-BOXwithHeroku
基礎LINE聊天機器人採用NODE.JS，在Heroku網站使用

##如何使用
1. 有個官方帳號 (LINE@ / LINE OFFICAL)
- LINE@生活圈 官方網站(https://at.line.me/tw/)
####自2019年4月18日起將關閉LINE@帳號申請入口，如欲創建新帳號，歡迎申請全新「LINE 官方帳號」。
- LINE 官方帳號 官方網站(https://www.linebiz.com/tw/service/line-account-connect/)

2. 申請機器人帳號 (Messaging API)
- LINE developers 官方網站(https://developers.line.biz/en/services/messaging-api/)

3. 有個Heroku帳號
- Heroku 官方網站(https://dashboard.heroku.com/)

4. 於Heroku建立app

5. 於app的Settings設置參數(Config Vars)，於Messaging API的Channel settings上尋找值
- 參數CHANNEL_ACCESS_TOKEN
- 參數CHANNEL_ID
- 參數CHANNEL_SECRET

6. 於app的Settings設置Buildpacks，新增　heroku/nodejs

7. 將程式上傳至HEROKU，於app的Deploy可以找到上傳方法(Deployment method)
- 上傳後，可至右上MORE的View logs查看紀錄，是否成功聆聽

8. 於Messaging API設置Webhook
- Use webhooks:Enabled
- Webhook URL:app的Settings找到Domain網址後面加上linewebhook

9. 於LINE官方帳號上設定 回應設定
- 回應模式:聊天機器人
- Webhook:啟用
