export class WeeChatProtocol {
  static rawText2Rich(input: string): AttributedStringNode[];

  parse(data: ArrayBuffer): WeechatResponse<unknown>;
}
