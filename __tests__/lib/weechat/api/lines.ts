import { configureStore } from '@reduxjs/toolkit';
import LinesAction from '../../../../src/lib/weechat/api/lines';
import type { LinesResponse } from '../../../../src/lib/weechat/api/types';
import { reducer } from '../../../../src/store';

describe(LinesAction, () => {
  it('sets properties to the expected values', () => {
    const store = configureStore({
      reducer,
      enhancers: (getDefaultEnhancers) =>
        getDefaultEnhancers({ autoBatch: false })
    });

    const action = LinesAction({
      code: 200,
      request: 'GET /api/buffers/1709932823238637/lines',
      body_type: 'lines',
      body: [
        {
          id: 0,
          date: '2024-11-09T00:02:07.000Z',
          tags: ['irc_privmsg', 'notify_none'],
          highlight: false,
          displayed: true
        } as LinesResponse['body'][number]
      ]
    });
    expect(action).toBeDefined();

    store.dispatch(action!);

    expect(store.getState().lines).toHaveProperty('1709932823238637');
    const lines = store.getState().lines['1709932823238637'];
    expect(lines[0].id).toEqual(0);
    expect(lines[0].tags_array).toEqual(['irc_privmsg', 'notify_none']);
    expect(lines[0].highlight).toEqual(0);
    expect(lines[0].displayed).toEqual(1);
  });

  it('sets the buffer last read line to the last displayed line', () => {
    const store = configureStore({
      preloadedState: {
        buffers: { '1709932823238637': { last_read_line: 1 } as WeechatBuffer }
      },
      reducer,
      enhancers: (getDefaultEnhancers) =>
        getDefaultEnhancers({ autoBatch: false })
    });

    const action = LinesAction({
      code: 200,
      request: 'GET /api/buffers/1709932823238637/lines',
      body_type: 'lines',
      body: [
        {
          id: 0,
          date: '2024-11-09T00:02:07.000Z',
          tags: ['irc_privmsg', 'notify_none'],
          highlight: false,
          displayed: true
        } as LinesResponse['body'][number],
        {
          id: 1,
          date: '2024-11-09T00:02:08.000Z',
          tags: ['irc_privmsg', 'notify_none'],
          highlight: false,
          displayed: false
        } as LinesResponse['body'][number],
        {
          id: 2,
          date: '2024-11-09T00:02:09.000Z',
          tags: ['irc_privmsg', 'notify_none'],
          highlight: false,
          displayed: true
        } as LinesResponse['body'][number]
      ]
    });
    expect(action).toBeDefined();

    store.dispatch(action!);

    const buffer = store.getState().buffers['1709932823238637'];
    expect(buffer.last_read_line).toEqual(0);
  });
});
