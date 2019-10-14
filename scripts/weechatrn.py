import weechat
import json

weechat.register("WeechatRN", "mhoran", "1.0", "MIT",
        "WeechatRN push notification plugin", "", "")

# Plugin options
# /set plugins.var.python.weechatrn.push_token
script_options = {
    "push_token": ""
}

for option, default_value in script_options.items():
    if weechat.config_is_set_plugin(option):
        script_options[option] = weechat.config_get_plugin(option)
    else:
        weechat.config_set_plugin(option, default_value)

# Register a custom command so the relay can set the token if the relay is
# configured to blacklist certain commands (like /set).
def weechatrn_cb(data, buffer, args):
    weechat.config_set_plugin("push_token", args)
    return weechat.WEECHAT_RC_OK

hook = weechat.hook_command("weechatrn", "", "", "", "", "weechatrn_cb", "")

# Reset in-memory push token on config change.
def config_cb(data, option, value):
    if option == "plugins.var.python.weechatrn.push_token":
        script_options["push_token"] = value
    return weechat.WEECHAT_RC_OK

weechat.hook_config("plugins.var.python.weechatrn.*", "config_cb", "")

# Only notify for PMs or highlights if message is not tagged with notify_none
# (ignores messages from ourselves).
def priv_msg_cb(data, buffer, date, tags, displayed, highlight, prefix,
        message):
    if "notify_none" in tags.split(","):
        return weechat.WEECHAT_RC_OK

    body = u"<%s> %s" % (prefix, message)
    is_pm = weechat.buffer_get_string(buffer, "localvar_type") == "private"
    if is_pm:
        send_push(title="Private message from %s" % prefix, body=body)
    elif int(highlight) and weechat.current_buffer() != buffer:
        buffer_name = (weechat.buffer_get_string(buffer, "short_name") or
                weechat.buffer_get_string(buffer, "name"))
        send_push(title="Highlight in %s" % buffer_name, body=body)

    return weechat.WEECHAT_RC_OK

weechat.hook_print("", "irc_privmsg", "", 1, "priv_msg_cb", "")

# Send push notification to Expo server. Message JSON encoded in the format:
# { "to": "EXPO_PUSH_TOKEN",
#   "title": "Notification title",
#   "body": "Notification body" }
def process_expo_cb(data, command, return_code, out, err):
    return weechat.WEECHAT_RC_OK

def send_push(title, body):
    push_token = script_options["push_token"]
    if push_token == "":
        return

    post_body = { "to": push_token, "title": title, "body": body }
    options = {
            "httpheader": "Content-Type: application/json",
            "postfields": json.dumps(post_body) }
    weechat.hook_process_hashtable(
            "url:https://exp.host/--/api/v2/push/send",
            options, 20000, "process_expo_cb", "")
