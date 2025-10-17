import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { usePaymentIntentStore } from '../../store/usePaymentIntentStore';
import { useCreatePaymentIntent } from '../../services/mutations/PaymentMutations';
import useThemeStore from '../../store/useThemeStore';

/**
 * Debug component to show Payment Intent status and manually trigger creation
 * Only visible in development mode
 */
export const PaymentIntentDebug: React.FC = () => {
  const { themeTag } = useThemeStore();
  const isDarkMode = themeTag === 'dark';
  
  const {
    paymentIntentData,
    isLoading,
    error,
    setPaymentIntentData,
    clearPaymentIntentData,
  } = usePaymentIntentStore();

  const createPaymentIntentMutation = useCreatePaymentIntent();

  const handleManualCreate = () => {
    createPaymentIntentMutation.mutate(
      { amount: 100, currency: 'usd' },
      {
        onSuccess: (data) => {
          console.log('🔧 Manual Payment Intent created:', JSON.stringify(data, null, 2));
          setPaymentIntentData({
            id: data.id,
            client_secret: data.clientSecret,
            amount: data.amount,
            currency: data.currency,
            status: data.status,
            created_at: new Date().toISOString(),
          });
          Alert.alert('Success', 'Payment Intent created manually');
        },
        onError: (error) => {
          Alert.alert('Error', error.message);
        },
      }
    );
  };

  const handleClearData = () => {
    clearPaymentIntentData();
    Alert.alert('Cleared', 'Payment Intent data cleared');
  };

  const showDetails = () => {
    if (paymentIntentData) {
      console.log('💾 Current Payment Intent Data:', JSON.stringify(paymentIntentData, null, 2));
      Alert.alert(
        'Payment Intent Details',
        `Payment Intent ID: ${paymentIntentData.id}\n` +
        `Amount: $${(paymentIntentData.amount / 100).toFixed(2)} ${paymentIntentData.currency.toUpperCase()}\n` +
        `Status: ${paymentIntentData.status}\n` +
        `Created: ${new Date(paymentIntentData.created_at).toLocaleString()}\n` +
        `Has Client Secret: ${!!paymentIntentData.client_secret}`
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
        Payment Intent Debug
      </Text>

      <Text style={{
        fontSize: 10,
        color: isDarkMode ? '#9ca3af' : '#6b7280',
        marginBottom: 4,
      }}>
        Status: {paymentIntentData ? 'Created' : 'Not Created'}
      </Text>

      {paymentIntentData && (
        <Text style={{
          fontSize: 9,
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          marginBottom: 4,
        }}>
          ID: {paymentIntentData.id.substring(0, 20)}...
        </Text>
      )}

      {isLoading && (
        <Text style={{
          fontSize: 10,
          color: 'orange',
          marginBottom: 4,
        }}>
          Loading...
        </Text>
      )}

      {error && (
        <Text style={{
          fontSize: 10,
          color: 'red',
          marginBottom: 4,
        }}>
          Error: {error}
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
          disabled={createPaymentIntentMutation.isPending}
        >
          <Text style={{ color: 'white', fontSize: 10 }}>Create</Text>
        </TouchableOpacity>

        {paymentIntentData && (
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