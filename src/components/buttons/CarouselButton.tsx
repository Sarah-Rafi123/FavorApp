import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

interface CarouselButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export function CarouselButton({ title, onPress, disabled = false }: CarouselButtonProps) {
  return (
    <View className="items-center">
      <TouchableOpacity 
        className={`
          ${disabled ? '' : 'bg-green-500'} 
          py-5 px-12 rounded-full items-center justify-center
          shadow-lg shadow-black/25 w-full max-w-sm
        `}
        style={{
          backgroundColor: disabled ? '#95D7BB' : '#44A27B'
        }}
        onPress={onPress}
        disabled={disabled}
      >
        <Text className={`
          ${disabled ? 'text-white' : 'text-white'} 
          text-xl font-semibold
        `}>
          {title}
        </Text>
      </TouchableOpacity>
    </View>
  );
}