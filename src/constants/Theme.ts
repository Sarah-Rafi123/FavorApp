// // // //
// // 💡 Modify accordingly

const LIGHT_THEME = {
  primary: '#44A27B',

  dark_1: '#0A1B2A',
  dark_2: '#4E5969',
  dark_3: '#031625',

  gray_1: '#44A27B',
  gray_2: '#979797',
  gray_3: '#E9E9EA',
  gray_4: '#FAFAFA',

  white:'#ffffff',

  bacground_1: '#FFFFFF',
  bacground_2: '#FFF9F7',
}

const DARK_THEME = {
  primary: '#44A27B',

  dark_1: '#0A1B2A',
  dark_2: '#4E5969',
  dark_3: '#031625',

  gray_1: '#44A27B',
  gray_2: '#979797',
  gray_3: '#E9E9EA',
  gray_4: '#FAFAFA',
  
  white:'#ffffff',

  bacground_1: '#FFFFFF',
  bacground_2: '#FFF9F7',
}

export type ThemeTypes = typeof LIGHT_THEME | typeof DARK_THEME;

export { LIGHT_THEME, DARK_THEME };