import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface ClockSmallProps {
  width?: number;
  height?: number;
  color?: string;
}

export function ClockSmallSvg({ width = 14, height = 14, color = '#6B7280' }: ClockSmallProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <Circle
        cx="8"
        cy="8"
        r="7"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 4V8L10.67 10.67"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}