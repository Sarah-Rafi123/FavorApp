import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import useThemeStore from '../../store/useThemeStore';
import { usePaymentMethods } from '../../services/queries/PaymentMethodQueries';
import { useDeletePaymentMethod } from '../../services/mutations/PaymentMethodMutations';
import { PaymentMethod } from '../../services/apis/PaymentMethodApis';

interface PaymentMethodsListProps {
  onAddPaymentMethod?: () => void;
  showAddButton?: boolean;
}

export const PaymentMethodsList: React.FC<PaymentMethodsListProps> = ({
  onAddPaymentMethod,
  showAddButton = true,
}) => {
  const { themeTag } = useThemeStore();
  const isDarkMode = themeTag === 'dark';
  
  const { data: paymentMethodsData, isLoading, error, refetch } = usePaymentMethods();
  const deletePaymentMethodMutation = useDeletePaymentMethod();

  const styles = StyleSheet.create({
    container: {
      padding: 16,
      borderRadius: 12,
      margin: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: isDarkMode ? '#ffffff' : '#000000',
    },
    addButton: {
      backgroundColor: '#059669',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    addButtonText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '500',
    },
    paymentMethodCard: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    cardInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    cardIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    cardDetails: {
      flex: 1,
    },
    cardBrand: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 2,
    },
    cardExpiry: {
      fontSize: 14,
    },
    defaultBadge: {
      backgroundColor: '#059669',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    defaultBadgeText: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: '500',
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    holderName: {
      fontSize: 14,
      flex: 1,
    },
    deleteButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: '#dc2626',
    },
    deleteButtonText: {
      color: '#dc2626',
      fontSize: 14,
      fontWeight: '500',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 32,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyDescription: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 20,
    },
    loadingText: {
      textAlign: 'center',
      fontSize: 16,
      paddingVertical: 32,
    },
    errorText: {
      textAlign: 'center',
      fontSize: 16,
      marginBottom: 16,
    },
    retryButton: {
      backgroundColor: '#059669',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      alignSelf: 'center',
    },
    retryButtonText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '500',
    },
  });

  const handleDeletePaymentMethod = (paymentMethod: PaymentMethod) => {
    Alert.alert(
      'Remove Payment Method',
      `Are you sure you want to remove the ${paymentMethod.card.brand.toUpperCase()} card ending in ${paymentMethod.card.last4}?${paymentMethod.is_default ? '\n\nNote: This is your default payment method.' : ''}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            deletePaymentMethodMutation.mutate(paymentMethod.id);
          },
        },
      ]
    );
  };

  const getCardIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      default:
        return '💳';
    }
  };

  const formatExpiryDate = (month: number, year: number) => {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  };

  const PaymentMethodCard: React.FC<{ paymentMethod: PaymentMethod }> = ({ paymentMethod }) => (
    <View style={[
      styles.paymentMethodCard,
      { 
        backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
        borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
      }
    ]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardIcon}>{getCardIcon(paymentMethod.card.brand)}</Text>
          <View style={styles.cardDetails}>
            <Text style={[
              styles.cardBrand,
              { color: isDarkMode ? '#ffffff' : '#000000' }
            ]}>
              {paymentMethod.card.brand.toUpperCase()} •••• {paymentMethod.card.last4}
            </Text>
            <Text style={[
              styles.cardExpiry,
              { color: isDarkMode ? '#9ca3af' : '#6b7280' }
            ]}>
              Expires {formatExpiryDate(paymentMethod.card.exp_month, paymentMethod.card.exp_year)}
            </Text>
          </View>
        </View>
        
        {paymentMethod.is_default && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>Default</Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <Text style={[
          styles.holderName,
          { color: isDarkMode ? '#9ca3af' : '#6b7280' }
        ]}>
          {paymentMethod.billing_details.name || 'No name provided'}
        </Text>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeletePaymentMethod(paymentMethod)}
          disabled={deletePaymentMethodMutation.isPending}
        >
          <Text style={styles.deleteButtonText}>
            {deletePaymentMethodMutation.isPending ? 'Removing...' : 'Remove'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#1a1a1a' : '#f9fafb' }
      ]}>
        <Text style={[
          styles.loadingText,
          { color: isDarkMode ? '#9ca3af' : '#6b7280' }
        ]}>
          Loading payment methods...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#1a1a1a' : '#f9fafb' }
      ]}>
        <Text style={[
          styles.errorText,
          { color: isDarkMode ? '#ef4444' : '#dc2626' }
        ]}>
          Failed to load payment methods
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const paymentMethods = paymentMethodsData?.data.payment_methods || [];
  const hasPaymentMethods = paymentMethods.length > 0;

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDarkMode ? '#1a1a1a' : '#f9fafb' }
    ]}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Methods</Text>
        {showAddButton && (
          <TouchableOpacity style={styles.addButton} onPress={onAddPaymentMethod}>
            <Text style={styles.addButtonText}>+ Add Card</Text>
          </TouchableOpacity>
        )}
      </View>

      {hasPaymentMethods ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {paymentMethods.map((paymentMethod) => (
            <PaymentMethodCard key={paymentMethod.id} paymentMethod={paymentMethod} />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💳</Text>
          <Text style={[
            styles.emptyTitle,
            { color: isDarkMode ? '#ffffff' : '#000000' }
          ]}>
            No Payment Methods
          </Text>
          <Text style={[
            styles.emptyDescription,
            { color: isDarkMode ? '#9ca3af' : '#6b7280' }
          ]}>
            You haven't added any payment methods yet.{'\n'}Add a card to get started with payments.
          </Text>
          {showAddButton && (
            <TouchableOpacity style={styles.addButton} onPress={onAddPaymentMethod}>
              <Text style={styles.addButtonText}>Add Your First Card</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};