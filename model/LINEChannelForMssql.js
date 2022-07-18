var sqlDb = require("mssql");

// 設定 LINE 資訊至 DB
async function SET_PROFILE(userId, profile) {
    if (userId) {
        if (profile) {
            MSSQL_RUN("IF NOT EXISTS(select [CHANNELID] from [dbo].[CHANNEL] where [CHANNELID] = '" + userId + "')" + CHANNELAddSql + "VALUES('" + userId + "',1,N'" + profile.displayName + "') ELSE IF EXISTS(select [CHANNELID] from [dbo].[CHANNEL] where [CHANNELID] = '" + userId + "' and [NOTE] != N'" + profile.displayName + "')UPDATE [dbo].[CHANNEL] SET [TYPE] = 1, [NOTE] = N'" + profile.displayName + "' WHERE [CHANNELID] = '" + userId + "' ;SELECT 'OK' as [status],'" + userId + "' as [userId]");
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
            MSSQL_RUN("IF NOT EXISTS(select [CHANNELID] from [dbo].[CHANNEL] where [CHANNELID] = '" + userId + "')" + CHANNELAddSql + "VALUES('" + userId + "',9999,N'');SELECT 'OK' as [status],'" + userId + "' as [userId]");
        }
    }
}
// 語法下派
async function MSSQL_RUN(sql) {
    if (sql) {
        // console.log('--MSSQL_RUN--' + '\n' + 'sql : ' + sql);
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
                        console.log('MSSQL_RUN result.recordset :');
                        console.log(result.recordset);
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