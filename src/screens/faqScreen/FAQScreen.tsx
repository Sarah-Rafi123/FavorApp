import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface FAQScreenProps {
  navigation?: any;
}

const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M12 19L5 12L12 5"
      stroke="#374151"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

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
    question: "What is Lorem Ipsum?",
    answer: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book."
  },
  {
    id: 2,
    question: "Why do we use it?",
    answer: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English."
  },
  {
    id: 3,
    question: "Where does it come from?",
    answer: "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage."
  },
  {
    id: 4,
    question: "Where can I get some?",
    answer: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet."
  },
  {
    id: 5,
    question: "How do I create an account?",
    answer: "To create an account, tap the 'Sign Up' button on the login screen, fill in your details including email and password, verify your email address, and complete your profile setup."
  },
  {
    id: 6,
    question: "How do I request a favor?",
    answer: "To request a favor, go to the 'Provide Favor' tab, tap 'Ask Favor', fill out the form with your request details, set the priority and timeframe, and submit your request to the community."
  }
];

export function FAQScreen({ navigation }: FAQScreenProps) {
  const [expandedItems, setExpandedItems] = useState<number[]>([4]); // Q4 is expanded by default as shown in image

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
      <View className="mb-3">
        <TouchableOpacity
          className="bg-white rounded-xl px-4 py-4 flex-row justify-between items-center"
          onPress={() => toggleExpand(item.id)}
        >
          <Text className="flex-1 text-base font-medium text-gray-800 mr-3">
            Q{item.id}. {item.question}
          </Text>
          {isExpanded ? <MinusIcon /> : <PlusIcon />}
        </TouchableOpacity>
        
        {isExpanded && (
          <View className="bg-white rounded-xl mt-1 px-4 py-4">
            <Text className="text-sm text-gray-600 leading-6">
              {item.answer}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-green-50">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View className="pt-16 pb-6 px-6 bg-green-200">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="mr-4 p-2"
            onPress={() => navigation?.goBack()}
          >
            <BackIcon />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">FAQ</Text>
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
          
          {/* Need More Help Section */}
          <View className="mt-8 bg-white rounded-2xl p-6">
            <Text className="text-lg font-bold text-gray-800 mb-3">Still Need Help?</Text>
            <Text className="text-sm text-gray-600 mb-4">
              Can't find the answer you're looking for? Our support team is here to help you.
            </Text>
            <TouchableOpacity 
              className="bg-green-500 rounded-xl py-3"
              onPress={() => navigation?.navigate('HelpSupportScreen')}
            >
              <Text className="text-white text-center font-semibold">
                Contact Support
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}