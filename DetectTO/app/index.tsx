import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const SetupPage = () => {
  const [hostIP, setHostIP] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loadIP = async () => {
      const savedIP = await AsyncStorage.getItem("FLASK_HOST_IP");
      if (savedIP) setHostIP(savedIP); // prefill input
    };
    loadIP();
  }, []);

  const handleConfirmIP = async () => {
    if (!hostIP) {
        Alert.alert("Error", "Please enter a valid IP address");
        return;
    }

    // Test connection first
    try {
        const res = await fetch(`http://${hostIP}/`);
        if (!res.ok) throw new Error("Server not reachable");
    } catch (err) {
        Alert.alert("Connection Error", "Cannot reach Flask server. Make sure Flask is running and IP is correct.");
        return;
    }

    await AsyncStorage.setItem("FLASK_HOST_IP", hostIP);
    router.replace("/(tabs)/"); // now safe to navigate
    };

  const handleClearIP = async () => {
    await AsyncStorage.removeItem("FLASK_HOST_IP");
    setHostIP("");
    Alert.alert("Cleared", "Previous IP has been cleared.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Flask Server Setup</Text>
      <Text style={styles.subtitle}>Enter the host IP of your Flask server</Text>

      <TextInput
        value={hostIP}
        onChangeText={setHostIP}
        placeholder="e.g., 192.168.1.5:5001"
        placeholderTextColor="#888"
        style={styles.input}
        keyboardType="default"
      />

      <TouchableOpacity onPress={handleConfirmIP} style={styles.saveButton}>
        <Text style={styles.buttonText}>Save & Continue</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleClearIP} style={styles.resetButton}>
        <Text style={styles.buttonText}>Reset IP</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SetupPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    backgroundColor: "#0C0C1E",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 25,
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#555",
    backgroundColor: "#1A1A2E",
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
  },
  saveButton: {
    width: "100%",
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#AB8BFF",
    marginBottom: 15,
    shadowColor: "#AB8BFF",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
  },
  resetButton: {
    width: "100%",
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#FF5C5C",
    shadowColor: "#FF5C5C",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 16,
  },
});
