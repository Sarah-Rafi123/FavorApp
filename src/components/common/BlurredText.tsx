import React from 'react';
import { View, Text, Animated } from 'react-native';
import Svg, { Defs, Filter, FeGaussianBlur, Text as SvgText, Rect, LinearGradient, Stop } from 'react-native-svg';

interface BlurredTextProps {
  children: string;
  style?: any;
  blurIntensity?: 'light' | 'medium' | 'heavy';
  blurType?: 'mask' | 'svg' | 'overlay' | 'smart';
  showPartial?: boolean;
  animated?: boolean;
}

export const BlurredText: React.FC<BlurredTextProps> = ({ 
  children, 
  style = {}, 
  blurIntensity = 'medium',
  blurType = 'smart',
  showPartial = true,
  animated = false
}) => {
  const defaultStyle = {
    fontSize: 16,
    color: '#374151',
    ...style
  };

  const [animValue] = React.useState(new Animated.Value(1));

  React.useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 0.7,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animated, animValue]);

  const getBlurSettings = () => {
    switch (blurIntensity) {
      case 'light':
        return { opacity: 0.8, blur: 1, letterSpacing: 0.5, maskChar: '·' };
      case 'heavy':
        return { opacity: 0.4, blur: 5, letterSpacing: 1, maskChar: '●' };
      default: // medium
        return { opacity: 0.6, blur: 3, letterSpacing: 0.8, maskChar: '•' };
    }
  };

  const settings = getBlurSettings();

  const getMaskedText = (text: string) => {
    // For emails, show dots without @ symbol
    if (text.includes('@')) {
      const totalLength = text.length;
      const dotsCount = Math.min(Math.max(totalLength, 6), 12);
      return settings.maskChar.repeat(dotsCount);
    } 
    
    // For phone numbers, show dots representing similar length
    if (text.match(/^\+?[\d\s\-\(\)]+$/)) {
      const cleaned = text.replace(/\D/g, '');
      const dotsCount = Math.min(Math.max(cleaned.length, 6), 10);
      return settings.maskChar.repeat(dotsCount);
    }
    
    // For general text, show proportional dots
    const dotsCount = Math.min(Math.max(text.length, 3), 8);
    return settings.maskChar.repeat(dotsCount);
  };

  const renderMaskedText = () => (
    <Animated.View style={{ opacity: animated ? animValue : 1 }}>
      <Text style={{
        ...defaultStyle,
        letterSpacing: settings.letterSpacing,
        color: '#9CA3AF',
        fontSize: (defaultStyle.fontSize || 16) * 0.9, // Slightly smaller
        lineHeight: (defaultStyle.fontSize || 16) * 1.1, // Tighter line height
      }}>
        {getMaskedText(children)}
      </Text>
    </Animated.View>
  );

  const renderSVGBlur = () => (
    <View style={{ height: 30, overflow: 'hidden' }}>
      <Svg height="30" width="100%" viewBox="0 0 200 30">
        <Defs>
          <Filter id="textBlur" x="-50%" y="-50%" width="200%" height="200%">
            <FeGaussianBlur in="SourceGraphic" stdDeviation={settings.blur} />
          </Filter>
          <LinearGradient id="fadeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#374151" stopOpacity="0.9" />
            <Stop offset="50%" stopColor="#374151" stopOpacity={settings.opacity} />
            <Stop offset="100%" stopColor="#374151" stopOpacity="0.9" />
          </LinearGradient>
        </Defs>
        <SvgText
          x="10"
          y="20"
          fontSize={defaultStyle.fontSize}
          fill="url(#fadeGrad)"
          filter="url(#textBlur)"
          fontFamily={defaultStyle.fontFamily || 'System'}
        >
          {children}
        </SvgText>
      </Svg>
    </View>
  );

  const renderOverlayBlur = () => (
    <View style={{ position: 'relative' }}>
      <Text style={defaultStyle}>{children}</Text>
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: `rgba(255, 255, 255, ${1 - settings.opacity})`,
        borderRadius: 4,
      }} />
      <View style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -50 }, { translateY: -50 }],
      }}>
        <Text style={{
          ...defaultStyle,
          color: '#9CA3AF',
          textAlign: 'center',
          letterSpacing: settings.letterSpacing,
          fontSize: (defaultStyle.fontSize || 16) * 0.85,
        }}>
          {settings.maskChar.repeat(Math.min(Math.max(children.length, 4), 8))}
        </Text>
      </View>
    </View>
  );

  const renderSmartBlur = () => {
    // Use masked text for better performance and compatibility
    if (showPartial) {
      return renderMaskedText();
    }
    // Try SVG blur for full blur effect
    try {
      return renderSVGBlur();
    } catch (error) {
      // Fallback to overlay blur
      console.warn('SVG blur failed, using overlay blur:', error);
      return renderOverlayBlur();
    }
  };

  // Choose rendering method based on blurType
  switch (blurType) {
    case 'mask':
      return renderMaskedText();
    case 'svg':
      return renderSVGBlur();
    case 'overlay':
      return renderOverlayBlur();
    default:
      return renderSmartBlur();
  }
};

// Preset components for common use cases
export const BlurredEmail: React.FC<{ children: string; style?: any }> = ({ children, style }) => (
  <BlurredText 
    style={{ fontSize: 14, ...style }} 
    blurType="mask" 
    blurIntensity="light"
    showPartial={false}
  >
    {children}
  </BlurredText>
);

export const BlurredPhone: React.FC<{ children: string; style?: any }> = ({ children, style }) => (
  <BlurredText 
    style={{ fontSize: 14, ...style }} 
    blurType="mask" 
    blurIntensity="light"
    showPartial={false}
  >
    {children}
  </BlurredText>
);

export const BlurredSensitive: React.FC<{ children: string; style?: any; intensity?: 'light' | 'medium' | 'heavy' }> = ({ 
  children, 
  style, 
  intensity = 'medium' 
}) => (
  <BlurredText 
    style={{ fontSize: 14, ...style }} 
    blurType="smart" 
    blurIntensity={intensity} 
    showPartial={false}
  >
    {children}
  </BlurredText>
);

export default BlurredText;