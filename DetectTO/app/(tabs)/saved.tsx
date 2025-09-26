import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const SavedScreen = () => {
  return (
    <SafeAreaView className='flex-1 bg-[#030014] px-5'>
      <View className='w-full h-16 justify-center'>
        <Text className='text-3xl text-white font-bold'>Saved Images</Text>
      </View>
      <ScrollView>
        <View>
          <Text className='text-white'>FILTERS</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SavedScreen

const styles = StyleSheet.create({})