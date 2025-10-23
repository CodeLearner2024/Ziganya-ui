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

// --- Configuration API ---
const API_BASE_URL = "https://ziganya.onrender.com/ziganya-managment-system/api/v1";
const MEMBERS_API = `${API_BASE_URL}/members`;
const CONTRIBUTIONS_API = `${API_BASE_URL}/contributions`;

// --- Fonction utilitaire ---
const getBackendErrorMessage = (error) => {
    if (error.response && error.response.data) {
        const data = error.response.data;
        // Essaie de trouver un message clair ou retourne une représentation JSON
        return data.message || data.errorMessage || JSON.stringify(data);
    } else if (error.message) {
        return error.message;
    } else {
        return "Une erreur inconnue est survenue.";
    }
};

const getTodayDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function ContributionScreen() {
    const [modalVisible, setModalVisible] = useState(false);
    const [contributions, setContributions] = useState([]);
    const [members, setMembers] = useState([]); 
    const [loadingData, setLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Champs du formulaire
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [selectedMemberId, setSelectedMemberId] = useState(""); 
    const [contributionDate, setContributionDate] = useState(getTodayDate());
    const [month, setMonth] = useState("JANUARY"); // ✅ Champ mois
    const [editingContributionId, setEditingContributionId] = useState(null);

    // Pop-up messages
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [popupType, setPopupType] = useState("success");

    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const [contributionToDelete, setContributionToDelete] = useState(null);

    const showPopup = (message, type = "success") => {
        setPopupMessage(message);
        setPopupType(type);
        setPopupVisible(true);
        // Masque le popup après 5 secondes, sauf si c'est pour une vue détaillée
        if (type !== "view_detail") { 
            setTimeout(() => setPopupVisible(false), 5000);
        }
    };

    const resetForm = () => {
        setAmount("");
        setDescription("");
        setContributionDate(getTodayDate()); 
        setMonth("JANUARY"); // ✅ Réinitialisation du mois
        setEditingContributionId(null);
        // Initialise selectedMemberId au premier membre s'il existe
        if (members.length > 0 && !selectedMemberId) {
            setSelectedMemberId(members[0].id); 
        } else if (members.length === 0) {
             setSelectedMemberId(""); // Réinitialise si aucun membre n'est chargé
        }
    };

    const loadData = useCallback(async () => {
        setLoadingData(true);
        try {
            const membersResponse = await axios.get(MEMBERS_API);
            const membersData = membersResponse.data.map(m => ({
                id: m.id.toString(),
                name: m.firstname && m.lastname ? `${m.firstname} ${m.lastname}` : `Membre #${m.id}`,
            }));
            setMembers(membersData);

            // S'assurer que l'ID du membre est sélectionné après chargement des membres
            if (membersData.length > 0 && !selectedMemberId) {
                setSelectedMemberId(membersData[0].id);
            }

            const contributionsResponse = await axios.get(CONTRIBUTIONS_API);
            setContributions(contributionsResponse.data);
        } catch (error) {
            console.error("Erreur lors du chargement des données:", error);
            showPopup("Erreur de connexion. Impossible de charger les données.", "error");
        } finally {
            setLoadingData(false);
        }
    }, [selectedMemberId]); // Ajouté selectedMemberId pour la logique d'initialisation

    useEffect(() => {
        loadData();
    }, [loadData]);

    const saveContribution = async () => {
        // Validation avant soumission
        if (!selectedMemberId || !amount || !description.trim()) {
            return showPopup("Veuillez remplir le membre, le montant et la description.", "error");
        }
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return showPopup("Le montant doit être un nombre positif.", "error");
        }

        const payload = {
            amount: parsedAmount,
            description: description.trim(),
            memberId: parseInt(selectedMemberId),
            contributionDate: contributionDate,
            month: month, // ✅ Ajout du champ month
        };

        setIsSubmitting(true);

        try {
            if (editingContributionId) {
                await axios.put(`${CONTRIBUTIONS_API}/${editingContributionId}`, payload);
                showPopup("Contribution modifiée avec succès.", "success");
            } else {
                await axios.post(CONTRIBUTIONS_API, payload);
                showPopup(`Contribution de ${payload.amount.toLocaleString('fr-FR')} FBu enregistrée.`, "success");
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

    const editContribution = (contribution) => {
        setAmount(contribution.amount ? contribution.amount.toString() : "");
        setDescription(contribution.description || "");
        setContributionDate(contribution.contributionDate || getTodayDate());
        setMonth(contribution.month || "JANUARY"); // ✅ Affichage du mois
        // S'assurer que l'ID du membre est une chaîne de caractères
        setSelectedMemberId(contribution.member?.id?.toString() || contribution.memberId?.toString() || "");
        setEditingContributionId(contribution.id);
        setModalVisible(true);
    };

    const confirmDeleteContribution = (contribution) => {
        setContributionToDelete(contribution);
        setConfirmDeleteVisible(true);
    };

    const performDeleteContribution = async () => {
        if (!contributionToDelete) return;
        const contributionId = contributionToDelete.id;
        const memberName = contributionToDelete.member 
            ? `${contributionToDelete.member.firstname} ${contributionToDelete.member.lastname}` 
            : `ID ${contributionId}`;
        try {
            await axios.delete(`${CONTRIBUTIONS_API}/${contributionId}`);
            loadData();
            showPopup(`La contribution de ${memberName} a été supprimée.`, "success");
        } catch (error) {
            console.error("Erreur de suppression:", error);
            showPopup(getBackendErrorMessage(error), "error");
        } finally {
            setContributionToDelete(null);
            setConfirmDeleteVisible(false);
        }
    };

    const viewContribution = (item) => {
        const memberName = item.member 
            ? `${item.member.firstname} ${item.member.lastname}` 
            : `ID ${item.memberId}`;
        // Utiliser un affichage plus propre ou simplement un popup standard
        const detailMessage = 
            `💰 Montant: ${item.amount ? item.amount.toLocaleString('fr-FR') : 'N/A'} FBu\n` +
            `👤 Membre: ${memberName}\n` +
            `📅 Date: ${item.contributionDate || 'N/A'}\n` +
            `🗓 Mois: ${item.month || 'N/A'}\n` +
            `📝 Description: ${item.description || 'N/A'}`;
            
        showPopup(detailMessage, "view_detail"); // Utiliser un type pour ne pas masquer automatiquement
    };

    const ContributionItem = ({ item }) => {
        const memberName = item.member 
            ? `${item.member.firstname} ${item.member.lastname}` 
            : `ID Inconnu (${item.memberId || 'N/A'})`;
        return (
            <View style={styles.tableRow}>
                <Text style={[styles.cellText, { flex: 2, textAlign: 'left', paddingLeft: 5 }]}>{memberName}</Text>
                <Text style={[styles.cellText, { flex: 2 }]}>{item.amount ? item.amount.toLocaleString('fr-FR') : '0'} FBu</Text>
                <View style={[styles.cellActions, { flex: 1.5 }]}>
                    <TouchableOpacity onPress={() => viewContribution(item)}>
                        <MaterialIcons name="info" size={22} color="#004080" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => editContribution(item)}>
                        <MaterialIcons name="edit" size={22} color="#FFA500" /> 
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => confirmDeleteContribution(item)}>
                        <MaterialIcons name="delete" size={22} color="#FF0000" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>

            {/* Confirmation suppression */}
            <Modal visible={confirmDeleteVisible} transparent animationType="fade">
                <View style={styles.popupOverlay}>
                    <View style={[styles.popupBox, { borderTopColor: "orange", borderTopWidth: 6 }]}>
                        <Text style={styles.popupText}>
                            Êtes-vous sûr de vouloir supprimer cette contribution ?
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
                                onPress={performDeleteContribution}
                            >
                                <Text style={styles.saveButtonText}>Supprimer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Bouton ajouter */}
            <TouchableOpacity 
                style={styles.addButton} 
                onPress={() => { resetForm(); setSelectedMemberId(members.length > 0 ? members[0].id : ""); setModalVisible(true); }}
                disabled={members.length === 0 && !loadingData} // Désactiver si on charge ou s'il n'y a pas de membres
            >
                <Text style={styles.addButtonText}>➕ Ajouter une contribution</Text>
            </TouchableOpacity>

            {/* Modal ajout/modif */}
            <Modal animationType="slide" transparent visible={modalVisible}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            {editingContributionId ? "Modifier la Contribution" : "Enregistrer une Contribution"}
                        </Text>
                        <ScrollView>
                            {/* Membre */}
                            <Text style={styles.label}>Membre</Text>
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

                            {/* Montant */}
                            <Text style={styles.label}>Montant (FBu)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: 48000"
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                                editable={!isSubmitting}
                            />

                            {/* Description */}
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Contribution Octobre"
                                value={description}
                                onChangeText={setDescription}
                                editable={!isSubmitting}
                            />

                            {/* Mois */}
                            <Text style={styles.label}>Mois</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={month}
                                    onValueChange={(value) => setMonth(value)}
                                    style={styles.picker}
                                    enabled={!isSubmitting}
                                >
                                    <Picker.Item label="JANUARY" value="JANUARY" />
                                    <Picker.Item label="FEBRUARY" value="FEBRUARY" />
                                    <Picker.Item label="MARCH" value="MARCH" />
                                    <Picker.Item label="APRIL" value="APRIL" />
                                    <Picker.Item label="MAY" value="MAY" />
                                    <Picker.Item label="JUNE" value="JUNE" />
                                    <Picker.Item label="JULY" value="JULY" />
                                    <Picker.Item label="AUGUST" value="AUGUST" />
                                    <Picker.Item label="SEPTEMBER" value="SEPTEMBER" />
                                    <Picker.Item label="OCTOBER" value="OCTOBER" />
                                    <Picker.Item label="NOVEMBER" value="NOVEMBER" />
                                    <Picker.Item label="DECEMBER" value="DECEMBER" />
                                </Picker>
                            </View>

                            {/* Date */}
                            <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="AAAA-MM-JJ"
                                value={contributionDate}
                                onChangeText={setContributionDate}
                                editable={!isSubmitting}
                            />

                            {/* Boutons */}
                            <View style={styles.modalButtons}>
                                <TouchableOpacity 
                                    style={styles.saveButton} 
                                    onPress={saveContribution}
                                    disabled={isSubmitting || members.length === 0}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>
                                            {editingContributionId ? "💾 Modifier" : "💾 Enregistrer"}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => { setModalVisible(false); resetForm(); }}
                                    disabled={isSubmitting}
                                >
                                    <Text style={styles.cancelButtonText}>Annuler</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Liste */}
            {loadingData ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#004080" />
                    <Text style={{ marginTop: 10 }}>Chargement des contributions...</Text>
                </View>
            ) : contributions.length > 0 ? (
                <View style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.headerText, { flex: 2, textAlign: 'left', paddingLeft: 5 }]}>Membre</Text>
                        <Text style={[styles.headerText, { flex: 2 }]}>Montant</Text>
                        <Text style={[styles.headerText, { flex: 1.5 }]}>Actions</Text>
                    </View>
                    <FlatList
                        data={contributions}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={ContributionItem}
                    />
                </View>
            ) : (
                <Text style={styles.emptyText}>Aucune contribution enregistrée</Text>
            )}

            {/* --- POPUP MESSAGE (PLACÉ EN DERNIER POUR ÊTRE AU-DESSUS) --- */}
            <Modal visible={popupVisible} transparent animationType="fade" onRequestClose={() => setPopupVisible(false)}>
                <View style={styles.popupOverlay}>
                    <View style={[
                        styles.popupBox,
                        popupType === "error" ? styles.popupError : 
                        popupType === "view_detail" ? { backgroundColor: "#fff", borderTopColor: "#004080", borderTopWidth: 6 } : 
                        styles.popupSuccess,
                    ]}>
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

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#E0F3FF" },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    addButton: { backgroundColor: "#004080", padding: 15, borderRadius: 10, alignItems: "center", marginBottom: 20 },
    addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
    modalContainer: { width: "90%", backgroundColor: "#fff", borderRadius: 10, padding: 20, maxHeight: "95%" },
    modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center", color: "#004080" },
    label: { fontWeight: "bold", marginBottom: 5, color: "#004080", marginTop: 10 },
    input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 15, backgroundColor: '#fff' },
    pickerContainer: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginBottom: 15, overflow: 'hidden', backgroundColor: '#fff' },
    picker: { height: 40, width: '100%' },
    modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 10, marginBottom: 10 },
    saveButton: { backgroundColor: "#004080", padding: 12, borderRadius: 8, flex: 1, marginRight: 5, alignItems: "center" },
    saveButtonText: { color: "#fff", fontWeight: "bold" },
    cancelButton: { backgroundColor: "#ccc", padding: 12, borderRadius: 8, flex: 1, marginLeft: 5, alignItems: "center" },
    cancelButtonText: { fontWeight: "bold" },
    tableContainer: { backgroundColor: "#fff", borderRadius: 10, overflow: "hidden", flex: 1 },
    tableHeader: { flexDirection: "row", backgroundColor: "#004080", padding: 10 },
    headerText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
    tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f0f0f0", paddingVertical: 12, paddingHorizontal: 5, backgroundColor: '#fff' },
    cellText: { fontSize: 14, color: "#333", textAlign: 'center' },
    cellActions: { flexDirection: "row", justifyContent: "space-around" },
    emptyText: { textAlign: "center", color: "#555", marginTop: 30, fontStyle: "italic" },
    popupOverlay: { 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center", 
        backgroundColor: "rgba(0,0,0,0.4)",
        zIndex: 9999,    
        elevation: 10,     
    },
    popupBox: { width: "80%", padding: 20, borderRadius: 10, alignItems: "center" },
    popupSuccess: { backgroundColor: "#E0FBE2", borderTopWidth: 6, borderTopColor: "#00C851" },
    popupError: { backgroundColor: "#FFE5E5", borderTopWidth: 6, borderTopColor: "#FF0000" },
    popupText: { fontSize: 16, textAlign: "center", marginBottom: 10, color: "#333" },
    closeText: { fontWeight: "bold", color: "#004080" },
});