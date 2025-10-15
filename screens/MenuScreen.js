import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons, MaterialIcons, FontAwesome } from "@expo/vector-icons"; 

// --- COULEURS BASÉES SUR VOTRE IMAGE ---
const PRIMARY_COLOR = "#4C1C8A"; // Violet foncé (similaire à la couleur principale de l'image)
const BACKGROUND_COLOR = "#F4F4F9"; // Fond très clair / blanc cassé

// Définition des éléments du menu
const menuItems = [
    { id: '1', name: 'Dashboard', icon: 'view-dashboard', route: 'Dashboard', iconLib: MaterialCommunityIcons, iconColor: PRIMARY_COLOR },
    { id: '2', name: 'Members', icon: 'account-group', route: 'Members', iconLib: MaterialCommunityIcons, iconColor: PRIMARY_COLOR },
    { id: '3', name: 'Contribution', icon: 'cash-multiple', route: 'Contribution', iconLib: MaterialCommunityIcons, iconColor: PRIMARY_COLOR },
    { id: '4', name: 'Credit', icon: 'credit-card', route: 'Credit', iconLib: MaterialCommunityIcons, iconColor: PRIMARY_COLOR },
    { id: '5', name: 'Remboursement', icon: 'currency-usd-off', route: 'Remboursement', iconLib: MaterialCommunityIcons, iconColor: PRIMARY_COLOR }, 
    { id: '6', name: 'Report', icon: 'file-chart', route: 'Report', iconLib: MaterialCommunityIcons, iconColor: PRIMARY_COLOR },
    { id: '7', name: 'Paramètres', icon: 'cog', route: 'Parametres', iconLib: MaterialCommunityIcons, iconColor: PRIMARY_COLOR },
    // Ajoutez des éléments vides pour compléter la grille 3x3 si vous en avez besoin (ex: {id: '8', name: '...'})
];

// Composant pour un seul élément de la grille
const MenuItem = ({ item, onPress }) => {
    const IconComponent = item.iconLib; 

    return (
        <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => onPress(item.route)}
        >
            {/* 🚨 Taille de l'icône réduite à 24 */}
            {IconComponent && <IconComponent name={item.icon} size={24} color={item.iconColor} />}
            <Text style={styles.menuItemText}>{item.name}</Text>
        </TouchableOpacity>
    );
};

export default function MenuScreen() {
    const navigation = useNavigation();

    // Fonction de rendu pour chaque élément de la FlatList
    const renderMenuItem = ({ item }) => (
        <MenuItem item={item} onPress={(route) => route && navigation.navigate(route)} />
    );

    return (
        <ScrollView style={styles.container}>
            
            {/* Section "Core Team Apps" (Titre) */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Apps Principales</Text>
                {/* Icône de flèche pour l'effet d'accordéon (maintenu du style de l'image) */}
                <MaterialIcons name="keyboard-arrow-up" size={24} color={PRIMARY_COLOR} />
            </View>

            {/* Grille des icônes du menu */}
            <FlatList
                data={menuItems}
                renderItem={renderMenuItem}
                keyExtractor={(item) => item.id}
                numColumns={3} // 3 colonnes comme dans l'image
                contentContainerStyle={styles.menuGrid}
                scrollEnabled={false} // Le ScrollView parent gère le défilement
            />          
            
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BACKGROUND_COLOR, // Fond très clair
        paddingTop: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 15,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 16, 
        fontWeight: "bold",
        color: PRIMARY_COLOR, 
    },
    menuGrid: {
        justifyContent: 'flex-start', 
        paddingHorizontal: 5,
        paddingBottom: 20, 
    },
    menuItem: {
        backgroundColor: "#fff", 
        borderRadius: 15, 
        width: '30%', 
        aspectRatio: 1, 
        justifyContent: "center",
        alignItems: "center",
        margin: '1.66%', // Marge pour 3 colonnes
        // Ombre plus subtile pour un look "flat" mais surélevé
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08, // Ombre plus légère
        shadowRadius: 2,
        elevation: 3, // Ombre pour Android
    },
    menuItemText: {
        fontSize: 9, // 🚨 Taille du texte réduite à 9
        color: "#333",
        marginTop: 6, // Espacement ajusté
        textAlign: 'center',
    },
    
    // --- Styles du Placeholder conservés pour la structure ---
    placeholderThirdPartyApps: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        marginHorizontal: 15,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 100,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08, 
        shadowRadius: 2,
        elevation: 3,
        marginBottom: 20, 
    },
    placeholderText: {
        color: '#888',
        fontStyle: 'italic',
    },
});