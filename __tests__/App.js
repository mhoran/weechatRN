import 'react-native';
import React from 'react';
import App from '../src/usecase/App';

import { render } from '../src/test-utils';

it('renders correctly', () => {
  jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

  const tree = render(<App />, {
    initialState: {
      buffers: {
        1: {
          id: '1',
          full_name: 'irc.freenode.#weechat',
          short_name: '#weechat',
          local_variables: { type: 'channel' }
        }
      }
    }
  });

  expect(tree).toMatchSnapshot();
});
