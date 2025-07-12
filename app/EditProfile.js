import React, { useEffect, useState } from 'react';
import {View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, KeyboardAvoidingView,Platform} from 'react-native';
import {useLocalSearchParams, useNavigation} from 'expo-router';
import Footer from './Footer';

export default function EditProfile() {
    const navigation = useNavigation();
    const { userId } = useLocalSearchParams();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = 'http://192.168.0.125:1012/users';

    useEffect(() => {
        if (userId) {
            fetchUserDetails();
            console.log("accessed")
        }else{
            console.log("NA");
        }
    }, [userId]);

    const fetchUserDetails = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/${userId}`);
            const result = await response.json();

            if (result.status_code === 200 && result.data) {
                setUserData(result.data);
            } else {
                setUserData(null);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            Alert.alert('Error', 'Failed to load user data.');
        } finally {
            setLoading(false);
        }
    };


    const handleUpdate = async () => {
        try {
            const payload = {
                name: userData.name,
                username: userData.username,
                email: userData.email,
                password: userData.password,
                profilePic: userData.profilePic,
                coverPic: userData.coverPic,
                phoneNumber: userData.phoneNumber,
            };

            const response = await fetch(`${API_BASE_URL}/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (result.status_code === 200) {
                Alert.alert('Success', 'Profile updated successfully.');
                navigation.goBack();

            } else {
                Alert.alert('Error', result.status_msg || 'Update failed');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong.');
        }
    };

    if (loading) return <Text>Loading...</Text>;
    if (!userData) return <Text>User data not found or empty</Text>;

    return (
        <View style={{ flex: 1 }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={80}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.container}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            style={styles.input}
                            value={userData.name || ''}
                            onChangeText={(text) => setUserData({ ...userData, name: text })}
                        />

                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={userData.email || ''}
                            onChangeText={(text) => setUserData({ ...userData, email: text })}
                            keyboardType="email-address"
                        />

                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            value={userData.password || ''}
                            onChangeText={(text) => setUserData({ ...userData, password: text })}
                            secureTextEntry
                        />

                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            value={userData.phoneNumber || ''}
                            onChangeText={(text) => setUserData({ ...userData, phoneNumber: text })}
                            keyboardType="phone-pad"
                        />

                        <View style={{ marginTop: 20 }}>
                            <Button title="Update Profile" onPress={handleUpdate} />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <Footer />
        </View>
    );

}

export const options = {
    headerShown: false,
};

const styles = StyleSheet.create({
    scrollContainer: {
        padding: 20,
        paddingBottom: 120,
    },
    container: {
        flex: 1,
    },
    label: {
        fontWeight: 'bold',
        marginTop: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginTop: 5,
    },
});

