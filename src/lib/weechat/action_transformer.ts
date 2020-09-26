import { StoreState } from '../../store';

export type WeechatReduxAction = {
  type: string;
  payload: any;
};

type KeyFn<T> = (t: T) => string;
type MapFn<A, B> = (a: A) => A | B;

const reduceToObjectByKey = <T, U>(
  array: T[],
  keyFn: KeyFn<T>,
  mapFn: MapFn<T, U> = (a) => a
) => array.reduce((acc, elem) => ({ ...acc, [keyFn(elem)]: mapFn(elem) }), {});

export const transformToReduxAction = (data: WeechatResponse<any>) => {
  switch (data.id) {
    // Weechat internal events starts with "_"
    case '_nicklist_diff': {
      const object = data.objects[0] as WeechatObject<WeechatNicklist[]>;
      const nicklistDiffs = object.content;

      const nick = nicklistDiffs.filter((diff) => diff.group === 0)[0];

      if (nick) {
        const bufferId = nick.pointers[0];
        const payload = nick;

        switch (String.fromCharCode(nick._diff)) {
          case '+': {
            return {
              type: 'NICK_ADDED',
              bufferId,
              payload
            };
          }
          case '-': {
            return {
              type: 'NICK_REMOVED',
              bufferId,
              payload
            };
          }
          case '*': {
            return {
              type: 'NICK_UPDATED',
              bufferId,
              payload
            };
          }
        }
      }

      return null;
    }
    case '_buffer_line_added': {
      const object = data.objects[0] as WeechatObject<WeechatLine[]>;
      const line = object.content[0];

      return (dispatch, getState) => {
        const state: StoreState = getState();

        dispatch({
          type: 'BUFFER_LINE_ADDED',
          bufferId: line.buffer,
          currentBufferId: state.app.currentBufferId,
          payload: line
        });
      };
    }
    case '_buffer_closing': {
      const object = data.objects[0] as WeechatObject<WeechatBuffer[]>;
      const buffer = object.content[0];

      return {
        type: 'BUFFER_CLOSED',
        bufferId: buffer.pointers[0]
      };
    }
    case '_buffer_opened': {
      const object = data.objects[0] as WeechatObject<WeechatBuffer[]>;
      const buffer = object.content[0];
      buffer.id = buffer.pointers[0];

      return {
        type: 'BUFFER_OPENED',
        payload: buffer,
        bufferId: buffer.id
      };
    }
    case '_buffer_renamed': {
      const object = data.objects[0] as WeechatObject<WeechatBuffer[]>;
      const buffer = object.content[0];
      buffer.id = buffer.pointers[0];

      return {
        type: 'BUFFER_RENAMED',
        payload: buffer,
        bufferId: buffer.id
      };
    }
    case '_buffer_localvar_removed': {
      const object = data.objects[0] as WeechatObject<WeechatBuffer[]>;
      const buffer = object.content[0];
      buffer.id = buffer.pointers[0];

      return {
        type: 'BUFFER_LOCALVAR_REMOVE',
        payload: buffer,
        bufferId: buffer.id
      };
    }
    case '_buffer_title_changed':
    case '_buffer_localvar_added': {
      const object = data.objects[0] as WeechatObject<WeechatBuffer[]>;
      const buffer = object.content[0];
      buffer.id = buffer.pointers[0];

      return {
        type: 'BUFFER_LOCALVAR_UPDATE',
        payload: buffer,
        bufferId: buffer.id
      };
    }
    case 'hotlist': {
      const object = data.objects[0] as WeechatObject<WeechatHotlist[]>;

      return (dispatch, getState) => {
        const state: StoreState = getState();

        dispatch({
          type: 'FETCH_HOTLISTS',
          payload: reduceToObjectByKey(
            object.content,
            (hotlist) => hotlist.buffer,
            (h) => {
              const [, message, privmsg, highlight] = h.count;
              const sum = message + privmsg + highlight;
              return { ...h, message, privmsg, highlight, sum };
            }
          ),
          currentBufferId: state.app.currentBufferId
        });
      };
    }
    case 'nicklist': {
      const object = data.objects[0] as WeechatObject<WeechatNicklist[]>;
      const nicklistDiffs = object.content;

      const nicks = nicklistDiffs.filter((diff) => diff.group === 0);

      return {
        type: 'FETCH_NICKLIST',
        bufferId: object.content[0].pointers[0],
        payload: nicks
      };
    }
    case 'buffers': {
      const object = data.objects[0] as WeechatObject<WeechatBuffer[]>;

      return {
        type: 'FETCH_BUFFERS',
        payload: reduceToObjectByKey(
          object.content,
          (buffer) => buffer.pointers[0],
          (buf) => ({ ...buf, id: buf.pointers[0] })
        )
      };
    }
    case 'version': {
      const infolist = data.objects[0] as WeechatObject<WeechatInfoList>;

      return {
        type: 'FETCH_VERSION',
        payload: infolist.content.value
      };
    }
    case 'lines': {
      const object = data.objects[0] as WeechatObject<WeechatLine[]>;
      return {
        type: 'FETCH_LINES',
        bufferId: object.content[0].buffer,
        payload: object.content
      };
    }
    default:
      console.log('unhandled event!', data.id, data);
      return undefined;
  }
};
