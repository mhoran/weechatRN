export class WeeChatProtocol {
  static rawText2Rich(input: string);

  parse(data: ArrayBuffer): WeechatResponse<unknown>;
}
