
import { EventEmitter } from 'events';
import fs from 'fs';
import express from 'express';
import schedule from 'node-schedule';
import cors from 'cors';
import { downloadData } from './js/data_download.js';
import { createTimeStr } from './js/date_mod.js';
import { sendData } from './js/endpoint.js';

const app = express();
const PORT = 8080;
const eventEmitter = new EventEmitter();

const DATA_DIR = "processed_data"

eventEmitter.on('testEvent', () => {
    console.log("hello world2")

    fs.readFile('./testFile.txt', 'utf8', (err, txt) => {
        console.log(txt)
    })
})

eventEmitter.emit("testEvent")

app.use(cors());

app.get('/testGet', (req, res) => {
    sendData(res, req, DATA_DIR)
})

app.listen(
    PORT,
    () => console.log(`live on localhost:${PORT}`)
)

async function getData() {
    let endTime = new Date()
    let MS_PER_MINUTE = 60000;
    let startTime = new Date(endTime - 30 * MS_PER_MINUTE)
    let fileName = "ETHDATA_" + createTimeStr(startTime)
    fileName = fileName.replace(":00.000Z", "")
    fileName = fileName.replace(":", "-") + ".json"
    console.log("Downloading data")
    console.log(createTimeStr(startTime), createTimeStr(endTime))
    downloadData(1000, startTime, endTime);
}

// seconds - minute - hour ...
schedule.scheduleJob('0 */30 * * * *', () => {
    getData();
})