import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { Picker } from "@react-native-picker/picker"; // pour le dropdown

export default function ContributionsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [contributionDate, setContributionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [memberId, setMemberId] = useState("");
  const [members, setMembers] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(false);

  const MEMBERS_URL =
    "https://ziganya.onrender.com/ziganya-managment-system/api/v1/membres";
  const CONTRIBUTIONS_URL =
    "https://ziganya.onrender.com/ziganya-managment-system/api/v1/contributions";

  // Charger les membres et contributions existants
  useEffect(() => {
    fetchMembers();
    fetchContributions();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await axios.get(MEMBERS_URL);
      setMembers(response.data);
    } catch (error) {
      console.error("Erreur chargement membres:", error);
    }
  };

  const fetchContributions = async () => {
    try {
      const response = await axios.get(CONTRIBUTIONS_URL);
      setContributions(response.data);
    } catch (error) {
      console.error("Erreur chargement contributions:", error);
    }
  };

  const handleSave = async () => {
    if (!amount || !memberId) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const data = {
      contributionDate,
      amount: parseFloat(amount),
      description,
      memberId: parseInt(memberId),
    };

    try {
      setLoading(true);
      await axios.post(CONTRIBUTIONS_URL, data);
      Alert.alert("Succès", "Contribution enregistrée !");
      setModalVisible(false);
      setAmount("");
      setDescription("");
      setMemberId("");
      fetchContributions(); // recharger la liste
    } catch (error) {
      console.error("Erreur d’enregistrement:", error);
      Alert.alert("Erreur", "Impossible d’enregistrer la contribution.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contributions</Text>

      {/* Bouton pour ouvrir le modal */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>Ajouter une contribution</Text>
      </TouchableOpacity>

      {/* Tableau des contributions */}
      <FlatList
        data={contributions}
        keyExtractor={(item) => item.id?.toString()}
        style={styles.list}
        ListHeaderComponent={() => (
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, styles.header]}>Date</Text>
            <Text style={[styles.cell, styles.header]}>Montant</Text>
            <Text style={[styles.cell, styles.header]}>Membre</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            <Text style={styles.cell}>{item.contributionDate}</Text>
            <Text style={styles.cell}>{item.amount} FBu</Text>
            <Text style={styles.cell}>{item.memberName || item.memberId}</Text>
          </View>
        )}
      />

      {/* Pop-up pour ajouter */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouvelle Contribution</Text>

            <Text>Date (auto)</Text>
            <TextInput
              value={contributionDate}
              editable={false}
              style={styles.input}
            />

            <Text>Montant *</Text>
            <TextInput
              placeholder="Entrez le montant"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              style={styles.input}
            />

            <Text>Description</Text>
            <TextInput
              placeholder="Description (facultatif)"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
            />

            <Text>Membre *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={memberId}
                onValueChange={(value) => setMemberId(value)}
              >
                <Picker.Item label="-- Sélectionnez un membre --" value="" />
                {members.map((m) => (
                  <Picker.Item
                    key={m.id}
                    label={`${m.firstname} ${m.lastname}`}
                    value={m.id}
                  />
                ))}
              </Picker>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveText}>Enregistrer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  button: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  list: { marginTop: 10 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#007bff",
    padding: 10,
  },
  tableRow: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cell: { flex: 1, textAlign: "center" },
  header: { color: "#fff", fontWeight: "bold" },

  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    width: "45%",
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    width: "45%",
    alignItems: "center",
  },
  cancelText: { color: "#000" },
  saveText: { color: "#fff", fontWeight: "bold" },
});
