const Pool = require('pg').Pool
const operations = require('./operation')
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'laure',
    password: 'Merlin27Postgres',
    port: 5432,
})

const createTable = (request, response) => {
    console.log({ request: request.body.name })

    pool.query(insertEpci, (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`TABLE ${request.name} has been created sucessfully`)
    })
}
const epciTable = async (request, response) => {
    const epciJson = await operations.createEpci()
    const values = epciJson.map(o => {
        return `('${o.CODGEO}',
        '${o.LIBGEO}',
        '${o.EPCI}',
        '${o.LIBEPCI}')`
    })
    pool.query(`INSERT INTO epci (
        CODGEO,
        LIBGEO,
        EPCI,
        LIBEPCI
        )VALUES${values.toString()}`,
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`DATA for EPCITABLE has been created sucessfully`)
        })
}
const insertEpci =

    module.exports = {
        createTable,
        epciTable
    }