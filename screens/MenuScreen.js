import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons, MaterialIcons, FontAwesome } from "@expo/vector-icons"; 

// --- COULEURS BASÉES SUR VOTRE IMAGE ---
const PRIMARY_COLOR = "#4C1C8A";
const BACKGROUND_COLOR = "#F4F4F9";

// --- TRADUCTIONS MULTILINGUES ---
const translations = {
    fr: {
        appsPrincipales: "Apps Principales",
        dashboard: "Dashboard",
        members: "Membres",
        contribution: "Contribution",
        credit: "Crédit",
        remboursement: "Remboursement",
        report: "Rapport",
        parametres: "Paramètres",
        selectLanguage: "Changer la langue"
    },
    en: {
        appsPrincipales: "Main Apps",
        dashboard: "Dashboard",
        members: "Members",
        contribution: "Contribution",
        credit: "Credit",
        remboursement: "Refund",
        report: "Report",
        parametres: "Settings",
        selectLanguage: "Change language"
    },
    kdi: {
        appsPrincipales: "Ibihakorerwa",
        dashboard: "Incamake",
        members: "Abanywanyi",
        contribution: "Intererano",
        credit: "Ingurane",
        remboursement: "Kwishura",
        report: "Raporo",
        parametres: "Ubuhinga",
        selectLanguage: "Cagura ururimi"
    }
};

// Définition des éléments du menu avec clés de traduction
const menuItems = [
    { id: '1', nameKey: 'dashboard', icon: 'view-dashboard', route: 'Dashboard', iconLib: MaterialCommunityIcons, iconColor: PRIMARY_COLOR },
    { id: '2', nameKey: 'members', icon: 'account-group', route: 'Members', iconLib: MaterialCommunityIcons, iconColor: PRIMARY_COLOR },
    { id: '3', nameKey: 'contribution', icon: 'cash-multiple', route: 'Contribution', iconLib: MaterialCommunityIcons, iconColor: PRIMARY_COLOR },
    { id: '4', nameKey: 'credit', icon: 'credit-card', route: 'Credit', iconLib: MaterialCommunityIcons, iconColor: PRIMARY_COLOR },
    { id: '5', nameKey: 'remboursement', icon: 'currency-usd-off', route: 'Remboursement', iconLib: MaterialCommunityIcons, iconColor: PRIMARY_COLOR }, 
    { id: '6', nameKey: 'report', icon: 'file-chart', route: 'Report', iconLib: MaterialCommunityIcons, iconColor: PRIMARY_COLOR },
    { id: '7', nameKey: 'parametres', icon: 'cog', route: 'Parametres', iconLib: MaterialCommunityIcons, iconColor: PRIMARY_COLOR },
];

