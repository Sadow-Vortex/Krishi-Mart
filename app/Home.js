import React, { useEffect, useState, useLayoutEffect } from "react";
import {
    View, Image, FlatList, StyleSheet, Dimensions,
    ActivityIndicator, Text, TouchableOpacity, Modal, Alert, Linking
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
    const [users, setUsers] = useState([]);
    const [usersLoaded, setUsersLoaded] = useState(false);
    const [popularAds, setPopularAds] = useState([]);
    const [RecentAds, setRecentAds] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedAd, setSelectedAd] = useState(null);

    const url = `http://10.0.167.11:2001`;
    const urll = `http://10.0.167.11:2012`;
    const userUrl = `http://10.0.167.11:1012`;

    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    useEffect(() => {
        fetchUsers();
        fetchCategories();
        fetchPopularAds();
        fetchRecentAds();

    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${urll}/users`);
            const data = await response.json();
            const userArray = Array.isArray(data.data) ? data.data : [];
            setUsers(userArray);
            setUsersLoaded(true);
        } catch (error) {
            console.error("Error fetching users:", error);
            setUsersLoaded(false);
        }
    };

    const fetchPopularAds = async () => {
        try {
            const response = await fetch(`${urll}/adv`);
            const data = await response.json();
            const ads = Array.isArray(data.data) ? data.data : [];
            const sortedAds = ads
                .filter(ad => ad.adv_Status === true)
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);
            setPopularAds(sortedAds);
        } catch (error) {
            console.error("Error fetching popular ads:");
        }
    };

    const fetchRecentAds = async () => {
        try {
            const response = await fetch(`${urll}/adv`);
            const data = await response.json();
            const ads = Array.isArray(data.data) ? data.data : [];
            const sortedAds = ads
                .filter(ad => ad.adv_Status === true)
                .sort((a, b) => new Date(b.adv_Date) - new Date(a.adv_Date))
                .slice(0, 5);
            setRecentAds(sortedAds);
        } catch (error) {
            console.error("Error fetching recent ads:", error);
        }
    };

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

    const openModal = async (ad) => {
        try {
            const storedUser = await AsyncStorage.getItem('user');
            const viewerId = storedUser ? JSON.parse(storedUser)?.id : null;

            if (!viewerId) {
                Alert.alert("Login Error", "Please log in to view this ad.");
                return;
            }

            if (users.length === 0) {
                const userRes = await fetch(`${userUrl}/users`);
                const userData = await userRes.json();
                const userArray = Array.isArray(userData.data) ? userData.data : [];
                setUsers(userArray);

                const response = await fetch(`${urll}/adv/${ad.adv_id}?viewerId=${viewerId}`);
                const result = await response.json();
                const updatedAd = result?.data;

                const farmer = userArray.find(user => user.id === updatedAd.advUserID);
                setSelectedAd({ ...updatedAd, farmer });
                setModalVisible(true);
            } else {
                const response = await fetch(`${urll}/adv/${ad.adv_id}?viewerId=${viewerId}`);
                const result = await response.json();
                const updatedAd = result?.data;

                const farmer = users.find(user => user.id === updatedAd.advUserID);
                setSelectedAd({ ...updatedAd, farmer });
                setModalVisible(true);
            }
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

    const bannerItems = [
        { image: "https://i.pinimg.com/736x/d5/ad/c1/d5adc1d3ba0ee46ccca8b2e0850796c9.jpg" },
        { image: "https://i.pinimg.com/736x/01/79/d6/0179d67a34789b7c046598512658013f.jpg" },
        { image: "https://i.pinimg.com/736x/7b/e1/69/7be169497d66bc6b2335885ac84a79bf.jpg" }
    ];

    const renderBannerItem = ({ item }) => (
        <View style={styles.slide}>
            <Image source={{ uri: item.image }} style={styles.bannerImage} resizeMode="cover" />
        </View>
    );

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
                <Text style={styles.brand}>Kisan Seva</Text>
                <Text style={styles.title}>your trusted farmer platform</Text>
            </View>

            <View style={{ height: 150, overflow: 'hidden' }}>
                <FlatList
                    data={bannerItems}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={renderBannerItem}
                />
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Categories</Text>
            </View>
            <View style={{ marginBottom: 10, overflow: 'hidden' }}>
                <FlatList
                    data={categories}
                    keyExtractor={(item, index) => item?.categoryId?.toString() || index.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryRow}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.circleWrapper}
                            onPress={() => navigation.navigate("SubCategory", { categoryId: item.categoryId })}
                        >
                            <Image source={{ uri: item.image }} style={styles.circleImage} />
                            <Text style={styles.categoryLabel}>{item.categoryName}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Popular Items</Text>
            </View>
            <View style={{ marginBottom: 10, overflow: 'hidden' }}>
                <FlatList
                    data={popularAds}
                    keyExtractor={(item) => item.adv_id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.popularRow}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.popularCard} onPress={() => openModal(item)}>
                            <Image source={{ uri: item.adv_Image }} style={styles.popularImage} />
                            <Text numberOfLines={1} style={styles.popularTitle}>{item.adv_Title}</Text>
                            <Text style={styles.popularCount}>Price: {item.adv_Price}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Fresh Items</Text>
            </View>
            <View style={{ marginBottom: 10, overflow: 'hidden' }}>
                <FlatList
                    data={RecentAds}
                    keyExtractor={(item) => item.adv_id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.popularRow}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.popularCard} onPress={() => openModal(item)}>
                            <Image source={{ uri: item.adv_Image }} style={styles.popularImage} />
                            <Text numberOfLines={1} style={styles.popularTitle}>{item.adv_Title}</Text>
                            <Text style={styles.popularCount}>Price: {item.adv_Price}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modelBackground}>
                    <View style={styles.modelContent}>
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

                                <Text style={styles.farmerText}>
                                    Farmer: {selectedAd.farmer?.name || 'Unknown'}
                                </Text>

                                {selectedAd.farmer?.profilePic && (
                                    <Image
                                        source={{ uri: selectedAd.farmer.profilePic }}
                                        style={{ width: 60, height: 60, borderRadius: 30, marginTop: 10 }}
                                    />
                                )}

                                <View style={styles.iconRow}>
                                    <TouchableOpacity
                                        style={styles.iconButton}
                                        onPress={() => openDialer(selectedAd.farmer?.phoneNumber)}
                                    >
                                        <Ionicons name="call" size={24} color="#1e90ff" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.iconButton}
                                        onPress={() => Alert.alert("Chat", "Chat with farmer coming soon.")}
                                    >
                                        <Text style={styles.chatText}>💬</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.iconButton}
                                        onPress={() => openMap(
                                            selectedAd.adv_Location?.latitude,
                                            selectedAd.adv_Location?.longitude
                                        )}
                                    >
                                        <Ionicons name="location" size={24} color="green" />
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            <TouchableOpacity style={styles.fab} onPress={handleAddPress}>
                <Ionicons name="add" size={32} color="#000" />
            </TouchableOpacity>

            <Footer />
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
        color: '#217300',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        alignItems: 'center',
        marginBottom: 6,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3ab008',
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
    slide: {
        width: width,
        height: 150,
        borderRadius: 12,
        overflow: 'hidden',
        margin: 0,
        padding: 0,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    popularRow: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    popularCard: {
        width: 140,
        backgroundColor: '#fff',
        marginRight: 16,
        borderRadius: 12,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    popularImage: {
        width: '100%',
        height: 80,
        borderRadius: 8,
        marginBottom: 6,
    },
    popularTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    popularCount: {
        fontSize: 12,
        color: '#23be0d',
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
    modelBackground: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 20,
    },
    modelContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    crossIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
        padding: 5,
    },
    modalImage: {
        width: 250,
        height: 200,
        marginBottom: 10,
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#1e293b',
    },
    farmerText: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    iconRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '80%',
        marginTop: 15,
    },
    iconButton: {
        backgroundColor: '#eef',
        padding: 10,
        borderRadius: 50,
    },
    chatText: {
        fontSize: 20,
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
    viewCountText: {
        color: '#fff',
        marginLeft: 4,
        fontSize: 14,
    },
});




