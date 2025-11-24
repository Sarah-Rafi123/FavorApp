import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface LocationSmallProps {
  width?: number;
  height?: number;
  color?: string;
}

export function LocationSmallSvg({ width = 14, height = 14, color = '#6B7280' }: LocationSmallProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <Path
        d="M14 6.67C14 10.5 8 15.33 8 15.33S2 10.5 2 6.67C2 5.07 2.63 3.54 3.76 2.42C4.88 1.29 6.41 0.67 8 0.67C9.59 0.67 11.12 1.29 12.24 2.42C13.37 3.54 14 5.07 14 6.67Z"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 8.67C9.1 8.67 10 7.77 10 6.67C10 5.57 9.1 4.67 8 4.67C6.9 4.67 6 5.57 6 6.67C6 7.77 6.9 8.67 8 8.67Z"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}