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
    ActivityIndicator, // ✅ Ajout pour l'indicateur de chargement
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";

const API_URL =
    "https://ziganya.onrender.com/ziganya-managment-system/api/v1/members";

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

export default function MembersScreen() {
    const [modalVisible, setModalVisible] = useState(false);
    const [members, setMembers] = useState([]);
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("+257");
    const [manyOfActions, setManyOfActions] = useState("");
    const [editingMemberId, setEditingMemberId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // ✅ Ajout pour l'état de soumission
    const [isLoading, setIsLoading] = useState(true); // ✅ Ajout pour l'état de chargement initial

    // Pop-up messages succès/erreur
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [popupType, setPopupType] = useState("success"); // success | error

    // Pop-up confirmation suppression
    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);

    // Afficher pop-up personnalisé
    const showPopup = (message, type = "success") => {
        setPopupMessage(message);
        setPopupType(type);
        setPopupVisible(true);
        // Garder le popup visible un peu plus longtemps pour les messages d'information
        setTimeout(() => setPopupVisible(false), type === "view_detail" ? 5000 : 3500); 
    };

    // Fonction de réinitialisation complète du formulaire
    const resetForm = () => {
        setFirstname("");
        setLastname("");
        setPhoneNumber("+257");
        setManyOfActions("");
        setEditingMemberId(null);
    };

    // Charger les membres
    const fetchMembers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(API_URL);
            setMembers(response.data);
        } catch (error) {
            console.error("Erreur de chargement des membres:", error);
            showPopup("Erreur de connexion. Impossible de charger les données.", "error");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    // Ajouter ou modifier un membre
    const saveMember = async () => {
        if (!firstname.trim()) return showPopup("Le prénom est requis.", "error");
        if (!lastname.trim()) return showPopup("Le nom est requis.", "error");
        if (!phoneNumber.trim() || phoneNumber.length < 5) return showPopup("Le numéro de téléphone est incomplet.", "error");
        
        const parsedManyOfActions = Number(manyOfActions);
        if (isNaN(parsedManyOfActions) || parsedManyOfActions <= 0) {
            return showPopup("Le nombre d'actions doit être un nombre positif.", "error");
        }

        const memberData = {
            firstname: firstname.trim(),
            lastname: lastname.trim(),
            phoneNumber: phoneNumber.trim(),
            manyOfActions: parsedManyOfActions,
        };

        setIsSubmitting(true); // Début de la soumission

        try {
            if (editingMemberId) {
                await axios.put(`${API_URL}/${editingMemberId}`, memberData);
                showPopup("Le membre a été modifié avec succès.", "success");
            } else {
                await axios.post(API_URL, memberData);
                showPopup("Le membre a été ajouté avec succès.", "success");
            }

            setModalVisible(false);
            resetForm(); // ✅ Réinitialisation après succès
            fetchMembers();
        } catch (error) {
            console.error("Erreur d'enregistrement:", error);
            showPopup(getBackendErrorMessage(error), "error");
        } finally {
            setIsSubmitting(false); // Fin de la soumission
        }
    };

    // Préparer confirmation suppression
    const confirmDeleteMember = (member) => { // Prendre l'objet entier pour le nom dans le popup
        setMemberToDelete(member);
        setConfirmDeleteVisible(true);
    };

    // Supprimer le membre après confirmation
    const performDeleteMember = async () => {
        if (!memberToDelete) return;
        const memberId = memberToDelete.id;
        try {
            await axios.delete(`${API_URL}/${memberId}`);
            fetchMembers();
            showPopup(`Le membre ${memberToDelete.lastname} a été supprimé.`, "success");
        } catch (error) {
            console.error("Erreur de suppression:", error);
            showPopup(getBackendErrorMessage(error), "error");
        } finally {
            setMemberToDelete(null);
            setConfirmDeleteVisible(false);
        }
    };

    // Préparer l’édition
    const editMember = (member) => {
        setFirstname(member.firstname);
        setLastname(member.lastname);
        setPhoneNumber(member.phoneNumber);
        setManyOfActions(member.manyOfActions.toString());
        setEditingMemberId(member.id);
        setModalVisible(true);
    };

    // Voir les détails
    const viewMember = (member) => {
        showPopup(
            `👤 Nom: ${member.firstname} ${member.lastname}\n📞 Téléphone: ${member.phoneNumber}\n🔢 Actions: ${member.manyOfActions}`,
            "view_detail" // ✅ Utilisation d'un type différent pour le popup d'information
        );
    };

    const MemberItem = ({ item }) => (
        <View style={styles.tableRow}>
            <Text style={[styles.cellText, { flex: 2, textAlign: 'left', paddingLeft: 5 }]}>{item.lastname} {item.firstname}</Text> {/* ✅ Affichage Nom et Prénom */}
            <Text style={[styles.cellText, { flex: 2 }]}>{item.phoneNumber}</Text>
            <View style={[styles.cellActions, { flex: 1.5 }]}> {/* Ajustement de la flexibilité */}
                <TouchableOpacity onPress={() => viewMember(item)}>
                    <MaterialIcons name="info" size={22} color="#004080" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => editMember(item)}>
                    <MaterialIcons name="edit" size={22} color="#FFA500" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDeleteMember(item)}>
                    <MaterialIcons name="delete" size={22} color="#FF0000" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Pop-up confirmation suppression */}
            <Modal visible={confirmDeleteVisible} transparent animationType="fade">
                <View style={styles.popupOverlay}>
                    <View style={[styles.popupBox, { borderTopColor: "orange", borderTopWidth: 6 }]}>
                        <Text style={styles.popupText}>
                            Êtes-vous sûr de vouloir supprimer le membre **{memberToDelete?.firstname} {memberToDelete?.lastname}** ?
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
                                onPress={performDeleteMember}
                            >
                                <Text style={styles.saveButtonText}>Supprimer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Bouton ajouter membre */}
            <TouchableOpacity 
                style={styles.addButton} 
                onPress={() => { resetForm(); setModalVisible(true); }} // ✅ Réinitialiser le formulaire
            >
                <Text style={styles.addButtonText}>➕ Ajouter un membre</Text>
            </TouchableOpacity>

            {/* Modal ajout/modif */}
            <Modal animationType="slide" transparent visible={modalVisible}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            {editingMemberId ? "Modifier un membre" : "Enregistrer un membre"}
                        </Text>
                        <ScrollView>
                            <Text style={styles.label}>Prénom</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Entrer le prénom"
                                value={firstname}
                                onChangeText={setFirstname}
                                editable={!isSubmitting} // Désactivé pendant la soumission
                            />

                            <Text style={styles.label}>Nom de Famille</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Entrer le nom de famille"
                                value={lastname}
                                onChangeText={setLastname}
                                editable={!isSubmitting}
                            />

                            <Text style={styles.label}>Numéro de Téléphone</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="+257XXXXXXXX"
                                keyboardType="phone-pad"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                editable={!isSubmitting}
                            />

                            <Text style={styles.label}>Nombre d'Actions (Parts)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Entrer le nombre d'actions"
                                keyboardType="numeric"
                                value={manyOfActions}
                                onChangeText={setManyOfActions}
                                editable={!isSubmitting}
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity 
                                    style={styles.saveButton} 
                                    onPress={saveMember}
                                    disabled={isSubmitting} // Désactivé pendant la soumission
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>
                                            {editingMemberId ? "💾 Modifier" : "💾 Enregistrer"}
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

            {/* Liste des membres */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#004080" />
                    <Text style={{ marginTop: 10 }}>Chargement des membres...</Text>
                </View>
            ) : members.length > 0 ? (
                <View style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.headerText, { flex: 2, textAlign: 'left', paddingLeft: 5 }]}>Nom et Prénom</Text>
                        <Text style={[styles.headerText, { flex: 2 }]}>Téléphone</Text>
                        <Text style={[styles.headerText, { flex: 1.5 }]}>Actions</Text>
                    </View>
                    <FlatList
                        data={members}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={MemberItem}
                    />
                </View>
            ) : (
                <Text style={styles.emptyText}>Aucun membre enregistré</Text>
            )}
            
            {/* Pop-up message (en dernier pour l'ordre de superposition) */}
            <Modal visible={popupVisible} transparent animationType="fade" onRequestClose={() => setPopupVisible(false)}>
                <View style={styles.popupOverlay}>
                    <View
                        style={[
                            styles.popupBox,
                            popupType === "error" ? styles.popupError : 
                            popupType === "view_detail" ? styles.popupInfo : 
                            styles.popupSuccess,
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

// Styles
const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#E0F3FF" },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }, // ✅ Style pour le chargement
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
        maxHeight: "95%", // Augmentation pour plus de place
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: "center",
        color: "#004080",
    },
    label: { fontWeight: "bold", marginBottom: 5, color: "#004080", marginTop: 5 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        backgroundColor: '#fff',
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

    tableContainer: { backgroundColor: "#fff", borderRadius: 10, overflow: "hidden", flex: 1 },
    tableHeader: { flexDirection: "row", backgroundColor: "#004080", padding: 10 },
    headerText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        paddingVertical: 12,
        paddingHorizontal: 5,
        alignItems: "center",
        backgroundColor: '#fff',
    },
    cellText: { fontSize: 14, color: "#333", textAlign: 'center' },
    cellActions: { flexDirection: "row", justifyContent: "space-around" },
    emptyText: { textAlign: "center", color: "#555", marginTop: 30, fontStyle: "italic" },

    // Pop-up
    popupOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.4)",
        zIndex: 9999, // S'assurer qu'il est au-dessus
        elevation: 10,
    },
    popupBox: {
        width: "80%",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        alignItems: "center",
    },
    popupError: { borderTopWidth: 6, borderTopColor: "#FF0000" }, // Rouge pour erreur
    popupSuccess: { borderTopWidth: 6, borderTopColor: "#00C851" }, // Vert pour succès
    popupInfo: { borderTopWidth: 6, borderTopColor: "#004080" }, // Bleu pour info/détails
    popupText: { fontSize: 16, textAlign: "center", marginBottom: 10, color: '#333' },
    closeText: { color: "#004080", fontWeight: "bold" },
});