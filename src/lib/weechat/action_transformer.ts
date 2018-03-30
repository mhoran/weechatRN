export type WeechatReduxAction = {
  type: string;
  payload: any;
};

const reduceToObjectByKey = <T>(array: T[], keyFn: (t: T) => string): object =>
  array.reduce((acc, elem) => ({ ...acc, [keyFn(elem)]: elem }), {});

export const transformToReduxAction = (data: WeechatResponse<any>) => {
  if (data.id.startsWith("_")) {
    // weechat builtin actions (resulting from sync)
    return { type: `WEECHAT${data.id}`, payload: data.objects };
  } else {
    switch (data.id) {
      case "buffers": {
        const object = data.objects[0] as WeechatObject<WeechatBuffer[]>;

        return {
          type: "FETCH_BUFFERS",
          payload: reduceToObjectByKey(
            object.content,
            buffer => buffer.pointers[0]
          )
        };
      }
      case "version": {
        const infolist = data.objects[0] as WeechatObject<WeechatInfoList>;

        return {
          type: "FETCH_VERSION",
          payload: infolist.content.value
        };
      }
    }
  }
};
