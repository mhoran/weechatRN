# WeechatRN

A [weechat](https://github.com/weechat/weechat) [relay](https://weechat.org/files/doc/stable/weechat_user.en.html#relay) client built with [React Native](https://reactnative.dev/) using [Expo](https://expo.dev/). Heavily inspired by [weechat-android](https://github.com/ubergeek42/weechat-android).

## Installation

### iOS

Binary packages are distrubited via TestFlight for iOS users. Join the beta test group here: https://testflight.apple.com/join/0jFsQpot.

### Android

Binary packages are not built for Android. However, the project can be built locally and easily installed on a device.

## Getting Started

All examples below uses `example.com` as hostname, and `9001` as port number, but you should of course replace them with your own values as needed.

### weechat configuration:

```
/relay add weechat 9001
/set relay.network.password <your secret password>
```

Note that WeechatRN requires the relay to be configured with the "weechat" protocol, not the "irc" protocol.

### Webserver configuration (recommended for TLS):

It is recommended to front the relay with a webserver to provide TLS termination. This can easily be done with [nginx](https://www.nginx.com/) or other webservers.

Example `nginx.conf` which exposes `/weechat` on `example.com` with TLS:

```
http {
	# ...

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
          proxy_set_header Connection "Upgrade";
          proxy_read_timeout 604800;
          proxy_set_header X-Real-IP $remote_addr;
        }
	}
}
```

### WeechatRN configuration:

Fill in the hostname and password fields with the appropriate values. Check the SSL box if weechat is fronted with a proxy that supports it or if a SSL relay is configured in weechat itself.

Note that `/weechat` will be appended to the configured hostname. The path suffix is not configurable. However, the hostname may also contain a path. For example, if you have exposed the weechat WebSocket at `https://example.com/~user/weechat`, simply enter `example.com/~user` as the hostname, and check the SSL box. Do not include the scheme (`https://`) in the hostname field.

## Push Notifications (Beta)

Push notifications can be sent to WeechatRN for private messages and highlights with the use of a helper script.

To install the script, download [weechatrn.py](scripts/weechatrn.py?raw=1) to weechat's `python/autoload` directory. This directory may reside in `~/.weechat` or `~/.local/share/weechat`, depending on your setup.

Once downloaded, load the script via `/python load weechatrn.py`.

On (re)connect, WeechatRN will store a token in weechat, which will be used to send push notifications. Ony a single token is stored at this time -- so only the most recently connected device will receive notifications.

To disable push notifications without uninstalling WeechatRN, unload (`/python unload WeechatRN`) and remove the script from `python/autoload`.

## Development

```bash
# Install dependencies for project
yarn install

# Launch Expo
yarn start
```

On your device, scan the QR code with the Camera app (iOS) or the [Expo Client](https://play.google.com/store/apps/details?id=host.exp.exponent&referrer=www) (Android).

## License

[MIT License](LICENSE)
