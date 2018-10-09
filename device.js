var mqtt = require('mqtt')
var encrypt = require('./identity.js').encrypt
var decrypt = require('./identity.js').decrypt
var client  = mqtt.connect('mqtt://localhost:1883')
var R = require('ramda')

const deviceIdentity = {
  secretKey:"694e49655547484b6131534a744b677035487a6b625771654a74474e746e35624a4665376f6e44726f2f413d",
  publicKey:"653172766e53504738505a51625a7646453337355345394d4367644b54646e486a6733313845444c7858413d"
}

// White list of allowed clients
const clientPublicKey = "526d4b73516b614357533843344f7a342b51785a6847365867666c4e494830514e4c5334377430493856453d"


client.on('connect', function () {
  client.subscribe(deviceIdentity.publicKey, function (err) {
    console.log(`err = ${err}`)
    if(!err) console.log(`successfully subscribed to: ${deviceIdentity.publicKey}`)

  })
})
client.on('message', function (topic, message) {
  const payload = R.compose(JSON.parse, R.map(x => x.toString()))(message)
  console.log(`Received ${JSON.stringify(payload)} from a client`)
  if (payload.publicKey !== clientPublicKey){
    console.log('Unauthorized client attempting to access device')
  }
  // if message is not properly signed, this will throw. i.e. even if an attacker
  // knows that the public key is allowed, they will fail at this step unless
  // they have somehow managed to also get the secret key from the client
  const unencrypted = decrypt(payload, deviceIdentity.secretKey)
  console.log(`Received a message: ${unencrypted} from a client`)
  const messageToSend = `Sucessfully received your message ${unencrypted}!`
  const reply = encrypt(messageToSend, deviceIdentity, payload.publicKey)

  client.publish(payload.publicKey, JSON.stringify(reply))
})
