import * as React from 'react';
import { TextInput } from 'react-native';

type Props = React.ComponentProps<typeof TextInput>;

const UndoTextInput = (props: Props): JSX.Element => {
  const { value, onChangeText, ...rest } = props;
  const lastValue = React.useRef<string>();
  const textInput = React.useRef<TextInput>(null);

  const handleChangeText = (textValue: string) => {
    lastValue.current = textValue;
    onChangeText && onChangeText(textValue);
  };

  React.useEffect(() => {
    if (value !== lastValue.current) {
      lastValue.current = value;
      textInput.current?.setNativeProps({ text: value });
    }
  }, [value]);

  return (
    <TextInput {...rest} ref={textInput} onChangeText={handleChangeText} />
  );
};

export default UndoTextInput;
