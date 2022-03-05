# Websocket Secure Ipfs node on Heroku

Create a new heroku application and configure the app name in the environmental variables

and a secret key which will be used to encrypt and decrypt the ipfs node peer-id

```
heroku config:set APPNAME=my-app-name
heroku config:set SECRET=secret-key
```

> the secret key must be a string of 32 characters

Then create a new peer id

```
node createHerokuId 
```

The script will produce the file `encrypted_key` and will log the node peer id to the console.  

At this point the app is ready to be deployed. The node is dialable at the multiaddress 

`/dns4/app-name.herokuapp.com/tcp/443/wss/p2p/peer-id`

```javascript
//From a browser node:
ipfs.node.swarm.connect("/dns4/app-name.herokuapp.com/tcp/443/wss/p2p/peer-id")
ipfs.swarm.peers().then((value)=>{console.log(value)}) 
//you should be able to find your node among the peers 
```







 
