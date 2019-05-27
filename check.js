// 引用 postgresql SDK
const pg = require('pg');

// DBClient設定檔
const config = {
    host: 'ec2-174-129-240-67.compute-1.amazonaws.com',
    user: 'iamwdodmqbebsj',     
    password: 'bce81014516027375e326d0e5970a1d4fab3cb0c2e973dc35c295832dce4dd38',
    database: 'd8a8qp0fsn155i',
    port: 5432,
    ssl: true
};

class LineBot {
	var checkchannel = function(channelid) {
        const client = new pg.Client(config);
        client.connect();
        console.log('Connected to PostgreSQL database');
		
		var query = client.query('SELECT "CHANNELID", "TYPE", "NOTE" FROM public."CHANNEL"');
        query.on("row", function (row, result) {
			result.addRow(row);
		});

		query.on("end", function (result) {
			var jsonString = JSON.stringify(result.rows);
			var jsonObj = JSON.parse(jsonString);
			console.log(jsonString);
			client.end();
			context.succeed(jsonObj);
		});

	    //const query = 'SELECT "CHANNELID", "TYPE", "NOTE" FROM public."CHANNEL"'// where "CHANNELID" = ' + channelid;
	
        //return client.query(query);
    }
}