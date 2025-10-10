import React from 'react';
import Svg, { Path } from 'react-native-svg';

const HouseSvg = () => (
  <Svg width="64" height="64" viewBox="0 0 64 64" fill="none">
    <Path
      d="M8 32L32 8L56 32V56C56 57.1 55.1 58 54 58H38V42H26V58H10C8.9 58 8 57.1 8 56V32Z"
      fill="#44A27B"
      stroke="#2E8862"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M26 58V42H38V58"
      fill="none"
      stroke="#2E8862"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M26 28H38"
      stroke="#2E8862"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

export default HouseSvg;