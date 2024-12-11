import type { UnknownAction } from 'redux';
import type { ThunkAction, ThunkDispatch } from 'redux-thunk';
import type { StoreState } from '../../store';
import * as actions from '../../store/actions';

interface RelayLine extends Omit<WeechatLine, 'id' | 'date' | 'date_printed'> {
  id: number;
  date: Date;
  date_printed: Date;
}

type KeyFn<T> = (t: T) => string;
type MapFn<A, B> = (a: A) => A | B;

const reduceToObjectByKey = <T, U>(
  array: T[],
  keyFn: KeyFn<T>,
  mapFn: MapFn<T, U> = (a) => a
) => array.reduce((acc, elem) => ({ ...acc, [keyFn(elem)]: mapFn(elem) }), {});

const parseVersion = (version: string) => {
  const parts = version.split('.').map((part) => parseInt(part) || 0);
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
      if (nicks.length === 0) return;

      const [bufferId] = nicks[0].pointers;
      const added = [] as WeechatNicklist[];
      const removed = [] as WeechatNicklist[];

      nicks.forEach((nick) => {
        switch (String.fromCharCode(nick._diff)) {
          case '+': {
            added.push(nick);
            break;
          }
          case '-': {
            removed.push(nick);
            break;
          }
        }
      });

      return actions.nicklistUpdatedAction({ added, removed, bufferId });
    }
    case '_buffer_cleared': {
      const object = data.objects[0] as WeechatObject<WeechatBuffer[]>;
      const buffer = object.content[0];

      return actions.bufferClearedAction(buffer.pointers[0]);
    }
    case '_buffer_line_added': {
      const object = data.objects[0] as WeechatObject<RelayLine[]>;
      const line = object.content[0];

      return (
        dispatch: ThunkDispatch<StoreState, undefined, UnknownAction>,
        getState: () => StoreState
      ) => {
        const state: StoreState = getState();
        const { id, pointers, date, date_printed } = line;

        dispatch(
          actions.bufferLineAddedAction({
            currentBufferId: state.app.currentBufferId,
            line: {
              ...line,
              id: id ?? parseInt(pointers[pointers.length - 1], 16),
              date: date.toISOString(),
              date_printed: date_printed.toISOString(),
              ...(line.notify_level !== undefined && {
                notify_level: new Int8Array([line.notify_level])[0]
              })
            }
          })
        );
      };
    }
    case '_buffer_line_data_changed': {
      const object = data.objects[0] as WeechatObject<RelayLine[]>;
      const line = object.content[0];
      const { id, date, date_printed } = line;

      if (id === undefined) return;

      return actions.bufferLineDataChangedAction({
        ...line,
        date: date.toISOString(),
        date_printed: date_printed.toISOString()
      });
    }
    case '_buffer_closing': {
      const object = data.objects[0] as WeechatObject<WeechatBuffer[]>;
      const buffer = object.content[0];

      return actions.bufferClosedAction(buffer.pointers[0]);
    }
    case '_buffer_opened': {
      const object = data.objects[0] as WeechatObject<WeechatBuffer[]>;
      const buffer = object.content[0];
      buffer._id =
        buffer.id !== undefined
          ? parseInt(buffer.id)
          : parseInt(buffer.pointers[0], 16);
      buffer.id = buffer.pointers[0];

      return actions.bufferOpenedAction(buffer);
    }
    case '_buffer_renamed': {
      const object = data.objects[0] as WeechatObject<WeechatBuffer[]>;
      const buffer = object.content[0];
      buffer.id = buffer.pointers[0];

      return actions.bufferRenamedAction(buffer);
    }
    case '_buffer_localvar_removed': {
      const object = data.objects[0] as WeechatObject<WeechatBuffer[]>;
      const buffer = object.content[0];
      buffer.id = buffer.pointers[0];

      return actions.bufferLocalvarRemoveAction(buffer);
    }
    case '_buffer_title_changed':
    case '_buffer_localvar_added': {
      const object = data.objects[0] as WeechatObject<WeechatBuffer[]>;
      const buffer = object.content[0];
      buffer.id = buffer.pointers[0];

      return actions.bufferLocalvarUpdateAction(buffer);
    }
    case '_upgrade': {
      return actions.upgradeAction();
    }
    case '_pong': {
      return actions.pongAction();
    }
    case 'hotlist': {
      const object = data.objects[0] as WeechatObject<WeechatHotlist[]>;

      return (
        dispatch: ThunkDispatch<StoreState, undefined, UnknownAction>,
        getState: () => StoreState
      ) => {
        const state: StoreState = getState();

        dispatch(
          actions.fetchHotlistsAction({
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

      return actions.fetchNicklistAction({
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

        dispatch(actions.fetchBuffersRemovedAction(removed));
        dispatch(actions.fetchBuffersAction(newBuffers));
      };
    }
    case 'version': {
      const infolist = data.objects[0] as WeechatObject<WeechatInfoList>;

      return actions.fetchVersionAction(infolist.content.value);
    }
    case 'lines': {
      const object = data.objects[0] as WeechatObject<RelayLine[]>;
      if (object.content.length === 0) return;
      return (
        dispatch: ThunkDispatch<StoreState, undefined, UnknownAction>,
        getState: () => StoreState
      ) => {
        dispatch(
          actions.fetchLinesAction(
            object.content.map((line) => {
              const { id, pointers, date, date_printed } = line;

              return {
                ...line,
                id:
                  parseVersion(getState().app.version) >= 0x04040000
                    ? id
                    : parseInt(pointers[pointers.length - 1], 16),
                date: date.toISOString(),
                date_printed: date_printed.toISOString()
              };
            })
          )
        );
      };
    }
    case 'last_read_lines': {
      const object = data.objects[0] as WeechatObject<
        Pick<WeechatLine, 'id' | 'pointers' | 'buffer'>[]
      >;

      return (
        dispatch: ThunkDispatch<StoreState, undefined, UnknownAction>,
        getState: () => StoreState
      ) => {
        const lines = object.content.map((line) => {
          const { pointers, buffer } = line;
          const id =
            parseVersion(getState().app.version) >= 0x04040000
              ? line.id
              : parseInt(pointers[pointers.length - 1], 16);

          return { id, buffer };
        });
        dispatch(actions.lastReadLinesAction(lines));
      };
    }
    case 'scripts': {
      const object = data.objects[0] as WeechatObject<{ name: string }[]>;

      return actions.fetchScriptsAction(object.content.map(({ name }) => name));
    }
    default:
      console.log('unhandled event!', data.id, data);
      return undefined;
  }
};
