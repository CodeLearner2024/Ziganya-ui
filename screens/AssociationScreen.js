import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Modal,
    Alert,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons"; 
import axios from "axios";
import { Picker } from "@react-native-picker/picker";

// --- Configuration API et Constantes ---
const API_BASE_URL = "http://192.168.40.90:8001/ziganya-managment-system/api/v1";
const DETAILS_API = `${API_BASE_URL}/association-details`;
const SETTINGS_API = `${API_BASE_URL}/association-settings`;

// 🚨 MIS À JOUR : Reflect InterestFrequency enum (DAILY, MONTHLY)
const INTEREST_FREQUENCIES = [
    { label: "Quotidienne (DAILY)", value: "DAILY" },
    { label: "Mensuelle (MONTHLY)", value: "MONTHLY" },
    // L'option YEARLY a été retirée.
];

// Fonction utilitaire pour extraire le message d'erreur du backend
const getBackendErrorMessage = (error) => {
    if (error.response && error.response.data) {
        const data = error.response.data;
        return data.message || data.errorMessage || JSON.stringify(data);
    } 
    else if (error.request) {
        return "❌ Connexion au serveur échouée. Le backend n'est peut-être pas lancé ou l'adresse est incorrecte.";
    } 
    else if (error.message) {
        return `Une erreur s'est produite : ${error.message}`;
    } 
    else {
        return "Une erreur inconnue est survenue.";
    }
};

// Modèle de données par défaut pour les détails de l'association
const initialDetailsState = {
    name: "",
    email: "",
    contact: "",
    address: "",
};

// Modèle de données par défaut pour les paramètres
const initialSettingsState = {
    contributionAmount: 0,
    manyOfMemberShipFee: 0,
    latePaymentPenalityInPercentage: 0,
    cycleStartDate: "YYYY-MM-DD",
    maxOfActions: 0,
    timesOfContributionForCredit: 0,
    interestFrequency: "DAILY", // Valeur par défaut
    creditRate: 0,
    id: null, 
    cycleEndDate: null,
};

