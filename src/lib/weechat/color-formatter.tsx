import { TextStyle, TextProps } from 'react-native';

import { WeeChatProtocol } from './parser';
import { ceb, cwb, cob, cef, cwf, cof } from './colors';

type AttributedStringNode = {
  attrs: {
    name: string | null;
    override: Record<string, boolean>;
  };
  bgColor: WeechatColorAttribute;
  fgColor: WeechatColorAttribute;
  text: string;
};

type WeechatColorAttribute = {
  name: string;
  type: 'option' | 'weechat' | 'ext';
};

const getBgColor = (
  colorAttr: WeechatColorAttribute
): TextStyle | undefined => {
  if (colorAttr.type === 'ext') {
    return { backgroundColor: ceb[colorAttr.name] };
  } else if (colorAttr.type === 'weechat') {
    return { backgroundColor: cwb[colorAttr.name] };
  } else if (colorAttr.type === 'option') {
    return cob[colorAttr.name];
  }
};

const getFgColor = (
  colorAttr: WeechatColorAttribute
): TextStyle | undefined => {
  if (colorAttr.type === 'ext') {
    return { color: cef[colorAttr.name] };
  } else if (colorAttr.type === 'weechat') {
    return { color: cwf[colorAttr.name] };
  } else if (colorAttr.type === 'option') {
    return cof[colorAttr.name];
  }
};

export const renderWeechatFormat = (input: string): TextProps[] => {
  const formattedNode = WeeChatProtocol.rawText2Rich(
    input
  ) as AttributedStringNode[];

  return formattedNode.map((node) => ({
    children: node.text,
    style: [getBgColor(node.bgColor), getFgColor(node.fgColor)]
  }));
};
