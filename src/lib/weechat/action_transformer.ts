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
            object.content.map(o => ({ ...o, id: o.pointers[0] })),
            buffer => buffer.id
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
      case "lines": {
        const object = data.objects[0] as WeechatObject<WeechatLine[]>;
        return {
          type: "FETCH_LINES",
          bufferId: object.content[0].buffer,
          payload: object.content
        };
      }
    }
  }
};