// Composant pour afficher les erreurs critiques de chargement
const ErrorDisplay = ({ message, onRetry }) => (
    <View style={styles.errorContainer}>
        <MaterialIcons name="warning" size={30} color="#D8000C" />
        <Text style={styles.errorText}>Erreur Critique de Chargement :</Text>
        <Text style={styles.errorTextDetail}>{message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Réessayer le Chargement</Text>
        </TouchableOpacity>
    </View>
);


export default function AssociationScreen() {
    const [activeTab, setActiveTab] = useState("details"); 
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [criticalError, setCriticalError] = useState(null); 
    
    // --- États pour l'onglet Détails ---
    const [details, setDetails] = useState(initialDetailsState);
    const [isDetailsEditing, setIsDetailsEditing] = useState(false);
    
    // --- États pour l'onglet Paramètres ---
    const [settings, setSettings] = useState(initialSettingsState);
    const [isSettingsEditing, setIsSettingsEditing] = useState(false);

    // --- Pop-up message ---
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [popupType, setPopupType] = useState("success");

    const showPopup = (message, type = "success") => {
        setPopupMessage(message);
        setPopupType(type);
        setPopupVisible(true);
        setTimeout(() => setPopupVisible(false), 3500);
    };


    // =========================================================================
    //                      LOGIQUE DE CHARGEMENT
    // =========================================================================

    const loadDetails = useCallback(async () => {
        try {
            const response = await axios.get(DETAILS_API);
            setDetails(response.data || initialDetailsState);
            setCriticalError(null); 
        } catch (error) {
            console.error("Erreur de chargement des détails:", error);
            const errorMessage = getBackendErrorMessage(error);
            showPopup(`Erreur Détails: ${errorMessage}`, "error");
            if(activeTab === 'details') setCriticalError(errorMessage); 
        }
    }, [activeTab]);

    const loadSettings = useCallback(async () => {
        try {
            const response = await axios.get(SETTINGS_API);
            const allSettings = Array.isArray(response.data) ? response.data : [];
            
            // Chercher le paramètre actif (cycleEndDate est null)
            const activeSetting = allSettings.find(s => s.cycleEndDate === null);
            
            let data = activeSetting || initialSettingsState;

            // Assurer que les champs sont présents et convertis
            const safeSettings = {
                ...initialSettingsState,
                ...data, 
                // Assurer que les valeurs numériques sont des strings pour l'affichage dans TextInput
                contributionAmount: data.contributionAmount != null ? data.contributionAmount.toString() : '0',
                manyOfMemberShipFee: data.manyOfMemberShipFee != null ? data.manyOfMemberShipFee.toString() : '0',
                latePaymentPenalityInPercentage: data.latePaymentPenalityInPercentage != null ? data.latePaymentPenalityInPercentage.toString() : '0',
                maxOfActions: data.maxOfActions != null ? data.maxOfActions.toString() : '0',
                timesOfContributionForCredit: data.timesOfContributionForCredit != null ? data.timesOfContributionForCredit.toString() : '0',
                creditRate: data.creditRate != null ? data.creditRate.toString() : '0',
                // Laissez les non-numériques tels quels
                cycleStartDate: data.cycleStartDate || initialSettingsState.cycleStartDate,
                interestFrequency: data.interestFrequency || initialSettingsState.interestFrequency,
                id: data.id || null, 
            };

            setSettings(safeSettings);
            setCriticalError(null); 
        } catch (error) {
            console.error("Erreur de chargement des paramètres:", error);
            const errorMessage = getBackendErrorMessage(error);
            showPopup(`Erreur Paramètres: ${errorMessage}`, "error");
            if(activeTab === 'settings') setCriticalError(errorMessage);
            setSettings(initialSettingsState); 
        }
    }, [activeTab]);

    const loadAllData = useCallback(async () => {
        setLoading(true);
        setCriticalError(null); 
        await Promise.all([loadDetails(), loadSettings()]);
        setLoading(false);
    }, [loadDetails, loadSettings]);

    useEffect(() => {
        loadAllData();
    }, [loadAllData]);


    // =========================================================================
    //                      LOGIQUE DE SAUVEGARDE
    // =========================================================================

    const saveAssociationData = async (type) => {
        setIsSubmitting(true);
        let api, data, successMessage, editingSetter, loadFunction;
        let method = 'POST'; 

        if (type === 'details') {
            api = DETAILS_API;
            data = details;
            successMessage = "Détails de l'association mis à jour avec succès.";
            editingSetter = setIsDetailsEditing;
            loadFunction = loadDetails;
            
            if (!data.name || !data.email || !data.contact) {
                setIsSubmitting(false);
                return showPopup("Veuillez remplir au moins le Nom, l'Email et le Contact.", "error");
            }
        } else if (type === 'settings') {
            api = SETTINGS_API;

            // Conversion et Validation
            const numContributionAmount = parseFloat(settings.contributionAmount);
            const numCreditRate = parseFloat(settings.creditRate);
            
            data = {
                contributionAmount: numContributionAmount,
                manyOfMemberShipFee: parseFloat(settings.manyOfMemberShipFee),
                latePaymentPenalityInPercentage: parseFloat(settings.latePaymentPenalityInPercentage),
                cycleStartDate: settings.cycleStartDate,
                maxOfActions: parseInt(settings.maxOfActions, 10),
                timesOfContributionForCredit: parseInt(settings.timesOfContributionForCredit, 10),
                interestFrequency: settings.interestFrequency,
                creditRate: numCreditRate,
                id: settings.id,
            };
            successMessage = "Paramètres de l'association mis à jour avec succès.";
            editingSetter = setIsSettingsEditing;
            loadFunction = loadSettings;
            
            // Validation
            if (isNaN(numContributionAmount) || numContributionAmount <= 0 || 
                isNaN(numCreditRate) || numCreditRate < 0 ||
                !data.cycleStartDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                setIsSubmitting(false);
                return showPopup("Veuillez vérifier les valeurs numériques et la date du cycle (YYYY-MM-DD).", "error");
            }
        } else {
            setIsSubmitting(false);
            return;
        }

        try {
            await axios({
                method: method,
                url: api,
                data: data,
            });
            
            await loadFunction(); 
            
            showPopup(successMessage, "success");
            editingSetter(false); 
        } catch (error) {
            console.error(`Erreur de sauvegarde ${type}:`, error);
            showPopup(getBackendErrorMessage(error), "error");
        } finally {
            setIsSubmitting(false);
        }
    };


    // =========================================================================
    //                      RENDU DES ONGLETS
    // =========================================================================

    const renderDetailsTab = () => {
        if (criticalError && activeTab === 'details') {
            return <ErrorDisplay message={criticalError} onRetry={loadAllData} />;
        }
        
        return (
            <View style={styles.tabContent}>
                <Text style={styles.sectionTitle}>Information de l'Association</Text>

                {Object.keys(initialDetailsState).map((key) => (
                    <View key={key}>
                        <Text style={styles.label}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                        <TextInput
                            style={[styles.input, isDetailsEditing ? styles.inputActive : styles.inputDisabled]}
                            value={details[key] || ''} 
                            onChangeText={(text) => setDetails({ ...details, [key]: text })}
                            editable={isDetailsEditing && !isSubmitting}
                            placeholder={`Entrez l'${key.charAt(0).toUpperCase() + key.slice(1)}`}
                        />
                    </View>
                ))}

                <TouchableOpacity 
                    style={[styles.actionButton, isDetailsEditing && { backgroundColor: 'orange' }]}
                    onPress={() => isDetailsEditing ? saveAssociationData('details') : setIsDetailsEditing(true)}
                    disabled={isSubmitting || loading}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>
                            {isDetailsEditing ? "💾 Enregistrer les modifications" : "✏️ Modifier les Détails"}
                        </Text>
                    )}
                </TouchableOpacity>
                
                {isDetailsEditing && (
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.cancelButton]}
                        onPress={() => {
                            loadDetails(); 
                            setIsDetailsEditing(false);
                        }}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.buttonText}>Annuler</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderSettingsTab = () => {
        if (criticalError && activeTab === 'settings') {
            return <ErrorDisplay message={criticalError} onRetry={loadAllData} />;
        }
        
        const isInitialState = settings.id === null && settings.cycleStartDate === initialSettingsState.cycleStartDate;

        if (isInitialState) {
             return (
                 <View style={styles.tabContent}>
                     <Text style={styles.sectionTitle}>Paramètres Financiers et Opérationnels</Text>
                     <Text style={{textAlign: 'center', color: '#555', marginTop: 20, marginBottom: 15, paddingHorizontal: 20}}>
                         Aucun paramètre actif n'a été trouvé (`cycleEndDate` est null). Veuillez définir les paramètres initiaux.
                     </Text>
                     <TouchableOpacity 
                         style={[styles.actionButton, {backgroundColor: 'green'}]}
                         onPress={() => {
                             setSettings({...initialSettingsState, cycleStartDate: new Date().toISOString().slice(0, 10)}); 
                             setIsSettingsEditing(true);
                         }}
                         disabled={isSubmitting}
                     >
                         <Text style={styles.buttonText}>Créer les Paramètres Initiaux</Text>
                     </TouchableOpacity>
                 </View>
             );
         }

        return (
            <View style={styles.tabContent}>
                <Text style={styles.sectionTitle}>Paramètres du Cycle Actuel</Text>

                {/* Contribution Amount */}
                <Text style={styles.label}>Montant de la cotisation (FBu)</Text>
                <TextInput
                    style={[styles.input, isSettingsEditing ? styles.inputActive : styles.inputDisabled]}
                    value={settings.contributionAmount}
                    onChangeText={(text) => setSettings({ ...settings, contributionAmount: text })}
                    editable={isSettingsEditing && !isSubmitting}
                    keyboardType="numeric"
                />
                
                {/* Membership Fee */}
                <Text style={styles.label}>Frais d'adhésion (FBu)</Text>
                <TextInput
                    style={[styles.input, isSettingsEditing ? styles.inputActive : styles.inputDisabled]}
                    value={settings.manyOfMemberShipFee}
                    onChangeText={(text) => setSettings({ ...settings, manyOfMemberShipFee: text })}
                    editable={isSettingsEditing && !isSubmitting}
                    keyboardType="numeric"
                />

                {/* Late Payment Penalty */}
                <Text style={styles.label}>Pénalité de retard (%)</Text>
                <TextInput
                    style={[styles.input, isSettingsEditing ? styles.inputActive : styles.inputDisabled]}
                    value={settings.latePaymentPenalityInPercentage}
                    onChangeText={(text) => setSettings({ ...settings, latePaymentPenalityInPercentage: text })}
                    editable={isSettingsEditing && !isSubmitting}
                    keyboardType="numeric"
                />

                {/* Cycle Start Date */}
                <Text style={styles.label}>Date de début du cycle (YYYY-MM-DD)</Text>
                <TextInput
                    style={[styles.input, isSettingsEditing ? styles.inputActive : styles.inputDisabled]}
                    value={settings.cycleStartDate}
                    onChangeText={(text) => setSettings({ ...settings, cycleStartDate: text })}
                    editable={isSettingsEditing && !isSubmitting}
                    placeholder="Ex: 2025-01-01"
                />
                
                {/* Max Of Actions */}
                <Text style={styles.label}>Maximum d'Actions/Parts</Text>
                <TextInput
                    style={[styles.input, isSettingsEditing ? styles.inputActive : styles.inputDisabled]}
                    value={settings.maxOfActions}
                    onChangeText={(text) => setSettings({ ...settings, maxOfActions: text })}
                    editable={isSettingsEditing && !isSubmitting}
                    keyboardType="numeric"
                />

                {/* Times Of Contribution For Credit */}
                <Text style={styles.label}>Contributions requises pour le crédit</Text>
                <TextInput
                    style={[styles.input, isSettingsEditing ? styles.inputActive : styles.inputDisabled]}
                    value={settings.timesOfContributionForCredit}
                    onChangeText={(text) => setSettings({ ...settings, timesOfContributionForCredit: text })}
                    editable={isSettingsEditing && !isSubmitting}
                    keyboardType="numeric"
                />
                
                {/* Credit Rate */}
                <Text style={styles.label}>Taux d'intérêt du crédit (%)</Text>
                <TextInput
                    style={[styles.input, isSettingsEditing ? styles.inputActive : styles.inputDisabled]}
                    value={settings.creditRate}
                    onChangeText={(text) => setSettings({ ...settings, creditRate: text })}
                    editable={isSettingsEditing && !isSubmitting}
                    keyboardType="numeric"
                />
                
                {/* Interest Frequency (Picker) */}
                <Text style={styles.label}>Fréquence de calcul des intérêts</Text>
                <View style={[styles.pickerContainer, !isSettingsEditing && styles.inputDisabled]}>
                    <Picker
                        selectedValue={settings.interestFrequency}
                        onValueChange={(itemValue) => setSettings({ ...settings, interestFrequency: itemValue })}
                        style={styles.picker}
                        enabled={isSettingsEditing && !isSubmitting}
                    >
                        {/* 🚨 Utilisation des options DAILY et MONTHLY seulement */}
                        {INTEREST_FREQUENCIES.map((option) => (
                            <Picker.Item 
                                key={option.value} 
                                label={option.label} 
                                value={option.value}  
                            />
                        ))}
                    </Picker>
                </View>

                {/* Boutons d'action : Enregistrer / Modifier */}
                <TouchableOpacity 
                    style={[styles.actionButton, isSettingsEditing && { backgroundColor: 'orange' }]}
                    onPress={() => isSettingsEditing ? saveAssociationData('settings') : setIsSettingsEditing(true)}
                    disabled={isSubmitting || loading}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>
                            {isSettingsEditing ? "💾 Enregistrer les modifications" : "✏️ Modifier les Paramètres"}
                        </Text>
                    )}
                </TouchableOpacity>
                
                {isSettingsEditing ? (
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.cancelButton]}
                        onPress={() => {
                            loadSettings(); 
                            setIsSettingsEditing(false);
                        }}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.buttonText}>Annuler</Text>
                    </TouchableOpacity>
                ) : (
                    // Bouton pour voir l'historique des paramètres
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.historyButton]}
                        onPress={() => Alert.alert("Historique des Paramètres", "Cette fonctionnalité ouvrira un tableau de tous les cycles de paramètres (actifs et passés).")}
                        disabled={loading}
                    >
                        <FontAwesome5 name="table" size={18} color="#004080" />
                        <Text style={[styles.buttonText, {color: '#004080', marginLeft: 10}]}>
                            Voir le Tableau des Paramètres
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Pop-up message */}
            <Modal visible={popupVisible} transparent animationType="fade">
                <View style={styles.popupOverlay}>
                    <View
                        style={[
                            styles.popupBox,
                            popupType === "error" ? styles.popupError : styles.popupSuccess,
                        ]}
                    >
                        <Text style={styles.popupText}>{popupMessage}</Text>
                        <TouchableOpacity onPress={() => setPopupVisible(false)}>
                            <Text style={styles.closeText}>Fermer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            
            {/* Onglets de navigation */}
            <View style={styles.tabBar}>
                <TouchableOpacity 
                    style={[styles.tabButton, activeTab === "details" && styles.activeTabButton]}
                    onPress={() => {
                        setActiveTab("details");
                        setIsSettingsEditing(false); 
                        setIsDetailsEditing(false);
                        if (activeTab === 'settings') loadSettings(); 
                        else if (criticalError) loadDetails(); 
                    }}
                >
                    <Text style={[styles.tabText, activeTab === "details" && styles.activeTabText]}>
                        Détails de l'Association
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tabButton, activeTab === "settings" && styles.activeTabButton]}
                    onPress={() => {
                        setActiveTab("settings");
                        setIsDetailsEditing(false); 
                        setIsSettingsEditing(false);
                        if (activeTab === 'details') loadDetails(); 
                        else if (criticalError) loadSettings(); 
                    }}
                >
                    <Text style={[styles.tabText, activeTab === "settings" && styles.activeTabText]}>
                        Paramètres
                    </Text>
                </TouchableOpacity>
            </View>
            
            {/* Contenu */}
            <ScrollView style={styles.contentScroll} contentContainerStyle={styles.contentPadding}>
                {loading && !criticalError ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#004080" />
                        <Text style={{ marginTop: 10 }}>Chargement des données...</Text>
                    </View>
                ) : (
                    <>
                        {activeTab === "details" && renderDetailsTab()}
                        {activeTab === "settings" && renderSettingsTab()}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

// Styles (inchangés)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#E0F3FF" },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    
    // --- Tabs ---
    tabBar: { flexDirection: 'row', backgroundColor: '#004080' },
    tabButton: { flex: 1, paddingVertical: 15, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: '#004080' },
    activeTabButton: { borderBottomColor: '#FFA500' },
    tabText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    activeTabText: { color: '#FFA500' },

    // --- Content ---
    contentScroll: { flex: 1 },
    contentPadding: { padding: 20 },
    tabContent: { paddingBottom: 50 }, 

    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#004080', marginBottom: 15 },
    label: { fontWeight: "bold", marginBottom: 5, color: "#004080", marginTop: 10 },
    
    // --- Inputs ---
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    inputDisabled: {
        backgroundColor: '#f0f0f0',
        borderColor: '#ddd',
        color: '#555',
    },
    inputActive: {
        backgroundColor: '#fff',
        borderColor: '#004080',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        marginBottom: 15,
        overflow: 'hidden',
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    picker: {
        height: 40,
        width: '100%',
    },

    // --- Buttons ---
    actionButton: {
        backgroundColor: "#004080",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 15,
    },
    cancelButton: {
        backgroundColor: '#ccc',
        marginTop: 10,
    },
    historyButton: {
        backgroundColor: '#e0e0e0', 
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#004080',
    },
    buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

    // --- Popup ---
    popupOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    popupBox: {
        width: "80%",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        alignItems: "center",
    },
    popupError: { borderTopWidth: 6, borderTopColor: "red" },
    popupSuccess: { borderTopWidth: 6, borderTopColor: "green" },
    popupText: { fontSize: 16, textAlign: "center", marginBottom: 10 },
    closeText: { color: "#004080", fontWeight: "bold" },
    
    // --- Error Display ---
    errorContainer: {
        padding: 20,
        backgroundColor: '#FFEEEE',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#D8000C',
        alignItems: 'center',
        marginTop: 30,
    },
    errorText: {
        color: '#D8000C',
        fontWeight: 'bold',
        fontSize: 16,
        marginTop: 10,
    },
    errorTextDetail: {
        color: '#D8000C',
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 15,
    },
    retryButton: {
        backgroundColor: '#D8000C',
        padding: 10,
        borderRadius: 5,
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});