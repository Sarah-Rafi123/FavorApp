import { TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import useThemeStore from '../../store/useThemeStore';
import { Ionicons } from '@expo/vector-icons';
import { ThemeTypes } from '../../constants';

/**
 * IconButton displays a touchable icon from Ionicons library or custom children
 * with minimal styling.
 * 
 * @example
 * ```tsx
 * <IconButton 
 *   iconName="heart"
 *   iconColor="#FF0000"
 *   iconSize={28}
 *   onPress={() => handleLike()}
 * />
 * ```
 * 
 * @example
 * ```tsx
 * <IconButton onPress={handleCustomAction}>
 *   <CustomSvgIcon />
 * </IconButton>
 * ```
 * 
 * @param props.iconName - Name of the Ionicons icon to display (default: 'close')
 * @param props.iconColor - Color of the icon (default: theme.white)
 * @param props.iconSize - Size of the icon in pixels (default: 24)
 * @param props.onPress - Function to call when button is pressed
 * @param props.outerContainerStyle - Custom styles for the container
 * @param props.children - Custom component to render instead of an icon
 * @param props.disabled - Whether the button is disabled (default: false)
 */

interface IconButtonProps {
  iconName?: string;
  iconColor?: string;
  iconSize?: number;
  onPress?: () => void;
  outerContainerStyle?: object;
  type?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export function IconButton(props: IconButtonProps) {
  const theme = useThemeStore((state) => state.theme);
  const {

    iconSize = 24,
    onPress,
    outerContainerStyle,
    children,
    disabled = false
  } = props;

  const styles = createStyles(theme);

  return (
    <TouchableOpacity disabled={disabled} onPress={onPress} style={[styles.outerContainer, outerContainerStyle]}>
      {
        children ?
          children
          : <Ionicons name={iconName as keyof typeof Ionicons.glyphMap} size={iconSize} color={iconColor} />
      }
    </TouchableOpacity>
  )
}

const createStyles = (theme: ThemeTypes) => StyleSheet.create({
  outerContainer: {
    padding: 4,
    margin: -4,
  },
});