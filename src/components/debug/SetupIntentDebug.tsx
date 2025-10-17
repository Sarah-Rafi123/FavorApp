import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useSetupIntentStore } from '../../store/useSetupIntentStore';
import { useCreateSetupIntent } from '../../services/mutations/SetupIntentMutations';
import useThemeStore from '../../store/useThemeStore';

/**
 * Debug component to show Setup Intent status and manually trigger creation
 * Only visible in development mode
 */
export const SetupIntentDebug: React.FC = () => {
  const { themeTag } = useThemeStore();
  const isDarkMode = themeTag === 'dark';
  
  const {
    setupIntentData,
    isSetupIntentLoading,
    setupIntentError,
    setSetupIntentData,
    clearSetupIntentData,
  } = useSetupIntentStore();

  const createSetupIntentMutation = useCreateSetupIntent();

  const handleManualCreate = () => {
    createSetupIntentMutation.mutate(undefined, {
      onSuccess: (data) => {
        setSetupIntentData(data.data);
        Alert.alert('Success', 'Setup Intent created manually');
      },
      onError: (error) => {
        Alert.alert('Error', error.message);
      },
    });
  };

  const handleClearData = () => {
    clearSetupIntentData();
    Alert.alert('Cleared', 'Setup Intent data cleared');
  };

  const showDetails = () => {
    if (setupIntentData) {
      Alert.alert(
        'Setup Intent Details',
        `Setup Intent ID: ${setupIntentData.setup_intent_id}\n` +
        `Customer ID: ${setupIntentData.customer_id}\n` +
        `Has Client Secret: ${!!setupIntentData.client_secret}`
      );
    }
  };

  // Only show in development
  if (!__DEV__) {
    return null;
  }

  return (
    <View style={{
      position: 'absolute',
      top: 100,
      right: 10,
      backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
      minWidth: 200,
      zIndex: 1000,
    }}>
      <Text style={{
        fontSize: 12,
        fontWeight: 'bold',
        color: isDarkMode ? '#ffffff' : '#000000',
        marginBottom: 8,
      }}>
        Setup Intent Debug
      </Text>

      <Text style={{
        fontSize: 10,
        color: isDarkMode ? '#9ca3af' : '#6b7280',
        marginBottom: 4,
      }}>
        Status: {setupIntentData ? 'Created' : 'Not Created'}
      </Text>

      {isSetupIntentLoading && (
        <Text style={{
          fontSize: 10,
          color: 'orange',
          marginBottom: 4,
        }}>
          Loading...
        </Text>
      )}

      {setupIntentError && (
        <Text style={{
          fontSize: 10,
          color: 'red',
          marginBottom: 4,
        }}>
          Error: {setupIntentError}
        </Text>
      )}

      <View style={{ flexDirection: 'row', gap: 4, marginTop: 8 }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#059669',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
          }}
          onPress={handleManualCreate}
          disabled={createSetupIntentMutation.isPending}
        >
          <Text style={{ color: 'white', fontSize: 10 }}>Create</Text>
        </TouchableOpacity>

        {setupIntentData && (
          <>
            <TouchableOpacity
              style={{
                backgroundColor: '#3b82f6',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
              }}
              onPress={showDetails}
            >
              <Text style={{ color: 'white', fontSize: 10 }}>Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: '#dc2626',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
              }}
              onPress={handleClearData}
            >
              <Text style={{ color: 'white', fontSize: 10 }}>Clear</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};