import fs from 'fs';
import express from 'express';
import schedule from 'node-schedule';
import cors from 'cors';
import path from 'path'
import { downloadData_ETH } from './js/data_download_eth.js';
import { getTimeFromStr } from './js/date_mod.js';
import { sendData_ETH, sendData_RESDB } from './js/endpoint.js';
import { downloadData_RESDB } from './js/data_download_resdb.js';
import { fileURLToPath } from 'url';

// const DATA_DIR = "processed_data\\";
// const RESDB_OUTFILE = 'resDB_data.json';

// Convert the URL path of the current module to a file path:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "processed_data/");
const RESDB_OUTFILE = path.join(__dirname, 'resDB_data.json');
const ETH_QUERY_SIZE = 1000;

console.log("Data dir: " + DATA_DIR)

const app = express();
const PORT = 3080;

app.use(cors());

app.get('/getData_ETH', (req, res) => {
    sendData_ETH(res, req, DATA_DIR)
})

app.get('/getData_RESDB', (req, res) => {
    sendData_RESDB(res, req, RESDB_OUTFILE)
})

app.listen(
    PORT,
    () => console.log(`Live on localhost:${PORT}`)
)

function deleteOldFiles(keep, dir) {
    fs.readdir(dir, (err, files) => {
        if(err) {
            console.log('failed to read dir:', dir);
        }
        files.sort((file1, file2) => {
            let d1 = getTimeFromStr(file1.replace('ETHDATA_', '').replace('.json', ''))
            let d2 = getTimeFromStr(file2.replace('ETHDATA_', '').replace('.json', ''))
            return d1 - d2;
        })
        let amountToDelete = files.length - keep
        if(amountToDelete <= 0) {
            return;
        }
        for(let i = 0; i < amountToDelete; i++) {
            console.log("deleting:", files[i])
            fs.unlinkSync(dir + files[i])
        }
    })
}

// seconds - minute - hour ...

// get eth data every 30 min and only keep newest 48 files (1 day old)
schedule.scheduleJob('0 */30 * * * *', () => {
    console.log("Downloading ETH data")
    let endTime = new Date()
    let MS_PER_MINUTE = 60000;
    let startTime = new Date(endTime - 30 * MS_PER_MINUTE)
    downloadData_ETH(ETH_QUERY_SIZE, startTime, endTime);
    deleteOldFiles(48, './processed_data/')
})

// get resdb data every hour
schedule.scheduleJob('0 0 */1 * * *', () => {
    console.log("Downloading RESDB data")
    downloadData_RESDB(RESDB_OUTFILE);
})
