import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import React from 'react'

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
  loading?: boolean;
  className?: string;
}

export function CustomButton(props: CustomButtonProps) {
  const {
    title,
    onPress,
    disabled = false,
    loading = false,
    className = ""
  } = props;

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled}
      className={`bg-green-500 rounded-full overflow-hidden ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      <View className="items-center px-6 py-4">
        {
          loading ?
            <ActivityIndicator color="white" />
            :
            <Text className="text-base text-white font-medium">{title}</Text>
        }
      </View>
    </TouchableOpacity>
  )
}

