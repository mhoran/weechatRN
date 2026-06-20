import { configureStore } from '@reduxjs/toolkit';
import { reducer } from '../../../../src/store';
import VersionAction from '../../../../src/lib/weechat/api/version';

describe(VersionAction, () => {
  it('stores the version', () => {
    const store = configureStore({
      reducer,
      enhancers: (getDefaultEnhancers) =>
        getDefaultEnhancers({ autoBatch: false })
    });

    const action = VersionAction({
      code: 200,
      body_type: 'version',
      body: { weechat_version: '4.4.3' }
    });
    expect(action).toBeDefined();

    store.dispatch(action!);

    expect(store.getState().app.version).toEqual('4.4.3');
  });
});
