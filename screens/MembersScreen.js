import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";

const API_URL =
  "http://ziganya.onrender.com/ziganya-managment-system/api/v1/members";

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
    setTimeout(() => setPopupVisible(false), 3500);
  };

  // Charger les membres
  const fetchMembers = async () => {
    try {
      const response = await axios.get(API_URL);
      setMembers(response.data);
    } catch (error) {
      console.error(error);
      showPopup(getBackendErrorMessage(error), "error");
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Ajouter ou modifier un membre
  const saveMember = async () => {
    if (!firstname.trim()) return showPopup("First name must be provided", "error");
    if (!lastname.trim()) return showPopup("Last name must be provided", "error");
    if (!phoneNumber.trim()) return showPopup("Phone number must be provided", "error");
    if (!manyOfActions) return showPopup("Many of actions must be provided", "error");

    const memberData = {
      firstname,
      lastname,
      phoneNumber,
      manyOfActions: Number(manyOfActions),
    };

    try {
      if (editingMemberId) {
        await axios.put(`${API_URL}/${editingMemberId}`, memberData);
        showPopup("Le membre a été modifié avec succès", "success");
        setEditingMemberId(null);
      } else {
        await axios.post(API_URL, memberData);
        showPopup("Le membre a été ajouté avec succès", "success");
      }

      setModalVisible(false);
      setFirstname("");
      setLastname("");
      setPhoneNumber("+257");
      setManyOfActions("");
      fetchMembers();
    } catch (error) {
      console.error(error);
      showPopup(getBackendErrorMessage(error), "error");
    }
  };

  // Préparer confirmation suppression
  const confirmDeleteMember = (id) => {
    setMemberToDelete(id);
    setConfirmDeleteVisible(true);
  };

  // Supprimer le membre après confirmation
  const performDeleteMember = async () => {
    if (!memberToDelete) return;
    try {
      await axios.delete(`${API_URL}/${memberToDelete}`);
      fetchMembers();
      showPopup("Le membre a été supprimé avec succès", "success");
    } catch (error) {
      console.error(error);
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
      `👤 ${member.firstname} ${member.lastname}\n📞 ${member.phoneNumber}\n🔢 ${member.manyOfActions} actions`,
      "success"
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

      {/* Pop-up confirmation suppression */}
      <Modal visible={confirmDeleteVisible} transparent animationType="fade">
        <View style={styles.popupOverlay}>
          <View style={[styles.popupBox, { borderTopColor: "orange", borderTopWidth: 6 }]}>
            <Text style={styles.popupText}>
              Êtes-vous sûr de vouloir supprimer ce membre ?
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
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
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
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter first name"
                value={firstname}
                onChangeText={setFirstname}
              />

              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter last name"
                value={lastname}
                onChangeText={setLastname}
              />

              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="+257XXXXXXXX"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />

              <Text style={styles.label}>Many of Actions</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter number of actions"
                keyboardType="numeric"
                value={manyOfActions}
                onChangeText={setManyOfActions}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.saveButton} onPress={saveMember}>
                  <Text style={styles.saveButtonText}>💾 Enregistrer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setModalVisible(false);
                    setEditingMemberId(null);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Liste des membres */}
      {members.length > 0 ? (
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, { flex: 2 }]}>Nom</Text>
            <Text style={[styles.headerText, { flex: 2 }]}>Téléphone</Text>
            <Text style={[styles.headerText, { flex: 1 }]}>Actions</Text>
          </View>
          <FlatList
            data={members}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <Text style={[styles.cellText, { flex: 2 }]}>{item.lastname}</Text>
                <Text style={[styles.cellText, { flex: 2 }]}>{item.phoneNumber}</Text>
                <View style={[styles.cellActions, { flex: 1 }]}>
                  <TouchableOpacity onPress={() => viewMember(item)}>
                    <MaterialIcons name="info" size={22} color="#004080" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => editMember(item)}>
                    <MaterialIcons name="edit" size={22} color="#FFA500" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmDeleteMember(item.id)}>
                    <MaterialIcons name="delete" size={22} color="#FF0000" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>
      ) : (
        <Text style={styles.emptyText}>Aucun membre enregistré</Text>
      )}
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#E0F3FF" },
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
  label: { fontWeight: "bold", marginBottom: 5, color: "#004080" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
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
  cellText: { fontSize: 14, color: "#000" },
  cellActions: { flexDirection: "row", justifyContent: "space-around" },
  emptyText: { textAlign: "center", color: "#555", marginTop: 30, fontStyle: "italic" },

  // Pop-up
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
