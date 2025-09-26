import { Text, TouchableOpacity } from 'react-native'
import React from 'react'

const UseCameraBtn = () => {
  return (
    <TouchableOpacity className="bg-[#1c1c2e] w-[48%] h-40 rounded-2xl shadow-lg shadow-black/50 justify-center items-center">
      <Text className="text-white font-semibold">Use Camera</Text>
    </TouchableOpacity>
  )
}

export default UseCameraBtn