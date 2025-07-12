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

export default function UserProfile() {
    const navigation = useNavigation();
    const [user, setUser] = useState(null);
    const route = useRoute();
    const { userId, subCategoryId } = route.params || {};
    const [loading, setLoading] = useState(true);

    const apiURL = `http://192.168.0.125:1012`;

    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } else {
                Alert.alert('Login Required', 'Please log in again.');
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'LoginScreen' }],
                });
            }
        } catch (error) {
            console.error('Failed to load user from storage:', error);
            Alert.alert('Error', 'Failed to load user from storage.');
        } finally {
            setLoading(false);
        }
    };

    const updateImage = async (field) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: field === 'coverPic' ? [4, 2] : [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            const imageUri = result.assets[0].uri;

            const formData = new FormData();
            formData.append('image', {
                uri: imageUri,
                name: `${field}.jpg`,
                type: 'image/jpeg',
            });

            try {
                const uploadResponse = await fetch(`${apiURL}/upload`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formData,
                });

                const uploadResult = await uploadResponse.json();

                if (!uploadResult?.url) {
                    throw new Error("Image upload failed");
                }

                const imageUrl = uploadResult.url;

                const updatedUser = { ...user, [field]: imageUrl };
                const response = await fetch(`${apiURL}/users/${user.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedUser),
                });

                const json = await response.json();
                setUser(json.data[0]);
                Alert.alert('Success', `${field === 'profilePic' ? 'Profile' : 'Cover'} picture updated`);
            } catch (error) {
                console.error(error);
                Alert.alert('Error', 'Failed to update picture.');
            }
        }
    };

    const handleEdit = async () => {
        try {
            navigation.navigate('EditProfile', { userId: user.id });
        } catch (error) {
            Alert.alert('Error', 'Failed to navigate to EditProfile.');
        }
    };

    const handleAds = async () => {
        try {
            navigation.navigate('MyAds', { userId: user.id });
        } catch (error) {
            Alert.alert('Error', 'Failed to navigate to MyAds.');
        }
    };

    const handleLogOut = async () => {
        try {
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('isLogin');
            await AsyncStorage.removeItem('userId');
            Alert.alert('You have been logged out');
            navigation.reset({
                index: 0,
                routes: [{ name: 'LoginScreen' }],
            });
        } catch (err) {
            Alert.alert('Failed to log out');
            console.error(err);
        }
    };

    if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
    if (!user) return navigation.navigate('LoginScreen');

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
    container: {
        flex: 1,
        backgroundColor: '#f4f7fb',
        alignItems: 'center',
        paddingTop: 40,
    },
    cover: {
        width: '100%',
        height: 180,
    },
    coverPlaceholder: {
        width: '100%',
        height: 180,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profilePicContainer: {
        position: 'absolute',
        top: 130,
        borderWidth: 3,
        borderColor: '#fff',
        borderRadius: 75,
        overflow: 'hidden',
        backgroundColor: '#fff',
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    profilePic: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
    },
    username: {
        fontSize: 14,
        color: '#888',
        marginBottom: 20,
    },
    button: {
        width: '80%',
        backgroundColor: '#3478f6',
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
    coverWrapper: {
        width: '100%',
        height: 180,
        position: 'relative',
    },
    cameraCoverIcon: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: '#0008',
        padding: 6,
        borderRadius: 20,
    },
    cameraProfileIcon: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: '#0008',
        padding: 4,
        borderRadius: 15,
    },
});
