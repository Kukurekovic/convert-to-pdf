import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  type ListRenderItem,
} from 'react-native';
import { RF, RS } from '../utils/responsive';
import { theme } from '../theme/theme';
import i18n from '../i18n';

interface UserReviewsCarouselProps {
  autoScrollInterval?: number;
}

interface ReviewItem {
  id: string;
  text: string;
}

export default function UserReviewsCarousel({
  autoScrollInterval = 5000,
}: UserReviewsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const CARD_WIDTH = Dimensions.get('window').width;

  const reviews: ReviewItem[] = [
    { id: '1', text: i18n.t('onboarding.screen1.reviews.items.0') },
    { id: '2', text: i18n.t('onboarding.screen1.reviews.items.1') },
    { id: '3', text: i18n.t('onboarding.screen1.reviews.items.2') },
  ];

  // Auto-scroll effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % reviews.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
          viewPosition: 0,
        });
        return nextIndex;
      });
    }, autoScrollInterval);

    return () => clearInterval(timer);
  }, [autoScrollInterval, reviews.length]);

  // Handle manual swipe
  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / CARD_WIDTH);
    setCurrentIndex(index);
  };

  const renderReview: ListRenderItem<ReviewItem> = ({ item }) => (
    <View style={styles.reviewCardContainer}>
      <View style={styles.reviewCard}>
        <Text style={styles.reviewText}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Heading */}
      <Text style={styles.heading}>
        {i18n.t('onboarding.screen1.reviews.heading')}
      </Text>

      {/* Stars */}
      <View style={styles.starsContainer}>
        <Text style={styles.starText}>★★★★★</Text>
      </View>

      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id}
        horizontal
        snapToInterval={CARD_WIDTH}
        snapToAlignment="center"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleScrollEnd}
        getItemLayout={(data, index) => ({
          length: CARD_WIDTH,
          offset: CARD_WIDTH * index,
          index,
        })}
        contentContainerStyle={styles.flatListContent}
      />

      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        {reviews.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  heading: {
    fontSize: RF(18),
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: RS(8),
  },
  starsContainer: {
    alignItems: 'center',
  },
  starText: {
    fontSize: RF(20),
    color: '#FFC107',
    letterSpacing: RS(2),
    fontFamily: 'Urbanist_400Regular',
  },
  flatListContent: {},
  reviewCardContainer: {
    width: Dimensions.get('window').width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewCard: {
    width: Dimensions.get('window').width - RS(26),
    padding: RS(16),
    backgroundColor: 'transparent',
  },
  reviewText: {
    fontSize: RF(16),
    fontFamily: 'Urbanist_400Regular',
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: RF(18),
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: RS(2),
  },
  dot: {
    borderRadius: RS(4),
    marginHorizontal: RS(4),
  },
  activeDot: {
    width: RS(8),
    height: RS(8),
    backgroundColor: theme.colors.primary,
  },
  inactiveDot: {
    width: RS(6),
    height: RS(6),
    backgroundColor: theme.colors.textLight,
    opacity: 0.3,
  },
});
