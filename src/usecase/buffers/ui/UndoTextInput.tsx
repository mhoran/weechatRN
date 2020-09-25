import * as React from "react";
import { TextInput } from 'react-native';

type Props = React.ComponentProps<typeof TextInput>;

export default class UndoTextInput extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props)
    this.value = props.value;
  }

  textInput: TextInput;
  value: string;

  componentDidUpdate() {
    const { value } = this.props;
    if (value !== this.value) {
      this.textInput.setNativeProps({ text: value })
      this.value = value;
    }
  }

  handleChangeText = (textValue: string) => {
    this.value = textValue;
    this.props.onChangeText(textValue);
  }

  render() {
    const { value, onChangeText, ...rest } = this.props;
    return (
        <TextInput {...rest}
          ref={input => this.textInput = input}
          onChangeText={this.handleChangeText}
      />
    );
  }
}