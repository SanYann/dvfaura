const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')
const jsonexport = require('jsonexport')
const _ = require('lodash')

const dataPath = path.join(__dirname, '/data/r84_mutation.csv')
const epciPath = path.join(__dirname, '/data/INSEE_EPCI.csv')

let epci = []

const jsonToHtml = (data, name) => {
    jsonexport(data, function (err, csv) {
        if (err) return console.log(err)
        console.log('CSV file processed')
        fs.appendFileSync(
            `data/mutation${name}.csv`,
            csv,
            'utf8',
            function (err) {
                if (err) return console.log('ERROR', err)
            }
        )
    })
}

async function createJson(year) {
    return new Promise(resolve => {
        let data = []
        fs.createReadStream(dataPath, 'utf8').pipe(csv())
            .on('data', (row) => {
                // Si l_condinsee unique
                if (row.anneemut.includes(year)) {
                    if (!row.l_codinsee.replace('{', '').replace('}', '').includes(',')) {
                        let objectCommune = {
                            idmutation: row.idmutation,
                            idmutinvar: row.idmutinvar,
                            idopendata: row.idopendata,
                            anneemut: row.anneemut,
                            coddep: row.coddep,
                            l_codinsee: row.l_codinsee,
                            libnatmut: row.libnatmut,
                            vefa: row.vefa,
                            valeurfonc: row.valeurfonc,
                            sterr: row.sterr,
                            sbati: row.sbati,
                            sbatmai: row.sbatmai,
                            sbatapt: row.sbatapt,
                            sbatact: row.sbatact,
                            sapt1pp: row.sapt1pp,
                            sapt2pp: row.sapt2pp,
                            sapt3pp: row.sapt3pp,
                            sapt4pp: row.sapt4pp,
                            sapt5pp: row.sapt5pp,
                            smai1pp: row.smai1pp,
                            smai2pp: row.smai2pp,
                            smai3pp: row.smai3pp,
                            smai4pp: row.smai4pp,
                            smai5pp: row.smai5pp,
                            libtypbien: row.libtypbien,
                            prixm2bati: (row.sbati > 0 ? +row.valeurfonc / +row.sbati : 0).toFixed(2),
                            prixm2terrain: (row.sterr > 0 ? +row.valeurfonc / +row.sterr : 0).toFixed(2)
                        }
                        data.push(objectCommune)
                    }
                }
            })
            .on('end', () => {
                console.log('WORK IS DONE')
                resolve(data)
            })
    })
}

async function createEpci() {
    return new Promise(resolve => {
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

const removeValeurFonc = intJson => {
    let jsonBis = intJson.filter(o => {
        return o.valeurfonc > 1
    })
    return jsonBis
}

const removelibtypbien = intJson => {
    let jsonBis = intJson.filter(o => {
        return o.libtypbien.includes('APPARTEMENT INDETERMINE') ||
            o.libtypbien.includes('BATI MIXTE - LOGEMENTS') ||
            o.libtypbien.includes('DES MAISONS') ||
            o.libtypbien.includes('DEUX APPARTEMENTS') ||
            o.libtypbien.includes('MAISON INDERTERMINEE') ||
            o.libtypbien.includes('TERRAIN DE TYPE TAB') ||
            o.libtypbien.includes('UN APPARTEMENT') ||
            o.libtypbien.includes('UNE MAISON')
    })
    return jsonBis
}
(async () => {
    const dataArray = await createJson('2014')
    await createEpci()
    let finalData = []

    let dataBis = removeValeurFonc(dataArray)
    const verifycodep = (json) => {
        const intjson = json.map(o => o.coddep)
        console.log('###########################################')
        const newlist = _.uniq(intjson)
        console.log(newlist.toString())
        console.log(newlist.length)
        console.log('###########################################')
    }
    verifycodep(dataBis)

    let dataBisBis = removelibtypbien(dataBis)
    verifycodep(dataBisBis)

    // Interpollation
    dataBisBis.forEach(date => {
        for (let i = 0; i < epci.length; i++) {
            if (date.l_codinsee.replace('{', '').replace('}', '').includes(epci[i].CODGEO)) {
                let toto = {
                    ...date,
                    CODGEO: epci[i].CODGEO,
                    LIBGEO: epci[i].LIBGEO,
                    EPCI: epci[i].EPCI,
                    LIBEPCI: epci[i].LIBEPCI
                }
                finalData.push(toto)
                break
            }
        }
    })
    // console.log({ finalData })
    console.log('Creation of CSV')

    verifycodep(finalData)
    jsonToHtml(finalData, '2014V4')

})().catch(e => {
    console.log({ e })
})
