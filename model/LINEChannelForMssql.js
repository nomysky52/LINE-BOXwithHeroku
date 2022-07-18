var sqlDb = require("mssql");

// 取得資料
async function GET_SELECT_MS(sql,sqlConfig) {
    if (sql) {
        // console.log('--GET_SELECT_MS--' + '\n' + 'sql : ' + sql);
        try {
            const client = new sqlDb.ConnectionPool(sqlConfig)

            // console.time('connect')
            const pool = await client.connect()
            // console.timeEnd('connect')

            const request = pool.request()

            // console.time('query')
            const query = await request.query(sql, function(err, result) {
                // if (result.recordsets) {
                // console.log('GET_SELECT_MS result.recordsets :');
                // console.log(result.recordsets);
                // }
                if (result) {
                    if (result.recordset) {
                        console.log('GET_SELECT_MS result.recordset :');
                        console.log(result.recordset);
                    }
                }
            })
            // console.timeEnd('query')
			console.log(query);
        } finally {
            try {
                await client.close()
            } catch {}
        }
    }
}