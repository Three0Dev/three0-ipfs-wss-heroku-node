# Wss Ipfs node on Heroku

Clone this repository and create a new Heroku app using the CLI

```bash
heroku apps:create my-ws-node-app
heroku git:remote -a my-ws-node-app
```

## Create a persistent peer-id 

Create a secret-key of 32 characters and export it to the environmental variables

```bash
SECRET=secret-key
export SECRET="$SECRET"
heroku config:set SECRET=secret-key
```

Then create a new peer id by running the script `create_id`

```bash
// first install deps
yarn
node create_id.js
```

The script will produce the file `encrypted_key` and will log the node peer id to the console.  

## Deploy

At this point the app is almost ready to be deployed. Add the app name to the environmental variables and deploy

```bash
git add . 
git commit -m "Deploy"
heroku config:set APPNAME=my-ws-node-app
git push heroku master
```

## Connect to the node

The node is dialable at the multi-address 

`/dns4/my-ws-node-app.herokuapp.com/tcp/443/wss/p2p/peer-id`

```javascript
//From a browser node:
this.ipfs.swarm.connect("/dns4/my-ws-node-app.herokuapp.com/tcp/443/wss/p2p/peer-id")
this.ipfs.swarm.peers().then((value)=>{console.log(value)}) 
//you should be able to find your node among the peers 
```

## Pubsub 

The node subscribes to the Pubsub channel `publicRoom` and welcome new peers with a message. 

From a browser node:

```js
const room = require('ipfs-pubsub-room')
...
this.Id = await this.ipfs.id()
this.peerId = this.Id.id
this.publicRoom = new room(this.ipfs, 'publicRoom')
this.publicRoom.on('peer joined', (peer) => {
  console.log('Peer joined the room', peer)
  this.publicRoom.broadcast('hello from browser node ' + this.peerId)
})
this.publicRoom.on('message', (message) => {
  console.log('message:', message.data.toString())
})
this.publicRoom.on('peer left', (peer) => {
  console.log('Peer left...', peer)
})
// now started to listen to room
this.publicRoom.on('subscribed', () => {
  console.log('Now connected!')
})
this.publicRoom.broadcast('Hello from hello from browser node ' + this.peerId)
```
