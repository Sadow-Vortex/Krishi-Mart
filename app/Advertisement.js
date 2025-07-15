import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, TextInput, Button, Switch, StyleSheet,
    ScrollView, Alert, TouchableOpacity, Dimensions, Image
} from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location';
import RNPickerSelect from 'react-native-picker-select';
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';

const Advertisement = () => {
    const scrollRef = useRef();
    const route = useRoute();
    const navigation = useNavigation();
    const { userId, subCategoryId } = route.params || {};
    const [locationHandled, setLocationHandled] = useState(false);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const url = "http://10.0.167.11:2001";
    const urll = "http://10.0.167.11:2012";
    const [uploading, setUploading] = useState(false);


    const [formData, setFormData] = useState({
        adv_CategoryID: '',
        adv_subCategoryID: subCategoryId || '',
        adv_Title: '',
        adv_Description: '',
        adv_Unit: '',
        adv_Price: '',
        adv_Address: '',
        adv_Image: '',
        adv_Status: true,
        adv_UserID: userId,
        adv_Latitude: null,
        adv_Longitude: null,
    });

    useEffect(() => {
        axios.get(`${url}/category`)
            .then(response => {
                const categoryArray = Array.isArray(response.data)
                    ? response.data
                    : response.data?.data || [];
                setCategories(categoryArray);
            })
            .catch(error => {
                console.error('Category fetch error:', error);
                setCategories([]);
            });
    }, []);

    useEffect(() => {
        if (formData.adv_CategoryID) {
            axios.get(`${url}/api/subcategories/by-category/${formData.adv_CategoryID}`)
                .then(response => {
                    const subArray = Array.isArray(response.data)
                        ? response.data
                        : response.data?.data || [];
                    setSubcategories(subArray);
                })
                .catch(() => setSubcategories([]));
        }
    }, [formData.adv_CategoryID]);

    useFocusEffect(
        React.useCallback(() => {
            if (route.params?.selectedLocation && !locationHandled.current) {
                const { latitude, longitude } = route.params.selectedLocation;

                (async () => {
                    try {
                        const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
                        let addressString = 'Unknown location';
                        if (geocode.length > 0) {
                            const place = geocode[0];
                            addressString = [
                                place.name,
                                place.street,
                                place.city || place.subregion,
                                place.region,
                                place.postalCode,
                                place.country,
                            ].filter(Boolean).join(', ');
                        }

                        setFormData(prev => ({
                            ...prev,
                            adv_Latitude: latitude,
                            adv_Longitude: longitude,
                            adv_Address: addressString,
                        }));
                    } catch (error) {
                        console.error('Reverse geocoding failed:', error);
                        setFormData(prev => ({
                            ...prev,
                            adv_Latitude: latitude,
                            adv_Longitude: longitude,
                            adv_Address: `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`,
                        }));
                    }
                    locationHandled.current = true;
                })();
            }
        }, [route.params?.selectedLocation])
    );

    const handleLocationSelect = () => {
        navigation.navigate('Map', {
            onLocationSelected: (location) => {
                reverseGeocodeAndSetLocation(location);
            },
        });
    };

    const reverseGeocodeAndSetLocation = async ({ latitude, longitude }) => {
        try {
            const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
            let addressString = 'Unknown location';
            if (geocode.length > 0) {
                const place = geocode[0];
                addressString = [
                    place.name,
                    place.street,
                    place.city || place.subregion,
                    place.region,
                    place.postalCode,
                    place.country
                ].filter(Boolean).join(', ');
            }

            setFormData(prev => ({
                ...prev,
                adv_Latitude: latitude,
                adv_Longitude: longitude,
                adv_Address: addressString,
            }));
        } catch (error) {
            console.error("Reverse geocoding failed:", error);
        }
    };


    // const PickImage = async () => {
    //     const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    //     if (!permission.granted) {
    //         alert("Permission to access camera roll is required!");
    //         return;
    //     }
    //
    //     const result = await ImagePicker.launchImageLibraryAsync({
    //         mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //         allowsEditing: true,
    //         quality: 1,
    //     });
    //
    //     if (!result.canceled) {
    //         const uri = result.assets[0].uri;
    //         setFormData(prev => ({ ...prev, adv_Image: uri }));
    //     }
    // };

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
            const localUri = result.assets[0].uri;
            const filename = localUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename ?? '');
            const type = match ? `image/${match[1]}` : `image`;

            const formDataImage = new FormData();
            formDataImage.append('file', {
                uri: localUri,
                name: filename,
                type,
            });

            try {
                setUploading(true); // optional: show loading indicator
                const response = await axios.post(`${urll}/adv/upload`, formDataImage, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                const imageUrl = response.data?.url;
                if (imageUrl) {
                    setFormData(prev => ({ ...prev, adv_Image: imageUrl }));
                    console.log("✅ Uploaded Image URL:", imageUrl);
                } else {
                    Alert.alert('Upload Failed', 'No URL returned from server.');
                }
            } catch (error) {
                console.error('❌ Image upload failed:', error);
                Alert.alert('Upload Error', 'Failed to upload image. Try again.');
            } finally {
                setUploading(false);
            }
        }
    };

    const validateForm = () => {
        const { adv_CategoryID, adv_subCategoryID, adv_Title, adv_Unit, adv_Price } = formData;
        if (!adv_CategoryID || !adv_subCategoryID || !adv_Title || !adv_Unit || !adv_Price) {
            Alert.alert('Validation Error', 'Please fill all required fields.');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        let finalUserId = userId;

        if (!finalUserId || finalUserId === 0 || isNaN(finalUserId)) {
            try {
                const storedUser = await AsyncStorage.getItem('user');
                console.log("📦 Stored user from AsyncStorage:", storedUser);
                const parsed = storedUser ? JSON.parse(storedUser) : null;
                finalUserId = parsed?.id;

                if (!finalUserId || finalUserId === 0) {
                    Alert.alert("Error", "User ID missing. Please log in again.");
                    return;
                }
            } catch (err) {
                console.warn("❌ Failed to retrieve user from AsyncStorage:", err);
                Alert.alert("Error", "Login session invalid. Please log in again.");
                return;
            }
        }


        const payload = {
            advUserID: parseInt(finalUserId),
            adv_CategoryID: parseInt(formData.adv_CategoryID),
            advSubCategoryID: parseInt(formData.adv_subCategoryID),
            adv_Title: formData.adv_Title,
            adv_Description: formData.adv_Description,
            adv_Unit: parseInt(formData.adv_Unit),
            adv_Price: parseFloat(formData.adv_Price),
            adv_Address: formData.adv_Address,
            adv_Image: formData.adv_Image,
            adv_Date: new Date().toISOString(),
            adv_Status: formData.adv_Status,
            adv_Location: {
                latitude: formData.adv_Latitude || 0,
                longitude: formData.adv_Longitude || 0
            },
        };

        axios.post(`${urll}/adv`, payload)
            .then(() => {
                Alert.alert('Success', 'Advertisement posted successfully');
                scrollRef.current?.scrollTo({ y: 0, animated: true });

                setFormData(prev => ({
                    ...prev,
                    adv_Title: '',
                    adv_Description: '',
                    adv_Unit: '',
                    adv_Price: '',
                    adv_Address: '',
                    adv_Image: '',
                    adv_Status: true,
                    adv_Latitude: null,
                    adv_Longitude: null,
                    adv_subCategoryID: subCategoryId || ''
                }));

                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                });
            })
            .catch(error => {
                Alert.alert('Error', 'Something went wrong while posting.');
                console.error("❌ Post failed:", error);
            });
    };



    return (
        <View style={styles.fullContainer}>
            <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.label}>Category <Text style={{ color: 'red' }}>*</Text></Text>
                <RNPickerSelect
                    onValueChange={value => setFormData(prev => ({ ...prev, adv_CategoryID: value }))}
                    items={categories.map(c => ({
                        key: c.categoryId.toString(),
                        label: c.categoryName,
                        value: c.categoryId
                    }))}
                    value={formData.adv_CategoryID}
                    placeholder={{ label: "Select Category", value: null }}
                />

                {!subCategoryId && (
                    <>
                        <Text style={styles.label}>Subcategory <Text style={{ color: 'red' }}>*</Text></Text>
                        <RNPickerSelect
                            onValueChange={value =>
                                setFormData(prev => ({ ...prev, adv_subCategoryID: value }))
                            }
                            items={subcategories.map(s => ({
                                key: s.subCategory_Id.toString(),
                                label: s.subCategory_Name,
                                value: s.subCategory_Id
                            }))}
                            value={formData.adv_subCategoryID}
                            placeholder={{ label: "Select Subcategory", value: null }}
                        />
                    </>
                )}

                <Text style={styles.label}>Title <Text style={{ color: 'red' }}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    value={formData.adv_Title}
                    onChangeText={text => setFormData(prev => ({ ...prev, adv_Title: text }))}
                />

                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, { height: 80 }]}
                    value={formData.adv_Description}
                    onChangeText={text => setFormData(prev => ({ ...prev, adv_Description: text }))}
                    multiline
                />

                <Text style={styles.label}>Unit <Text style={{ color: 'red' }}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    value={formData.adv_Unit}
                    onChangeText={text => setFormData(prev => ({ ...prev, adv_Unit: text }))}
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Price <Text style={{ color: 'red' }}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    value={formData.adv_Price}
                    onChangeText={text => setFormData(prev => ({ ...prev, adv_Price: text }))}
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Address</Text>
                <View style={styles.inputWithIcon}>
                    <TextInput
                        style={styles.inputFlex}
                        value={formData.adv_Address}
                        onChangeText={text => setFormData(prev => ({ ...prev, adv_Address: text }))}
                        placeholder="Enter address or select from map"
                    />
                    <TouchableOpacity onPress={handleLocationSelect}>
                        <Icon name="location-on" size={24} color="#007bff" />
                    </TouchableOpacity>
                </View>


                {formData.adv_Latitude && formData.adv_Longitude && (
                    <Text style={styles.selectedLocationText}>
                        Selected Location: Lat: {formData.adv_Latitude.toFixed(4)}, Lon: {formData.adv_Longitude.toFixed(4)}
                    </Text>
                )}

                <Text style={styles.label}>Select Image</Text>
                <TouchableOpacity onPress={PickImage} style={styles.button}>
                    <Text style={{ color: 'blue' }}>Choose Image</Text>
                </TouchableOpacity>
                {formData.adv_Image && (
                    <Image source={{ uri: formData.adv_Image }} style={{ width: 100, height: 100, marginTop: 10 }} />
                )}

                <View style={styles.switchContainer}>
                    <Text style={styles.label}>Status (Active)</Text>
                    <Switch
                        value={formData.adv_Status}
                        onValueChange={val => setFormData(prev => ({ ...prev, adv_Status: val }))}
                    />
                </View>

                <Button title="Post Advertisement" onPress={handleSubmit} />
            </ScrollView>

        </View>
    );
};

const styles = StyleSheet.create({
    fullContainer: { flex: 1 },
    scrollContainer: { padding: 20, paddingBottom: 100 },
    input: {
        borderWidth: 1, borderColor: '#ccc', borderRadius: 5,
        padding: 8, marginBottom: 15,
    },
    label: { fontWeight: 'bold', marginBottom: 5 },
    switchContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
    locationButton: {
        position: 'absolute', top: Dimensions.get('window').height * 0.05, right: 20,
        backgroundColor: '#007bff', borderRadius: 30, width: 60, height: 60,
        justifyContent: 'center', alignItems: 'center', elevation: 5,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25, shadowRadius: 3.84, zIndex: 10,
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: '#fff',
        justifyContent: 'space-between',
    },
    inputFlex: { flex: 1, paddingVertical: 8, fontSize: 16 },
    icon: { marginRight: 8 },
    selectedLocationText: {
        marginTop: -10, marginBottom: 10, fontSize: 12, color: 'gray',
    }
});

export default Advertisement;
