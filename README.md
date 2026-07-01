# WeeChatRN

A [WeeChat](https://github.com/weechat/weechat) [relay](https://weechat.org/files/doc/stable/weechat_user.en.html#relay) client built with [React Native](https://reactnative.dev/) using [Expo](https://expo.dev/). Heavily inspired by [weechat-android](https://github.com/ubergeek42/weechat-android).

<img src="https://github.com/mhoran/weechatRN/assets/5330/337589c6-a029-4d6a-bc13-1924e2174c0f" width="300">
<img src="https://github.com/mhoran/weechatRN/assets/5330/510482bc-769e-4be2-bb97-ea4472e4e231" width="300">

## Installation

### iOS

Binary packages are distrubited via TestFlight for iOS users. Join the beta test group here: https://testflight.apple.com/join/0jFsQpot.

### Android

Binary packages for Android are attached to GitHub [releases](https://github.com/mhoran/weechatRN/releases).

## Getting Started

All examples below uses `example.com` as hostname, and `9001` as port number, but you should of course replace them with your own values as needed.

### WeeChat configuration:

#### WeeChat protocol

```
/relay add weechat 9001
/set relay.network.password <your secret password>
```

Select WeeChat in the relay protocol drop down in settings.

### API protocol

```
/relay add api 9000
/set relay.network.password <your secret password>
```

Select API in the relay protocol drop down in settings.

### Webserver configuration (recommended for TLS):

It is recommended to front the relay with a webserver to provide TLS termination. This can easily be done with [nginx](https://www.nginx.com/) or other webservers.

Example `nginx.conf` which exposes `/weechat` on `example.com` with TLS:

```
http {
    # ...

    map $http_upgrade $connection_upgrade {
        default upgrade;
        '' close;
      }

    server {
        listen       443 ssl http2;
        server_name  example.com;

        ssl_certificate      cert.pem;
        ssl_certificate_key  cert.key;

        ssl_session_cache    shared:SSL:1m;
        ssl_session_timeout  5m;

        ssl_ciphers  HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers  on;

        location /weechat {
            proxy_pass http://localhost:9001/weechat;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;
            proxy_read_timeout 604800;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

Set the port as appropriate for the relay configuration in WeeChat. The above `location` directive is compatible with the WeeChat API protocol REST API, in addition to WebSockets.

### WeeChatRN configuration:

Fill in the hostname and password fields with the appropriate values. Check the SSL box if weechat is fronted with a proxy that supports it or if a SSL relay is configured in weechat itself.

The default relay path is `/weechat`. The hostname may include a port number. For example, if you have exposed the WeeChat WebSocket at `https://example.com/~user/weechat`, enter `example.com` as the hostname, set the path to `/~user/weechat`, and check the SSL box. Do not include the scheme (`https://`) in the hostname field.

## Push Notifications

Push notifications can be sent to WeeChatRN for private messages and highlights with the use of a helper script.

To install the script, download [weechatrn.py](scripts/weechatrn.py?raw=1) to weechat's `python/autoload` directory. This directory may reside in `~/.weechat` or `~/.local/share/weechat`, depending on your setup.

Once downloaded, load the script via `/python load weechatrn.py`.

On (re)connect, WeeChatRN will store a token in WeeChat, which will be used to send push notifications to the device.

By default, push notifications will be sent for all highlights and private messages. You can disable notifications for the current buffer with `/set plugins.var.python.WeechatRN.notify_current_buffer off`.

## Development

```sh
# Install dependencies
npm install

# LaStartunch Expo
npm start
```

The app can then be run on a device or in a simulator with `npx expo run:ios` or `npx expo run:android`.

## License

[MIT License](LICENSE)
