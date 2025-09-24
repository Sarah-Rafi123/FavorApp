import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native'
import React from 'react'
import useThemeStore from '../../store/useThemeStore';
import { ThemeTypes } from  '../../constants';

/**
 * CustomButton provides a standardized button component with customizable styles and loading state.
 *
 * @example
 * ```tsx
 * <CustomButton 
 *   title="Submit"
 *   onPress={() => handleSubmit()}
 *   loading={isSubmitting}
 * />
 * ```
 *
 * @param props.title - The text to display on the button
 * @param props.onPress - Function to call when button is pressed
 * @param props.disabled - Whether the button is disabled (default: false)
 * @param props.outerContainerStyle - Custom styles for the outer container
 * @param props.innerContainerStyle - Custom styles for the inner container
 * @param props.titleStyle - Custom styles for the button text
 * @param props.loading - Whether to show a loading indicator instead of text (default: false)
 * @param props.loaderColor - Color of the loading indicator (default: theme.primary)
 */

interface CustomButtonProps {
  title?: string;
  onPress?: () => void;
  disabled?: boolean;
  outerContainerStyle?: ViewStyle;
  innerContainerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  loading?: boolean;
  loaderColor?: string;
}

export function CustomButton(props: CustomButtonProps) {
  const theme = useThemeStore((state) => state.theme);
  const styles = createStyles(theme);

  const {
    title,
    onPress,
    disabled = false,
    outerContainerStyle = {},
    innerContainerStyle = {},
    titleStyle = {},
    loading = false,
    loaderColor = theme.primary
  } = props;


  return (
    <TouchableOpacity onPress={onPress} style={[styles.outerContainer, outerContainerStyle]} disabled={disabled}>
      <View style={[styles.innerContainer, innerContainerStyle]}>
        {
          loading ?
            <ActivityIndicator color={loaderColor} />
            :
            <Text style={[styles.title, titleStyle]}>{title}</Text>
        }
      </View>
    </TouchableOpacity>
  )
}

const createStyles = (theme: ThemeTypes) => StyleSheet.create({
  outerContainer: {
    // flex: 1,
    borderRadius: 34,
    overflow: 'hidden',
    borderWidth: 1,

  },
  innerContainer: {
    alignItems: 'center',
    padding: 15,
  
  },
  title: {
    fontSize: 16,
    color: theme.dark_1,
  }

});