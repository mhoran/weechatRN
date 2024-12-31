import { render, screen } from '@testing-library/react-native';
import type { PanGesture } from 'react-native-gesture-handler';
import { State } from 'react-native-gesture-handler';
import {
  fireGestureHandler,
  getByGestureTestId
} from 'react-native-gesture-handler/jest-utils';
import { Snackbar } from '../../../src/usecase/shared/Snackbar';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  default: jest.fn().mockReturnValue({
    width: 320,
    height: 568
  })
}));

jest.unmock('react-native-reanimated');

jest.useFakeTimers();

describe('Snackbar', () => {
  describe('on pan', () => {
    it('sets translateX to the X position of the pan gesture', () => {
      const onDismiss = jest.fn();
      render(<Snackbar message="" onDismiss={onDismiss} />);

      fireGestureHandler<PanGesture>(getByGestureTestId('snackbarPan'), [
        { state: State.BEGAN, translationX: 0 },
        { state: State.ACTIVE, translationX: 10 },
        { translationX: 20 }
      ]);

      jest.advanceTimersByTime(0);

      const snackbar = screen.getByRole('alert');
      expect(snackbar.props.jestAnimatedStyle?.value).toEqual(
        expect.objectContaining({
          transform: expect.arrayContaining([{ translateX: 20 }])
        })
      );
    });

    it('resets translateX to 0 if not panned beyond the threshold', () => {
      const onDismiss = jest.fn();
      render(<Snackbar message="" onDismiss={onDismiss} />);

      fireGestureHandler<PanGesture>(getByGestureTestId('snackbarPan'), [
        { state: State.BEGAN, translationX: 0 },
        { state: State.ACTIVE, translationX: 10 },
        { translationX: 20 }
      ]);

      jest.advanceTimersByTime(0);

      const snackbar = screen.getByRole('alert');
      expect(snackbar.props.jestAnimatedStyle?.value).toEqual(
        expect.objectContaining({
          transform: expect.arrayContaining([{ translateX: 20 }])
        })
      );

      jest.runAllTimers();

      expect(snackbar.props.jestAnimatedStyle?.value).toEqual(
        expect.objectContaining({
          transform: expect.arrayContaining([{ translateX: 0 }])
        })
      );
    });

    it('calls onDismiss when panned to the width of the window', () => {
      const onDismiss = jest.fn();
      render(<Snackbar message="" onDismiss={onDismiss} />);

      fireGestureHandler<PanGesture>(getByGestureTestId('snackbarPan'), [
        { state: State.BEGAN, translationX: 0 },
        { state: State.ACTIVE, translationX: 10 },
        { translationX: 320 },
        { state: State.END, translationX: 320 }
      ]);

      jest.runAllTimers();

      expect(onDismiss).toHaveBeenCalled();
    });

    it('positions the view offscreen panned to the width of the window', () => {
      const onDismiss = jest.fn();
      render(<Snackbar message="" onDismiss={onDismiss} />);

      fireGestureHandler<PanGesture>(getByGestureTestId('snackbarPan'), [
        { state: State.BEGAN, translationX: 0 },
        { state: State.ACTIVE, translationX: 10 },
        { translationX: 320 },
        { state: State.END, translationX: 320 }
      ]);

      jest.runAllTimers();

      const snackbar = screen.getByRole('alert');
      expect(snackbar.props.jestAnimatedStyle?.value).toEqual(
        expect.objectContaining({
          transform: expect.arrayContaining([{ translateX: 320 }])
        })
      );
    });
  });
});
