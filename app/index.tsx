import { useEffect, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import LoginScreen from "@/app/LoginScreen";

export default function Index() {
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkLogin = async () => {
            const value = await AsyncStorage.getItem("isLogin");
            if (value === "true") {
                router.replace("/Home"); // redirects to app/home.tsx
            } else {
                router.replace("/LoginScreen"); // redirects to app/login.tsx
            }
            setChecking(false);
        };
        checkLogin();
    }, []);

    if (checking) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
                <Text>Checking login status...</Text>
            </View>
        );
    }

    return null;
}
