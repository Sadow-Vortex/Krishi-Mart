// Updated code with Phone & Location icons for Ads Modal
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
    View, Text, Image, FlatList, Modal,
    TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions, Alert, Linking
} from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Footer from "./Footer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useNavigation} from "expo-router";

export default function AdsBySubCategory() {
    const navigation = useNavigation();
    const route = useRoute();
    const { subCategoryId } = route.params;
    const [ads, setAds] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAd, setSelectedAd] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const url = `http://192.168.0.125:2012`;
    const urll = `http://192.168.0.125:1012`;

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        })
    });

    const fetchAds = async () => {
        try {
            const response = await axios.get(`${url}/adv/subCategory/${subCategoryId}`);
            setAds(Array.isArray(response.data.data) ? response.data.data : []);
            console.log(response.data.data);
        } catch (error) {
            console.error('Failed to fetch ads:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${urll}/users`);
            setUsers(Array.isArray(response.data.data) ? response.data.data : []);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        }
    };

    useEffect(() => {
        if (subCategoryId) {
            fetchAds();
            fetchUsers();
        }
    }, [subCategoryId]);

    const openModal = async (ad) => {
        try {
            const storedUser = await AsyncStorage.getItem('user');
            const viewerId = storedUser ? JSON.parse(storedUser)?.id : null;

            if (!viewerId) {
                Alert.alert("Login Error", "Please log in to view this ad.");
                return;
            }

            const response = await axios.get(`${url}/adv/${ad.adv_id}?viewerId=${viewerId}`);
            const updatedAd = response.data?.data;

            const farmer = users.find(user => user.id === updatedAd.advUserID);

            setSelectedAd({ ...updatedAd, farmer });
            setModalVisible(true);
        } catch (error) {
            console.error("Failed to open ad modal:", error);
            Alert.alert("Error", "Failed to load ad. Try again.");
        }
    };


    const closeModal = () => {
        setModalVisible(false);
        setSelectedAd(null);
    };

    const openDialer = (number) => {
        Linking.openURL(`tel:${number}`);
    };

    const openMap = (lat, lng) => {
        const url = `https://www.google.com/maps?q=${lat},${lng}`;
        Linking.openURL(url);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => openModal(item)} style={styles.card}>
            <Image source={{ uri: item.adv_Image }} style={styles.image} />
            <View style={styles.cardBody}>
                <Text style={styles.title}>{item.adv_Title}</Text>
                <Text style={styles.price}>₹{item.adv_Price}</Text>
                <Text style={styles.location}>{item.adv_Address}</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.brand}>Krishi Mart</Text>
            </View>
            {ads.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No Ads are posted</Text>
                </View>
            ) : (
                <FlatList
                    data={ads}
                    keyExtractor={(item) => item.adv_id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalBackground}>
                    <View style={styles.modalContent}>
                        {selectedAd && (
                            <>
                                <TouchableOpacity onPress={closeModal} style={styles.crossIcon}>
                                    <Ionicons name="close" size={24} color="#000" />
                                </TouchableOpacity>
                                <Image source={{ uri: selectedAd.adv_Image }} style={styles.modalImage} />
                                <View style={styles.viewCountOverlay}>
                                    <Ionicons name="eye" size={16} color="#fff" />
                                    <Text style={styles.viewCountText}>{selectedAd.count || 0}</Text>
                                </View>
                                <Text style={styles.modalTitle}>{selectedAd.adv_Title}</Text>
                                <Text>{selectedAd.adv_Description}</Text>
                                <Text>Price: ₹{selectedAd.adv_Price}</Text>
                                <Text>Location: {selectedAd.adv_Address}</Text>

                                <Text style={styles.farmerText}>Farmer: {selectedAd.farmer?.name || 'Unknown'}</Text>
                                {console.log(selectedAd.farmer)}

                                <View style={styles.iconRow}>
                                    <TouchableOpacity
                                        style={styles.iconButton}
                                        onPress={() => openDialer(selectedAd.farmer?.phoneNumber)}>
                                        <Ionicons name="call" size={24} color="#1e90ff" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.iconButton} onPress={() => Alert.alert("Chat", "Chat with farmer coming soon.")}>
                                        <Text style={styles.chatText}>💬</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.iconButton}
                                        onPress={() => openMap(
                                            selectedAd.adv_Location?.latitude,
                                            selectedAd.adv_Location?.longitude
                                        )}>
                                        <Ionicons name="location" size={24} color="green" />
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
            <Footer/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: '#fff' },
    header: {
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 10,
        backgroundColor: '#f4f7fb',
    },
    card: {
        borderRadius: 10,
        backgroundColor: '#f9f9f9',
        marginBottom: 10,
        elevation: 2,
        overflow: 'hidden'
    },
    image: { width: '100%', height: 200 },
    cardBody: { padding: 10 },
    title: { fontSize: 18, fontWeight: 'bold' },
    price: { fontSize: 16, color: 'green' },
    location: { fontSize: 14, color: 'gray' },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#000000aa'
    },
    modalContent: {
        margin: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center'
    },
    modalImage: { width: 250, height: 200, marginBottom: 10 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    farmerText: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    chatButton: {
        marginTop: 15,
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    chatText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#ff4444',
        padding: 10,
        borderRadius: 8
    },
    closeButtonText: { color: '#fff', fontWeight: 'bold' },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 18,
        color: '#777',
    },
    iconRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '60%',
        marginTop: 10
    },
    crossIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
        padding: 5,
    },
    viewCountOverlay: {
        position: 'absolute',
        top: 15,
        left: 15,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 15,
        paddingVertical: 4,
        paddingHorizontal: 8,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 10,
    },
    brand: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2563eb',
    },
    viewCountText: {
        color: '#fff',
        marginLeft: 4,
        fontSize: 14,
    },
    iconButton: {
        backgroundColor: '#eef',
        padding: 10,
        borderRadius: 50,
    },
});
