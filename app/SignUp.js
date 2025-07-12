import React from "react";
import {View, Text, TouchableOpacity, Button, Alert, TextInput} from 'react-native';
import {Link, useNavigation} from "expo-router";

export default function SignUp(){
    const navigation = useNavigation();
    const [name, setName] = React.useState('');
    const [username, setUsername] = React.useState('');
    const [number, setNumber] = React.useState('');
    const [password, setPassword] = React.useState('');
    const url = `http://192.168.0.125:1012`;

    const handleSignUp = async () => {
        try {
            const response = await fetch(`${url}/users`,{
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                    username: username.trim(),
                    phoneNumber: number.trim(),
                    password: password.trim(),
                }),
            });
            if (response.ok) {
                Alert.alert('Sucess');
                navigation.navigate('LoginScreen')
            }else {
                const error = await response.text();
                Alert.alert('user name already taken.',error);
            }
        }catch(err){
            console.error(err);
            Alert.alert('Error', err.message);
        }
    }

    return (
        <View className="flex-1 justify-center items-center px-4 bg-amber-50">
            <Text className="text-3xl font-bold mb-6">Sign Up</Text>
            <TextInput
                className="border border-gray-400 rounded w-full p-3 mb-4"
                placeholder="Name"
                autoCapitalize="none"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                className="border border-gray-400 rounded w-full p-3 mb-4"
                placeholder="Username"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
                />
            <TextInput
                className="border border-gray-400 rounded w-full p-3 mb-4"
                placeholder="Number"
                keyboardType="numeric"
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
            <Button title="Sign Up" onPress={handleSignUp} />
            <Text className="text-sm mb-6">already have an acount ?<Link className="text-sm text-blue-500 mb-6" href="./LoginScreen">login</Link></Text>
        </View>
    )
}
