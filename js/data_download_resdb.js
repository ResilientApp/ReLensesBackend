import axios from 'axios';
import fs from 'fs';

function saveJSON(jsonObj, outfile) {
    jsonObj = JSON.stringify(jsonObj)
    fs.writeFile(outfile, jsonObj, 'utf8', () => {
        console.log(outfile, "file saved")
    })
}

function deleteBetweenTwoPhrases(str, phrase1, phrase2, newPhrase) {
    let index1 = str.indexOf(phrase1)
    let index2 = str.indexOf(phrase2, index1 + phrase1.length)
    if (index1 == -1 || index2 == -1) {
        return null
    }
    let substr = str.substring(index1, index2 + phrase2.length)
    let newstr = str.replace(substr, newPhrase)
    return newstr
}

function processDataResDB(txt, outfile) {
    let data = JSON.parse(txt);
    let numTrans = 0;
    let addresses = [];
    let transactions = [];
    for (let i = 0; i < data.length; i++) {
        let obj = data[i]
        if (obj.inputs) {
            if (obj.inputs[0].owners_before) {
                if (obj.outputs) {
                    if (obj.outputs[0].public_keys) {
                        if (obj.outputs[0].amount) {
                            if (obj.asset) {
                                if (obj.asset.data) {
                                    if (obj.asset.data.time) {
                                        let processedTrans = {
                                            from: obj.inputs[0].owners_before[0],
                                            to: obj.outputs[0].public_keys[0],
                                            amount: obj.outputs[0].amount,
                                            timestamp: obj.asset.data.time,
                                            id: obj.id
                                        }

                                        transactions.push(processedTrans)
                                        if (!addresses.includes(processedTrans.to)) {
                                            addresses.push(processedTrans.to)
                                        }
                                        if (!addresses.includes(processedTrans.from)) {
                                            addresses.push(processedTrans.from)
                                        }

                                        numTrans += 1;
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
}

export async function downloadData_RESDB(outfile) {
    axios.get('https://crow.resilientdb.com/v1/transactions')
        .then((response) => {
            let datastr = response.data;
            let canDel = true;
            while (canDel) {
                let newstr = deleteBetweenTwoPhrases(datastr, "-----BEGIN PUBLIC KEY-----", "{", "{")
                if (newstr) {
                    datastr = newstr;
                } else {
                    canDel = false
                }
            }

            // fix weird inputs with empty
            // ex: },b,{ => },{
            let lastInd = 0;
            while (lastInd >= 0) {
                lastInd = datastr.indexOf('{\"inputs\"', lastInd)
                let closerInd = datastr.lastIndexOf('},', lastInd)
                if (closerInd > -1 && lastInd > -1) {
                    let gapstr = datastr.substring(closerInd, lastInd + '{"inputs:"'.length)
                    if (gapstr != '},{\"inputs\":') {
                        datastr = datastr.replace(gapstr, '},{\"inputs\":');
                    }
                }
                if (lastInd != -1) {
                    lastInd += 1;
                }
            }

            let firstInput = datastr.indexOf('\"inputs\"')
            let gapstr = datastr.substring(0, firstInput)
            datastr = datastr.replace(gapstr, "[{")


            // fs.writeFile("./preprocessedData_RESDB.json", datastr, 'utf8', () => {
            //     console.log("./preprocessedData_RESDB.json", "file saved")

            // })
            processDataResDB(datastr, outfile);
        }).catch((error) => {
            console.log("Couldn't get, error code:", error.code)
        });
}
