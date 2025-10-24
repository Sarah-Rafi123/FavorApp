import { axiosInstance } from '../axiosConfig';

// Escrow Transaction Types
export enum EscrowStatus {
  PENDING = 'pending',           // Payment authorized, funds held
  CONFIRMED = 'confirmed',       // Provider accepted, funds secured  
  IN_PROGRESS = 'in_progress',   // Work in progress
  DISPUTED = 'disputed',         // Dispute raised
  RELEASED = 'released',         // Funds released to provider
  REFUNDED = 'refunded',         // Funds returned to requester
  EXPIRED = 'expired'            // Favor expired, funds returned
}

export enum EscrowTransactionType {
  FAVOR_PAYMENT = 'favor_payment',
  TIP_PAYMENT = 'tip_payment',
  REFUND = 'refund',
  DISPUTE_RESOLUTION = 'dispute_resolution'
}

export interface EscrowTransaction {
  id: string;
  favor_id: number;
  requester_id: number;
  provider_id?: number;
  amount: number;
  currency: string;
  type: EscrowTransactionType;
  status: EscrowStatus;
  payment_intent_id: string;
  stripe_charge_id?: string;
  platform_fee: number;
  provider_amount: number;
  escrow_hold_until?: string;
  dispute_reason?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
  released_at?: string;
  refunded_at?: string;
}

export interface EscrowDisputeRequest {
  reason: string;
  description: string;
  evidence_urls?: string[];
}

export interface EscrowResolutionRequest {
  resolution: 'release_to_provider' | 'refund_to_requester' | 'partial_release';
  provider_amount?: number;
  refund_amount?: number;
  resolution_notes: string;
}

// API Response Types
export interface GetEscrowTransactionResponse {
  success: boolean;
  data: {
    transaction: EscrowTransaction;
  };
  message?: string;
}

export interface ListEscrowTransactionsResponse {
  success: boolean;
  data: {
    transactions: EscrowTransaction[];
    meta: {
      current_page: number;
      per_page: number;
      total_pages: number;
      total_count: number;
    };
  };
  message?: string;
}

export interface CreateDisputeResponse {
  success: boolean;
  data: {
    transaction: EscrowTransaction;
    dispute_id: string;
  };
  message: string;
}

export interface ResolveDisputeResponse {
  success: boolean;
  data: {
    transaction: EscrowTransaction;
    resolution_details: {
      provider_amount?: number;
      refund_amount?: number;
      platform_fee_refunded?: number;
    };
  };
  message: string;
}

