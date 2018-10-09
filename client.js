var mqtt = require('mqtt')
var readline = require('readline')
var client  = mqtt.connect('mqtt://localhost:1883')
var nacl = require('tweetnacl');
var R = require('ramda')
var encrypt = require('./identity.js').encrypt
var decrypt = require('./identity.js').decrypt

nacl.util = require('tweetnacl-util');


const clientIdentity = {
  secretKey:"6e3856435a3374507a72317236616f4f6234614c74686d54346c654e4d7150714b7a33564473475a4d626b3d",
  publicKey:"526d4b73516b614357533843344f7a342b51785a6847365867666c4e494830514e4c5334377430493856453d"
}

// list of device client can talk to
const devicePublicKey = "653172766e53504738505a51625a7646453337355345394d4367644b54646e486a6733313845444c7858413d"

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let sendingTime = new Date().getTime()
let receivingTime = new Date().getTime()

client.on('connect', function () {
  client.subscribe(`${clientIdentity.publicKey}`, function (err) {
    if(!err) console.log(`Client listening on ${clientIdentity.publicKey}`)
    rl.on('line', (input) => {
        console.log(`sending ${input} to device`)
        const message = encrypt(input, clientIdentity, devicePublicKey)
        // Send messages to the device via it's public key
        console.log(`sending message = ${JSON.stringify(message)}`)
        client.publish(devicePublicKey, JSON.stringify(message))
        sendingTime = new Date().getTime()
    })
  })
})


client.on('message', function (topic, message) {

  console.log(`Received a message on the topic: ${topic}`)
  // message is Buffer
  const payload = R.compose(JSON.parse, R.map(x => x.toString()))(message)
  console.log(`Received payload ${JSON.stringify(payload)} from device`)
  if (payload.publicKey !== devicePublicKey){
     console.log('Unauthorized message received.');
     return
   }
   // if box is not properly signed, this will throw
  const unencrypted = decrypt(payload, clientIdentity.secretKey)
  receivingTime = new Date().getTime()
  console.log(`Device sent me a message!: ${unencrypted}`)
  console.log(`It took ${receivingTime - sendingTime} ms\n`)
})
