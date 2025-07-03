import { useEffect, useRef } from 'react';
import { TextInput } from 'react-native';

type Props = React.ComponentProps<typeof TextInput>;

const UndoTextInput: React.FC<Props> = ({ value, onChangeText, ...rest }) => {
  const lastValue = useRef<string>(undefined);
  const textInput = useRef<TextInput>(null);

  const handleChangeText = (textValue: string) => {
    lastValue.current = textValue;
    onChangeText?.(textValue);
  };

  useEffect(() => {
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
