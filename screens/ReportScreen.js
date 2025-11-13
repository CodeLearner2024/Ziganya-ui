import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Text, Button, ActivityIndicator, Alert } from "react-native";
import axios from "axios";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export default function App() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // API Endpoint
  const API_URL = "https://ziganya.onrender.com/ziganya-managment-system/api/v1/reports/all-members";

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await axios.get(API_URL);
      setMembers(response.data);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de récupérer les données de l'API");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    const date = new Date().toLocaleDateString();

    let htmlContent = `
      <h1 style="text-align:center;">Rapport des Membres</h1>
      <p style="text-align:center;">Date du rapport : <strong>${date}</strong></p>
      <table style="width:100%; border-collapse: collapse;" border="1">
        <thead>
          <tr style="background-color:#f0f0f0;">
            <th>Nom</th>
            <th>Téléphone</th>
            <th>Actions</th>
            <th>Contribution</th>
            <th>Prêt</th>
            <th>Remboursement</th>
            <th>Intérêt</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${members
            .map(
              (m) => `
            <tr>
              <td>${m.memberResponse.firstname} ${m.memberResponse.lastname}</td>
              <td>${m.memberResponse.phoneNumber}</td>
              <td>${m.actions}</td>
              <td>${m.contributedAmount}</td>
              <td>${m.loanAmount}</td>
              <td>${m.refundAmount}</td>
              <td>${m.interestAmount}</td>
              <td>${m.totalAmount}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert("Erreur", "Échec de la génération du PDF");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📊 Rapport des Membres</Text>
      <Text style={styles.date}>Date du rapport : {new Date().toLocaleDateString()}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <ScrollView style={styles.scroll}>
          {members.map((item, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.name}>
                {item.memberResponse.firstname} {item.memberResponse.lastname}
              </Text>
              <Text style={styles.phone}>{item.memberResponse.phoneNumber}</Text>

              {/* Ligne d'information (libellé + valeur) */}
              <View style={styles.row}>
                <Text style={styles.label}>Actions</Text>
                <Text style={styles.value}>{item.actions}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Contribution</Text>
                <Text style={styles.value}>{item.contributedAmount.toLocaleString()} FBu</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Prêt</Text>
                <Text style={styles.value}>{item.loanAmount.toLocaleString()} FBu</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Remboursement</Text>
                <Text style={styles.value}>{item.refundAmount.toLocaleString()} FBu</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Intérêt</Text>
                <Text style={styles.value}>{item.interestAmount.toLocaleString()} FBu</Text>
              </View>
              <View style={[styles.row, styles.totalRow]}>
                <Text style={[styles.label, styles.totalLabel]}>Total</Text>
                <Text style={[styles.value, styles.totalValue]}>{item.totalAmount.toLocaleString()} FBu</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.buttonContainer}>
        <Button title="📄 Générer le PDF" onPress={generatePDF} color="#007BFF" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f9f9f9",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#007BFF",
    textAlign: "center",
    marginVertical: 10,
  },
  date: {
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  scroll: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  phone: {
    color: "#555",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
    paddingVertical: 4,
  },
  label: {
    fontSize: 14,
    color: "#555",
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  totalRow: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#007BFF",
    paddingTop: 6,
  },
  totalLabel: {
    fontWeight: "bold",
    color: "#007BFF",
  },
  totalValue: {
    fontWeight: "bold",
    color: "#007BFF",
  },
  buttonContainer: {
    marginBottom: 10,
  },
});
