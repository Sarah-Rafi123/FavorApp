import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StatusBar, ImageBackground, ActivityIndicator, Alert, Platform, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CarouselButton } from '../../components/buttons';
import { UpdateProfileModal } from '../../components/overlays/UpdateProfileModal';
import { ExportPDFModal } from '../../components/overlays/ExportPDFModal';
import { useProfileQuery, useStripeBalanceQuery, useUserReviewsQuery } from '../../services/queries/ProfileQueries';
import { exportProfilePDF, ExportProfileParams, ExportProfileJSONResponse } from '../../services/apis/ProfileApis';
import Toast from 'react-native-toast-message';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { PDFViewerModal } from '../../components/overlays/PDFViewerModal';
import EditSvg from '../../assets/icons/Edit';
import FilterSvg from '../../assets/icons/Filter';
import { NotificationBell } from '../../components/notifications/NotificationBell';

interface ProfileData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  phoneCall: string;
  phoneText: string;
}

export function ProfileScreen() {
  const navigation = useNavigation();
  const [activeReviewTab, setActiveReviewTab] = useState<'asked' | 'provided'>('asked');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [pdfUri, setPdfUri] = useState('');
  const { data: profileResponse, isLoading, error } = useProfileQuery();
  const { data: balanceResponse, isLoading: isBalanceLoading, error: balanceError, refetch: refetchBalance } = useStripeBalanceQuery();
  const { data: reviewsResponse, isLoading: isReviewsLoading, error: reviewsError } = useUserReviewsQuery(
    profileResponse?.data?.profile?.id || null,
    { page: 1, per_page: 10 },
    { enabled: !!profileResponse?.data?.profile?.id }
  );
  
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: 'Kathryn',
    lastName: 'Murphy',
    dateOfBirth: '8/2/2001',
    address: '4140 Parker Rd, Allentown, New Mexico 31134',
    phoneCall: '(303) 555-0105',
    phoneText: '(209) 555-0104',
  });
  
  const profile = profileResponse?.data?.profile;
  const balance = balanceResponse?.data;

  const handleUpdateProfile = (newProfileData: ProfileData) => {
    setProfileData(newProfileData);
  };

  const handleShowExportModal = () => {
    setShowExportModal(true);
  };

  const generatePDFFromData = (exportData: ExportProfileJSONResponse, startDate: string, endDate: string): string => {
    const { user, statistics } = exportData.data;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Profile Export - ${user.first_name} ${user.last_name}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #44A27B;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #44A27B;
            margin: 0;
            font-size: 28px;
          }
          .header p {
            margin: 5px 0;
            color: #666;
          }
          .section {
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
          }
          .section h2 {
            color: #44A27B;
            border-bottom: 1px solid #44A27B;
            padding-bottom: 10px;
            margin-top: 0;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
          }
          .info-item {
            display: flex;
            flex-direction: column;
          }
          .info-label {
            font-weight: bold;
            color: #666;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .info-value {
            color: #333;
            font-size: 14px;
          }
          .skills {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 10px;
          }
          .skill-tag {
            background-color: #E8F5E8;
            color: #44A27B;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          .stat-card {
            text-align: center;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 8px;
          }
          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #44A27B;
          }
          .stat-label {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
          }
          .monthly-hours {
            margin-top: 20px;
          }
          .monthly-hours table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .monthly-hours th,
          .monthly-hours td {
            padding: 8px 12px;
            text-align: left;
            border-bottom: 1px solid #e0e0e0;
          }
          .monthly-hours th {
            background-color: #44A27B;
            color: white;
            font-weight: 600;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${user.first_name} ${user.last_name}</h1>
          <p>Community Service Profile Export</p>
          <p>Period: ${startDate} to ${endDate}</p>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="section">
          <h2>Personal Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Email</div>
              <div class="info-value">${user.email}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Age</div>
              <div class="info-value">Not specified</div>
            </div>
            <div class="info-item">
              <div class="info-label">Phone (Call)</div>
              <div class="info-value">${user.phone_no_call || 'Not specified'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Phone (Text)</div>
              <div class="info-value">${user.phone_no_text || 'Not specified'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Experience</div>
              <div class="info-value">${user.years_of_experience ? `${user.years_of_experience} year${user.years_of_experience !== 1 ? 's' : ''}` : 'Not specified'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Member Since</div>
              <div class="info-value">${new Date(user.created_at).toLocaleDateString()}</div>
            </div>
          </div>
          ${user.about_me ? `
            <div class="info-item">
              <div class="info-label">About Me</div>
              <div class="info-value">${user.about_me}</div>
            </div>
          ` : ''}
          ${user.skills && user.skills.length > 0 ? `
            <div class="info-item">
              <div class="info-label">Skills</div>
              <div class="skills">
                ${user.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
              </div>
              ${user.other_skills ? `<div class="info-value" style="margin-top: 10px;"><strong>Other:</strong> ${user.other_skills}</div>` : ''}
            </div>
          ` : ''}
        </div>

        <div class="section">
          <h2>Community Service Statistics</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${statistics.favors_requested.count}</div>
              <div class="stat-label">Favors Requested</div>
              <div style="font-size: 12px; margin-top: 5px;">${statistics.favors_requested.total_hours} hours</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${statistics.favors_provided.count}</div>
              <div class="stat-label">Favors Provided</div>
              <div style="font-size: 12px; margin-top: 5px;">${statistics.favors_provided.total_hours} hours</div>
            </div>
          </div>

          ${statistics.monthly_unpaid_hours && statistics.monthly_unpaid_hours.length > 0 ? `
            <div class="monthly-hours">
              <h3>Monthly Unpaid Community Service Hours</h3>
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  ${statistics.monthly_unpaid_hours.map(item => `
                    <tr>
                      <td>${item.month}</td>
                      <td>${item.hours}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}
        </div>

        <div class="footer">
          <p>This document certifies the community service hours completed by ${user.first_name} ${user.last_name}</p>
          <p>Generated from FavorApp - Community Service Platform</p>
        </div>
      </body>
      </html>
    `;
    
    return htmlContent;
  };

  const handleExportPDF = async (startDate: string, endDate: string) => {
    setIsExporting(true);
    setIsDownloading(true);
    setDownloadProgress('Fetching export data...');
    
    try {
      const params: ExportProfileParams = {
        start_date: startDate,
        end_date: endDate,
      };

      console.log('🚀 Starting PDF export with params:', params);
      
      setDownloadProgress('Connecting to server...');
      const exportData = await exportProfilePDF(params);
      
      console.log('✅ Export data received:', exportData);
      setDownloadProgress('Generating PDF content...');
      
      // Generate HTML content from the export data
      const htmlContent = generatePDFFromData(exportData, startDate, endDate);
      
      setDownloadProgress('Creating PDF file...');
      
      // Use expo-print to convert HTML to PDF
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `Profile_${exportData.data.user.first_name || 'User'}_${startDate}_${endDate}_${timestamp}.pdf`;
      
      setDownloadProgress('Converting to PDF...');
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });
      
      console.log('✅ PDF generated at:', uri);
      setDownloadProgress('Preparing PDF viewer...');
      
      // Move the PDF to a permanent location
      const permanentUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.moveAsync({
        from: uri,
        to: permanentUri,
      });
      
      console.log('✅ PDF saved to:', permanentUri);
      setDownloadProgress('Opening PDF viewer...');
      
      // Show the PDF in the viewer
      setPdfUri(permanentUri);
      setShowPDFViewer(true);
      
      // Show success toast
      Toast.show({
        type: 'success',
        text1: 'PDF Generated! 📄',
        text2: 'Your profile has\nbeen exported as PDF',
        visibilityTime: 4000,
      });

      // Close the export modal
      setShowExportModal(false);
      
    } catch (error: any) {
      console.error('❌ PDF export failed:', error);
      
      // Show error toast
      Toast.show({
        type: 'error',
        text1: 'Export Failed',
        text2: error.message || 'Failed to export profile.\nPlease try again.',
        visibilityTime: 4000,
      });
      
      // Also show alert for better visibility
      Alert.alert(
        'Export Failed',
        error.message || 'Failed to export profile.\nPlease try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsExporting(false);
      setIsDownloading(false);
      setDownloadProgress('');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#44A27B" />
        <Text className="mt-4 text-gray-600">Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-6">
        <Text className="text-red-500 text-center mb-4">Failed to load profile</Text>
        <Text className="text-gray-600 text-center">Please check your connection and try again.</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/images/Wallpaper.png')}
      className="flex-1"
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View className="pt-16 pb-6 px-6">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-black">Profile</Text>
          <View className="flex-row gap-x-2">
            {/* <TouchableOpacity 
              className="w-10 h-10  rounded-full items-center justify-center"
              onPress={() => navigation.navigate('FilterScreen' as never)}
            >
              <FilterSvg />
            </TouchableOpacity> */}
            <NotificationBell />
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Main Profile Card */}
        <View className="mx-6 mb-6 bg-[#FBFFF0] rounded-3xl p-6 border-4 border-[#71DFB1]">
          <TouchableOpacity 
            onPress={() => setShowUpdateModal(true)}
            className="absolute top-6 right-6 w-8 h-8 items-center justify-center"
          >
            <EditSvg />
          </TouchableOpacity>

          {/* Profile Image and Name */}
          <View className="items-center mb-6">
            <View className="w-24 h-24 bg-gray-200 rounded-2xl mb-4 overflow-hidden">
              {profile?.image_url ? (
                <Image 
                  source={{ uri: profile.image_url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full bg-[#44A27B] items-center justify-center">
                  <Text className="text-white text-2xl font-bold">
                    {profile?.first_name?.[0]?.toUpperCase() || profileData.firstName[0]?.toUpperCase()}
                    {profile?.last_name?.[0]?.toUpperCase() || profileData.lastName[0]?.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <Text className="text-xl font-bold text-black mb-1">{profile?.full_name || `${profileData.firstName} ${profileData.lastName}`}</Text>
          </View>

          {/* Personal Details */}
          <View className="mb-6">
            <View className="space-y-2">
              <Text className="text-black font-bold text-lg">Email: <Text className="text-black font-normal text-lg">{profile?.email || 'kathrynmurphy@gmail.com'}</Text></Text>
              <Text className="text-black font-bold text-lg">Age: <Text className="text-black font-normal text-lg">{profile?.age || '26'}</Text></Text>
              <Text className="text-black font-bold text-lg">Call: <Text className="text-black font-normal text-lg">{profile?.phone_no_call || profileData.phoneCall}</Text></Text>
              <Text className="text-black font-bold text-lg">Text: <Text className="text-black font-normal text-lg">{profile?.phone_no_text || profileData.phoneText}</Text></Text>
              <Text className="text-black font-bold text-lg">Experience: <Text className="text-black font-normal text-lg">{profile?.years_of_experience ? `${profile.years_of_experience} year${profile.years_of_experience !== 1 ? 's' : ''}` : 'Not specified'}</Text></Text>
              <Text className="text-black font-bold text-lg">Since: <Text className="text-black font-normal text-lg">{profile?.member_since || 'March 2025'}</Text></Text>
              {profile?.address && (
                <Text className="text-black font-bold text-lg">Location: <Text className="text-black font-normal text-lg">{profile.address.city}, {profile.address.state}</Text></Text>
              )}
              {profile?.is_certified !== null && (
                <Text className="text-black font-bold text-lg">Certified: <Text className={`font-normal text-lg ${profile?.is_certified ? 'text-green-600' : 'text-gray-500'}`}>{profile?.is_certified ? 'Yes' : 'No'}</Text></Text>
              )}
            </View>
          </View>

          {/* About Me Section */}
          {profile?.about_me && (
            <View className="mb-6">
              <Text className="text-lg font-bold text-black mb-3">About Me</Text>
              <Text className="text-black font-normal text-lg leading-6">{profile.about_me}</Text>
            </View>
          )}

          {/* Skills Section */}
          {profile?.skills && profile.skills.length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-bold text-black mb-3">Skills</Text>
              <View className="flex-row flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <View key={index} className="bg-[#E8F5E8] px-3 py-1.5 rounded-full">
                    <Text className="text-[#44A27B] text-lg font-normal">{skill}</Text>
                  </View>
                ))}
              </View>
              {profile.other_skills && (
                <View className="mt-2">
                  <Text className="text-black font-bold text-lg">Other: <Text className="text-black font-normal text-lg">{profile.other_skills}</Text></Text>
                </View>
              )}
            </View>
          )}

          {/* Favor Details */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-black mb-3">Favor Details</Text>
            <View className="space-y-2">
              <Text className="text-black font-bold text-lg">Asked: <Text className="text-black font-normal">0/0:0 Hours</Text></Text>
              <Text className="text-black font-bold text-lg">Provided: <Text className="text-black font-normal">0/0:0 Hours</Text></Text>
            </View>
          </View>

          {/* Fund Details */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-bold text-black">Fund Details</Text>
              <View className="flex-row gap-2">
                {/* <TouchableOpacity 
                  onPress={() => scheduleTestNotificationWithType('favor_request', 'New Favor Request', 'John Doe wants help with moving furniture')}
                  className="px-3 py-1 bg-blue-500 rounded-full"
                >
                  <Text className="text-white text-xs font-medium">Test</Text>
                </TouchableOpacity> */}
                <TouchableOpacity 
                  onPress={() => refetchBalance()}
                  disabled={isBalanceLoading}
                  className="px-3 py-1 bg-[#44A27B] rounded-full"
                >
                  <Text className="text-white text-xs font-medium">
                    {isBalanceLoading ? 'Loading...' : 'Refresh'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            {balanceError ? (
              <View className="space-y-2">
                <Text className="text-red-500 text-lg font-normal">Failed to load balance</Text>
                <Text className="text-black font-bold text-lg">Available: <Text className="text-black font-normal">$0.00</Text></Text>
                <Text className="text-black font-bold text-lg">Pending: <Text className="text-black font-normal">$0.00</Text></Text>
              </View>
            ) : balance?.has_account ? (
              <View className="space-y-2">
                <Text className="text-black font-bold text-lg">Available: <Text className="text-green-600 font-normal">${(balance.available || 0).toFixed(2)}</Text></Text>
                <Text className="text-black font-bold text-lg">Pending: <Text className="text-orange-600 font-normal">${(balance.pending || 0).toFixed(2)}</Text></Text>
                <Text className="text-black font-bold text-lg mt-1">Total: <Text className="text-black font-normal">${((balance.available || 0) + (balance.pending || 0)).toFixed(2)} {balance.currency?.toUpperCase()}</Text></Text>
                <Text className="text-black font-normal text-lg mt-2">
                  Available funds can be withdrawn. Pending funds will be available in 2-7 days.
                </Text>
              </View>
            ) : (
              <View className="space-y-2">
                <Text className="text-black font-bold text-lg">Available: <Text className="text-black font-normal">$0.00</Text></Text>
                <Text className="text-black font-bold text-lg">Pending: <Text className="text-black font-normal">$0.00</Text></Text>
                <Text className="text-black font-normal text-lg mt-1">Set up payment account to start earning</Text>
              </View>
            )}
          </View>

          {/* Add Payment Method Button */}
          {!profile?.has_payment_method && (
            <View className="mb-4">
              <CarouselButton
                title="Add Payment Method"
                onPress={() => navigation.navigate('PaymentMethodScreen' as never)}
              />
            </View>
          )}

          {/* Export PDF Section */}
          <View className="bg-[#DCFBCC] rounded-2xl p-4">
            <Text className="text-center text-black font-normal text-lg mb-3">
              Export your free community service hours as a PDF
            </Text>
            <TouchableOpacity 
              className="bg-transparent border-2 border-[#44A27B] rounded-full py-3"
              onPress={handleShowExportModal}
            >
              <Text className="text-center text-[#44A27B] font-semibold">Export PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Review Section */}
        <View className="mx-4">
          <Text className="text-xl font-bold text-black mb-4">Review</Text>
          
          <View className="flex-row p-2 bg-white rounded-full shadow-lg mb-4">
            <TouchableOpacity 
              className={`flex-1 py-2.5 items-center ${
                activeReviewTab === 'asked' ? 'bg-[#44A27B] rounded-full' : ''
              }`}
              onPress={() => setActiveReviewTab('asked')}
            >
              <Text className={`font-semibold text-sm ${
                activeReviewTab === 'asked' ? 'text-white' : 'text-gray-600'
              }`}>
                Favor Asked
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className={`flex-1 py-2.5 items-center ${
                activeReviewTab === 'provided' ? 'bg-[#44A27B] rounded-full' : ''
              }`}
              onPress={() => setActiveReviewTab('provided')}
            >
              <Text className={`font-semibold text-sm ${
                activeReviewTab === 'provided' ? 'text-white' : 'text-gray-600'
              }`}>
                Favor Provided
              </Text>
            </TouchableOpacity>
          </View>

{isReviewsLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="small" color="#44A27B" />
              <Text className="text-gray-500 text-sm mt-2">Loading reviews...</Text>
            </View>
          ) : reviewsError ? (
            <View className="items-center py-8">
              <Text className="text-red-500 text-sm">Failed to load reviews</Text>
              <Text className="text-gray-500 text-xs mt-1">Please check your connection and try again</Text>
            </View>
          ) : reviewsResponse?.data?.reviews && reviewsResponse.data.reviews.length > 0 ? (
            <View>
              {/* Review Statistics */}
              <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                <View className="flex-row justify-between items-center">
                  <View className="items-center">
                    <Text className="text-2xl font-bold text-[#44A27B]">
                      {reviewsResponse.data.statistics.average_rating.toFixed(1)}
                    </Text>
                    <Text className="text-gray-600 text-xs">Average Rating</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-2xl font-bold text-[#44A27B]">
                      {reviewsResponse.data.statistics.total_reviews}
                    </Text>
                    <Text className="text-gray-600 text-xs">Total Reviews</Text>
                  </View>
                </View>
              </View>
              
              {/* Reviews List */}
              <View className="space-y-3">
                {reviewsResponse.data.reviews.map((review) => (
                  <View key={review.id} className="bg-white rounded-2xl p-4 shadow-sm">
                    {/* Reviewer Info */}
                    <View className="flex-row items-center mb-3">
                      <View className="w-10 h-10 bg-[#44A27B] rounded-full items-center justify-center">
                        <Text className="text-white text-sm font-bold">
                          {review.given_by.first_name[0]}{review.given_by.last_name[0]}
                        </Text>
                      </View>
                      <View className="flex-1 ml-3">
                        <View className="flex-row items-center justify-between">
                          <Text className="font-semibold text-black">{review.given_by.full_name}</Text>
                          {review.given_by.is_certified && (
                            <View className="bg-green-100 px-2 py-0.5 rounded-full">
                              <Text className="text-green-600 text-xs font-medium">Certified</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-gray-500 text-xs">
                          {new Date(review.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Rating */}
                    <View className="flex-row items-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Text 
                          key={star} 
                          className={`text-lg ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </Text>
                      ))}
                      <Text className="ml-2 text-gray-600 text-sm">({review.rating}/5)</Text>
                    </View>
                    
                    {/* Review Description */}
                    {review.description && (
                      <Text className="text-black text-sm leading-5 mb-2">
                        {review.description}
                      </Text>
                    )}
                    
                    {/* Favor Info */}
                    {review.favor && (
                      <View className="bg-gray-50 rounded-lg p-2 mt-2">
                        <Text className="text-gray-600 text-xs">For favor:</Text>
                        <Text className="text-black text-sm font-medium">{review.favor.title}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
              
              {/* Pagination Info */}
              {reviewsResponse.data.meta.total_pages > 1 && (
                <View className="items-center mt-4 py-3">
                  <Text className="text-gray-500 text-xs">
                    Showing {reviewsResponse.data.reviews.length} of {reviewsResponse.data.meta.total_count} reviews
                  </Text>
                  {reviewsResponse.data.meta.next_page && (
                    <Text className="text-[#44A27B] text-xs mt-1">Tap to load more</Text>
                  )}
                </View>
              )}
            </View>
          ) : (
            <View className="items-center py-8">
              <Text className="text-gray-500 text-sm">No reviews yet</Text>
              <Text className="text-gray-400 text-xs mt-1">Reviews will appear here once you complete favors</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <UpdateProfileModal
        visible={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onUpdate={handleUpdateProfile}
        initialData={profileData}
      />

      <ExportPDFModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExportPDF}
        isExporting={isExporting}
      />

      {/* Download Progress Modal */}
      <Modal
        visible={isDownloading}
        transparent={true}
        animationType="fade"
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-center items-center">
          <View className="bg-white rounded-2xl p-8 mx-8 items-center shadow-lg">
            <ActivityIndicator size="large" color="#44A27B" />
            <Text className="text-lg font-semibold text-gray-800 mt-4 mb-2">
              Downloading PDF
            </Text>
            <Text className="text-sm text-gray-600 text-center">
              {downloadProgress}
            </Text>
            <View className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <View 
                className="bg-[#44A27B] h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: downloadProgress === 'Generating PDF...' ? '20%' :
                        downloadProgress === 'Connecting to server...' ? '40%' :
                        downloadProgress === 'Processing PDF...' ? '60%' :
                        downloadProgress === 'Converting PDF...' ? '70%' :
                        downloadProgress === 'Preparing download...' ? '80%' :
                        downloadProgress === 'Saving to device...' ? '90%' :
                        downloadProgress === 'Opening PDF viewer...' ? '95%' :
                        downloadProgress === 'Download complete!' ? '100%' : '10%'
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* PDF Viewer Modal */}
      <PDFViewerModal
        visible={showPDFViewer}
        onClose={() => {
          setShowPDFViewer(false);
          setPdfUri('');
        }}
        pdfUri={pdfUri}
        fileName={`Profile_${profile?.first_name || 'User'}_${new Date().toISOString().split('T')[0]}.pdf`}
      />
    </ImageBackground>
  );
}