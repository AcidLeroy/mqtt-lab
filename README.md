# MQTT Lab

This is a demonstration how to use mosca, mqtt.js, and tweetnacl to have end to end encryption between a device and a mobile client. In this example,
we use Redis as the backend for the Mosca broker.

## How to run
First make sure you have docker installed and then
run:

```
 docker run --name some-redis -p 6379:6379 -d redis:latest
```
This will start up your Redis server on your local machine.

Next you'll need to install the necessary packages:
`npm install`

Now you can start your Mosca broker. You'll need to start each one of these in a separate terminal. I usually do this using TMux.
`node broker.js`

Finally, you are ready to start your client and your
device:
`node device.js`
and then you can run your client:
`node client.js`
You can verify that the connection is working by typing in any text in the client window and hitting enter. You should see that the device received a message and also sent the client back a response. Congratulations, you ran a full end-to-end encrypted IoT stack! 
