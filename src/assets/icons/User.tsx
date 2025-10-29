import React from 'react';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

interface UserSvgProps {
  focused?: boolean;
  width?: number;
  height?: number;
}

const UserSvg = ({ focused = false, width = 25, height = 25 }: UserSvgProps) => {
  return(
 <Svg width={width} height={height} viewBox="0 0 25 25" fill="none">
<Path d="M12.5 12.5C15.2614 12.5 17.5 10.2614 17.5 7.5C17.5 4.73858 15.2614 2.5 12.5 2.5C9.73858 2.5 7.5 4.73858 7.5 7.5C7.5 10.2614 9.73858 12.5 12.5 12.5Z" stroke={focused ? "#44A27B" : "white"} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<Path d="M21.0901 22.5C21.0901 18.63 17.2402 15.5 12.5002 15.5C7.76015 15.5 3.91016 18.63 3.91016 22.5" stroke={focused ? "#44A27B" : "white"} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</Svg>

  )
}
export default UserSvg;