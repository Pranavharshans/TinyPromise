import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar,
  FlatList,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = 320;
const CARD_PADDING = 32;
const TEXT_HORIZONTAL_PADDING = 8;
const BUTTON_HEIGHT = 64;
const CONTENT_PADDING = 24;

interface OnboardingItem {
  id: string;
  title: string;
  subtitle: string;
  image: any;
}

const onboardingData: OnboardingItem[] = [
  {
    id: '1',
    title: 'Build Habits 3 Days at a Time',
    subtitle: 'Start small and achieve more. Our 3-day approach makes building habits easy.',
    image: require('../assets/images/ob1.png')
  },
  {
    id: '2',
    title: 'Smart Reminders',
    subtitle: 'Stay on track with timely notifications. We\'ll help you remember your commitments at the right time.',
    image: require('../assets/images/ob2.png')
  },
  {
    id: '3',
    title: 'Earn Achievement Badges',
    subtitle: 'Celebrate your progress with badges and rewards as you complete each streak.',
    image: require('../assets/images/ob3.png')
  }
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const handleContinue = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true
      });
    } else {
      router.push('/');
    }
  };

  const handleSkip = () => {
    router.push('/');
  };

  const renderItem = ({ item }: { item: OnboardingItem }) => (
    <View style={styles.slide}>
      <View style={styles.contentContainer}>
        <View style={styles.imageWrapper}>
          <View style={styles.imageContainer}>
            <Image
              source={item.image}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardInner}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.button}
                onPress={handleContinue}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>
                  {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Continue'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <TouchableOpacity 
        style={styles.skipButton} 
        onPress={handleSkip}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
      />

      <View style={styles.pagination}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.paginationDotActive
            ]}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  slide: {
    width,
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  skipText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  imageWrapper: {
    height: height * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  imageContainer: {
    width: width * 0.8,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    width: width * 0.9,
    height: CARD_HEIGHT,
  },
  cardInner: {
    flex: 1,
    padding: CARD_PADDING,
  },
  textContainer: {
    flex: 1,
    marginBottom: CONTENT_PADDING,
    paddingHorizontal: TEXT_HORIZONTAL_PADDING,
  },
  buttonContainer: {
    height: BUTTON_HEIGHT,
  },
  title: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#FFF',
    opacity: 0.9,
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
  },
  button: {
    backgroundColor: '#4F46E5',
    height: BUTTON_HEIGHT,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#4F46E5',
    width: 24,
  },
});
