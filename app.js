const ipfs = require("ipfs");
const room = require('ipfs-pubsub-room')
const wrtc = require('wrtc')
const WStar = require('libp2p-webrtc-star')
const Websockets = require('libp2p-websockets')
const filters = require('libp2p-websockets/src/filters')
const transportKey = Websockets.prototype[Symbol.toStringTag]
const Utils = require("./utils.js")
const appName = process.env.APPNAME
const swarmAddress = "/dns4/" + appName + ".herokuapp.com/tcp/" + process.env.PORT + "/wss/"

class App {
  constructor(Ipfs) {
    this.importedKey
    this.Ipfs = Ipfs
  }

  async create() {
    this.privateKey = await Utils.importPersistedKey()
    this.node = await this.Ipfs.create({
      repo: './ipfs',
      init: {
        privateKey: this.privateKey
      },
      relay: {
        enabled: true,
        hop: {
          enabled: true,
          active: true
        }
      },
      config: {
        Addresses: {
          Swarm: [
            // "/dns4/signaling-server.com/tcp/443/wss/p2p-webrtc-star/",
            swarmAddress
          ]
        }
      },
      libp2p: {
        modules: {
          transport: [WStar, Websockets]
        },
        config: {
          peerDiscovery: {
            webRTCStar: { // <- note the lower-case w - see https://github.com/libp2p/js-libp2p/issues/576
              enabled: true
            }
          },
          transport: {
            [transportKey]: {
              filter: filters.dnsWsOrWss
            },
            WebRTCStar: { // <- note the upper-case w- see https://github.com/libp2p/js-libp2p/issues/576
              wrtc
            }
          }
        }
      }
    })
    this.Id = await this.node.id()
    this.peerId = this.Id.id
    console.log(this.peerId)

    this.publicRoom = new room(this.node, 'publicRoom')
    this.publicRoom.on('peer joined', (peer) => {
      console.log('Peer joined the room', peer)
      this.publicRoom.broadcast('hello from HEROKU wss node ' + this.peerId)
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

    this.publicRoom.broadcast('Hello from HEROKU wss node with id ' + this.peerId)
  }

}

WSSNode = new App(ipfs)

var instance

function init() {
  console.log("Server is running...")
  instancePromise = WSSNode.create()
  instancePromise.then((value) => {
    console.log('Node running and listening at ' + swarmAddress);
  })
}

init()