// Composant pour le sélecteur de langue
const LanguageSelector = ({ currentLanguage, onLanguageChange }) => {
    const [showSelector, setShowSelector] = useState(false);
    const languages = [
        { code: 'fr', name: 'FR', fullName: 'Français' },
        { code: 'en', name: 'EN', fullName: 'English' },
        { code: 'kdi', name: 'KDI', fullName: 'Kirundi' }
    ];

    return (
        <View style={styles.languageContainer}>
            <TouchableOpacity 
                style={styles.languageButton}
                onPress={() => setShowSelector(!showSelector)}
            >
                <Text style={styles.languageButtonText}>
                    {languages.find(lang => lang.code === currentLanguage)?.name}
                </Text>
                <MaterialIcons 
                    name={showSelector ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                    size={16} 
                    color={PRIMARY_COLOR} 
                />
            </TouchableOpacity>

            {showSelector && (
                <View style={styles.languageDropdown}>
                    {languages.map((language) => (
                        <TouchableOpacity
                            key={language.code}
                            style={[
                                styles.languageOption,
                                currentLanguage === language.code && styles.languageOptionSelected
                            ]}
                            onPress={() => {
                                onLanguageChange(language.code);
                                setShowSelector(false);
                            }}
                        >
                            <Text style={[
                                styles.languageOptionText,
                                currentLanguage === language.code && styles.languageOptionTextSelected
                            ]}>
                                {language.fullName}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
            
            {/* Overlay pour fermer le dropdown en cliquant ailleurs */}
            {showSelector && (
                <TouchableOpacity 
                    style={styles.overlay}
                    onPress={() => setShowSelector(false)}
                    activeOpacity={1}
                />
            )}
        </View>
    );
};

// Composant pour un seul élément de la grille
const MenuItem = ({ item, onPress, language }) => {
    const IconComponent = item.iconLib; 
    const translatedName = translations[language]?.[item.nameKey] || item.nameKey;

    return (
        <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => onPress(item.route)}
        >
            {IconComponent && <IconComponent name={item.icon} size={24} color={item.iconColor} />}
            <Text style={styles.menuItemText}>{translatedName}</Text>
        </TouchableOpacity>
    );
};

export default function MenuScreen() {
    const navigation = useNavigation();
    const [currentLanguage, setCurrentLanguage] = useState('fr');

    // Sauvegarder la langue dans le stockage local si nécessaire
    useEffect(() => {
        // Ici vous pouvez charger la langue sauvegardée depuis AsyncStorage
        // async function loadLanguage() {
        //     const savedLanguage = await AsyncStorage.getItem('appLanguage');
        //     if (savedLanguage) {
        //         setCurrentLanguage(savedLanguage);
        //     }
        // }
        // loadLanguage();
    }, []);

    const handleLanguageChange = async (languageCode) => {
        setCurrentLanguage(languageCode);
        // Sauvegarder la préférence de langue
        // await AsyncStorage.setItem('appLanguage', languageCode);
    };

    // Fonction de rendu pour chaque élément de la FlatList
    const renderMenuItem = ({ item }) => (
        <MenuItem 
            item={item} 
            onPress={(route) => route && navigation.navigate(route)} 
            language={currentLanguage}
        />
    );

    return (
        <View style={styles.container}>
            {/* Header avec titre et sélecteur de langue */}
            <View style={styles.header}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        {translations[currentLanguage]?.appsPrincipales || "Apps Principales"}
                    </Text>
                    <MaterialIcons name="keyboard-arrow-up" size={24} color={PRIMARY_COLOR} />
                </View>
                
                {/* Sélecteur de langue */}
                <LanguageSelector 
                    currentLanguage={currentLanguage}
                    onLanguageChange={handleLanguageChange}
                />
            </View>

            {/* Grille des icônes du menu */}
            <FlatList
                data={menuItems}
                renderItem={renderMenuItem}
                keyExtractor={(item) => item.id}
                numColumns={3}
                contentContainerStyle={styles.menuGrid}
                scrollEnabled={false}
                style={styles.flatList}
            />          
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BACKGROUND_COLOR,
        paddingTop: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 15,
        marginTop: 10,
        zIndex: 100, // ✅ Assure que le header reste au-dessus
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 16, 
        fontWeight: "bold",
        color: PRIMARY_COLOR, 
        marginRight: 10,
    },
    // Styles pour le sélecteur de langue
    languageContainer: {
        position: 'relative',
        zIndex: 1000, // ✅ Z-index élevé pour le conteneur
    },
    languageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: PRIMARY_COLOR,
        minWidth: 60,
        justifyContent: 'space-between',
        zIndex: 1001, // ✅ Z-index plus élevé pour le bouton
    },
    languageButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: PRIMARY_COLOR,
        marginRight: 4,
    },
    languageDropdown: {
        position: 'absolute',
        top: 35,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2, // ✅ Ombre plus visible
        shadowRadius: 6,
        elevation: 10, // ✅ Élévation plus importante pour Android
        minWidth: 120,
        zIndex: 1002, // ✅ Z-index le plus élevé pour le dropdown
    },
    languageOption: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    languageOptionSelected: {
        backgroundColor: PRIMARY_COLOR + '20',
    },
    languageOptionText: {
        fontSize: 12,
        color: '#333',
    },
    languageOptionTextSelected: {
        color: PRIMARY_COLOR,
        fontWeight: 'bold',
    },
    // ✅ Overlay pour fermer le dropdown
    overlay: {
        position: 'absolute',
        top: -100, // Étendre vers le haut
        left: -100, // Étendre vers la gauche
        right: -100, // Étendre vers la droite
        bottom: -100, // Étendre vers le bas
        backgroundColor: 'transparent',
        zIndex: 999, // ✅ En dessous du dropdown mais au-dessus du reste
    },
    menuGrid: {
        justifyContent: 'flex-start', 
        paddingHorizontal: 5,
        paddingBottom: 20,
    },
    flatList: {
        zIndex: 1, // ✅ Z-index bas pour la FlatList
    },
    menuItem: {
        backgroundColor: "#fff", 
        borderRadius: 15, 
        width: '30%', 
        aspectRatio: 1, 
        justifyContent: "center",
        alignItems: "center",
        margin: '1.66%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 3,
        zIndex: 1, // ✅ Z-index bas pour les items du menu
    },
    menuItemText: {
        fontSize: 9,
        color: "#333",
        marginTop: 6,
        textAlign: 'center',
    },
    
    // Styles du Placeholder
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