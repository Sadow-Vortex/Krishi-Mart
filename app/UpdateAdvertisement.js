import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, TextInput, Button, Switch, StyleSheet,
    ScrollView, Alert, TouchableOpacity, Image
} from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location';
import RNPickerSelect from 'react-native-picker-select';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';

const UpdateAdvertisement = () => {
    const scrollRef = useRef();
    const navigation = useNavigation();
    const route = useRoute();
    const { adData } = route.params;

    const url = "http://192.168.0.125:2001";
    const urll = "http://192.168.0.125:2012";
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);

    const [formData, setFormData] = useState({
        adv_id: adData.adv_id,
        advUserID: adData.advUserID,
        adv_CategoryID: adData.adv_CategoryID?.toString(),
        advSubCategoryID: adData.advSubCategoryID?.toString(),
        adv_Title: adData.adv_Title || '',
        adv_Description: adData.adv_Description || '',
        adv_Unit: adData.adv_Unit?.toString() || '',
        adv_Price: adData.adv_Price?.toString() || '',
        adv_Address: adData.adv_Address || '',
        adv_Image: adData.adv_Image || '',
        adv_Status: adData.adv_Status,
        adv_Latitude: adData.adv_Location?.latitude || 0,
        adv_Longitude: adData.adv_Location?.longitude || 0
    });

    useEffect(() => {
        axios.get(`${url}/category`)
            .then(response => {
                setCategories(response.data?.data || []);
            })
            .catch(err => {
                console.error("Category fetch failed:", err);
            });
    }, []);

    useEffect(() => {
        if (formData.adv_CategoryID) {
            axios.get(`${url}/api/subcategories/by-category/${formData.adv_CategoryID}`)
                .then(response => {
                    setSubcategories(response.data?.data || []);
                })
                .catch(() => setSubcategories([]));
        }
    }, [formData.adv_CategoryID]);

    const PickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            alert("Permission to access camera roll is required!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            setFormData(prev => ({ ...prev, adv_Image: uri }));
        }
    };

    const handleLocationSelect = () => {
        navigation.navigate('Map', {
            onLocationSelected: async (location) => {
                const { latitude, longitude } = location;
                const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
                const address = geocode?.[0]
                    ? [geocode[0].name, geocode[0].city, geocode[0].region, geocode[0].country].filter(Boolean).join(', ')
                    : `Lat: ${latitude}, Lon: ${longitude}`;
                setFormData(prev => ({
                    ...prev,
                    adv_Latitude: latitude,
                    adv_Longitude: longitude,
                    adv_Address: address
                }));
            }
        });
    };

    const handleUpdate = () => {
        if (!formData.adv_Title || !formData.adv_Unit || !formData.adv_Price) {
            Alert.alert('Validation', 'Title, Unit, and Price are required.');
            return;
        }

        const payload = {
            adv_id: formData.adv_id,
            advUserID: formData.advUserID,
            adv_CategoryID: parseInt(formData.adv_CategoryID),
            advSubCategoryID: parseInt(formData.advSubCategoryID),
            adv_Title: formData.adv_Title,
            adv_Description: formData.adv_Description,
            adv_Unit: parseInt(formData.adv_Unit),
            adv_Price: parseFloat(formData.adv_Price),
            adv_Address: formData.adv_Address,
            adv_Image: formData.adv_Image,
            adv_Date: new Date().toISOString(),
            adv_Status: formData.adv_Status,
            adv_Location: {
                latitude: formData.adv_Latitude,
                longitude: formData.adv_Longitude
            }
        };

        axios.put(`${urll}/adv/${formData.adv_id}`, payload)
            .then(response => {
                if (response.data.status_code === 200) {
                    Alert.alert('Success', 'Advertisement updated successfully.');
                    navigation.goBack();
                } else {
                    Alert.alert('Error', response.data.status_msg || 'Update failed.');
                }
            })
            .catch(err => {
                console.error('Update failed:', err);
                Alert.alert('Error', 'Something went wrong while updating.');
            });
    };


    return (
        <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
                style={styles.input}
                value={formData.adv_Title}
                onChangeText={text => setFormData(prev => ({ ...prev, adv_Title: text }))}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
                style={[styles.input, { height: 80 }]}
                value={formData.adv_Description}
                multiline
                onChangeText={text => setFormData(prev => ({ ...prev, adv_Description: text }))}
            />

            <Text style={styles.label}>Unit *</Text>
            <TextInput
                style={styles.input}
                value={formData.adv_Unit}
                keyboardType="numeric"
                onChangeText={text => setFormData(prev => ({ ...prev, adv_Unit: text }))}
            />

            <Text style={styles.label}>Price *</Text>
            <TextInput
                style={styles.input}
                value={formData.adv_Price}
                keyboardType="numeric"
                onChangeText={text => setFormData(prev => ({ ...prev, adv_Price: text }))}
            />

            <Text style={styles.label}>Address</Text>
            <View style={styles.inputWithIcon}>
                <TextInput
                    style={styles.inputFlex}
                    value={formData.adv_Address}
                    onChangeText={text => setFormData(prev => ({ ...prev, adv_Address: text }))}
                />
                <TouchableOpacity onPress={handleLocationSelect}>
                    <Icon name="location-on" size={24} color="#007bff" />
                </TouchableOpacity>
            </View>

            <Text style={styles.label}>Image</Text>
            <TouchableOpacity onPress={PickImage} style={styles.button}>
                <Text style={{ color: 'blue' }}>Choose Image</Text>
            </TouchableOpacity>
            {formData.adv_Image && (
                <Image source={{ uri: formData.adv_Image }} style={{ width: 100, height: 100, marginTop: 10 }} />
            )}

            <View style={styles.switchContainer}>
                <Text>Status (Active)</Text>
                <Switch
                    value={formData.adv_Status}
                    onValueChange={val => setFormData(prev => ({ ...prev, adv_Status: val }))}
                />
            </View>

            <Button title="Update Advertisement" onPress={handleUpdate} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: { padding: 20 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, marginBottom: 15 },
    label: { fontWeight: 'bold', marginBottom: 5 },
    inputWithIcon: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderColor: '#ccc', borderRadius: 5,
        paddingHorizontal: 10, marginBottom: 15, backgroundColor: '#fff',
        justifyContent: 'space-between'
    },
    inputFlex: { flex: 1, paddingVertical: 8, fontSize: 16 },
    switchContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    button: { marginBottom: 15 }
});

export default UpdateAdvertisement;
