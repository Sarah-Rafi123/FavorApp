import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export interface ImageResult {
  uri: string;
  type: string;
  name: string;
  fileSize?: number;
}

export class ImagePickerUtils {
  
  /**
   * Opens image library with iOS-optimized settings
   */
  static async openImageLibrary(): Promise<ImageResult | null> {
    try {
      console.log('📱 Opening image library on:', Platform.OS);
      
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow photo library access to select images.'
        );
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) {
        console.log('📷 User cancelled image selection');
        return null;
      }

      const asset = result.assets[0];
      
      // Compress and resize image
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        asset.uri,
        [
          { resize: { width: 800 } }
        ],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Check file size (10MB limit)
      if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
        Alert.alert('Error', 'Image file is too large. Please choose an image smaller than 10MB.');
        return null;
      }

      console.log('✅ Image selected successfully:', {
        width: asset.width,
        height: asset.height,
        fileSize: asset.fileSize
      });

      return {
        uri: manipulatedImage.uri,
        type: 'image/jpeg',
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        fileSize: asset.fileSize,
      };

    } catch (error: any) {
      console.error('❌ Image library error:', error);
      
      Alert.alert(
        'Error', 
        'Failed to access photo library. Please try again or check app permissions.'
      );
      return null;
    }
  }

  /**
   * Opens camera with iOS-optimized settings
   */
  static async openCamera(): Promise<ImageResult | null> {
    try {
      console.log('📷 Opening camera on:', Platform.OS);
      
      // Request permissions
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow camera access to take photos.'
        );
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) {
        console.log('📷 User cancelled camera');
        return null;
      }

      const asset = result.assets[0];
      
      // Compress and resize image
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        asset.uri,
        [
          { resize: { width: 800 } }
        ],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Check file size (10MB limit)
      if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
        Alert.alert('Error', 'Image file is too large. Please try again with lower quality.');
        return null;
      }

      console.log('✅ Photo taken successfully:', {
        width: asset.width,
        height: asset.height,
        fileSize: asset.fileSize
      });

      return {
        uri: manipulatedImage.uri,
        type: 'image/jpeg',
        name: `camera_${Date.now()}.jpg`,
        fileSize: asset.fileSize,
      };

    } catch (error: any) {
      console.error('❌ Camera error:', error);
      
      Alert.alert(
        'Error', 
        'Failed to access camera. Please try again or check app permissions.'
      );
      return null;
    }
  }

  /**
   * Shows action sheet to choose between camera and gallery
   */
  static showImagePicker(
    onImageSelected: (image: ImageResult) => void,
    onCancel?: () => void
  ) {
    Alert.alert(
      'Select Image',
      'Choose how you would like to add an image',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const result = await this.openCamera();
            if (result) {
              onImageSelected(result);
            } else {
              onCancel?.();
            }
          },
        },
        {
          text: 'Photo Library',
          onPress: async () => {
            const result = await this.openImageLibrary();
            if (result) {
              onImageSelected(result);
            } else {
              onCancel?.();
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: onCancel,
        },
      ]
    );
  }
}