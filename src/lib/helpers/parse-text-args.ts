export const getParseArgs = (style, onPress, onLongPress) => {
  const baseObj = {
    style
  };

  return [
    {
      ...baseObj,
      onPress: arg => onPress("url", arg),
      onLongPress: arg => onLongPress("url", arg),
      type: "url"
    },
    {
      ...baseObj,
      onPress: arg => onPress("channel", arg),
      onLongPress: arg => onLongPress("channel", arg),
      pattern: /#(\w+)/
    },
    {
      ...baseObj,
      onPress: arg => onPress("phone", arg),
      onLongPress: arg => onLongPress("phone", arg),
      type: "phone"
    },
    {
      ...baseObj,
      onPress: arg => onPress("email", arg),
      onLongPress: arg => onLongPress("email", arg),
      type: "email"
    }
  ];
};
