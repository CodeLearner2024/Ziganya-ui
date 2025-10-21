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
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import axios from "axios";

// --- Configuration API et Constantes ---
const API_BASE_URL = "https://ziganya.onrender.com/ziganya-managment-system/api/v1";
const MEMBERS_API = `${API_BASE_URL}/members`;
const CREDITS_API = `${API_BASE_URL}/credits`;
const CREDIT_TREATMENT_API = `${API_BASE_URL}/credit-traitment`;
// ----------------------------------------

// Options pour la décision de traitement
const DECISION_OPTIONS = [
    { label: "En Cours (IN_TREATMENT)", value: "IN_TREATMENT" }, // Ajout d'une option par défaut claire
    { label: "Approuvé (GRANTED)", value: "GRANTED" },
    { label: "Refusé (REFUSED)", value: "REFUSED" },
];

// Fonction utilitaire pour extraire le message d'erreur du backend
const getBackendErrorMessage = (error) => {
    // Cas 1 : Réponse du serveur reçue (Erreur HTTP 4xx, 5xx)
    if (error.response && error.response.data) {
        const data = error.response.data;
        return data.message || data.errorMessage || JSON.stringify(data);
    } 
    // Cas 2 : Le serveur n'a pas répondu (ex: serveur éteint, mauvaise URL)
    else if (error.request) {
        // Axios error sans réponse du serveur (Network Error, Timeout)
        return "❌ Connexion au serveur échouée. Le backend n'est peut-être pas lancé ou l'adresse est incorrecte.";
    } 
    // Cas 3 : Autres erreurs (ex: Erreur de configuration de la requête)
    else if (error.message) {
        return `Une erreur s'est produite : ${error.message}`;
    } 
    // Cas 4 : Erreur inconnue
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

export default function CreditScreen() {
    const [modalVisible, setModalVisible] = useState(false);
    const [credits, setCredits] = useState([]);
    const [members, setMembers] = useState([]); 
    const [loadingData, setLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Champs du formulaire de crédit (Ajout/Modification)
    const [amount, setAmount] = useState("");
    const [creditDate, setCreditDate] = useState(getTodayDate());
    const [interestRate, setInterestRate] = useState(""); 
    const [selectedMemberId, setSelectedMemberId] = useState(""); 
    const [editingCreditId, setEditingCreditId] = useState(null); 
    
    // État pour la fonctionnalité de traitement
    const [treatmentModalVisible, setTreatmentModalVisible] = useState(false);
    const [creditToTreat, setCreditToTreat] = useState(null);
    // Initialiser la décision à la première option (IN_TREATMENT)
    const [selectedDecision, setSelectedDecision] = useState(DECISION_OPTIONS[0].value); 
    
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
        // Fermeture automatique après 3.5 secondes
        setTimeout(() => setPopupVisible(false), 3500);
    };

    // Réinitialiser les champs du formulaire (Ajout/Modification)
    const resetForm = () => {
        setAmount("");
        setCreditDate(getTodayDate());
        setInterestRate("");
        setEditingCreditId(null);
        // Sélectionner le premier membre s'il existe
        if (members.length > 0 && !selectedMemberId) {
            setSelectedMemberId(members[0].id); 
        } else if (members.length > 0 && editingCreditId === null) {
            // Si on ouvre pour ajouter (pas en modification), on peut forcer la sélection du premier
            setSelectedMemberId(members[0].id);
        }
    };

    // --- CRUD Fonctions ---
    const loadData = useCallback(async () => {
        setLoadingData(true);
        try {
            // Tenter de charger les membres
            const membersResponse = await axios.get(MEMBERS_API);
            const membersData = membersResponse.data.map(m => ({
                id: m.id.toString(),
                name: m.firstname && m.lastname ? `${m.firstname} ${m.lastname}` : `Membre #${m.id}`,
            }));
            setMembers(membersData);
            
            if (membersData.length > 0 && !selectedMemberId) {
                setSelectedMemberId(membersData[0].id);
            }

            // Tenter de charger les crédits
            const creditsResponse = await axios.get(CREDITS_API);
            setCredits(creditsResponse.data);

        } catch (error) {
            console.error("Erreur lors du chargement des données:", error);
            const errorMessage = getBackendErrorMessage(error);
            showPopup(errorMessage, "error");
        } finally {
            setLoadingData(false);
        }
    }, [selectedMemberId]); 

    useEffect(() => {
        loadData();
    }, [loadData]);

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
            memberId: parseInt(selectedMemberId), 
        };
        
        setIsSubmitting(true);

        try {
            if (editingCreditId) {
                await axios.put(`${CREDITS_API}/${editingCreditId}`, payload);
                showPopup("Crédit modifié avec succès.", "success");
            } else {
                // Pour un nouveau crédit, il est logique de le mettre en IN_TREATMENT
                payload.creditDecision = "IN_TREATMENT"; 
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
    
    // La fonction editCredit n'appelle la modale que si l'élément n'est PAS traité
    const editCredit = (credit) => {
        if (credit.creditDecision === 'GRANTED' || credit.creditDecision === 'REFUSED') {
            return showPopup("Ce crédit a déjà été traité et ne peut pas être modifié.", "error");
        }
        setAmount(credit.amount.toString());
        setCreditDate(credit.creditDate);
        setInterestRate(credit.interestRate.toString());
        if (credit.member && credit.member.id) {
            setSelectedMemberId(credit.member.id.toString());
        }
        setEditingCreditId(credit.id);
        setModalVisible(true);
    };

    // La fonction confirmDeleteCredit n'appelle la modale de suppression que si l'élément n'est PAS traité
    const confirmDeleteCredit = (credit) => {
        if (credit.creditDecision === 'GRANTED' || credit.creditDecision === 'REFUSED') {
            return showPopup("Ce crédit a déjà été traité et ne peut pas être supprimé.", "error");
        }
        setCreditToDelete(credit);
        setConfirmDeleteVisible(true);
    };

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

    const viewCredit = (item) => {
        const memberName = item.member 
            ? `${item.member.firstname} ${item.member.lastname}` 
            : `ID ${item.memberId}`;
            
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
    
    // --- Fonctionnalité de Traitement ---
    const openTreatmentModal = (credit) => {
        // Assurez-vous que le crédit est bien en traitement ou nouveau pour pouvoir le traiter
        if (credit.creditDecision === 'GRANTED' || credit.creditDecision === 'REFUSED') {
            return showPopup("Ce crédit a déjà été traité.", "error");
        }
        setCreditToTreat(credit);
        // S'assurer que la décision par défaut est bien IN_TREATMENT si ce n'est pas déjà le cas
        setSelectedDecision(DECISION_OPTIONS.find(d => d.value === 'GRANTED' || d.value === 'REFUSED') ? 'GRANTED' : DECISION_OPTIONS[0].value);
        setTreatmentModalVisible(true);
    };
    
    const processCreditTreatment = async () => {
        if (!creditToTreat || !selectedDecision) return;
        
        const creditId = creditToTreat.id;
        
        const payload = {
            creditId: creditId,
            decision: selectedDecision,
        };
        
        setIsSubmitting(true);
        
        try {
            // Utilisation de CREDIT_TREATMENT_API pour mettre à jour la décision
            await axios.post(CREDIT_TREATMENT_API, payload);
            
            const decisionLabel = DECISION_OPTIONS.find(d => d.value === selectedDecision).label;
            showPopup(`Crédit #${creditId} : Statut mis à jour à ${decisionLabel}.`, "success");
            
            setTreatmentModalVisible(false);
            setCreditToTreat(null);
            loadData();
            
        } catch (error) {
            console.error("Erreur de traitement du crédit:", error);
            showPopup(getBackendErrorMessage(error), "error");
        } finally {
            setIsSubmitting(false);
        }
    };


    // Le composant d'une ligne de la liste
    const CreditItem = ({ item }) => {
        const memberName = item.member 
            ? `${item.member.firstname} ${item.member.lastname}` 
            : `ID Inconnu (${item.memberId || 'N/A'})`;
        
        const statusColor = item.creditDecision === 'IN_TREATMENT' 
            ? 'orange' 
            : item.creditDecision === 'GRANTED' 
            ? 'green' 
            : item.creditDecision === 'REFUSED'
            ? 'red'
            : 'gray'; // Ajout d'une couleur par défaut

        // Logique de désactivation : Désactivé si la décision est GRANTED ou REFUSED
        const isTreated = item.creditDecision === 'GRANTED' || item.creditDecision === 'REFUSED';

        // L'icône de Traitement est visible seulement si IN_TREATMENT
        const showTreatButton = item.creditDecision === 'IN_TREATMENT';
        
        const actionJustificationStyle = isTreated 
            ? { justifyContent: 'flex-end' } 
            : { justifyContent: 'space-around' };

        return (
            <View style={styles.tableRow}>
                {/* Membre (Aligné à gauche) */}
                <Text style={[styles.cellText, styles.cellMember]}>{memberName}</Text>
                
                {/* Montant (Aligné au centre) */}
                <Text style={[styles.cellText, styles.cellAmount]}>{item.amount ? item.amount.toLocaleString('fr-FR') : '0'} FBu</Text>
                
                {/* Statut (Aligné au centre) */}
                <Text style={[styles.cellText, styles.cellStatus, { color: statusColor, fontWeight: 'bold' }]}>
                    {item.creditDecision || 'N/A'}
                </Text>
                
                {/* Actions (Alignement dynamique) */}
                <View style={[styles.cellActions, actionJustificationStyle]}>
                    
                    {/* Bouton Traitement (Actif seulement si IN_TREATMENT) */}
                    {showTreatButton && (
                        <TouchableOpacity onPress={() => openTreatmentModal(item)}>
                            <FontAwesome name="hourglass-start" size={22} color="#008CBA" /> 
                        </TouchableOpacity>
                    )}
                    
                    {/* Bouton Détails (Toujours actif) */}
                    <TouchableOpacity onPress={() => viewCredit(item)}>
                        <MaterialIcons name="info" size={22} color="#004080" />
                    </TouchableOpacity>
                    
                    {/* Bouton Modifier (Visible seulement si PAS traité) */}
                    {!isTreated && (
                        <TouchableOpacity onPress={() => editCredit(item)}>
                            <MaterialIcons 
                                name="edit" 
                                size={22} 
                                color="#FFA500" 
                            /> 
                        </TouchableOpacity>
                    )}
                    
                    {/* Bouton Supprimer (Visible seulement si PAS traité) */}
                    {!isTreated && (
                        <TouchableOpacity onPress={() => confirmDeleteCredit(item)}>
                            <MaterialIcons 
                                name="delete" 
                                size={22} 
                                color="#FF0000" 
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            
            {/* Bouton ajouter crédit (Demande) */}
            <TouchableOpacity 
                style={styles.addButton} 
                onPress={() => {
                    resetForm();
                    setModalVisible(true);
                }}
                disabled={popupVisible || treatmentModalVisible || confirmDeleteVisible} // Désactiver le bouton si un autre modal est actif
            >
                <Text style={styles.addButtonText}>➕ Demander un crédit</Text>
            </TouchableOpacity>

            {/* Liste des crédits */}
            {loadingData ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#004080" />
                    <Text style={{ marginTop: 10 }}>Chargement des crédits...</Text>
                </View>
            ) : credits.length > 0 ? (
                <View style={styles.tableContainer}>
                    {/* En-tête du tableau */}
                    <View style={styles.tableHeader}>
                        <Text style={[styles.headerText, styles.headerMember]}>Membre</Text>
                        <Text style={[styles.headerText, styles.headerAmount]}>Montant</Text>
                        <Text style={[styles.headerText, styles.headerStatus]}>Statut</Text>
                        <Text style={[styles.headerText, styles.headerActions]}>Actions</Text>
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

            {/* MODALE D'AJOUT/MODIFICATION DE CRÉDIT */}
            <Modal 
                animationType="slide" 
                transparent 
                visible={modalVisible && !popupVisible && !treatmentModalVisible && !confirmDeleteVisible} // Rendu AVANT les modales de confirmation/traitement
            >
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

            {/* MODALE DE TRAITEMENT DU CRÉDIT */}
            <Modal 
                animationType="slide" 
                transparent 
                visible={treatmentModalVisible && !popupVisible && !confirmDeleteVisible} // Rendu AVANT le popup de message
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            Traiter le Crédit #{creditToTreat?.id}
                        </Text>
                        
                        <Text style={styles.label}>
                            Décision pour {creditToTreat?.member?.firstname} {creditToTreat?.member?.lastname}
                        </Text>
                        
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={selectedDecision}
                                onValueChange={(itemValue) => setSelectedDecision(itemValue)}
                                style={styles.picker}
                                enabled={!isSubmitting}
                            >
                                {DECISION_OPTIONS.map((option) => (
                                    <Picker.Item 
                                        key={option.value} 
                                        label={option.label} 
                                        value={option.value}  
                                    />
                                ))}
                            </Picker>
                        </View>
                        
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={[styles.saveButton, {backgroundColor: '#1E90FF'}]} 
                                onPress={processCreditTreatment}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Décision</Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => {
                                    setTreatmentModalVisible(false);
                                    setCreditToTreat(null);
                                }}
                                disabled={isSubmitting}
                            >
                                <Text style={styles.cancelButtonText}>Annuler</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Pop-up confirmation suppression */}
            <Modal 
                visible={confirmDeleteVisible && !popupVisible} // Rendu AVANT le popup de message
                transparent 
                animationType="fade"
            >
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

// Styles (Inchangés, car ils étaient déjà corrects pour la mise en page)
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
    headerText: { color: "#fff", fontWeight: "bold" },

    // --- Styles spécifiques pour l'alignement des colonnes ---
    headerMember: { flex: 2.5, textAlign: "left" },
    cellMember: { flex: 2.5, textAlign: "left" },
    
    headerAmount: { flex: 1.5, textAlign: "center" },
    cellAmount: { flex: 1.5, textAlign: "center" },

    headerStatus: { flex: 1.5, textAlign: "center" },
    cellStatus: { flex: 1.5, textAlign: "center" },

    headerActions: { flex: 2, textAlign: "right" },
    cellActions: { 
        flex: 2, 
        flexDirection: "row", 
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