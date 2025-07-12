import React, { useEffect, useState } from 'react';
import {StyleSheet, View, Text, ActivityIndicator, Dimensions, Button, Alert, TouchableOpacity} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import {useNavigation, useRoute} from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LocationScreen() {
    const [location, setLocation] = useState(null);
    const [markerPosition, setMarkerPosition] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const route = useRoute();
    const navigation = useNavigation();

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission denied');
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc.coords);
            setMarkerPosition(prev => prev || loc.coords);
        })();
    }, []);

    const handleConfirm = () => {
        const callback = route.params?.onLocationSelected;
        if (callback && typeof callback === 'function') {
            callback(markerPosition);
        }
        navigation.goBack();
    };


    if (errorMsg) return <Text>{errorMsg}</Text>;
    if (!location || !markerPosition) return <ActivityIndicator size="large" />;

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                }}
            >
                <Marker
                    coordinate={markerPosition}
                    draggable={true}
                    onDragEnd={(e) => setMarkerPosition(e.nativeEvent.coordinate)}
                    title="Drag to choose"
                />
            </MapView>
            <View style={styles.buttonContainer}>
                <Button title="Confirm location" onPress={handleConfirm} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
    }
});
