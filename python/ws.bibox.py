#/usr/bin/env python
# -*- coding: UTF-8 -*-

import websocket
import json
import base64
import zlib

ws_url = 'wss://push.bibox.com/'
ws_channel = 'bibox_sub_spot_ALL_ALL_market'

def stringify(obj):
    return json.dumps(obj, sort_keys=True).replace("\'", "\"").replace(" ", "")

def get_sub_str(ch):
    subdata = {
        'event': 'addChannel',
        'channel': ch,
        'binary': 0
        }
    return stringify(subdata)

def get_unsub_str(ch):
    subdata = {
        'event': 'removeChannel',
        'channel': ch,
        'binary': 0
        }
    return stringify(subdata)

def decode_data(message):
    jmsgs = json.loads(message)
    if isinstance(jmsgs, dict) and jmsgs.has_key('error'):
        print(jmsgs)
        return
    for msg in jmsgs:
        if msg.has_key('data'):
            data = msg.get('data')
            if msg.has_key('binary') and msg.get('binary') == '1':
                data = zlib.decompress(base64.b64decode(data), zlib.MAX_WBITS|32)
            print(data)
            json.loads(data)


def on_message(ws, message):
    # print(message)
    decode_data(message)

def on_error(ws, error):
    print(error)

def on_close(ws):
    print("### closed ###")

def on_open(ws):
    ws.send(get_sub_str(ws_channel))

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

