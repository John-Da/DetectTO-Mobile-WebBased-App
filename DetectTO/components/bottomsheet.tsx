import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { forwardRef, useCallback, useEffect, useImperativeHandle } from 'react'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import UploadImageBtn from './upload_image';

type BottomSheetProps = {
  title: string;
  btn1: string;
  btn2: string;
};

export type BottomSheetRefProps = {
  scrollTo: (destination: number) => void;
  isActive: () => boolean;
};

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const CustomBottomSheet = forwardRef<BottomSheetRefProps, BottomSheetProps>(
  ({ title, btn1, btn2 }, ref) => {

    const context = useSharedValue({ y: 0 });
    const active = useSharedValue(false);

    const translateY = useSharedValue(SCREEN_HEIGHT); 
    const MAX_TRANSLATE_Y = 50; 
    translateY.value = Math.min(Math.max(translateY.value, MAX_TRANSLATE_Y), SCREEN_HEIGHT);

    const scrollTo = useCallback((destination: number) => {
      'worklet';
      active.value = destination !== SCREEN_HEIGHT;
      translateY.value = withSpring(destination, { damping: 50 });
    }, []);

    const isActive = useCallback(() => {
      return active.value;
    }, []);

    useImperativeHandle(ref, () => ({ scrollTo, isActive }), [scrollTo, isActive]);
    
    // ---- Handle hardware back button ----
    useEffect(() => {
      const onBackPress = () => {
        if (active.value) {
          scrollTo(SCREEN_HEIGHT);
          return true;
        }
        return false;
      };
    }, [scrollTo]);


    const gesture = Gesture.Pan()
      .onStart(() => {
        context.value = { y: translateY.value };
      })
      .onUpdate((event) => {
        translateY.value = event.translationY + context.value.y;
        translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y);
      })
      .onEnd(() => {
        if (translateY.value > -SCREEN_HEIGHT / 3) {
          scrollTo(SCREEN_HEIGHT);
        } else if (translateY.value < -SCREEN_HEIGHT / 1.3) {
          scrollTo(MAX_TRANSLATE_Y);
        }
      });

    const rBottomSheetStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateY: translateY.value }],
      };
    });

    return (
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.content, rBottomSheetStyle]}>
          <View style={styles.line} />

          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: "black", fontWeight: "bold", fontSize: 20 }}>{title}</Text>
          </View>

          <UploadImageBtn btn_name={btn1} mode="gallery" bottomSheetRef={ref} />
          <UploadImageBtn btn_name={btn2} mode="camera" bottomSheetRef={ref} />

          <TouchableOpacity className='w-full h-[22px] items-center justify-center' onPress={() => scrollTo(SCREEN_HEIGHT)}>
            <Text className='text-[16px] font-semibold text-red-500'>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    );
  }
);

export default CustomBottomSheet;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    height: SCREEN_HEIGHT,
    top: SCREEN_HEIGHT, 
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "white",
  },
  line: {
    width: 74,
    height: 4,
    backgroundColor: "gray",
    alignSelf: "center",
    marginVertical: 15,
    borderRadius: 15,
  },
});
