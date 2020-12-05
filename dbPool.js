const mysql = require('mysql');

const pool  = mysql.createPool({
    
    //Images are not properly displayed when using this pool, but bepuy5ijvb0xwfel.reviews does not exist.
    connectionLimit: 15,
    host: "r1bsyfx4gbowdsis.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "pbr0dvx3u8hw0r4j",
    password: "wbca9qwoylydh8tq",
    database: "iyp01uqtwbyhetm1"
    
    //Previous pool, I (James) changed it to my jaws.db
    /*host: "aqx5w9yc5brambgl.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "hs5myapojoylquun",
    password: "txdmdvhmkxtssfrf",
    database: "bepuy5ijvb0xwfel"*/
});

module.exports = pool;