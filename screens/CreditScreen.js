import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";

// --- Configuration API et Constantes ---
const API_BASE_URL = "http://192.168.40.90:8001/ziganya-managment-system/api/v1";
const MEMBERS_API = `${API_BASE_URL}/members`;
const CREDITS_API = `${API_BASE_URL}/credits`;
// ----------------------------------------

// Fonction utilitaire pour extraire le message d'erreur du backend
const getBackendErrorMessage = (error) => {
    if (error.response && error.response.data) {
        const data = error.response.data;
        return data.message || data.errorMessage || JSON.stringify(data);
    } else if (error.message) {
        return error.message;
    } else {
        return "Une erreur inconnue est survenue.";
    }
};

// Obtient la date du jour au format YYYY-MM-DD
const getTodayDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function CreditScreen() {
    const [modalVisible, setModalVisible] = useState(false);
    const [credits, setCredits] = useState([]);
    const [members, setMembers] = useState([]); 
    const [loadingData, setLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Champs du formulaire de crédit
    const [amount, setAmount] = useState("");
    const [creditDate, setCreditDate] = useState(getTodayDate());
    const [interestRate, setInterestRate] = useState(""); // Taux d'intérêt
    const [selectedMemberId, setSelectedMemberId] = useState(""); 
    const [editingCreditId, setEditingCreditId] = useState(null); 
    
    // Pop-up messages succès/erreur
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [popupType, setPopupType] = useState("success");

    // Pop-up confirmation suppression
    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const [creditToDelete, setCreditToDelete] = useState(null);

    const showPopup = (message, type = "success") => {
        setPopupMessage(message);
        setPopupType(type);
        setPopupVisible(true);
        setTimeout(() => setPopupVisible(false), 3500);
    };

    // Réinitialiser les champs du formulaire
    const resetForm = () => {
        setAmount("");
        setCreditDate(getTodayDate());
        setInterestRate("");
        setEditingCreditId(null);
        if (members.length > 0) {
            setSelectedMemberId(members[0].id); 
        }
    };

    // Charger les données (Membres pour le Picker et Crédits pour la Liste)
    const loadData = useCallback(async () => {
        setLoadingData(true);
        try {
            // 1. Charger les membres (NÉCESSAIRE pour le Picker)
            const membersResponse = await axios.get(MEMBERS_API);
            const membersData = membersResponse.data.map(m => ({
                id: m.id.toString(),
                name: m.firstname && m.lastname ? `${m.firstname} ${m.lastname}` : `Membre #${m.id}`,
            }));
            setMembers(membersData);
            
            if (membersData.length > 0 && !selectedMemberId) {
                setSelectedMemberId(membersData[0].id);
            }

            // 2. Charger la liste des crédits
            const creditsResponse = await axios.get(CREDITS_API);
            setCredits(creditsResponse.data);

        } catch (error) {
            console.error("Erreur lors du chargement des données:", error);
            showPopup("Erreur de connexion. Impossible de charger les données.", "error");
        } finally {
            setLoadingData(false);
        }
    }, [selectedMemberId]); // Dépendance ajoutée pour initialiser le selectedMemberId

    useEffect(() => {
        loadData();
    }, [loadData]);


    // Fonction d'ajout/modification (CRUD - C & U)
    const saveCredit = async () => {
        if (!selectedMemberId || !amount || !interestRate) {
            return showPopup("Veuillez remplir le membre, le montant et le taux d'intérêt.", "error");
        }
        if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            return showPopup("Le montant doit être un nombre positif.", "error");
        }
        if (isNaN(parseFloat(interestRate)) || parseFloat(interestRate) < 0) {
            return showPopup("Le taux d'intérêt doit être un nombre positif ou nul.", "error");
        }
        
        const payload = {
            amount: parseFloat(amount),
            creditDate: creditDate,
            interestRate: parseFloat(interestRate),
            memberId: parseInt(selectedMemberId), // Envoie l'ID
        };
        
        setIsSubmitting(true);

        try {
            if (editingCreditId) {
                // Modification (PUT)
                await axios.put(`${CREDITS_API}/${editingCreditId}`, payload);
                showPopup("Crédit modifié avec succès.", "success");
            } else {
                // Ajout (POST)
                await axios.post(CREDITS_API, payload);
                showPopup(`Crédit de ${payload.amount} FBu enregistré.`, "success");
            }
            
            setModalVisible(false);
            resetForm();
            loadData(); 
        } catch (error) {
            console.error("Erreur d'enregistrement:", error);
            showPopup(getBackendErrorMessage(error), "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Préparer l'édition
    const editCredit = (credit) => {
        setAmount(credit.amount.toString());
        setCreditDate(credit.creditDate);
        setInterestRate(credit.interestRate.toString());
        // Assurez-vous que le membre existe pour éviter les erreurs
        if (credit.member && credit.member.id) {
            setSelectedMemberId(credit.member.id.toString());
        }
        setEditingCreditId(credit.id);
        setModalVisible(true);
    };

    // Préparer la confirmation de suppression
    const confirmDeleteCredit = (credit) => {
        setCreditToDelete(credit);
        setConfirmDeleteVisible(true);
    };

    // Exécuter la suppression (CRUD - D)
    const performDeleteCredit = async () => {
        if (!creditToDelete) return;
        
        const creditId = creditToDelete.id;
        const memberName = creditToDelete.member 
            ? `${creditToDelete.member.firstname} ${creditToDelete.member.lastname}` 
            : `ID ${creditId}`;

        try {
            await axios.delete(`${CREDITS_API}/${creditId}`);
            loadData();
            showPopup(`Le crédit de ${memberName} a été supprimé.`, "success");
        } catch (error) {
            console.error("Erreur de suppression:", error);
            showPopup(getBackendErrorMessage(error), "error");
        } finally {
            setCreditToDelete(null);
            setConfirmDeleteVisible(false);
        }
    };


    // Afficher les détails 
    const viewCredit = (item) => {
        const memberName = item.member 
            ? `${item.member.firstname} ${item.member.lastname}` 
            : `ID ${item.memberId}`;
            
        // Formattage du montant à payer
        const totalAmount = item.totalAmountToPay ? item.totalAmountToPay.toLocaleString('fr-FR') : 'N/A';
        
        showPopup(
            `💰 Montant: ${item.amount.toLocaleString('fr-FR')} FBu
📅 Date: ${item.creditDate}
% Taux: ${item.interestRate}%
💵 Total à payer: ${totalAmount} FBu
🏷️ Statut: ${item.creditDecision}
👤 Membre: ${memberName}`,
            "success"
        );
    };


    // Le composant d'une ligne de la liste
    const CreditItem = ({ item }) => {
        const memberName = item.member 
            ? `${item.member.firstname} ${item.member.lastname}` 
            : `ID Inconnu (${item.memberId || 'N/A'})`;
        
        const statusColor = item.creditDecision === 'IN_TREATMENT' 
            ? 'orange' 
            : item.creditDecision === 'APPROVED' 
            ? 'green' 
            : 'red';

        return (
            <View style={styles.tableRow}>
                <Text style={[styles.cellText, { flex: 2 }]}>{memberName}</Text>
                <Text style={[styles.cellText, { flex: 1.5 }]}>{item.amount ? item.amount.toLocaleString('fr-FR') : '0'} FBu</Text>
                <Text style={[styles.cellText, { flex: 1.5, color: statusColor, fontWeight: 'bold' }]}>
                    {item.creditDecision || 'N/A'}
                </Text>
                <View style={[styles.cellActions, { flex: 1.5 }]}>
                    {/* Bouton Détails */}
                    <TouchableOpacity onPress={() => viewCredit(item)}>
                        <MaterialIcons name="info" size={22} color="#004080" />
                    </TouchableOpacity>
                    {/* Bouton Modifier */}
                    <TouchableOpacity onPress={() => editCredit(item)}>
                        <MaterialIcons name="edit" size={22} color="#FFA500" /> 
                    </TouchableOpacity>
                    {/* Bouton Supprimer */}
                    <TouchableOpacity onPress={() => confirmDeleteCredit(item)}>
                        <MaterialIcons name="delete" size={22} color="#FF0000" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            
            {/* Pop-up message (Succès/Erreur) */}
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
            
            {/* Pop-up confirmation suppression */}
            <Modal visible={confirmDeleteVisible} transparent animationType="fade">
                <View style={styles.popupOverlay}>
                    <View style={[styles.popupBox, { borderTopColor: "orange", borderTopWidth: 6 }]}>
                        <Text style={styles.popupText}>
                            Êtes-vous sûr de vouloir supprimer ce crédit ?
                        </Text>
                        <View style={{ flexDirection: "row", justifyContent: "space-around", width: "100%" }}>
                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: "#ccc", flex: 1, marginRight: 5 }]}
                                onPress={() => setConfirmDeleteVisible(false)}
                            >
                                <Text style={styles.saveButtonText}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: "#FF0000", flex: 1, marginLeft: 5 }]}
                                onPress={performDeleteCredit}
                            >
                                <Text style={styles.saveButtonText}>Supprimer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>


            {/* Bouton ajouter crédit */}
            <TouchableOpacity 
                style={styles.addButton} 
                onPress={() => {
                    resetForm();
                    setModalVisible(true);
                }}
            >
                <Text style={styles.addButtonText}>➕ Demander un crédit</Text>
            </TouchableOpacity>

            {/* Modal ajout/modif */}
            <Modal animationType="slide" transparent visible={modalVisible}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            {editingCreditId ? "Modifier le Crédit" : "Demander un Crédit"}
                        </Text>
                        <ScrollView>
                            
                            {/* Champ Membre (Dropdown) */}
                            <Text style={styles.label}>Membre demandeur</Text>
                            <View style={styles.pickerContainer}>
                                {loadingData && members.length === 0 ? (
                                    <ActivityIndicator size="small" color="#004080" style={{height: 40}} />
                                ) : members.length > 0 ? (
                                    <Picker
                                        selectedValue={selectedMemberId}
                                        onValueChange={(itemValue) => setSelectedMemberId(itemValue)}
                                        style={styles.picker}
                                        enabled={!isSubmitting}
                                    >
                                        {members.map((member) => (
                                            <Picker.Item 
                                                key={member.id} 
                                                label={member.name} 
                                                value={member.id}   
                                            />
                                        ))}
                                    </Picker>
                                ) : (
                                    <Text style={styles.emptyText}>Aucun membre trouvé.</Text>
                                )}
                            </View>

                            {/* Champ Montant */}
                            <Text style={styles.label}>Montant du crédit (FBu)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: 12000"
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                                editable={!isSubmitting}
                            />

                            {/* Champ Taux d'intérêt */}
                            <Text style={styles.label}>Taux d'intérêt (%)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: 12.0"
                                keyboardType="numeric"
                                value={interestRate}
                                onChangeText={setInterestRate}
                                editable={!isSubmitting}
                            />

                            {/* Champ Date */}
                            <Text style={styles.label}>Date de la demande (YYYY-MM-DD)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="AAAA-MM-JJ"
                                value={creditDate}
                                onChangeText={setCreditDate}
                                editable={!isSubmitting}
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity 
                                    style={styles.saveButton} 
                                    onPress={saveCredit}
                                    disabled={isSubmitting || members.length === 0}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>
                                            {editingCreditId ? "💾 Modifier" : "💾 Enregistrer"}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => {
                                        setModalVisible(false);
                                        resetForm();
                                    }}
                                    disabled={isSubmitting}
                                >
                                    <Text style={styles.cancelButtonText}>Annuler</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Liste des crédits */}
            {loadingData ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#004080" />
                    <Text style={{ marginTop: 10 }}>Chargement des crédits...</Text>
                </View>
            ) : credits.length > 0 ? (
                <View style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.headerText, { flex: 2 }]}>Membre</Text>
                        <Text style={[styles.headerText, { flex: 1.5 }]}>Montant</Text>
                        <Text style={[styles.headerText, { flex: 1.5 }]}>Statut</Text>
                        <Text style={[styles.headerText, { flex: 1.5 }]}>Actions</Text>
                    </View>
                    <FlatList
                        data={credits}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={CreditItem}
                    />
                </View>
            ) : (
                <Text style={styles.emptyText}>Aucun crédit enregistré</Text>
            )}
        </View>
    );
}

