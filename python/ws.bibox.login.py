#/usr/bin/env python
# -*- coding: UTF-8 -*-

import websocket
import json
import base64
import zlib
import hmac
import hashlib

ws_url = 'wss://push.bibox.com/'

apikey = '1e01c22ff8c59e9d98d93423817303f0e7c6d79d' # your apikey
secret = '1e01c22ff8c59e9d98d93423817303f098d93423' # your apikey secret

def stringify(obj):
    return json.dumps(obj, sort_keys=True).replace("\'", "\"").replace(" ", "")

def get_sign(data, secret):
    return hmac.new(secret.encode("utf-8"), data.encode("utf-8"), hashlib.md5).hexdigest()

def get_sub_str():
    subdata = {
        'apikey': apikey,
        'binary': 0,
        'channel': 'bibox_sub_spot_ALL_ALL_login',
        'event': 'addChannel'
        }
    # print(stringify(subdata))
    sign = get_sign(stringify(subdata), secret)
    subdata['sign'] = sign
    # print(stringify(subdata))
    return stringify(subdata)

def get_unsub_str():
    subdata = {
        'event': 'removeChannel',
        'channel': 'bibox_sub_spot_ALL_ALL_login',
        'binary': 0
        }
    return stringify(subdata)

def decode_data(message):
    jmsgs = json.loads(message)
    if isinstance(jmsgs, dict) and jmsgs.has_key('error'):
        print(jmsgs)
        return
    for msg in jmsgs:
        if isinstance(msg, dict) and msg.has_key('data'):
            data = msg.get('data')
            if msg.has_key('binary') and msg.get('binary') == '1':
                data = zlib.decompress(base64.b64decode(data), zlib.MAX_WBITS|32)
            print(data)
            print(type(data))

def on_message(ws, message):
    # print(message)
    decode_data(message)

def on_error(ws, error):
    print(error)

def on_close(ws):
    print("### closed ###")

def on_open(ws):
    ws.send(get_sub_str())

def connect():
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp(ws_url,
                              on_message = on_message,
                              on_error = on_error,
                              on_close = on_close)
    ws.on_open = on_open
    ws.run_forever(ping_interval=30,ping_timeout=5)

if __name__ == "__main__":
    connect()

