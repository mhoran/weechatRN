# WeechatRN

An attempt to bring iOS users in on the good life of [weechat-android](https://github.com/ubergeek42/weechat-android).

## Supported connection options

The only supported option for connecting to a weechat instance is through websockets.

## Development

```bash
# Install expo-cli
yarn global add expo-cli

# Install dependencies for project
yarn install

# Launch Expo
yarn start
```

On your device, scan the QR code with the Camera app (iOS) or the [Expo Client](https://play.google.com/store/apps/details?id=host.exp.exponent&referrer=www) (Android).

## Example configuration

All examples below uses `example.com` as hostname, and `5555` as port number, but you should of course replace them with your own values as needed.

### Weechat configuration:

```
/relay add ssl.weechat 5555
/set relay.network.password <your secret password>
```

### Webserver configuration (probably not needed):

If you need to proxy though another host and happen to be using Caddy as your webserver, you can use my config file below:

Caddy:

```
example.com {
	log stdout
	errors stderr
	proxy /weechat localhost:5555 {
		websocket
	}
}
```
