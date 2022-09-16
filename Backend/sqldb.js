const Pool = require("pg").Pool;


    
devConfig =    {
    user:"",
    password: "",
    host: "" ,
    port: 5432,
    database: "",

}

const proConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
}

const pool = new Pool(proConfig)

module.exports = pool;