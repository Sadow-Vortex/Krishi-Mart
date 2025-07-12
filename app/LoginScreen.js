import React, {useEffect, useState} from 'react';
import { View, Text, Alert, TextInput, Button } from 'react-native';
import { Link, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
    const navigation = useNavigation();
    const [number, setNumber] = useState('');
    const [password, setPassword] = useState('');
    const url = `http://192.168.0.125:1012`;

    const dumpAsyncStorage = async () => {
        const keys = await AsyncStorage.getAllKeys();
        const items = await AsyncStorage.multiGet(keys);
        console.log('AsyncStorage Contents:', items);
    };

    useEffect(() => {
        dumpAsyncStorage();
    }, []);

    const handleLogin = async () => {
        try {
            // Clear old user info before login
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('isLogin');

            const response = await fetch(`${url}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `phoneNumber=${encodeURIComponent(number)}&password=${encodeURIComponent(password)}`
            });

            console.log('Sent login for:', number, password);

            if (response.ok) {
                const json = await response.json();
                console.log('Login response:', json); // ✅ Check if it's user 2

                const user = json.data;
                if (user?.id) {
                    await AsyncStorage.setItem('user', JSON.stringify(user));
                    await AsyncStorage.setItem('isLogin', 'true');
                    console.log('Stored user:', user);
                    navigation.navigate('Home');
                } else {
                    Alert.alert('Login Failed', 'User data missing in response.');
                }
            } else {
                const responseText = await response.text();
                Alert.alert('Login Failed', responseText || 'Invalid credentials');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', error.message || 'Network error');
        }
    };


    return (
        <View className="flex-1 justify-center items-center px-4 bg-amber-50">
            <Text className="text-3xl font-bold mb-6">Login</Text>

            <TextInput
                className="border border-gray-400 rounded w-full p-3 mb-4"
                placeholder="Number"
                autoCapitalize="none"
                value={number}
                onChangeText={setNumber}
            />

            <TextInput
                className="border border-gray-400 rounded w-full p-3 mb-4"
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <Button title="Login" onPress={handleLogin} />

            <Text className="text-sm mt-4">
                Don’t have an account?{' '}
                <Link className="text-sm text-blue-500" href="/SignUp">Create account</Link>
            </Text>
        </View>
    );
}
