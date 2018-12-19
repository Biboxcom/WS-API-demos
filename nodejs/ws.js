
const WebSocket = require('ws');
const pako = require('pako');
let CryptoJS = require("crypto-js");

const WS_URL = 'wss://push.bibox.com/';

function handle(msg) {

    let channel = msg.channel;
    let data = msg.data;
    let text = data;
    let recvMsg = data;
    if (typeof data == "string") {

        text = pako.inflate(Buffer.from(data, "base64"), {
            to: 'string'
        });
        recvMsg = JSON.parse(text);
    }
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
        case 'deals':
            console.log('deals ', pair, text);
            break;
        case 'ticker':
            console.log('ticker ', pair, text);
            break;
        case 'login':
            console.log('login ', pair, text);
            break;
        default:
            console.error(' invalid channel. ', msg);
    }
}

function subscribe(ws) {

    let pairs = ['BIX_BTC', 'BIX_ETH'];

    // // subscribe market
    // for (let pair of pairs) {
    //     ws.send(JSON.stringify({
    //         "event": "addChannel",
    //         "channel": 'bibox_sub_spot_ALL_ALL_market'
    //     }));
    // }
    // // sub depth
    // for (let pair of pairs) {
    //     ws.send(JSON.stringify({
    //         "event": "addChannel",
    //         "channel": 'bibox_sub_spot_' + pair + '_depth'
    //     }));
    // }
    // // sub deals
    // for (let pair of pairs) {
    //     ws.send(JSON.stringify({
    //         "event": "addChannel",
    //         "channel": 'bibox_sub_spot_' + pair + '_deals'
    //     }));
    // }

    // sub kline
    // for (let pair of pairs) {
    //     ws.send(JSON.stringify({
    //         "event": "addChannel",
    //         "channel": 'bibox_sub_spot_' + pair + '_kline_3min'
    //     }));
    // }
    // // sub ticker
    // for (let pair of pairs) {
    //     ws.send(JSON.stringify({
    //         "event": "addChannel",
    //         "channel": 'bibox_sub_spot_' + pair + '_ticker'
    //     }));
    // }

    // sub online_count
    // ws.send(JSON.stringify({
    //     "event": "online_count"
    // }));

    // sub login
    let data = {
        "event": "addChannel",
        "channel": 'bibox_sub_spot_ALL_ALL_login',
        "apikey": "your apikey",
    };
    let sign = getSign(data);
    data.sign = sign;
    ws.send(JSON.stringify(data));

}

function getSign(data) {
    let secret = "your apisecret";
    let sdic = Object.keys(data).sort();//sort in ascending
    let dataTmp = {};
    for(let ki in sdic){
        dataTmp[sdic[ki]] = data[sdic[ki]];
    }
    return CryptoJS.HmacMD5(JSON.stringify(dataTmp), String(secret)).toString();
}

function ping(ws) {
    let now = new Date().getTime();
    ws.send(JSON.stringify({ping:now}));
}

function pong(ws, msg) {
    ws.send(JSON.stringify({pong:msg}));
}

function init() {
    let ws = new WebSocket(WS_URL);
    ws.on('open', () => {
        console.log('open');
        subscribe(ws);
        ping(ws);
    });

    ws.on('message', (data) => {
        let msg = JSON.parse(data);

        if (msg.ping) {
            pong(ws, msg.ping)
            return
        } else if (msg.pong) {
            console.log("pong ", msg.pong)
            return
        }

        if (msg[0]) {
            handle(msg[0]);
        } else {
            console.error('msg err: ', msg);
        }
    });

    ws.on('close', (code, msg) => {
        console.log('close, ', new Date(), code, msg);
        init();
    });

    ws.on('error', err => {
        console.log('error ', err);
        init();
    });

    ws.on('ping', ts => {
        let msg = ts.toString('utf8');
        console.log('ping ', msg);
    });

    ws.on('pong', ts => {
        let msg = ts.toString('utf8');
        console.log('pong ', msg);
    });
}

init();