// Styles (Réutilisés du ContributionScreen)
const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#E0F3FF" },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    
    addButton: {
        backgroundColor: "#004080",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 20,
    },
    addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        maxHeight: "85%",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: "center",
    },
    label: { fontWeight: "bold", marginBottom: 5, color: "#004080", marginTop: 10 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        marginBottom: 15,
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    picker: {
        height: 40,
        width: '100%',
    },
    
    modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    saveButton: {
        backgroundColor: "#004080",
        padding: 12,
        borderRadius: 8,
        flex: 1,
        marginRight: 5,
        alignItems: "center",
    },
    saveButtonText: { color: "#fff", fontWeight: "bold" },
    cancelButton: {
        backgroundColor: "#ccc",
        padding: 12,
        borderRadius: 8,
        flex: 1,
        marginLeft: 5,
        alignItems: "center",
    },
    cancelButtonText: { fontWeight: "bold" },

    tableContainer: { backgroundColor: "#fff", borderRadius: 10, overflow: "hidden" },
    tableHeader: { flexDirection: "row", backgroundColor: "#004080", padding: 10 },
    headerText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        paddingVertical: 10,
        paddingHorizontal: 5,
        alignItems: "center",
    },
    cellText: { fontSize: 14, color: "#000", textAlign: 'center' },
    cellActions: { flexDirection: "row", justifyContent: "space-around" },
    emptyText: { textAlign: "center", color: "#555", marginTop: 30, fontStyle: "italic" },

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
});