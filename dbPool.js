const mysql = require('mysql');

const pool  = mysql.createPool({
    
    connectionLimit: 15,
    host: "r1bsyfx4gbowdsis.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "pbr0dvx3u8hw0r4j",
    password: "wbca9qwoylydh8tq",
    database: "iyp01uqtwbyhetm1"
    
});

module.exports = pool;