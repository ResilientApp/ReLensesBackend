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
    return obj;
}

export function sendData_ETH(res, req, dir) {
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
        let jsonObjs = []
        let filesToRead = files.length
        for(let i = 0; i < filesToRead; i++) {
            fs.readFile(dir + files[i], 'utf8', (err, txt) => {
                let filestr = dir + files[i]
                console.log("reading:", filestr)
                if(err) {
                    console.log("can't find file", file)
                }
                else {
                    let data = JSON.parse(txt)
                    jsonObjs.push(data)
                    if(jsonObjs.length == filesToRead) {
                        let dataOut = compoundData(jsonObjs)
                        res.status(200).send({
                            data: dataOut
                        })  
                    }
                }
            })
        }
    })
}

export function sendData_RESDB(res, req, file) {
    fs.readFile(file, 'utf8', (err, txt) => {
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
}