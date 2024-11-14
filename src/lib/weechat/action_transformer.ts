import { UnknownAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { StoreState } from '../../store';
import {
  bufferClearedAction,
  bufferClosedAction,
  bufferLineAddedAction,
  bufferLineDataChangedAction,
  bufferLocalvarRemoveAction,
  bufferLocalvarUpdateAction,
  bufferOpenedAction,
  bufferRenamedAction,
  fetchBuffersAction,
  fetchBuffersRemovedAction,
  fetchHotlistsAction,
  fetchLinesAction,
  fetchNicklistAction,
  fetchScriptsAction,
  fetchVersionAction,
  lastReadLinesAction,
  nicklistUpdatedAction,
  pongAction,
  upgradeAction
} from '../../store/actions';

type KeyFn<T> = (t: T) => string;
type MapFn<A, B> = (a: A) => A | B;

const reduceToObjectByKey = <T, U>(
  array: T[],
  keyFn: KeyFn<T>,
  mapFn: MapFn<T, U> = (a) => a
) => array.reduce((acc, elem) => ({ ...acc, [keyFn(elem)]: mapFn(elem) }), {});

const parseVersion = (version: string) => {
  const parts = version.split('.').map((part) => parseInt(part) ?? 0);
  return (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
};

export const transformToReduxAction = (
  data: WeechatResponse<unknown>
):
  | UnknownAction
  | ThunkAction<void, StoreState, undefined, UnknownAction>
  | undefined => {
  switch (data.id) {
    // Weechat internal events starts with "_"
    case '_nicklist_diff': {
      const object = data.objects[0] as WeechatObject<WeechatNicklist[]>;
      const nicklistDiffs = object.content;

      const nicks = nicklistDiffs.filter((diff) => diff.group === 0);

      const updates = nicks.reduce(
        ({ added, removed }, nick) => {
          switch (String.fromCharCode(nick._diff)) {
            case '+': {
              return { added: [...added, nick], removed };
            }
            case '-': {
              return { removed: [...removed, nick], added };
            }
          }
          return { added, removed };
        },
        { added: [] as WeechatNicklist[], removed: [] as WeechatNicklist[] }
      );

      return nicklistUpdatedAction(updates);
    }
    case '_buffer_cleared': {
      const object = data.objects[0] as WeechatObject<{ full_name: string }[]>;
      const fullName = object.content[0].full_name;

      return (
        dispatch: ThunkDispatch<StoreState, undefined, UnknownAction>,
        getState: () => StoreState
      ) => {
        const state: StoreState = getState();
        const buffer = Object.values(state.buffers).find(
          (buffer: WeechatBuffer) => buffer.full_name === fullName
        );

        if (!buffer) return undefined;

        dispatch(bufferClearedAction(buffer.id));
      };
    }
    case '_buffer_line_added': {
      const object = data.objects[0] as WeechatObject<
        Record<string, unknown>[]
      >;
      const line = object.content[0];

      return (
        dispatch: ThunkDispatch<StoreState, undefined, UnknownAction>,
        getState: () => StoreState
      ) => {
        const state: StoreState = getState();
        const { id, date, date_printed, ...restLine } = line;
        const pointers = restLine.pointers as string[];

        dispatch(
          bufferLineAddedAction({
            currentBufferId: state.app.currentBufferId,
            line: {
              ...restLine,
              id: id ?? parseInt(pointers[pointers.length - 1], 16),
              date: (date as Date).toISOString(),
              date_printed: (date_printed as Date).toISOString()
            } as WeechatLine
          })
        );
      };
    }
    case '_buffer_line_data_changed': {
      const object = data.objects[0] as WeechatObject<
        Record<string, unknown>[]
      >;
      const line = object.content[0];
      const { id, date, date_printed, ...restLine } = line;

      if (id === undefined) return;

      return bufferLineDataChangedAction({
        ...restLine,
        id,
        date: (date as Date).toISOString(),
        date_printed: (date_printed as Date).toISOString()
      } as WeechatLine);
    }
    case '_buffer_closing': {
      const object = data.objects[0] as WeechatObject<WeechatBuffer[]>;
      const buffer = object.content[0];

      return bufferClosedAction(buffer.pointers[0]);
    }
    case '_buffer_opened': {
      const object = data.objects[0] as WeechatObject<WeechatBuffer[]>;
      const buffer = object.content[0];
      buffer._id =
        buffer.id !== undefined
          ? parseInt(buffer.id)
          : parseInt(buffer.pointers[0], 16);
      buffer.id = buffer.pointers[0];

      return bufferOpenedAction(buffer);
    }
    case '_buffer_renamed': {
      const object = data.objects[0] as WeechatObject<WeechatBuffer[]>;
      const buffer = object.content[0];
      buffer.id = buffer.pointers[0];

      return bufferRenamedAction(buffer);
    }
    case '_buffer_localvar_removed': {
      const object = data.objects[0] as WeechatObject<WeechatBuffer[]>;
      const buffer = object.content[0];
      buffer.id = buffer.pointers[0];

      return bufferLocalvarRemoveAction(buffer);
    }
    case '_buffer_title_changed':
    case '_buffer_localvar_added': {
      const object = data.objects[0] as WeechatObject<WeechatBuffer[]>;
      const buffer = object.content[0];
      buffer.id = buffer.pointers[0];

      return bufferLocalvarUpdateAction(buffer);
    }
    case '_upgrade': {
      return upgradeAction();
    }
    case '_pong': {
      return pongAction();
    }
    case 'hotlist': {
      const object = data.objects[0] as WeechatObject<WeechatHotlist[]>;

      return (
        dispatch: ThunkDispatch<StoreState, undefined, UnknownAction>,
        getState: () => StoreState
      ) => {
        const state: StoreState = getState();

        dispatch(
          fetchHotlistsAction({
            hotlists: reduceToObjectByKey(
              object.content,
              (hotlist) => hotlist.buffer,
              ({ buffer, count }) => {
                const [, message, privmsg, highlight] = count;
                const sum = message + privmsg + highlight;
                return { buffer, message, privmsg, highlight, sum };
              }
            ),
            currentBufferId: state.app.currentBufferId
          })
        );
      };
    }
    case '_nicklist':
    case 'nicklist': {
      const object = data.objects[0] as WeechatObject<WeechatNicklist[]>;
      const nicklistDiffs = object.content;

      const nicks = nicklistDiffs.filter((diff) => diff.group === 0);

      return fetchNicklistAction({
        bufferId: object.content[0].pointers[0],
        nicklist: nicks
      });
    }
    case 'buffers': {
      const object = data.objects[0] as WeechatObject<WeechatBuffer[]>;

      return (
        dispatch: ThunkDispatch<StoreState, undefined, UnknownAction>,
        getState: () => StoreState
      ) => {
        const { buffers } = getState();
        const newBuffers = reduceToObjectByKey(
          object.content,
          (buffer) => buffer.pointers[0],
          (buf) => ({
            ...buf,
            id: buf.pointers[0],
            _id:
              buf.id !== undefined
                ? parseInt(buf.id)
                : parseInt(buf.pointers[0], 16)
          })
        );
        const removed = Object.keys(buffers).filter((buffer) => {
          return !(buffer in newBuffers);
        });

        dispatch(fetchBuffersRemovedAction(removed));
        dispatch(fetchBuffersAction(newBuffers));
      };
    }
    case 'version': {
      const infolist = data.objects[0] as WeechatObject<WeechatInfoList>;

      return fetchVersionAction(infolist.content.value);
    }
    case 'lines': {
      const object = data.objects[0] as WeechatObject<
        Record<string, unknown>[]
      >;
      if (!object.content[0]) return undefined;
      return (
        dispatch: ThunkDispatch<StoreState, undefined, UnknownAction>,
        getState: () => StoreState
      ) => {
        dispatch(
          fetchLinesAction(
            object.content.map((line) => {
              const { id, date, date_printed, ...restLine } = line;
              const pointers = restLine.pointers as string[];

              return {
                ...restLine,
                id:
                  parseVersion(getState().app.version) >= 0x04040000
                    ? id
                    : parseInt(pointers[pointers.length - 1], 16),
                date: (date as Date).toISOString(),
                date_printed: (date_printed as Date).toISOString()
              } as WeechatLine;
            })
          )
        );
      };
    }
    case 'last_read_lines': {
      const object = data.objects[0];

      return lastReadLinesAction(object.content);
    }
    case 'scripts': {
      const object = data.objects[0] as WeechatObject<{ name: string }[]>;

      return fetchScriptsAction(object.content.map(({ name }) => name));
    }
    default:
      console.log('unhandled event!', data.id, data);
      return undefined;
  }
};
