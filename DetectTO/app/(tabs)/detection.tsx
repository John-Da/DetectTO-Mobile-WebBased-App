import { StyleSheet, Text, View, ScrollView, TouchableOpacity, BackHandler, Dimensions } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomBottomSheet, { BottomSheetRefProps } from '@/components/bottomsheet'
import { GestureHandlerRootView } from 'react-native-gesture-handler'



const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const DetectionScreen = () => {
  const uploadSheetRef = useRef<BottomSheetRefProps>(null);
  const cameraSheetRef = useRef<BottomSheetRefProps>(null);

  // Handle hardware back
  useEffect(() => {
    const onBackPress = () => {
      if (uploadSheetRef.current?.isActive()) {
        uploadSheetRef.current.scrollTo(SCREEN_HEIGHT);
        return true;
      }
      if (cameraSheetRef.current?.isActive()) {
        cameraSheetRef.current.scrollTo(SCREEN_HEIGHT);
        return true;
      }
      return false;
    };

    BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
  }, []);


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className='bg-[#030014] flex-1 px-5'>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            minHeight: "100%",
            paddingBottom: 20,
          }}
        >

          {/* Overlay */}
          <View className="w-full h-16 justify-center">
            <Text className="text-white text-3xl font-bold">Let's start Detection!</Text>
          </View>

          {/* Content Section */}
          <View className="mt-10">
            {/* Action Buttons */}
            <View className="flex-row justify-between mb-6">
              {/* Upload Image */}
              <TouchableOpacity
                className="bg-[#1c1c2e] w-[48%] h-40 rounded-2xl shadow-lg shadow-black/50 justify-center items-center"
                onPress={() => uploadSheetRef.current?.scrollTo(-400)}
              >
                <Text className="text-white font-semibold">Upload Image</Text>
              </TouchableOpacity>

              {/* Use Camera */}
              <TouchableOpacity
                className="bg-[#1c1c2e] w-[48%] h-40 rounded-2xl shadow-lg shadow-black/50 justify-center items-center"
                onPress={() => cameraSheetRef.current?.scrollTo(-400)}
              >
                <Text className="text-white font-semibold">Use Camera</Text>
              </TouchableOpacity>
            </View>

            {/* Descriptions */}
            <View className="mt-1">
              <Text className="text-white text-2xl font-semibold mb-3">Descriptions</Text>

              <View className="mb-4">
                <Text className="text-white font-medium">Upload Image</Text>
                <Text className="text-gray-400"> - Select an image from your gallery.</Text>
              </View>

              <View>
                <Text className="text-white font-medium">Use Camera</Text>
                <Text className="text-gray-400"> - Take a new photo using your camera.</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* BottomSheets */}
        <CustomBottomSheet
          ref={uploadSheetRef}
          title="Upload Image"
          btn1="Select an image from gallery"
          btn2="Take a photo"
        />
        <CustomBottomSheet
          ref={cameraSheetRef}
          title="Use Camera"
          btn1="Select a recorded video"
          btn2="Open Camera"
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

export default DetectionScreen;

const styles = StyleSheet.create({});
