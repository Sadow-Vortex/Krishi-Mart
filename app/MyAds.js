import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
    View, Text, FlatList, Image, ActivityIndicator,
    StyleSheet, Alert, TouchableOpacity
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Footer from "./Footer";
import {useFocusEffect} from "@react-navigation/native";

const BACKEND_URL = 'http://10.0.167.11:2012';

export default function UserAdvertisements() {
    const navigation = useNavigation();
    const { userId } = useLocalSearchParams();
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);

    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    useFocusEffect(
        React.useCallback(() => {
            fetchAds();
        }, [userId])
    );

    const fetchAds = () => {
        if (!userId) return;
        setLoading(true);
        fetch(`${BACKEND_URL}/adv/userID/${userId}`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch advertisements');
                return res.json();
            })
            .then((data) => {
                setAds(Array.isArray(data.data) ? data.data : []);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching ads:', err);
                setLoading(false);
            });
    };

    const handleDelete = (adv_id) => {
        Alert.alert(
            'Delete Advertisement',
            'Are you sure you want to delete this ad?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        fetch(`${BACKEND_URL}/adv/${adv_id}`, {
                            method: 'DELETE',
                        })
                            .then((res) => {
                                if (!res.ok) throw new Error('Failed to delete ad');
                                fetchAds();
                            })
                            .catch((err) => {
                                console.error('Delete error:', err);
                                Alert.alert('Error', 'Failed to delete advertisement.');
                            });
                    },
                },
            ]
        );
    };

    const handleUpdate = (ad) => {
        console.log(ad);
        navigation.navigate('UpdateAdvertisement', { adData: ad });
    };

    const renderAd = ({ item }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.adv_Image }} style={styles.image} />
            <View style={styles.details}>
                <Text style={styles.title}>{item.adv_Title}</Text>
                <Text style={styles.price}>₹ {item.adv_Price}</Text>
                {item.adv_Location && (
                    <Text style={styles.location}>
                        {item.adv_Location.latitude}, {item.adv_Location.longitude}
                    </Text>
                )}
            </View>
            <View style={styles.iconColumn}>
                <TouchableOpacity onPress={() => handleUpdate(item)}>
                    <Feather name="edit-3" size={22} color="#007bff" style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.adv_id)}>
                    <Feather name="trash-2" size={22} color="#dc3545" style={styles.icon} />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.brand}>Kisan Seva</Text>
                <Text style={styles.title}>your trusted farmer platform</Text>
            </View>
            <Text style={styles.header}>Your Posted Advertisements</Text>
            {ads.length === 0 ? (
                <Text style={styles.empty}>No ads posted yet.</Text>
            ) : (
                <FlatList
                    data={ads}
                    keyExtractor={(item) => item.adv_id.toString()}
                    renderItem={renderAd}
                    contentContainerStyle={styles.list}
                    refreshing={loading}
                    onRefresh={fetchAds}
                />
            )}
            <Footer/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fff', paddingTop: 50 },
    header: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
    list: { paddingBottom: 50 },
    card: {
        flexDirection: 'row',
        marginBottom: 12,
        padding: 12,
        backgroundColor: '#f2f2f2',
        borderRadius: 10,
        elevation: 3,
        alignItems: 'center',
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },
    details: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    price: {
        fontSize: 16,
        color: 'green',
        marginTop: 4,
    },
    location: {
        fontSize: 14,
        color: '#555',
        marginTop: 4,
    },
    empty: {
        marginTop: 50,
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
    },
    iconColumn: {
        justifyContent: 'space-between',
        alignItems: 'center',
        marginLeft: 10,
        height: 60,
    },
    icon: {
        marginVertical: 2,
    },
});
