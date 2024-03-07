import 'react-native';
import App from '../../src/usecase/App';

import { render } from '../../src/test-utils';

it('renders correctly', () => {
  const tree = render(
    <App
      disconnect={() => {}}
      fetchBufferInfo={() => {}}
      sendMessageToBuffer={() => {}}
      clearHotlistForBuffer={() => {}}
    />,
    {
      preloadedState: {
        buffers: {
          '8578d9c00': {
            full_name: 'irc.libera.#weechat',
            hidden: 0,
            id: '8578d9c00',
            local_variables: {
              channel: '#weechat',
              name: 'libera.#weechat',
              plugin: 'irc',
              type: 'channel'
            },
            notify: 3,
            number: 2,
            pointers: ['8578d9c00'],
            short_name: '#weechat',
            title: '',
            type: 0
          }
        }
      }
    }
  );

  expect(tree).toMatchSnapshot();
});
