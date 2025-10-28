import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ImageBackground,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import BackSvg from '../../assets/icons/Back';

interface FAQScreenProps {
  navigation?: any;
}


const PlusIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <Path
      d="M10 4V16M4 10H16"
      stroke="#374151"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const MinusIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <Path
      d="M4 10H16"
      stroke="#374151"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "Why is my Stripe payment taking so long?",
    answer: "Stripe has a mandatory 7 day waiting period for all first time transactions. After your first transaction, Stripe will release funds as desired. The waiting period is to ensure no initial fraud, incorrect banking, and overall protection of the customers."
  },
  {
    id: 2,
    question: "Once a favor is accepted, will the address of the Favor show on the main screen along with contact info?",
    answer: "Yes, once a favor is accepted, the address and contact information will be displayed on the main screen. If this feature is not currently available, we will be adding the address display functionality to improve the user experience."
  },
  {
    id: 3,
    question: "Why am I charged 15% to the final amount?",
    answer: "FavorApp charges 15% to ensure we can keep the platform running and maintain a marketplace for everyone to use. Other similar platforms charge 30-40% but we believe in keeping charges minimal for our community."
  },
  {
    id: 4,
    question: "What to do if my favor costs a lot of money and I dont want to pay the 15% admin fee?",
    answer: "We encourage that the favor amount is paid through our online system, however, if you are also paying for materials for a contractor/handyman we recommend going offline to pay for materials to save you money and only pay for the labor through our platform."
  },
  {
    id: 5,
    question: "If I am doing a favor, will my final amount be taxed?",
    answer: "No, if you are completing a favor and are being paid for it, you will receive the exact amount that is posted and tipped at the end of the transaction."
  },
  {
    id: 6,
    question: "Will there be an app to download in the iOS and Android store?",
    answer: "Yes, our next goal is to develop the iOS and Android app by mid year of 2025."
  }
];

export function FAQScreen({ navigation }: FAQScreenProps) {
  const [expandedItems, setExpandedItems] = useState<number[]>([]); // All questions closed by default

  const toggleExpand = (id: number) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const FAQItem = ({ item }: { item: FAQItem }) => {
    const isExpanded = expandedItems.includes(item.id);
    
    return (
      <View className="mb-4 border border-gray-300 rounded-xl bg-transparent">
        <TouchableOpacity
          className="px-4 py-4 flex-row justify-between items-center"
          onPress={() => toggleExpand(item.id)}
        >
          <Text className="flex-1 text-base font-medium text-gray-800 mr-3">
            Q{item.id}. {item.question}
          </Text>
          {isExpanded ? <MinusIcon /> : <PlusIcon />}
        </TouchableOpacity>
        
        {isExpanded && (
          <View className="px-4 pb-4">
            <Text className="text-sm text-gray-600 leading-6">
              {item.answer}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ImageBackground
      source={require('../../assets/images/Wallpaper.png')}
      className="flex-1"
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View className="pt-16 pb-6 px-6">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="mr-4"
            onPress={() => navigation?.goBack()}
          >
            <BackSvg />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-black">FAQ</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-6 pt-6">
          {faqData.map((item) => (
            <FAQItem key={item.id} item={item} />
          ))}   
        </View>
      </ScrollView>
    </ImageBackground>
  );
}