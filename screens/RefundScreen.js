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
const API_BASE_URL = "https://ziganya.onrender.com/ziganya-managment-system/api/v1";
const REFUNDS_API = `${API_BASE_URL}/refunds`;
const CREDITS_API = `${API_BASE_URL}/credits`;
// ----------------------------------------

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

// Obtient la date du jour au format YYYY-MM-DD
const getTodayDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function RefundScreen() {
    const [modalVisible, setModalVisible] = useState(false);
    const [refunds, setRefunds] = useState([]);
    const [grantedCredits, setGrantedCredits] = useState([]); 
    const [loadingData, setLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Champs du formulaire de remboursement (Ajout/Modification)
    const [amount, setAmount] = useState("");
    const [refundDate, setRefundDate] = useState(getTodayDate());
    const [selectedCreditId, setSelectedCreditId] = useState(""); 
    const [editingRefundId, setEditingRefundId] = useState(null); 
    
    // Pop-up messages succès/erreur
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [popupType, setPopupType] = useState("success");

    // Pop-up confirmation suppression
    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const [refundToDelete, setRefundToDelete] = useState(null);

    const showPopup = (message, type = "success") => {
        setPopupMessage(message);
        setPopupType(type);
        setPopupVisible(true);
        setTimeout(() => setPopupVisible(false), 3500);
    };

    const resetForm = () => {
        setAmount("");
        setRefundDate(getTodayDate());
        setEditingRefundId(null);
        if (grantedCredits.length > 0) {
            setSelectedCreditId(grantedCredits[0].id.toString());
        }
    };

    // --- Chargement des données (Corrigé pour l'extraction du nom du membre) ---
    const loadData = useCallback(async () => {
        setLoadingData(true);
        try {
            // 1. Charger tous les crédits pour filtrer ceux qui sont GRANTED (Nécessaire pour le Picker)
            const creditsResponse = await axios.get(CREDITS_API);
            
            // Filtrer les crédits GRANTED pour le Picker
            const filteredCredits = creditsResponse.data
                .filter(c => c.creditDecision === 'GRANTED')
                .map(c => ({
                    id: c.id.toString(),
                    label: `Crédit #${c.id} - ${c.amount.toLocaleString('fr-FR')} FBu - ${c.member?.firstname || 'Membre'}`,
                    member: c.member,
                }));
                
            setGrantedCredits(filteredCredits);
            
            if (filteredCredits.length > 0 && !selectedCreditId) {
                setSelectedCreditId(filteredCredits[0].id);
            }

            // 2. Charger tous les remboursements
            const refundsResponse = await axios.get(REFUNDS_API);
            
            // On enrichit chaque remboursement en utilisant l'objet 'credit' DÉJÀ PRÉSENT dans la réponse
            const enhancedRefunds = refundsResponse.data.map(refund => {
                // Référence directe à l'objet credit imbriqué
                const creditInfo = refund.credit; 
                
                // Récupérer le nom du membre du crédit imbriqué
                const memberName = creditInfo?.member 
                    ? `${creditInfo.member.firstname} ${creditInfo.member.lastname}` 
                    : `Crédit ID ${refund.creditId || 'N/A'} (Membre Introuvable)`;
                
                return {
                    ...refund,
                    // S'assurer que creditDetails contient l'info du crédit
                    creditDetails: creditInfo,
                    // S'assurer que creditId est bien défini (prend l'ID de l'objet imbriqué)
                    creditId: creditInfo?.id || refund.creditId,
                    // Clé utilisée dans le tableau et les détails
                    memberName: memberName 
                };
            });
            setRefunds(enhancedRefunds);

        } catch (error) {
            console.error("Erreur lors du chargement des données:", error);
            const errorMessage = getBackendErrorMessage(error);
            showPopup(errorMessage, "error");
        } finally {
            setLoadingData(false);
        }
    }, [selectedCreditId]); 

    useEffect(() => {
        loadData();
    }, [loadData]);

    // --- CRUD Fonctions ---

    const saveRefund = async () => {
        if (!selectedCreditId || !amount || !refundDate) {
            return showPopup("Veuillez remplir le montant, la date et sélectionner un crédit.", "error");
        }
        if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            return showPopup("Le montant doit être un nombre positif.", "error");
        }
        
        const payload = {
            amount: parseFloat(amount),
            // Convertir selectedCreditId en nombre pour l'API
            creditId: parseInt(selectedCreditId), 
            refundDate: refundDate,
        };
        
        setIsSubmitting(true);

        try {
            if (editingRefundId) {
                await axios.put(`${REFUNDS_API}/${editingRefundId}`, payload);
                showPopup("Remboursement modifié avec succès.", "success");
            } else {
                await axios.post(REFUNDS_API, payload);
                showPopup(`Remboursement de ${payload.amount} FBu enregistré.`, "success");
            }
            
            setModalVisible(false);
            resetForm();
            loadData();
        } catch (error) {
            console.error("Erreur d'enregistrement du remboursement:", error);
            showPopup(getBackendErrorMessage(error), "error");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const editRefund = (refund) => {
        setAmount(refund.amount.toString());
        setRefundDate(refund.refundDate);
        setSelectedCreditId(refund.creditId.toString());
        setEditingRefundId(refund.id);
        setModalVisible(true);
    };

    const confirmDeleteRefund = (refund) => {
        setRefundToDelete(refund);
        setConfirmDeleteVisible(true);
    };

    const performDeleteRefund = async () => {
        if (!refundToDelete) return;
        
        const refundId = refundToDelete.id;
        const memberName = refundToDelete.memberName;

        try {
            await axios.delete(`${REFUNDS_API}/${refundId}`);
            loadData();
            showPopup(`Le remboursement de ${memberName} a été supprimé.`, "success");
        } catch (error) {
            console.error("Erreur de suppression du remboursement:", error);
            showPopup(getBackendErrorMessage(error), "error");
        } finally {
            setRefundToDelete(null);
            setConfirmDeleteVisible(false);
        }
    };

    // Fonction viewRefund (Utilise la clé enrichie memberName)
    const viewRefund = (item) => {
        const creditAmount = item.creditDetails?.amount.toLocaleString('fr-FR') || 'N/A';
        const memberName = item.memberName; 
            
        showPopup(
            `💰 Montant Remboursé: ${item.amount.toLocaleString('fr-FR')} FBu
📅 Date du Remboursement: ${item.refundDate}
💳 Crédit ID: ${item.creditId} (Montant initial: ${creditAmount} FBu)
👤 Membre: ${memberName}`,
            "success"
        );
    };

    // Le composant d'une ligne de la liste (Utilise la clé enrichie memberName)
    const RefundItem = ({ item }) => {
        return (
            <View style={styles.tableRow}>
                {/* Membre */}
                <Text style={[styles.cellText, styles.cellMember]}>{item.memberName}</Text> 
                
                {/* ID Crédit */}
                <Text style={[styles.cellText, styles.cellCreditId]}>{item.creditId}</Text>
                
                {/* Montant Remboursé */}
                <Text style={[styles.cellText, styles.cellAmount]}>
                    {item.amount ? item.amount.toLocaleString('fr-FR') : '0'} FBu
                </Text>
                
                {/* Actions */}
                <View style={styles.cellActions}>
                    
                    {/* Bouton Détails (Toujours actif) */}
                    <TouchableOpacity onPress={() => viewRefund(item)}>
                        <MaterialIcons name="info" size={22} color="#004080" />
                    </TouchableOpacity>
                    
                    {/* Bouton Modifier */}
                    <TouchableOpacity onPress={() => editRefund(item)}>
                        <MaterialIcons name="edit" size={22} color="#FFA500" /> 
                    </TouchableOpacity>
                    
                    {/* Bouton Supprimer */}
                    <TouchableOpacity onPress={() => confirmDeleteRefund(item)}>
                        <MaterialIcons name="delete" size={22} color="#FF0000" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // Si la liste des crédits GRANTED est vide, on ne peut pas faire de remboursement
    const canAddRefund = grantedCredits.length > 0;

    return (
        <View style={styles.container}>
            
            {/* Bouton ajouter remboursement */}
            <TouchableOpacity 
                style={[styles.addButton, !canAddRefund && styles.disabledButton]} 
                onPress={() => {
                    resetForm();
                    setModalVisible(true);
                }}
                disabled={popupVisible || confirmDeleteVisible || !canAddRefund}
            >
                <Text style={styles.addButtonText}>➕ Enregistrer un remboursement</Text>
            </TouchableOpacity>
            
            {!canAddRefund && (
                 <Text style={[styles.emptyText, {color: 'red'}]}>
                    ❌ Aucun crédit approuvé (GRANTED) n'est disponible pour un remboursement.
                 </Text>
            )}

            {/* Liste des remboursements */}
            {loadingData ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#004080" />
                    <Text style={{ marginTop: 10 }}>Chargement des remboursements...</Text>
                </View>
            ) : refunds.length > 0 ? (
                <View style={styles.tableContainer}>
                    {/* En-tête du tableau */}
                    <View style={styles.tableHeader}>
                        <Text style={[styles.headerText, styles.headerMember]}>Membre</Text>
                        <Text style={[styles.headerText, styles.headerCreditId]}>Crédit ID</Text>
                        <Text style={[styles.headerText, styles.headerAmount]}>Montant Remb.</Text>
                        <Text style={[styles.headerText, styles.headerActions]}>Actions</Text>
                    </View>
                    <FlatList
                        data={refunds}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={RefundItem}
                    />
                </View>
            ) : (
                <Text style={styles.emptyText}>Aucun remboursement enregistré</Text>
            )}

            {/* MODALE D'AJOUT/MODIFICATION DE REMBOURSEMENT */}
            <Modal 
                animationType="slide" 
                transparent 
                visible={modalVisible && !popupVisible && !confirmDeleteVisible}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            {editingRefundId ? "Modifier le Remboursement" : "Enregistrer un Remboursement"}
                        </Text>
                        <ScrollView>
                            
                            {/* Champ Crédit (Dropdown - GRANTED seulement) */}
                            <Text style={styles.label}>Crédit concerné</Text>
                            <View style={styles.pickerContainer}>
                                {grantedCredits.length > 0 ? (
                                    <Picker
                                        selectedValue={selectedCreditId}
                                        onValueChange={(itemValue) => setSelectedCreditId(itemValue)}
                                        style={styles.picker}
                                        enabled={!isSubmitting}
                                    >
                                        {grantedCredits.map((credit) => (
                                            <Picker.Item 
                                                key={credit.id} 
                                                label={credit.label} 
                                                value={credit.id}  
                                            />
                                        ))}
                                    </Picker>
                                ) : (
                                    <Text style={styles.emptyText}>Aucun crédit 'Approuvé' (GRANTED) disponible.</Text>
                                )}
                            </View>

                            {/* Champ Montant */}
                            <Text style={styles.label}>Montant du remboursement (FBu)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: 5000"
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                                editable={!isSubmitting}
                            />

                            {/* Champ Date */}
                            <Text style={styles.label}>Date du remboursement (YYYY-MM-DD)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="AAAA-MM-JJ"
                                value={refundDate}
                                onChangeText={setRefundDate}
                                editable={!isSubmitting}
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity 
                                    style={styles.saveButton} 
                                    onPress={saveRefund}
                                    disabled={isSubmitting || grantedCredits.length === 0}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>
                                            {editingRefundId ? "💾 Modifier" : "💾 Enregistrer"}
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

            {/* Pop-up confirmation suppression */}
            <Modal 
                visible={confirmDeleteVisible && !popupVisible} 
                transparent 
                animationType="fade"
            >
                <View style={styles.popupOverlay}>
                    <View style={[styles.popupBox, { borderTopColor: "orange", borderTopWidth: 6 }]}>
                        <Text style={styles.popupText}>
                            Êtes-vous sûr de vouloir supprimer ce remboursement de {refundToDelete?.amount.toLocaleString('fr-FR')} FBu pour le crédit #{refundToDelete?.creditId} ?
                        </Text>
                        <View style={{ flexDirection: "row", justifyContent: "space-around", width: "100%", marginTop: 10 }}>
                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: "#ccc", flex: 1, marginRight: 5 }]}
                                onPress={() => setConfirmDeleteVisible(false)}
                            >
                                <Text style={styles.saveButtonText}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: "#FF0000", flex: 1, marginLeft: 5 }]}
                                onPress={performDeleteRefund}
                            >
                                <Text style={styles.saveButtonText}>Supprimer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Pop-up message (Succès/Erreur) - RENDU EN DERNIER POUR ÊTRE AU-DESSUS */}
            <Modal 
                visible={popupVisible} 
                transparent 
                animationType="fade"
            >
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
        </View>
    );
}

// Styles ( inchangés )
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
    disabledButton: {
        backgroundColor: "#A9A9A9",
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
    headerText: { color: "#fff", fontWeight: "bold" },

    // --- Styles spécifiques pour l'alignement des colonnes ---
    headerMember: { flex: 2.5, textAlign: "left" },
    cellMember: { flex: 2.5, textAlign: "left" },
    
    headerCreditId: { flex: 1.5, textAlign: "center" },
    cellCreditId: { flex: 1.5, textAlign: "center" },

    headerAmount: { flex: 2, textAlign: "center" },
    cellAmount: { flex: 2, textAlign: "center" },

    headerActions: { flex: 2, textAlign: "right" },
    cellActions: { 
        flex: 2, 
        flexDirection: "row", 
        justifyContent: 'space-around', 
        minWidth: 100,
    }, 
    // --------------------------------------------------------

    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        paddingVertical: 10,
        paddingHorizontal: 5,
        alignItems: "center",
    },
    cellText: { fontSize: 14, color: "#000" },
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