// Escrow API Implementation
export const EscrowApis = {
  // 1. Get Escrow Transaction Details
  getEscrowTransaction: async (favorId: number): Promise<GetEscrowTransactionResponse> => {
    try {
      console.log('🚀 Making Get Escrow Transaction API call to: /favors/' + favorId + '/escrow');
      const response = await axiosInstance.get(`/favors/${favorId}/escrow`);
      
      console.log('🎉 Get Escrow Transaction API Success!');
      console.log('📊 Response Status:', response.status);
      console.log('📄 Full API Response:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Get Escrow Transaction API Error!');
      console.error('📄 Full API Error:', error);
      console.error('📊 Error Response Status:', error.response?.status);
      console.error('📄 Error Response Data:', JSON.stringify(error.response?.data, null, 2));
      
      if (error.response?.status === 404) {
        throw new Error('Escrow transaction not found');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to load escrow transaction. Please try again.');
      }
    }
  },

  // 2. List User's Escrow Transactions
  listEscrowTransactions: async (params?: {
    status?: EscrowStatus[];
    type?: EscrowTransactionType[];
    page?: number;
    per_page?: number;
  }): Promise<ListEscrowTransactionsResponse> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.status) {
        params.status.forEach(s => queryParams.append('status[]', s));
      }
      if (params?.type) {
        params.type.forEach(t => queryParams.append('type[]', t));
      }
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString());

      const url = `/escrow/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      console.log('🚀 Making List Escrow Transactions API call to:', url);
      const response = await axiosInstance.get(url);
      
      console.log('🎉 List Escrow Transactions API Success!');
      console.log('📊 Response Status:', response.status);
      console.log('📄 Transaction Count:', response.data.data.transactions.length);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ List Escrow Transactions API Error!');
      console.error('📄 Full API Error:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to load escrow transactions. Please try again.');
      }
    }
  },

  // 3. Create Dispute
  createDispute: async (favorId: number, data: EscrowDisputeRequest): Promise<CreateDisputeResponse> => {
    try {
      console.log('🚀 Making Create Dispute API call to: /favors/' + favorId + '/escrow/dispute');
      console.log('📤 Request Data:', JSON.stringify(data, null, 2));
      
      const response = await axiosInstance.post(`/favors/${favorId}/escrow/dispute`, data);
      
      console.log('🎉 Create Dispute API Success!');
      console.log('📊 Response Status:', response.status);
      console.log('📄 Full API Response:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Create Dispute API Error!');
      console.error('📄 Full API Error:', error);
      
      if (error.response?.status === 422) {
        const errorData = error.response?.data;
        if (errorData?.errors?.includes('Dispute already exists for this transaction')) {
          throw new Error('A dispute has already been raised for this favor');
        } else if (errorData?.errors?.includes('Cannot dispute completed transaction')) {
          throw new Error('Cannot dispute a completed transaction');
        } else {
          throw new Error(errorData?.message || 'Cannot create dispute at this time.');
        }
      } else if (error.response?.status === 403) {
        throw new Error('You are not authorized to dispute this transaction.');
      } else if (error.response?.status === 404) {
        throw new Error('Escrow transaction not found.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to create dispute. Please try again.');
      }
    }
  },

  // 4. Resolve Dispute (Admin only)
  resolveDispute: async (favorId: number, data: EscrowResolutionRequest): Promise<ResolveDisputeResponse> => {
    try {
      console.log('🚀 Making Resolve Dispute API call to: /favors/' + favorId + '/escrow/resolve');
      console.log('📤 Request Data:', JSON.stringify(data, null, 2));
      
      const response = await axiosInstance.post(`/favors/${favorId}/escrow/resolve`, data);
      
      console.log('🎉 Resolve Dispute API Success!');
      console.log('📊 Response Status:', response.status);
      console.log('📄 Full API Response:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Resolve Dispute API Error!');
      console.error('📄 Full API Error:', error);
      
      if (error.response?.status === 422) {
        const errorData = error.response?.data;
        throw new Error(errorData?.message || 'Cannot resolve dispute at this time.');
      } else if (error.response?.status === 403) {
        throw new Error('You are not authorized to resolve disputes.');
      } else if (error.response?.status === 404) {
        throw new Error('Dispute not found.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to resolve dispute. Please try again.');
      }
    }
  },

  // 5. Manual Release (Emergency/Admin)
  manualRelease: async (favorId: number, data: { reason: string }): Promise<GetEscrowTransactionResponse> => {
    try {
      console.log('🚀 Making Manual Release API call to: /favors/' + favorId + '/escrow/manual_release');
      const response = await axiosInstance.post(`/favors/${favorId}/escrow/manual_release`, data);
      
      console.log('🎉 Manual Release API Success!');
      return response.data;
    } catch (error: any) {
      console.error('❌ Manual Release API Error!');
      throw new Error(error.response?.data?.message || 'Failed to manually release funds.');
    }
  },

  // 6. Cancel Escrow (Before provider acceptance)
  cancelEscrow: async (favorId: number): Promise<GetEscrowTransactionResponse> => {
    try {
      console.log('🚀 Making Cancel Escrow API call to: /favors/' + favorId + '/escrow/cancel');
      const response = await axiosInstance.post(`/favors/${favorId}/escrow/cancel`);
      
      console.log('🎉 Cancel Escrow API Success!');
      return response.data;
    } catch (error: any) {
      console.error('❌ Cancel Escrow API Error!');
      
      if (error.response?.status === 422) {
        throw new Error('Cannot cancel escrow at this stage of the favor.');
      } else {
        throw new Error(error.response?.data?.message || 'Failed to cancel escrow transaction.');
      }
    }
  }
};