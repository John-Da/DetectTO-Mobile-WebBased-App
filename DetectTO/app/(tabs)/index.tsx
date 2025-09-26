import { StyleSheet, Image, Text, ScrollView, View } from "react-native";
import React from "react";
import { images } from "@/assets/images/images";
import { SafeAreaView } from "react-native-safe-area-context";

const HomeScreen = () => {
  return (
    <SafeAreaView className="bg-[#030014] flex-1">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          minHeight: "100%",
          paddingBottom: 20,
        }}
      >
        {/* Top Hero Section */}
        <View className="relative w-full h-48">
          <Image
            source={images.thumbnail}
            className="absolute w-full h-full top-0 left-0 rounded-b-2xl"
            resizeMode="cover"
          />
        </View>

        {/* Overlay */}
        <View className="w-full h-28 rounded-b-2xl justify-center items-center">
          <Text className="text-white text-3xl font-bold">
            Welcome To DetectTO
          </Text>
        </View>

        {/* Content Section */}
        <View className="mt-1 px-5">
          <View className="bg-[#1c1c2e] rounded-2xl p-5 shadow-lg shadow-black/50">
            <Text className="text-gray-300 leading-6">
              Some texts are here... Lorem ipsum dolor sit amet, consectetur
              adipiscing elit. Nunc vitae semper sapien. Duis nec volutpat
              risus.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
