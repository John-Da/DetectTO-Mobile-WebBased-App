import { ActivityIndicator, StyleSheet, Text, View, Modal } from "react-native";
import React from "react";

interface LoadingProps {
  isVisible: boolean;
  loadingText?: string;
  color?: string;
}

const Loading: React.FC<LoadingProps> = ({
  isVisible,
  loadingText = "Loading...",
  color = "#fff",
}) => {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={color} />
          <Text style={[styles.text, { color }]}>{loadingText}</Text>
        </View>
      </View>
    </Modal>
  );
};

export default Loading;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: 160,
    height: 160,
    backgroundColor: "#1a1a2e",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  text: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
