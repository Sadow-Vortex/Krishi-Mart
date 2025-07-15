import React, {useEffect, useLayoutEffect, useState} from "react";
import {
    View, Image, FlatList, StyleSheet, Dimensions,
    ActivityIndicator, Text, TouchableOpacity
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import view from "react-native-web/src/exports/View";
import Footer from "./Footer";

const { width } = Dimensions.get("window");
const IMAGE_WIDTH = width / 2 - 20;

export default function SubCategory() {
    const navigation = useNavigation();
    const { categoryId } = useLocalSearchParams();
    const [subCategory, setSubCategory] = useState([]);
    const [loading, setLoading] = useState(true);
    const url = `http://10.0.167.11:2001`;

    useLayoutEffect(()=>{
        navigation.setOptions({
            headerShown: false,
        })
    })


    const fetchSubCategory = async () => {
        try {
            const response = await fetch(`${url}/api/subcategories/by-category/${categoryId}`);
            const data = await response.json();
            const subcategoryArray = Array.isArray(data) ? data : data.data || [];
            setSubCategory(subcategoryArray);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (categoryId) {
            fetchSubCategory();
        }
    }, [categoryId]);

    const renderItem = ({ item }) => {
        console.log("SubCategory item:");
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('AdsBySubCategory', {
                    subCategoryId: item.subCategory_Id
                })}
            >
                <Image
                    source={{ uri: item.image }}
                    style={styles.image}
                    onError={() => console.warn("Failed to load image:", item.image)}
                />
                <Text style={{ marginTop: 7 }}>{item.subCategory_Name}</Text>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: "center" }} />;
    }

    if (!Array.isArray(subCategory) || subCategory.length === 0) {
        return (
            <>
                <View style={styles.header}>
                    <Text style={styles.brand}>Krishi Mart</Text>
                </View>
                <Text style={{ textAlign: "center", marginTop: 50 }}>No Sub Categories</Text>
                <Footer/>
            </>
        );
    }

    return (
        <View  style={{ flex: 1, backgroundColor: '#f4f7fb' }}>
            <View style={styles.header}>
                <Text style={styles.brand}>Kisan Seva</Text>
                <Text style={styles.title}>your trusted farmer platform</Text>
            </View>
            <FlatList
                data={subCategory}
                keyExtractor={(item, index) => {
                    if (!item || item.subCategory_Id === undefined || item.subCategory_Id === null) {
                        console.warn("Missing subCategory_Id", item);
                        return index.toString();
                    }
                    return item.subCategory_Id.toString();
                }}
                renderItem={renderItem}
                numColumns={2}
                contentContainerStyle={styles.container}
            />
            <Footer/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
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
    image: {
        width: IMAGE_WIDTH,
        height: 150,
        borderRadius: 10,
    },

    card: {
        flex: 1,
        margin: 5,
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});
