import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { Slider } from "@miblanchard/react-native-slider";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import RNPickerSelect from "react-native-picker-select";

import AsyncStorage from "@react-native-async-storage/async-storage";
import Loading from "@/components/loading";


const PreviewPage = () => {
  const { uri } = useLocalSearchParams();
  const router = useRouter();

  const [iou, setIou] = useState<number>(0.2);
  const [labelscale, setLabelScale] = useState<number>(700);
  const [imgHeight, setImgHeight] = useState<string>("640");
  const [imgWidth, setImgWidth] = useState<string>("640");
  const [models, setModels] = useState<{ label: string; value: string }[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //---------
  const [flaskIP, setFlaskIP] = useState<string>("");

  useEffect(() => {
    const loadIP = async () => {
      const savedIP = await AsyncStorage.getItem("FLASK_HOST_IP");
      if (savedIP) setFlaskIP(savedIP); // <-- use state flaskIP here
    };
    loadIP();
  }, []);

  useEffect(() => {
    const fetchModels = async () => {
      if (!flaskIP) return;
      try {
        const res = await fetch(`http://${flaskIP}/`);
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        const data = await res.json();
        setModels((data.models || []).map(m => ({ label: m, value: m })));
        setSelectedModel(data.models[0] || null);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError("Cannot reach Flask server. Check IP and network.");
      }
    };
    fetchModels();
  }, [flaskIP]);


  if (error) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-[#030014]">
        <Text className="text-red-500 text-lg">{error}</Text>
        <TouchableOpacity
          onPress={() => {
            setError(null);
            // Retry fetch
            setFlaskIP(flaskIP);
          }}
          className="mt-4 bg-[#AB8BFF] px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  //-------


  // ------
  // Use `flaskIP` (not FlaskIP)
  const handleConfirm = async () => {
    setLoading(true);

    if (!flaskIP) return alert("Flask server IP not set!");

    const formData = new FormData();
    formData.append("image", { uri, type: "image/jpeg", name: "upload.jpg" } as any);
    formData.append("models", selectedModel ?? "");
    formData.append("conf", iou.toFixed(2));
    formData.append("scale", labelscale.toString());
    formData.append("img_width", imgWidth);
    formData.append("img_height", imgHeight);

    try {
      const response = await fetch(`http://${flaskIP}/upload`, { method: "POST", body: formData });

      const result = await response.json();
      const resultId = Date.now().toString();
      router.push({ pathname: `/image_details/${resultId}`, params: { imageResult: JSON.stringify(result) } });
      setLoading(false);

    } catch (err) {
      console.error("Error sending data:", err);
      alert("Failed to send data to server.");
      setLoading(false);
    }
  };
// -------

  const handleDelete = () => {
    setLoading(true);
    router.push("/detection");
    setLoading(false);
  };


  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Preview Image",
          headerTransparent: true,
          headerTintColor: "#fff", // makes title & back button white
          headerTitleStyle: {
            fontWeight: "600",
            fontSize: 18,
          },
          headerBackTitle: "Back", // 👈 overrides < (tabs)
        }}
      />
      <SafeAreaView className="flex-1 bg-[#030014]">
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          className="px-5"
        >
          {/* Image Preview */}
          {uri ? (
            <Image
              source={{ uri: uri as string }}
              className="w-full h-80 rounded-2xl mb-8 border border-gray-700"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-white text-center text-lg">
              No image found
            </Text>
          )}

          {/* Model */}
          <View className="mb-6">
            <Text className="text-gray-300 font-semibold text-base mb-2">Model</Text>
            <RNPickerSelect
              onValueChange={(val) => setSelectedModel(val)}
              items={models}
              value={selectedModel}
              style={styles}
              placeholder={{ label: "Select a model...", value: null }}
            />
          </View>

          {/* IOU Threshold */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-300 font-semibold text-base">
                IOU Threshold
              </Text>
              <Text className="text-white">{iou.toFixed(2)}</Text>
            </View>

            <Slider
              value={iou}
              onValueChange={(val) => setIou(val[0])}
              minimumValue={0}
              maximumValue={1}
              step={0.05}
              minimumTrackTintColor="#AB8BFF"
              maximumTrackTintColor="#555"
              thumbTintColor="#AB8BFF"
            />
          </View>

          {/* Label Font Scale */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-300 font-semibold text-base">
                Label Scale
              </Text>
              <Text className="text-white">{labelscale.toFixed(0)}</Text>
            </View>

            <Slider
              value={labelscale}
              onValueChange={(val) => setLabelScale(val[0])}
              minimumValue={100}
              maximumValue={1200}
              step={10}
              minimumTrackTintColor="#AB8BFF"
              maximumTrackTintColor="#555"
              thumbTintColor="#AB8BFF"
            />
          </View>

          {/* Image Size */}
          <View className="mb-6">
            <Text className="text-gray-300 mb-2 font-semibold text-base">
              Image Size
            </Text>
            <View className="flex-row gap-6">
              <View className="flex-row gap-2 items-center flex-1">
                <Text className="text-white">h:</Text>
                <TextInput
                  value={imgHeight}
                  onChangeText={setImgHeight}
                  keyboardType="numeric"
                  className="flex-1 bg-[#1a1a2e] text-white px-4 py-3 rounded-xl border border-gray-700"
                  placeholder="Height"
                  placeholderTextColor="#666"
                />
              </View>
              <View className="flex-row gap-2 items-center flex-1">
                <Text className="text-white">w:</Text>
                <TextInput
                  value={imgWidth}
                  onChangeText={setImgWidth}
                  keyboardType="numeric"
                  className="flex-1 bg-[#1a1a2e] text-white px-4 py-3 rounded-xl border border-gray-700"
                  placeholder="Width"
                  placeholderTextColor="#666"
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Confirm / Delete Buttons fixed at bottom */}
        <View className="mb-5 absolute bottom-0 left-0 right-0 flex-row justify-between gap-4 px-5 py-4 bg-[#030014] border-t border-gray-800">
          <TouchableOpacity
            onPress={handleDelete}
            className="bg-slate-200 flex-1 h-14 rounded-xl justify-center items-center"
          >
            <Text className="text-red-500 font-semibold text-lg">Delete</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleConfirm}
            className="bg-[#AB8BFF] flex-1 h-14 rounded-xl justify-center items-center"
          >
            <Text className="text-white font-semibold text-lg">Confirm</Text>
          </TouchableOpacity>
        </View>
        {loading && <Loading isVisible={true} /> }
      </SafeAreaView>
    </>
  );
};

export default PreviewPage;

const styles = StyleSheet.create({
  inputIOS: {
    color: "white",
    backgroundColor: "#1a1a2e",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#444",
  },
  inputAndroid: {
    color: "white",
    backgroundColor: "#1a1a2e",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#444",
  },
  placeholder: { color: "#999" },
})