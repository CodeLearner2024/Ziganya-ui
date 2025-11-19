import React, { useState } from "react";
import { 
    View, 
    Text, 
    StyleSheet, 
    Image, 
    TouchableOpacity, 
    TextInput, 
    Alert 
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// --- Configuration ---
// Assurez-vous d'ajuster ce chemin si votre image est ailleurs (e.g., './assets/Ziganya.png')
const ZIGANYA_LOGO = require('../assets/Ziganya.png'); 

export default function LoginScreen({ navigation }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // Identifiants par défaut : eric, 1234
    const DEFAULT_USERNAME = "eric";
    const DEFAULT_PASSWORD = "1234";

    const handleLogin = () => {
        if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
            Alert.alert("Succès", "Connexion réussie !");
            // Remplacer "Home" par le nom de votre écran principal
            navigation.navigate("Menu");
        } else {
            // Afficher le toast d'erreur
            setShowToast(true);
            // Masquer automatiquement après 3 secondes
            setTimeout(() => setShowToast(false), 3000);
        }
    };

    return (
        <LinearGradient
            // Couleurs de dégradé utilisées dans votre code
            colors={["#E0F3FF", "#005EB8"]} 
            style={styles.gradientBackground}
        >
            <View style={styles.container}>
                
                {/* Toast Notification */}
                {showToast && (
                    <View style={styles.toastContainer}>
                        <Text style={styles.toastText}>Nom d'utilisateur ou mot de passe incorrect</Text>
                    </View>
                )}
                
                {/* HEADER AVEC LOGO */}
                <View style={styles.header}>
                    <Image
                        source={ZIGANYA_LOGO}
                        style={styles.logo}
                    />
                    <Text style={styles.headerTitle}>
                        Connexion au <Text style={styles.headerSubTitle}>ZIGANYA</Text>
                    </Text>
                </View>

                {/* LOGIN FORM */}
                <View style={styles.loginForm}>
                    {/* Username Field */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>USERNAME</Text>
                        <TextInput
                            style={styles.textInput}
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Enter your username"
                            placeholderTextColor="#999"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Password Field */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>PASSWORD</Text>
                        <TextInput
                            style={styles.textInput}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter your password"
                            placeholderTextColor="#999"
                            secureTextEntry
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Remember Me & Forgot Password */}
                    <View style={styles.optionsContainer}>
                        <TouchableOpacity 
                            style={styles.rememberMeContainer}
                            onPress={() => setRememberMe(!rememberMe)}
                        >
                            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.rememberMeText}>Remember me</Text>
                        </TouchableOpacity>

                        <TouchableOpacity>
                            <Text style={styles.forgotPassword}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* LOGIN BUTTON */}
                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                        <Text style={styles.loginButtonText}>LOG IN</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradientBackground: {
        flex: 1,
    },
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 30,
    },
    
    // Styles pour le toast
    toastContainer: {
        position: 'absolute',
        top: 50,
        backgroundColor: '#FF3B30',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        zIndex: 1000,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    toastText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    
    // Nouveaux styles pour le logo
    header: {
        alignItems: "center",
        marginBottom: 30, // Réduit l'espace pour le logo
    },
    logo: {
        width: 150, // Taille ajustée pour le logo rond
        height: 150,
        borderRadius: 75,
        marginBottom: 15,
        borderWidth: 4,
        borderColor: '#FFF', // Bordure blanche pour contraster avec le dégradé
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "600",
        color: "#FFF",
        letterSpacing: 1,
        textShadowColor: 'rgba(0, 0, 0, 0.4)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    headerSubTitle: {
        fontWeight: "bold",
        color: "#003366", // Utiliser une couleur du logo
        textShadowColor: 'rgba(255, 255, 255, 0.8)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 1,
    },
    
    // Styles du formulaire (légèrement ajustés pour la cohérence)
    loginForm: {
        width: "100%",
        maxWidth: 400, // Ajout d'une largeur maximale pour les écrans larges
        backgroundColor: "rgba(255, 255, 255, 0.95)", // Plus opaque
        padding: 30,
        borderRadius: 15,
        elevation: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#003366",
        marginBottom: 8,
        letterSpacing: 1,
    },
    textInput: {
        backgroundColor: "#F8F8F8",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        color: "#333",
    },
    optionsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 30,
    },
    rememberMeContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: "#005EB8",
        borderRadius: 4,
        marginRight: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    checkboxChecked: {
        backgroundColor: "#005EB8",
    },
    checkmark: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },
    rememberMeText: {
        color: "#003366",
        fontSize: 14,
    },
    forgotPassword: {
        color: "#005EB8",
        fontSize: 14,
        fontWeight: "600",
    },
    loginButton: {
        backgroundColor: "#004080",
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: "center",
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    loginButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        letterSpacing: 1,
    },
});