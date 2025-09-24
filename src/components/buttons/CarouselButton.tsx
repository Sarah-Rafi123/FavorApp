import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface CarouselButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export function CarouselButton({ title, onPress, disabled = false }: CarouselButtonProps) {
  return (
    <TouchableOpacity 
      className={`
        ${disabled ? 'bg-green-300' : 'bg-green-500'} 
        py-4 px-8 rounded-full items-center justify-center mx-10
        shadow-lg shadow-black/25
      `}
      onPress={onPress}
      disabled={disabled}
    >
      <Text className={`
        ${disabled ? 'text-green-100' : 'text-white'} 
        text-lg font-semibold
      `}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}