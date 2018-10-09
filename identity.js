var nacl = require('tweetnacl')
nacl.util = require('tweetnacl-util')
var R = require('ramda')

const hex = a => {
  return Buffer.from(nacl.util.encodeBase64(a)).toString('hex')
}

const unhex = a => {
  return nacl.util.decodeBase64(Buffer.from(a, 'hex').toString())
}

var generateKeys = function (){
  const keys = nacl.box.keyPair()
  const publicKey = hex(keys.publicKey)
  const secretKey = hex(keys.secretKey)
  return {secretKey: secretKey, publicKey: publicKey}
}

var encrypt = function(message, identity, theirPublicKey) {
  const secretKey = unhex(identity.secretKey)
  const publicKey = unhex(theirPublicKey)
  const msg = nacl.util.decodeUTF8(message)
  const nonce = nacl.randomBytes(24)
  const box = nacl.util.encodeBase64(nacl.box(msg, nonce, publicKey, secretKey))
  return {box: box, nonce: nacl.util.encodeBase64(nonce), publicKey: identity.publicKey}
}

var decrypt = function(message, mySecretKey) {
  console.log(`${message.box}, mySecret Key = ${mySecretKey}`)
  const result = nacl.box.open(
      nacl.util.decodeBase64(message.box),
      nacl.util.decodeBase64(message.nonce),
      unhex(message.publicKey),
      unhex(mySecretKey)
    )
    if(!result) throw('Error decoding the message!')
    return nacl.util.encodeUTF8(result)
}

const test = () => {
  const id1 = generateKeys()
  console.log(`id1 = ${JSON.stringify(id1)}`)
  const id2 = generateKeys();
  [id1, id2].map(x => console.log(`id = ${JSON.stringify(x)}`))
  const message = 'hello world'
  const encrypted = encrypt(message, id1, id2.publicKey)
  console.log('encrypted = ', JSON.stringify(encrypted))
  const unencrypted = decrypt(encrypted, id2.secretKey)
  console.log(`unencrypted = ${unencrypted}`)
}


module.exports = {
  generateKeys,
  encrypt,
  decrypt
}
