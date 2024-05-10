
import { EventEmitter } from 'events';
import fs from 'fs';
import express from 'express';
import schedule from 'node-schedule';
import cors from 'cors';
import { saveJSON, downloadData } from './js/data_download.js';
import { createTimeStr } from './js/date_mod.js';
import { sendData } from './js/endpoint.js';
import axios from 'axios';

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
    // sendData(res, req, DATA_DIR)
    fs.readFile("./resDB_processed_data.json", 'utf8', (err, txt) => {
        if(err) {
            console.log("can't find file", file)
        }
        else {
            let data = JSON.parse(txt)
            res.status(200).send({
                data: data
            })  
        }
    })
})

app.listen(
    PORT,
    () => console.log(`live on localhost:${PORT}`)
)

// async function getData() {
//     let endTime = new Date()
//     let MS_PER_MINUTE = 60000;
//     let startTime = new Date(endTime - 30 * MS_PER_MINUTE)
//     let fileName = "ETHDATA_" + createTimeStr(startTime)
//     fileName = fileName.replace(":00.000Z", "")
//     fileName = fileName.replace(":", "-") + ".json"
//     console.log("Downloading data")
//     console.log(createTimeStr(startTime), createTimeStr(endTime))
//     downloadData(1000, startTime, endTime);
// }

// seconds - minute - hour ...
schedule.scheduleJob('0 */30 * * * *', () => {
    // getData();
})

// post to resdb

// let data = JSON.stringify({
//   query: `mutation { postTransaction(data: {
// operation: "CREATE"
// amount: 503783
// signerPublicKey: "8fPAqJvAFAkqGs8GdmDDrkHyR7hHsscVjes39TVVfN54"
// signerPrivateKey: "5R4ER6smR6c6fsWt3unPqP6Rhjepbn82Us7hoSj5ZYCc"
// recipientPublicKey: "ECJksQuF9UWi3DPCYvQqJPjF6BqSbXrnDiXUjdiVvkyH"
// asset: """{
//             "data": { 
//                 "time": 1690881023169,
//                 "testVal": "testing axios"
//             },
//           }"""
//       }) {
//   id
//   }
// }`,
//   variables: {}
// });

// console.log(data)

// let config = {
//   method: 'post',
//   maxBodyLength: Infinity,
//   url: 'https://cloud.resilientdb.com/graphql',
//   headers: { 
//     'Content-Type': 'application/json'
//   },
//   data : data
// };

// axios.request(config)
// .then((response) => {
//   console.log(JSON.stringify(response.data));
// })
// .catch((error) => {
//   console.log(error);
// });

function deleteBetweenTwoPhrases(str, phrase1, phrase2, newPhrase) {
    let index1 = str.indexOf(phrase1)
    let index2 = str.indexOf(phrase2, index1 + phrase1.length)
    if(index1 == -1 || index2 == -1) {
        return null
    }
    let substr = str.substring(index1, index2 + phrase2.length)
    let newstr = str.replace(substr, newPhrase)
    return newstr
}

function processData(txt, outfile) {
    let data = JSON.parse(txt);
    let numTrans = 0;
    let addresses = [];
    let transactions = [];
    for(let i = 0; i < data.length; i++) {
        let obj = data[i]
        if(obj.inputs) {
            if(obj.inputs[0].owners_before) {
                if(obj.outputs) {
                    if(obj.outputs[0].public_keys) {
                        if(obj.outputs[0].amount) {
                            if(obj.asset) {
                                if(obj.asset.data) {
                                    if(obj.asset.data.time) {
                                        let processedTrans = {
                                            from: obj.inputs[0].owners_before[0],
                                            to: obj.outputs[0].public_keys[0],
                                            amount: obj.outputs[0].amount,
                                            timestamp: obj.asset.data.time,
                                            id: obj.id
                                        }

                                        transactions.push(processedTrans)
                                        if(!addresses.includes(processedTrans.to)) {
                                            addresses.push(processedTrans.to)
                                        }
                                        if(!addresses.includes(processedTrans.from)) {
                                            addresses.push(processedTrans.from)
                                        }

                                        numTrans += 1;
                                        // console.log(processedTrans)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    let obj = {
        users: addresses,
        transactions: transactions
    }
    saveJSON(obj, outfile)
    // console.log(numTrans)
}

function getResDBData() {
    axios.get('https://crow.resilientdb.com/v1/transactions')
    .then((response) => {
      let datastr = response.data;
      let canDel = true;
      while(canDel) {
          let newstr = deleteBetweenTwoPhrases(datastr, "-----BEGIN PUBLIC KEY-----", "{", "{")
          if(newstr) {
              datastr = newstr;
          } else {
              canDel = false
          }
      }
      let lastInd = 0;
      let t = 0
      while(lastInd >= 0 && t < 10) {
          lastInd = datastr.indexOf('{\"inputs\"', lastInd)
          let closerInd = datastr.lastIndexOf('},', lastInd)
          if(closerInd > -1 && lastInd > -1) {
              let gapstr = datastr.substring(closerInd, lastInd + '{"inputs:"'.length)
              if(gapstr != '},{\"inputs\":') {
                  console.log(closerInd, lastInd)
                  console.log(gapstr)
                  datastr = datastr.replace(gapstr, '},{\"inputs\":');
              }
          }
          if(lastInd != -1) {
              lastInd += 1;
          }
      }
  
      processData(datastr);
    //   fs.writeFile("./resDB_data5.json", datastr, 'utf8', () => {
    //       console.log("./resDB_data5.json", "file saved")
    //   })
    });
}

// getResDBData()

fs.readFile("./resDB_data5.json" , 'utf8', (err, txt) => {
    if(err) {
        console.log("can't find file", file)
    }
    else {
        processData(txt, "./resDB_processed_data.json");
    }
})

// axios get

// let data = JSON.stringify({
//     query: `query { getFilteredTransactions(filter: {
//         ownerPublicKey: ""
//         recipientPublicKey: ""
//       }) {
//         id
//         version
//         amount
//         metadata
//         operation
//         asset
//         publicKey
//         uri
//         type
//       }
        
//       }`,
//     variables: {}
//   });

// let config = {
//   method: 'post',
//   maxBodyLength: Infinity,
//   url: 'https://cloud.resilientdb.com/graphql',
//   headers: { 
//     'Content-Type': 'application/json'
//   },
//   data : data
// };

// axios.request(config)
// .then((response) => {
//     // console.log(response)
//     console.log(response.data);
//     // dataObj = JSON.parse(response)
//     saveJSON(response.data, "./graphQL_data2.json")
// })
// .catch((error) => {
//   console.log(error);
// });

// let testStr = "testing string end replacement element abcde end second end"
// console.log(testStr)
// testStr = deleteBetweenTwoPhrases(testStr, "element", "end ")
// console.log(testStr)