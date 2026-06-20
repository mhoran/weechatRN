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
          date_printed: '2024-11-10T17:28:48.000Z',
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
});
