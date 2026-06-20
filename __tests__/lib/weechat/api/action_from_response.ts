import actionFromResponse from '../../../../src/lib/weechat/api/action_from_response';
import BufferAction from '../../../../src/lib/weechat/api/buffer';
import BuffersAction from '../../../../src/lib/weechat/api/buffers';
import HotlistAction from '../../../../src/lib/weechat/api/hotlist';
import LineAction from '../../../../src/lib/weechat/api/line';
import LinesAction from '../../../../src/lib/weechat/api/lines';
import NickAction from '../../../../src/lib/weechat/api/nick';
import NicklistAction from '../../../../src/lib/weechat/api/nicklist';
import PongAction from '../../../../src/lib/weechat/api/pong';
import ScriptsAction from '../../../../src/lib/weechat/api/scripts';
import UpgradeAction from '../../../../src/lib/weechat/api/upgrade';
import VersionAction from '../../../../src/lib/weechat/api/version';

function mockAction() {
  const mockAction = function () {};
  mockAction.from_response = jest.fn();

  return mockAction;
}

jest.mock('../../../../src/lib/weechat/api/buffer', () => mockAction());
jest.mock('../../../../src/lib/weechat/api/buffers', () => mockAction());
jest.mock('../../../../src/lib/weechat/api/hotlist', () => mockAction());
jest.mock('../../../../src/lib/weechat/api/line', () => mockAction());
jest.mock('../../../../src/lib/weechat/api/lines', () => mockAction());
jest.mock('../../../../src/lib/weechat/api/nick', () => mockAction());
jest.mock('../../../../src/lib/weechat/api/nicklist', () => mockAction());
jest.mock('../../../../src/lib/weechat/api/pong', () => mockAction());
jest.mock('../../../../src/lib/weechat/api/scripts', () => mockAction());
jest.mock('../../../../src/lib/weechat/api/upgrade', () => mockAction());
jest.mock('../../../../src/lib/weechat/api/version', () => mockAction());

describe('actionFromResponse', () => {
  describe('on version', () => {
    it('calls VersionDispatcher', () => {
      actionFromResponse({
        code: 200,
        body_type: 'version',
        body: {}
      });

      expect(VersionAction.from_response).toHaveBeenCalled();
    });
  });

  describe('on buffers', () => {
    it('calls BuffersDispatcher', () => {
      actionFromResponse({
        code: 200,
        body_type: 'buffers',
        body: {}
      });

      expect(BuffersAction.from_response).toHaveBeenCalled();
    });
  });

  describe('on buffer', () => {
    it('calls BufferDispatcher', () => {
      actionFromResponse({
        code: 200,
        request: 'GET /api/buffers/1730555173010842',
        body_type: 'buffer',
        body: {}
      });

      expect(BufferAction.from_response).toHaveBeenCalled();
    });
  });

  describe('on lines', () => {
    it('calls LinesDispatcher', () => {
      actionFromResponse({
        code: 200,
        request: 'GET /api/buffers/1730555173010842/lines',
        body_type: 'lines',
        body: {}
      });

      expect(LinesAction.from_response).toHaveBeenCalled();
    });
  });

  describe('on line', () => {
    it('calls LineDispatcher', () => {
      actionFromResponse({
        code: 0,
        buffer_id: 1730555173010842,
        event_name: 'buffer_line_added',
        body_type: 'line',
        body: {}
      });

      expect(LineAction.from_response).toHaveBeenCalled();
    });
  });

  describe('on nick_group', () => {
    it('calls NicklistDispatcher', () => {
      actionFromResponse({
        code: 200,
        request: 'GET /api/buffers/1730555173010842/nicks',
        body_type: 'nick_group',
        body: {}
      });

      expect(NicklistAction.from_response).toHaveBeenCalled();
    });
  });

  describe('on nick', () => {
    it('calls NickDispatcher', () => {
      actionFromResponse({
        code: 0,
        buffer_id: 1730555173010842,
        event_name: 'nicklist_nick_added',
        body_type: 'nick',
        body: {}
      });

      expect(NickAction.from_response).toHaveBeenCalled();
    });
  });

  describe('on hotlist', () => {
    it('calls HotlistDispatcher', () => {
      actionFromResponse({
        code: 200,
        body_type: 'hotlist',
        body: {}
      });

      expect(HotlistAction.from_response).toHaveBeenCalled();
    });
  });

  describe('on pong', () => {
    it('calls PongDispatcher', () => {
      actionFromResponse({
        code: 204,
        request: 'POST /api/ping'
      });

      expect(PongAction.from_response).toHaveBeenCalled();
    });
  });

  describe('on scripts', () => {
    it('calls ScriptsDispatcher', () => {
      actionFromResponse({
        code: 200,
        body_type: 'scripts',
        body: {}
      });

      expect(ScriptsAction.from_response).toHaveBeenCalled();
    });
  });

  describe('on upgrade', () => {
    it('calls UpgradeDispatcher', () => {
      actionFromResponse({
        code: 0,
        event_name: 'upgrade',
        body: null
      });

      expect(UpgradeAction.from_response).toHaveBeenCalled();
    });
  });
});
