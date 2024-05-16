
import { EventEmitter } from 'events';
import fs from 'fs';
import express from 'express';
import schedule from 'node-schedule';
import cors from 'cors';
import { downloadData_ETH } from './js/data_download_eth.js';
import { createTimeStr } from './js/date_mod.js';
import { sendData_ETH, sendData_RESDB } from './js/endpoint.js';
import axios from 'axios';
import { downloadData_RESDB } from './js/data_download_resdb.js';

const DATA_DIR = "processed_data";
const RESDB_OUTFILE = './resDB_data.json';
const ETH_QUERY_SIZE = 1000;

const app = express();
const PORT = 8080;
const eventEmitter = new EventEmitter();

eventEmitter.on('testEvent', () => {
    console.log("hello world2")

    fs.readFile('./testFile.txt', 'utf8', (err, txt) => {
        console.log(txt)
    })
})

eventEmitter.emit("testEvent")

app.use(cors());

app.get('/getData_ETH', (req, res) => {
    sendData_ETH(res, req, DATA_DIR)
})

app.get('/getData_RESDB', (req, res) => {
    sendData_RESDB(res, req, RESDB_OUTFILE)
})

app.listen(
    PORT,
    () => console.log(`live on localhost:${PORT}`)
)

async function getData_ETH() {
    let endTime = new Date()
    let MS_PER_MINUTE = 60000;
    let startTime = new Date(endTime - 30 * MS_PER_MINUTE)
    let fileName = "ETHDATA_" + createTimeStr(startTime)
    fileName = fileName.replace(":00.000Z", "")
    fileName = fileName.replace(":", "-") + ".json"
    downloadData_ETH(ETH_QUERY_SIZE, startTime, endTime);
}

// seconds - minute - hour ...
schedule.scheduleJob('0 */30 * * * *', () => {
    console.log("Downloading ETH data")
    // getData_ETH();
})

schedule.scheduleJob('0 0 */1 * * *', () => {
    console.log("Downloading RESDB data")
    // downloadData_RESDB(RESDB_OUTFILE);
})

function deleteFiles(range) {
    
}

schedule.scheduleJob('0 */1 * * * *', () => {
    console.log("Downloading ETH data")
    // getData_ETH();
})