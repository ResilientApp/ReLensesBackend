// probably won't be used

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