declare module 'react-native-image-crop-picker' {
  export interface ImageOrVideo {
    path: string;
    size: number;
    mime: string;
    width: number;
    height: number;
    filename?: string;
  }

  export interface Options {
    width?: number;
    height?: number;
    cropping?: boolean;
    compressImageQuality?: number;
    mediaType?: 'photo' | 'video' | 'any';
    includeBase64?: boolean;
  }

  export default class ImagePicker {
    static openPicker(options: Options): Promise<ImageOrVideo>;
    static openCamera(options: Options): Promise<ImageOrVideo>;
    static clean(): Promise<void>;
  }
}