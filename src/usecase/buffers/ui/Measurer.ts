import { Skia } from '@shopify/react-native-skia';
import { PixelRatio } from 'react-native';

export default class Measurer {
  messageWidth?: number;

  measure = (data: unknown[], index: number) => {
    if (this.messageWidth === undefined) throw 'messageWidth is undefined';

    const heights: number[] = [];

    for (let i = 0; i <= index; i++) {
      const para = Skia.ParagraphBuilder.Make()
        .pushStyle({
          fontSize: 14 * PixelRatio.getFontScale(),
          heightMultiplier: 1.2,
          fontFamilies: ['Menlo']
        })
        .addText(data[i].message)
        .build();
      para.layout(this.messageWidth);
      const height = para.getHeight();
      heights.push(height);
    }
    const result = {
      height: heights[heights.length - 1] + 10,
      offset:
        heights.reduce((offset, height) => offset + height + 10) -
        heights[heights.length - 1]
    };
    console.log('measured layout:', index, result);
    return result;
  };
}
