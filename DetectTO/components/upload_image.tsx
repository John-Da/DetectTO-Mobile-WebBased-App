import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Loading from './loading';


const UploadImageBtn = ({ btn_name, mode = "gallery", bottomSheetRef }: any) => {
  const [image, setImage] = useState<string | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    setLoading(true);
    let result;
    if (mode === "gallery") {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: false,
        quality: 1,
      });
    } else if (mode === "camera") {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        allowsEditing: false,
        quality: 1,
      });
    }

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      bottomSheetRef?.current?.scrollTo(0);

      router.push({
        pathname: "/detectionstates/detection_image",
        params: { uri },
      });
      setLoading(false);
    }
  };

  return (
    <>
    <TouchableOpacity style={styles.buttons} onPress={pickImage}>
      <Text style={styles.buttonText}>{btn_name}</Text>
    </TouchableOpacity>
    { loading && <Loading isVisible={true} /> }

    </>
  );
};


export default UploadImageBtn

const styles = StyleSheet.create({
  buttons: {
    width: "100%",
    backgroundColor: "#AB8BFF",
    height: 40,
    borderRadius: 20,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});
