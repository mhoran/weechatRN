import * as React from "react";
import { TextStyle, Text } from "react-native";

import { WeeChatProtocol } from "./parser";
import { ceb, cwb, cob, cef, cwf, cof } from "./colors";

type AttributedStringNode = {
  attrs: {
    name: string | null;
    override: any;
  };
  bgColor: WeechatColorAttribute;
  fgColor: WeechatColorAttribute;
  text: string;
};

type WeechatColorAttribute = {
  name: string;
  type: "option" | "weechat" | "ext";
};

const getBgColor = (colorAttr: WeechatColorAttribute): TextStyle => {
  if (colorAttr.type === "ext") {
    return { backgroundColor: ceb[colorAttr.name] };
  } else if (colorAttr.type === "weechat") {
    return { backgroundColor: cwb[colorAttr.name] };
  } else if (colorAttr.type === "option") {
    return cob[colorAttr.name];
  }
};

const getFgColor = (colorAttr: WeechatColorAttribute): TextStyle => {
  if (colorAttr.type === "ext") {
    return { color: cef[colorAttr.name] };
  } else if (colorAttr.type === "weechat") {
    return { color: cwf[colorAttr.name] };
  } else if (colorAttr.type === "option") {
    return cof[colorAttr.name];
  }
};

export const renderWeechatFormat = (input: string): React.ReactNode => {
  const formattedNode = WeeChatProtocol.rawText2Rich(
    input
  ) as AttributedStringNode[];
  // console.log(formattedNode);

  const debugNode = formattedNode.find(n => n.text === "neon");
  if (debugNode) {
    console.log(debugNode);
  }

  return formattedNode.map((node, index) => (
    <Text
      key={index}
      style={[getBgColor(node.bgColor), getFgColor(node.fgColor)]}
    >
      {node.text}
    </Text>
  ));
};

export const getHighlightedViewStyles = line => {
  if (line.highlight) {
    return {
      backgroundColor: "#ffcf7f"
    };
  } else {
    return null;
  }
};

export const getHighlightedTextStyles = line => {
  if (line.highlight) {
    return {
      color: "#000"
    };
  } else {
    return null;
  }
};
