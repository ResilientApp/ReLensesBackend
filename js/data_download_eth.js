import fs from 'fs';
import { createTimeStr } from './date_mod.js';

function saveJSON(jsonObj, outfile) {
    jsonObj = JSON.stringify(jsonObj)
    fs.writeFile(outfile, jsonObj, 'utf8', () => {
        console.log(outfile, "file saved")
    })
}

function processJSON_ETH(data1, outfile) {
    let data = data1.ethereum
    let addresses = [];
    let transactions = [];
    data.transactions.forEach(trans => {
        let processedTrans = {
            from: trans.sender.address,
            to: trans.to.address,
            amount: trans.gas_value_usd,
            timestamp: trans.block.timestamp.time,
            hash: trans.hash
        }
        transactions.push(processedTrans)
        if(!addresses.includes(trans.sender.address)) {
            addresses.push(trans.sender.address)
        }
        if(!addresses.includes(trans.to.address)) {
            addresses.push(trans.to.address)
        }
    });
    let obj = {
        users: addresses,
        transactions: transactions
    }
    saveJSON(obj, outfile)
}

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

export async function downloadData_ETH(querySize, startTime, endTime) {

    const dir = './processed_data/'

    let startTimeStr = createTimeStr(startTime);
    let endTimeStr = createTimeStr(endTime);

    console.log(startTimeStr, endTimeStr)

    let fileName = dir + "ETHDATA_" + createTimeStr(startTimeStr)
    fileName = fileName.replace(":00.000Z", "")
    fileName = fileName.replace(":", "-") + ".json"

    const apiKey = "BQYd0rsSmffBzkLkUs5bJkqCPlHKZPiz"
  
    // https://community.bitquery.io/t/make-api-calls-to-bitquery-in-python-javascript-dart-golang-and-php/1004
    const query = `
    query ($network: EthereumNetwork!, $limit: Int!, $offset: Int!, $from: ISO8601DateTime, $till: ISO8601DateTime) {
        ethereum(network: $network) {
          transactions(
            options: {desc: "block.height", limit: $limit, offset: $offset}
            time: {since: $from, till: $till}
          ) {
            block {
              height
              timestamp {
                time(format: "%Y-%m-%d %H:%M:%S")
              }
            }
            sender {
              address
            }
            to {
              address
            }
            hash
            gas_value_usd: gasValue(in: USD)
          }
        }
      }  
    `;
  
    const variables = {
        "limit": querySize,
        "offset": 0,
        "network": "ethereum",
        "from": startTimeStr,
        "till": endTimeStr,
        "dateFormat": "%Y-%m-%d"
    }
  
    const url = "https://graphql.bitquery.io/";
    const opts = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey
        },
        body: JSON.stringify({
            query,
            'variables':variables
        })
    };
  
    async function bitqueryAPICall() {
      try {
        const result = await fetch(url, opts).then(res => res.json())
        console.log("data downloaded for", fileName)
        processJSON_ETH(result.data, fileName)
      } catch (error) {
        console.log("failed download for", fileName)
        console.log("error:", error)
      }
    }
  
    bitqueryAPICall()
  }