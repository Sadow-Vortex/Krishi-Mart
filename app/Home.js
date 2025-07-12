import React, { useEffect, useState, useLayoutEffect } from "react";
import {
    View, Image, FlatList, StyleSheet, Dimensions,
    ActivityIndicator, Text, TouchableOpacity, Alert
} from "react-native";
import { useNavigation } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from '@expo/vector-icons';
import Footer from "./Footer";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
    const navigation = useNavigation();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const url = `http://192.168.0.125:2001`;

    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${url}/category`);
            const data = await response.json();
            const categoryArray = Array.isArray(data.data) ? data.data : [];
            setCategories(categoryArray);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPress = async () => {
        try {
            const userData = await AsyncStorage.getItem('user');
            if (!userData) {
                console.warn("No user data found in AsyncStorage.");
                return;
            }

            const parsedUser = JSON.parse(userData);
            if (parsedUser?.id) {
                navigation.navigate("Advertisement", { userId: parsedUser.id });
            } else {
                console.warn("User ID not found in stored user object.");
            }
        } catch (error) {
            console.error("Failed to retrieve user from storage:", error);
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: "center" }} />;
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#f4f7fb' }}>
            <View style={styles.header}>
                <Text style={styles.brand}>Krishi Mart</Text>
            </View>

            <View style={styles.banner}>
                <Text style={styles.todayText}>TODAY</Text>
                <Text style={styles.bannerText}>FREE shipping for ALL orders</Text>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Categories</Text>
            </View>

            <FlatList
                data={categories}
                keyExtractor={(item, index) => item?.categoryId?.toString() || index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryRow}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.circleWrapper}
                        onPress={() =>
                            navigation.navigate("SubCategory", { categoryId: item.categoryId })
                        }
                    >
                        <Image source={{ uri: item.image }} style={styles.circleImage} />
                        <Text style={styles.categoryLabel}>{item.categoryName}</Text>
                    </TouchableOpacity>
                )}
            />

            <TouchableOpacity style={styles.fab} onPress={handleAddPress}>
                <Ionicons name="add" size={32} color="#000" />
            </TouchableOpacity>

            {/*<TouchableOpacity style={styles.logoutFab} onPress={handleLogOut}>*/}
            {/*    <Ionicons name="log-out-outline" size={24} color="#000" />*/}
            {/*</TouchableOpacity>*/}

            <Footer/>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 10,
        backgroundColor: '#f4f7fb',
    },
    brand: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2563eb',
    },
    banner: {
        marginHorizontal: 16,
        backgroundColor: '#e0f2fe',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    todayText: {
        fontSize: 12,
        color: '#22c55e',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    bannerText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0f172a',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    showAll: {
        fontSize: 14,
        color: '#2563eb',
        fontWeight: '500',
    },
    categoryRow: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    circleWrapper: {
        alignItems: 'center',
        marginRight: 20,
    },
    circleImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
        marginBottom: 6,
    },
    categoryLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1e293b',
    },
    fab: {
        position: 'absolute',
        bottom: 90,
        right: 30,
        backgroundColor: '#fefae0',
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
    logoutFab: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        backgroundColor: '#fefae0',
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
});
