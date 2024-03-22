import weechat
import json
from collections import UserDict


class Options(UserDict[str, str]):
    """Helper object for accessing configuration settings."""

    @property
    def push_tokens(self) -> list[str]:
        """Return comma separated push tokens as an array."""
        if script_options["push_tokens"]:
            return self.data["push_tokens"].split(",")
        return []

    @push_tokens.setter
    def push_tokens(self, tokens: list[str]):
        weechat.config_set_plugin("push_tokens", ",".join(tokens))

    @property
    def notify_current_buffer(self):
        """Return notify_current_buffer option as boolean."""
        return weechat.config_string_to_boolean(self.data["notify_current_buffer"])


script_options_default = {
    "push_tokens": (
        "",
        "Comma separated list of push tokens (appended to by /weechatrn <token>)",
    ),
    "notify_current_buffer": (
        "on",
        "Option to send notifications for the current buffer",
    ),
}
script_options = Options()


def weechatrn_cb(data: str, buffer: str, args: str) -> int:
    """
    Command to allow managing push tokens without the need to allow /set access
    to relay clients.
    """
    tokens = script_options.push_tokens
    if args not in tokens:
        tokens.append(args)
        script_options.push_tokens = tokens
    return weechat.WEECHAT_RC_OK


def config_cb(data: str, option: str, value: str) -> int:
    """Reset script_options values on config change."""
    if option == "plugins.var.python.WeechatRN.push_tokens":
        script_options["push_tokens"] = value
    if option == "plugins.var.python.WeechatRN.notify_current_buffer":
        script_options["notify_current_buffer"] = value
    return weechat.WEECHAT_RC_OK


def priv_msg_cb(
    data: str,
    buffer: str,
    date: str,
    tags: str,
    displayed: int,
    highlight: int,
    prefix: str,
    message: str,
) -> int:
    """
    Only notify for PMs or highlights if message is not tagged with notify_none
    (ignores messages from ourselves). Optionally ignores notifications for the
    current buffer.
    """
    if "notify_none" in tags.split(","):
        return weechat.WEECHAT_RC_OK

    if not script_options.notify_current_buffer and weechat.current_buffer() == buffer:
        return weechat.WEECHAT_RC_OK

    body = "<%s> %s" % (prefix, message)
    is_pm = weechat.buffer_get_string(buffer, "localvar_type") == "private"
    if is_pm:
        send_push(title="Private message from %s" % prefix, body=body)
    elif int(highlight):
        buffer_name = weechat.buffer_get_string(
            buffer, "short_name"
        ) or weechat.buffer_get_string(buffer, "name")
        send_push(title="Highlight in %s" % buffer_name, body=body)

    return weechat.WEECHAT_RC_OK


def send_push(title: str, body: str) -> None:
    """
    Send push notification to Expo server. Message JSON encoded in the format:
    [{ "to": "EXPO_PUSH_TOKEN",
       "title": "Notification title",
       "body": "Notification body" }]
    """
    push_tokens = script_options.push_tokens
    if push_tokens == []:
        return

    post_body: list[dict[str, str]] = []
    for token in push_tokens:
        post_body.append({"to": token, "title": title, "body": body})

    options = {
        "httpheader": "Content-Type: application/json",
        "postfields": json.dumps(post_body),
        "failonerror": "1",
    }
    weechat.hook_process_hashtable(
        "url:https://exp.host/--/api/v2/push/send",
        options,
        20000,
        "process_expo_cb",
        "",
    )


def process_expo_cb(
    data: str, command: str, return_code: int, out: str, err: str
) -> int:
    if out:
        remove_unregistered_devices(out)
    return weechat.WEECHAT_RC_OK


def remove_unregistered_devices(response: str) -> None:
    """Remove push tokens for unregistered devices."""
    try:
        statuses = json.loads(response)
    except json.JSONDecodeError:
        pass
    else:
        tokens = script_options.push_tokens

        for index, status in enumerate(statuses["data"]):
            if (
                status["status"] == "error"
                and status["details"]["error"] == "DeviceNotRegistered"
            ):
                unregistered_token = tokens[index]
                try:
                    tokens.remove(unregistered_token)
                except ValueError:
                    pass

        script_options.push_tokens = tokens


if weechat.register(
    "WeechatRN",
    "mhoran",
    "1.1.0",
    "MIT",
    "WeechatRN push notification plugin",
    "",
    "",
):
    weechat.hook_command(
        "weechatrn",
        "Manage Expo push tokens for WeechatRN",
        "<token>",
        "token: Append the given push token to the list of push tokens",
        "",
        "weechatrn_cb",
        "",
    )
    weechat.hook_config("plugins.var.python.WeechatRN.*", "config_cb", "")
    weechat.hook_print("", "irc_privmsg", "", 1, "priv_msg_cb", "")

    for option, value in script_options_default.items():
        if weechat.config_is_set_plugin(option):
            script_options[option] = weechat.config_get_plugin(option)
        else:
            weechat.config_set_plugin(option, value[0])
        weechat.config_set_desc_plugin(
            option, '%s (default: "%s")' % (value[1], value[0])
        )
