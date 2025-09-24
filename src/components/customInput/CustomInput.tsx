import { Text, TextInput, KeyboardTypeOptions } from 'react-native'
import React from 'react'
import useThemeStore from '../../store/useThemeStore';
import { font_size } from '../../constants';

/**
 * CustomInput provides a styled text input field with optional note text.
 * Changes border color on focus and supports various text input configurations.
 * 
 * @example
 * ```tsx
 * <CustomInput 
 *   value={email}
 *   onChangeText={setEmail}
 *   placeholder="Enter your email"
 *   keyboardType="email-address"
 *   note="We'll never share your email"
 * />
 * ```
 * 
 * @param props.value - Current input value
 * @param props.onChangeText - Function called when text changes
 * @param props.placeholder - Placeholder text when input is empty
 * @param props.placeholderTextColor - Color of the placeholder text
 * @param props.keyboardType - Keyboard type to display (default: 'default')
 * @param props.secureTextEntry - Whether to hide text entry for passwords (default: false)
 * @param props.containerStyles - Custom styles for the input container
 * @param props.note - Optional helper or error text to display below the input
 * @param props.noteStyles - Custom styles for the note text
 * @param props.editable - Whether the input is editable (default: true)
 */

interface CustomInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  containerStyles?: object;
  note?: string;
  noteStyles?: object;
  editable?: boolean
}

export function CustomInput(props: CustomInputProps) {
  const theme = useThemeStore((state) => state.theme);
  const {
    value,
    onChangeText,
    placeholder,
    placeholderTextColor,
    keyboardType = 'default',
    secureTextEntry = false,
    containerStyles = {},
    note = '',
    noteStyles = {},
    editable = true
  } = props;

  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        editable={editable}
        style={[{
   
          borderWidth: 1,
          padding: 12,
          borderRadius: 6,
          width: '100%',
          textAlign: 'center',

          fontSize: font_size.L
        }, containerStyles]}
      />
      {
        note.length !== 0 &&
        <Text style={[{
          color: theme.primary,
          textAlign: 'center',
          marginTop: 8,
          fontSize: font_size.M
        }, noteStyles]}>{note}</Text>
      }
    </>
  );
}