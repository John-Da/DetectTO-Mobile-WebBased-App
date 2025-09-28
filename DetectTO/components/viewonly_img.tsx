import React from "react";
import { Modal, StyleSheet } from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";

interface ZoomableImageProps {
  uri: string;
  isVisible: boolean;
  onClose: () => void;
}

const ZoomableImage: React.FC<ZoomableImageProps> = ({ uri, isVisible, onClose }) => {
  return (
    <Modal visible={isVisible} transparent={true} onRequestClose={onClose}>
      <ImageViewer
        imageUrls={[{ url: uri }]}
        enableSwipeDown
        onSwipeDown={onClose}
        onCancel={onClose}
        renderIndicator={() => null}
      />
    </Modal>
  );
};

export default ZoomableImage;

const styles = StyleSheet.create({});
