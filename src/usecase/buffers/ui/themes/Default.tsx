import type * as React from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';
import {
  GestureDetector,
  InterceptingGestureDetector,
  useExclusiveGestures,
  useLongPressGesture,
  useTapGesture,
  VirtualGestureDetector
} from 'react-native-gesture-handler';
import type { ParseShape } from 'react-native-parsed-text';
import { formatDate } from '../../../../lib/helpers/date-formatter';
import { renderWeechatFormat } from '../../../../lib/weechat/color-formatter';

interface Props {
  line: WeechatLine;
  onLongPress: (line: WeechatLine) => void;
  parseArgs: ParseShape[];
  nickWidth: number;
}

const PressableText: React.FC<{
  onPress: () => void;
  children: React.ReactNode;
}> = ({ onPress, children }) => {
  const longPressGesture = useLongPressGesture({
    onActivate: () => {
      console.log(children);
    }
  });

  const tapGesture = useTapGesture({
    onActivate: () => onPress(),
    runOnJS: true
  });

  const gesture = useExclusiveGestures(longPressGesture, tapGesture);

  return (
    <VirtualGestureDetector gesture={gesture}>
      <Text style={{ textDecorationLine: 'underline' }}>{children}</Text>
    </VirtualGestureDetector>
  );
};

const BufferLine: React.FC<Props> = ({ line, onLongPress, nickWidth }) => {
  const longPressAll = useLongPressGesture({
    onActivate: () => {
      onLongPress(line);
    },
    runOnJS: true
  });

  return (
    <GestureDetector gesture={longPressAll}>
      <View style={[styles.container]}>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[
            styles.text,
            {
              width: nickWidth,
              textAlign: 'right'
            }
          ]}
        >
          {renderWeechatFormat(line.prefix).map((props, index) => {
            const { style, ...rest } = props;
            return (
              <Text
                {...rest}
                key={index}
                style={[line.highlight ? styles.highlight : style]}
              />
            );
          })}
        </Text>
        <Text style={styles.text}> </Text>

        <View style={[styles.messageContainer]}>
          <InterceptingGestureDetector>
            <Text style={styles.text}>
              {renderWeechatFormat(line.message).map(
                ({ children, ...props }, index) => (
                  <Text key={index} {...props}>
                    {(children as string)
                      .split(/(https?:\/\/[^\s]+)/)
                      .map((s, index) => {
                        if (s.match(/^http/)) {
                          return (
                            <PressableText
                              key={index}
                              onPress={() => Linking.openURL(s)}
                            >
                              {s}
                            </PressableText>
                          );
                        }
                        return s;
                      })}
                  </Text>
                )
              )}
            </Text>
          </InterceptingGestureDetector>
        </View>

        <Text style={[styles.text]}> {formatDate(line.date)}</Text>
      </View>
    </GestureDetector>
  );
};

export default BufferLine;

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2e3440',
    paddingVertical: 5,
    paddingHorizontal: 10,
    flexDirection: 'row'
  },
  messageContainer: {
    flex: 1
  },
  text: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#eee',
    fontSize: 14
  },
  highlight: {
    backgroundColor: 'magenta',
    color: 'yellow'
  }
});
