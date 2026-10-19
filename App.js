import React, { useState } from "react";
import {
  Alert,
  Button,
  Image,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

export default function App() {
  // Alle markers gemmes i et array i state (kun i hukommelsen)
  const [markers, setMarkers] = useState([]);
  // Den marker brugeren har trykket på (null = ingen valgt)
  const [selectedMarker, setSelectedMarker] = useState(null);

  // Opretter en marker med billede på en given position
  async function addMarkerWithImage(coordinate) {
    // Bed om tilladelse til at se billeder
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Ingen adgang", "Appen har brug for adgang til dine billeder.");
      return;
    }

    // Lad brugeren vælge et billede fra Photos
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });

    // Hvis brugeren annullerer, oprettes der ingen marker
    if (result.canceled) {
      return;
    }

    const newMarker = {
      id: Date.now().toString(),
      coordinate: coordinate,
      imageUri: result.assets[0].uri,
    };

    setMarkers([...markers, newMarker]);
  }

  // Kaldes når brugeren long-presser på kortet
  async function handleLongPress(event) {
    await addMarkerWithImage(event.nativeEvent.coordinate);
  }

  // Kaldes når brugeren trykker på knappen: opretter en marker på aktuel lokation
  async function handleCurrentLocation() {
    // Bed om tilladelse til at se brugerens lokation
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Ingen adgang", "Appen har brug for adgang til din lokation.");
      return;
    }

    // Hent den aktuelle position
    const position = await Location.getCurrentPositionAsync({});

    const coordinate = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };

    await addMarkerWithImage(coordinate);
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        showsUserLocation={true}
        initialRegion={{
          latitude: 55.6761, // København
          longitude: 12.5683,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        onLongPress={handleLongPress}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            onPress={() => setSelectedMarker(marker)}
          />
        ))}
      </MapView>

      {/* Viser billedet når man trykker på en marker */}
      <Modal
        visible={selectedMarker !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedMarker(null)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            {selectedMarker && (
              <Image
                source={{ uri: selectedMarker.imageUri }}
                style={styles.image}
                resizeMode="contain"
              />
            )}
            <Button title="Luk" onPress={() => setSelectedMarker(null)} />
          </View>
        </View>
      </Modal>

      <Text style={styles.hint}>
        Hold fingeren nede på kortet for at tilføje en marker
      </Text>

      <View style={styles.locationButton}>
        <Button
          title="Opret marker på min lokation"
          onPress={handleCurrentLocation}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  hint: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    backgroundColor: "white",
    padding: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  locationButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
  },
  image: {
    width: "100%",
    height: 350,
    marginBottom: 12,
  },
});