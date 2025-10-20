import { axiosInstance } from '../axiosConfig';
import { ProfileResponse } from '../../types';

export const getProfile = async (): Promise<ProfileResponse> => {
  console.log(`[INIT] => /profile`);
  const response = await axiosInstance.get('/profile');
  console.log(`[OK] => /profile`);
  return response.data;
};