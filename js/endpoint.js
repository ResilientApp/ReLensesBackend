import fs from 'fs';

function compoundData(jsonObjs) {
    let users = [];
    let transactions = [];
    jsonObjs.forEach(jsonObj => {
        jsonObj.users.forEach(user => {
            if(!users.includes(user)) {
                users.push(user)
            }
        })
        jsonObj.transactions.forEach(trans => {
            transactions.push(trans)
        })
    });
    let obj = {
        users: users,
        transactions: transactions
    }
    // console.log("compounded data")
    // console.log("unique users:", users.length)
    // console.log("num transactions:", transactions.length)
    return obj;
}

// fs.readdir(dataDir, (err, files) => {
//     console.log("printing files")
//     console.log(files)
//     let jsonObjs = []
//     files.forEach(file => {
//         fs.readFile(dataDir + "/" + file, 'utf8', (err, txt) => {
//             if(err) {
//                 console.log("can't find file", file)
//             }
//             else {
//                 let data = JSON.parse(txt)
//                 jsonObjs.push(data)
//                 if(jsonObjs.length == files.length) {
//                     console.log("all files accounted for:", jsonObjs.length)
//                     compoundData(jsonObjs)
//                 }
//             }
//         })
//     })
// })


export function sendData(res, req, dir) {
    // query handle
    if(req.query) {
        if(req.query.start) {
            console.log(req.query.start)
        }
        if(req.query.end) {
            console.log(req.query.end)
        }
    }
    fs.readdir(dir, (err, files) => {
        if(err) {
            res.status(500).send('failed to read dir');
        }
        // console.log("printing files")
        // console.log(files)
        let jsonObjs = []
        files.forEach(file => {
            fs.readFile(dir + "/" + file, 'utf8', (err, txt) => {
                if(err) {
                    console.log("can't find file", file)
                }
                else {
                    let data = JSON.parse(txt)
                    jsonObjs.push(data)
                    if(jsonObjs.length == files.length) {
                        // console.log("all files accounted for:", jsonObjs.length)
                        let dataOut = compoundData(jsonObjs)
                        res.status(200).send({
                            data: dataOut
                        })  
                    }
                }
            })
        })
    })

    // fs.readFile(sampleOut, 'utf8', (err, txt) => {
    //     if(err) {
    //         res.status(500).send('failed to read file');
    //     }
    //     else {
    //         res.status(200).send({
    //             data: JSON.parse(txt)
    //         })  
    //     }
    // })
    // console.log("get")
    // console.log(req.query)
    // if(req.query) {
    //     if(req.query.start) {
    //         console.log(req.query.start)
    //     }
    //     if(req.query.end) {
    //         console.log(req.query.end)
    //     }
    // }
}