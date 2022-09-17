const Pool = require("pg").Pool;


    
devConfig =    {
    user:"postgres",
    password: "testtest",
    host: "localhost" ,
    port: 5432,
    database: "realms",

}

const proConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
}

const pool = new Pool(proConfig)

module.exports = pool;