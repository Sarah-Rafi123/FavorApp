import React, { useState } from 'react';
import { HomeMapScreen } from './HomeMapScreen';
import { HomeListScreen } from './HomeListScreen';

interface HomeScreenProps {
  navigation: any;
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  const handleFilter = () => {
    navigation.navigate('FilterScreen');
  };

  const handleNotifications = () => {
    navigation.navigate('NotificationsScreen');
  };

  if (viewMode === 'list') {
    return (
      <HomeListScreen
        onMapView={() => setViewMode('map')}
        onFilter={handleFilter}
        onNotifications={handleNotifications}
        navigation={navigation}
      />
    );
  }

  return (
    <HomeMapScreen
      onListView={() => setViewMode('list')}
      onFilter={handleFilter}
      onNotifications={handleNotifications}
      navigation={navigation}
    />
  );
}