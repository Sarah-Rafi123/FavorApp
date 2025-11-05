import React from 'react';
import { View, Text, TouchableOpacity, Modal, StatusBar, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';

interface PDFViewerModalProps {
  visible: boolean;
  onClose: () => void;
  pdfUri: string;
  fileName: string;
}

export function PDFViewerModal({ visible, onClose, pdfUri, fileName }: PDFViewerModalProps) {
  const handleOpenExternal = async () => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Open PDF with...',
        });
      } else {
        Alert.alert(
          'Sharing Not Available',
          'File sharing is not available on this device.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error sharing PDF:', error);
      Alert.alert(
        'Error',
        'Could not open the PDF file. The file has been saved to your device.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="pt-12 pb-4 px-4 bg-white border-b border-gray-200">
          <View className="flex-row justify-between items-center">
            <View className="flex-1 pt-8 ">
              <Text className="text-lg font-semibold text-gray-800" numberOfLines={1}>
                {fileName}
              </Text>
              <Text className="text-sm text-gray-500">
                Profile Export PDF
              </Text>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={handleOpenExternal}
                className="px-3 py-2 rounded-xl bg-[#44A27B]"
              >
                <Text className="text-white text-sm font-medium">Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onClose}
                className="px-3 py-2 bg-gray-100 rounded-xl"
              >
                <Text className="text-gray-800  text-sm font-medium">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* PDF Content */}
        <View className="flex-1 justify-center items-center p-8">
          <View className="items-center">
            <Text className="text-6xl mb-4">📄</Text>
            <Text className="text-xl font-semibold text-gray-800 mb-2 text-center">
              PDF Generated Successfully!
            </Text>
            <Text className="text-gray-600 text-center mb-6 leading-6">
              Your profile PDF has been saved to your device. Tap "Share" to view it in your preferred PDF viewer app or share it with others.
            </Text>
            <TouchableOpacity
              onPress={handleOpenExternal}
              className="bg-[#44A27B] px-8 py-4 rounded-xl mb-4"
            >
              <Text className="text-white font-semibold text-lg">
                Share PDF
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-100 px-6 py-3 rounded-xl"
            >
              <Text className="text-gray-800 font-medium">
                Close
              </Text>
            </TouchableOpacity>
            <Text className="text-gray-500 text-sm mt-4 text-center">
              File saved as: {fileName}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}