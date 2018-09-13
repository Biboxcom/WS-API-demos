
const WebSocket = require('ws');
const pako = require('pako');

const WS_URL = 'wss://push.bibox.com/';

let WSClient = {};

exports.OrderBook = WSClient;

function handle(msg) {

    let channel = msg.channel;
    let data = msg.data;
    let text = pako.inflate(Buffer.from(data, 'base64'), {
        to: 'string'
    });

    let recvMsg = JSON.parse(text);
    let channelArr = channel.split('_');
    let pair = channelArr[3] + '_' + channelArr[4];
    let channelType = channelArr[5];
    switch (channelType) {
        case 'market':
            console.log('market ', pair, text);
            break;
        case 'depth':
            console.log('depth ', pair, text);
            break;
        case 'kline':
            console.log('kline ', pair, text);
            break;
        default:
            console.error(' invalid channel. ', msg);
    }
}

function subscribe(ws) {

    let pairs = ['BIX_BTC', 'BIX_ETH'];

    // subscribe market
    for (let pair of pairs) {
        ws.send(JSON.stringify({
            "event": "addChannel",
            "channel": 'bibox_sub_spot_ALL_ALL_market'
        }));
    }
    // sub depth
    for (let pair of pairs) {
        ws.send(JSON.stringify({
            "event": "addChannel",
            "channel": 'bibox_sub_spot_' + pair + '_depth'
        }));
    }
    // sub kline
    for (let pair of pairs) {
        ws.send(JSON.stringify({
            "event": "addChannel",
            "channel": 'bibox_sub_spot_' + pair + '_kline_1min'
        }));
    }
}

function init() {
    let ws = new WebSocket(WS_URL);
    ws.on('open', () => {
        console.log('open');
        subscribe(ws);
    });

    ws.on('message', (data) => {
        let msg = JSON.parse(data);

        if (msg[0]) {
            handle(msg[0]);
        } else {
            console.error('error ', msg);
        }
    });

    ws.on('close', () => {
        console.log('close');
        init();
    });

    ws.on('error', err => {
        console.log('error', err);
        init();
    });
}

init();