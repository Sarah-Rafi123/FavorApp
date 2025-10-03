import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { CarouselButton } from '../../components/buttons';

const { width: screenWidth } = Dimensions.get('window');

interface CarouselItem {
  id: string;
  title: string;
  description: string;
}

const carouselData: CarouselItem[] = [
  {
    id: '1',
    title: 'Welcome to FavorApp',
    description: 'Connect with your neighbors and community to share favors and build lasting relationships.',
  },
  {
    id: '2',
    title: 'Request or Offer Help',
    description: 'Easily request assistance or offer your skills to help others in your community.',
  },
  {
    id: '3',
    title: 'Trusted Connections',
    description: 'Build trust through verified profiles and community recommendations.',
  },
  {
    id: '4',
    title: 'Give Back, Track Hours',
    description: 'Monitor your community service hours and see the positive impact you make.',
  },
];


interface CarouselScreenProps {
  onComplete: () => void;
}

export function CarouselScreen({ onComplete }: CarouselScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Auto-advance carousel every 4 seconds with smoother timing
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % carouselData.length;
        flatListRef.current?.scrollToIndex({ 
          index: nextIndex, 
          animated: true,
          viewPosition: 0.5
        });
        return nextIndex;
      });
    }, 4000); // Increased to 4 seconds for better UX

    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    onComplete();
  };

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setCurrentIndex(roundIndex);
  };

  const renderCarouselItem = ({ item }: { item: CarouselItem }) => (
    <View 
      className="flex-1 justify-between items-center px-8 pt-20 pb-20"
      style={{ width: screenWidth }}
    >
      <View className="flex-1 justify-center items-center mt-10">
        <Image 
          source={require('../../../assets/people.png')} 
          className="w-80 h-72"
          resizeMode="contain"
        />
      </View>
      
      <View className="items-center mb-10">
        <Text className="text-3xl font-bold text-center mb-4 text-black">
          {item.title}
        </Text>
        <Text className="text-base text-gray-700 text-center leading-6 px-5">
          {item.description}
        </Text>
      </View>
      
      <View className="w-full mb-8">
        <CarouselButton
          title="Get Started"
          onPress={handleGetStarted}
        />
      </View>
      
      <View className="flex-row justify-center items-center">
        {carouselData.map((_, index) => (
          <TouchableOpacity
            key={index}
            className={`
              w-2 h-2 rounded-full mx-1
              ${index === currentIndex 
                ? 'w-3 h-3' 
                : 'bg-white/50'
              }
            `}
            style={{
              backgroundColor: index === currentIndex ? '#44A27B' : 'rgba(255, 255, 255, 0.5)'
            }}
            onPress={() => {
              setCurrentIndex(index);
              flatListRef.current?.scrollToIndex({ 
                index, 
                animated: true,
                viewPosition: 0.5
              });
            }}
          />
        ))}
      </View>
    </View>
  );

  return (
    <ImageBackground 
      source={require('../../../assets/Wallpaper.png')} 
      className="flex-1 w-full h-full"
      resizeMode="cover"
    >
      <View className="flex-1">
        <FlatList
          ref={flatListRef}
          data={carouselData}
          renderItem={renderCarouselItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          decelerationRate="fast"
          snapToInterval={screenWidth}
          snapToAlignment="center"
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          removeClippedSubviews={false}
          scrollEventThrottle={16}
        />
      </View>
    </ImageBackground>
  );
}
