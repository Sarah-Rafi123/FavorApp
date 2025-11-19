import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';

interface ExportPDFModalProps {
  visible: boolean;
  onClose: () => void;
  onExport: (startDate: string, endDate: string) => Promise<void>;
  isExporting?: boolean;
}

export function ExportPDFModal({ visible, onClose, onExport, isExporting = false }: ExportPDFModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startDateError, setStartDateError] = useState('');
  const [endDateError, setEndDateError] = useState('');

  // Initialize with current year dates when modal opens
  useEffect(() => {
    if (visible) {
      const currentYear = new Date().getFullYear();
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      setStartDate(`${currentYear}-01-01`);
      setEndDate(today);
      setStartDateError('');
      setEndDateError('');
    }
  }, [visible]);

  const validateDate = (date: string) => {
    if (!date.trim()) {
      return 'Date is required';
    }
    
    // Check if it's in YYYY-MM-DD format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return 'Please use YYYY-MM-DD format (e.g., 2025-01-15)';
    }
    
    // Validate the actual date
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return 'Please enter a valid date';
    }
    
    // Check if the date components make sense
    const [year, month, day] = date.split('-').map(Number);
    if (year < 1900 || year > 2100) {
      return 'Year must be between 1900 and 2100';
    }
    if (month < 1 || month > 12) {
      return 'Month must be between 01 and 12';
    }
    if (day < 1 || day > 31) {
      return 'Day must be between 01 and 31';
    }
    
    return '';
  };

  const validateDateRange = () => {
    const startError = validateDate(startDate);
    const endError = validateDate(endDate);
    
    setStartDateError(startError);
    setEndDateError(endError);
    
    if (startError || endError) {
      return false;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      setEndDateError('End date must be after start date');
      return false;
    }
    
    const today = new Date();
    if (end > today) {
      setEndDateError('End date cannot be in the future');
      return false;
    }
    
    return true;
  };

  const handleExport = async () => {
    if (validateDateRange()) {
      await onExport(startDate, endDate);
    }
  };

  const handleDateInput = (text: string, setter: (value: string) => void) => {
    // Allow user to type freely, just limit length
    if (text.length <= 10) {
      setter(text);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-white rounded-3xl w-full max-w-md mx-4 p-6">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-black">Export PDF</Text>
            <TouchableOpacity 
              onPress={onClose}
              className="w-6 h-6 items-center justify-center"
              disabled={isExporting}
            >
              <Text className="text-black text-xl font-bold">×</Text>
            </TouchableOpacity>
          </View>

          {/* Start Date */}
          <View className="mb-6">
            <Text className="text-base font-medium text-black mb-2">
              Start Date
            </Text>
            <TextInput
              className={`border rounded-xl px-4 py-3 text-black ${startDateError ? 'border-red-500' : 'border-gray-300'}`}
              style={{ fontSize: 16, height: 50 }}
              value={startDate}
              onChangeText={(text) => handleDateInput(text, setStartDate)}
              placeholder="YYYY-MM-DD (e.g., 2025-01-01)"
              placeholderTextColor="#9CA3AF"
              maxLength={10}
              keyboardType="default"
              editable={!isExporting}
            />
            {startDateError ? (
              <Text className="text-red-500 text-sm mt-1">{startDateError}</Text>
            ) : (
              <Text className="text-gray-500 text-xs mt-1">Format: YYYY-MM-DD</Text>
            )}
          </View>

          {/* End Date */}
          <View className="mb-8">
            <Text className="text-base font-medium text-black mb-2">
              End Date
            </Text>
            <TextInput
              className={`border rounded-xl px-4 py-3 text-black ${endDateError ? 'border-red-500' : 'border-gray-300'}`}
              style={{ fontSize: 16, height: 50 }}
              value={endDate}
              onChangeText={(text) => handleDateInput(text, setEndDate)}
              placeholder="YYYY-MM-DD (e.g., 2025-10-21)"
              placeholderTextColor="#9CA3AF"
              maxLength={10}
              keyboardType="default"
              editable={!isExporting}
            />
            {endDateError ? (
              <Text className="text-red-500 text-sm mt-1">{endDateError}</Text>
            ) : (
              <Text className="text-gray-500 text-xs mt-1">Format: YYYY-MM-DD</Text>
            )}
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-x-3">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-gray-100 rounded-full py-4 border border-gray-300"
              disabled={isExporting}
            >
              <Text className="text-gray-700 text-center font-semibold text-base">Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleExport}
              className={`flex-1 bg-[#44A27B] rounded-full py-4 flex-row justify-center items-center ${isExporting ? 'opacity-50' : ''}`}
              disabled={isExporting}
            >
              {isExporting && (
                <View className="mr-2">
                  <ActivityIndicator size="small" color="white" />
                </View>
              )}
              <Text className="text-white text-center font-semibold text-base">
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}