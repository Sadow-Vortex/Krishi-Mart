import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
    View, Text, StyleSheet, Image, TouchableOpacity,
    Alert, ActivityIndicator
} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import Footer from "./Footer";
import { useRoute } from "@react-navigation/native";
import axios from "axios";

export default function UserProfile() {
    const navigation = useNavigation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const apiURL = `http://10.0.167.11:1012`;

    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission Denied', 'Please allow access to your photos.');
                }

                const storedUser = await AsyncStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                } else {
                    navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
                }
            } catch (err) {
                console.error("Error loading user:", err);
                Alert.alert("Error", "Could not load user data.");
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const updateImage = async (field) => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: field === 'coverPic' ? [4, 2] : [1, 1],
                quality: 1,
            });

            if (!result.canceled) {
                const imageUri = result.assets[0].uri;
                const filename = imageUri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename ?? '');
                const type = match ? `image/${match[1]}` : `image`;

                const formData = new FormData();
                formData.append('file', {
                    uri: imageUri,
                    name: filename,
                    type: type,
                });

                const uploadRes = await axios.post(`${apiURL}/users/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                const imageUrl = uploadRes.data?.url;
                if (!imageUrl) throw new Error("Image upload failed");

                const updatedUser = { ...user, [field]: imageUrl };
                const updateRes = await axios.put(`${apiURL}/users/${user.id}`, updatedUser, {
                    headers: { 'Content-Type': 'application/json' },
                });

                const updatedUserData = updateRes.data?.data;

                if (updatedUserData) {
                    const finalUser = Array.isArray(updatedUserData) ? updatedUserData[0] : updatedUserData;
                    setUser(finalUser);
                    await AsyncStorage.setItem('user', JSON.stringify(finalUser));
                    Alert.alert('Success', `${field === 'profilePic' ? 'Profile' : 'Cover'} picture updated`);
                } else {
                    throw new Error("User update response missing data");
                }

            }
        } catch (error) {
            console.error("Upload error:", error);
            Alert.alert('Error', 'Failed to update picture.');
        }
    };

    const handleEdit = () => navigation.navigate('EditProfile', { userId: user?.id });
    const handleAds = () => navigation.navigate('MyAds', { userId: user?.id });
    const handleLogOut = async () => {
        try {
            await AsyncStorage.multiRemove(['user', 'isLogin', 'userId']);
            Alert.alert('You have been logged out');
            navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to log out');
        }
    };

    if (loading || !user) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.coverWrapper}>
                {user.coverPic ? (
                    <Image source={{ uri: user.coverPic }} style={styles.cover} />
                ) : (
                    <View style={styles.coverPlaceholder}>
                        <Ionicons name="image-outline" size={40} color="#bbb" />
                    </View>
                )}
                <TouchableOpacity style={styles.cameraCoverIcon} onPress={() => updateImage('coverPic')}>
                    <Ionicons name="camera" size={22} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.profilePicContainer}>
                {user.profilePic ? (
                    <Image source={{ uri: user.profilePic }} style={styles.profilePic} />
                ) : (
                    <Ionicons name="person-circle-outline" size={100} color="#aaa" />
                )}
                <TouchableOpacity style={styles.cameraProfileIcon} onPress={() => updateImage('profilePic')}>
                    <Ionicons name="camera" size={18} color="#fff" />
                </TouchableOpacity>
            </View>

            <Text style={styles.name}>{user.name || 'No Name'}</Text>
            <Text style={styles.username}>@{user.username}</Text>

            <TouchableOpacity style={styles.button} onPress={handleEdit}>
                <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleAds}>
                <Text style={styles.buttonText}>My Ads</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: '#ff4d4d' }]}
                onPress={handleLogOut}
            >
                <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>

            <Footer />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f7fb', alignItems: 'center', paddingTop: 40 },
    cover: { width: '100%', height: 180 },
    coverPlaceholder: {
        width: '100%', height: 180, backgroundColor: '#e0e0e0',
        justifyContent: 'center', alignItems: 'center',
    },
    profilePicContainer: {
        position: 'absolute', top: 130, borderWidth: 3, borderColor: '#fff',
        borderRadius: 75, overflow: 'hidden', backgroundColor: '#fff',
        width: 100, height: 100, justifyContent: 'center', alignItems: 'center', zIndex: 2,
    },
    profilePic: { width: 100, height: 100, borderRadius: 50 },
    name: { fontSize: 20, fontWeight: 'bold', marginTop: 10 },
    username: { fontSize: 14, color: '#888', marginBottom: 20 },
    button: {
        width: '80%', backgroundColor: '#3478f6', padding: 12, borderRadius: 8,
        marginTop: 10, alignItems: 'center',
    },
    buttonText: { color: '#fff', fontWeight: '600' },
    coverWrapper: { width: '100%', height: 180, position: 'relative' },
    cameraCoverIcon: {
        position: 'absolute', bottom: 10, right: 10, backgroundColor: '#0008',
        padding: 6, borderRadius: 20,
    },
    cameraProfileIcon: {
        position: 'absolute', bottom: 2, right: 2, backgroundColor: '#0008',
        padding: 4, borderRadius: 15,
    },
});
