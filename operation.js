const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')
const jsonexport = require('jsonexport')
const _ = require('lodash')

const dataPath = path.join(__dirname, '/data/r84_mutation.csv')
const epciPath = path.join(__dirname, '/data/INSEE_EPCI_V2.csv')

async function createEpci() {
    return new Promise(resolve => {
        let epci = []
        fs.createReadStream(epciPath, 'utf8').pipe(csv())
            .on('data', (row) => {
                //Remove space in key
                const o = JSON.parse(JSON.stringify(row).replace(/\s(?=\w+":)/g, ""))
                epci.push({
                    CODGEO: o.CODGEO,
                    LIBGEO: o.LIBGEO,
                    EPCI: o.EPCI,
                    LIBEPCI: o.LIBEPCI
                })
            })
            .on('end', () => {
                console.log('WORK IS DONE')
                resolve(epci)
            })
    })
}

module.exports = {
    createEpci
}