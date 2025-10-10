import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import axios from "axios";

export default function DashboardScreen() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(
          "https://ziganya.onrender.com/ziganya-managment-system/api/v1/reports"
        );
        setReport(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement du rapport :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#004080" />
        <Text>Chargement du Dashboard...</Text>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Impossible de charger les données.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Tableau de bord</Text>

      {/* ✅ Affichage du message du backend */}
      {report.message && (
        <Text style={styles.backendMessage}>{report.message}</Text>
      )}

      <Text style={styles.subtitle}>
        Statistiques générales de l’association
      </Text>

      <View style={styles.gridContainer}>
        {/* Première ligne */}
        <View style={styles.row}>
          <View
            style={[
              styles.gridItem,
              { borderLeftColor: "#2E8B57", backgroundColor: "#E9F7EF" },
            ]}
          >
            <Text style={styles.gridTitle}>Membres</Text>
            <Text style={styles.gridValue}>{report.totalMembers}</Text>
          </View>

          <View
            style={[
              styles.gridItem,
              { borderLeftColor: "#1E90FF", backgroundColor: "#EAF3FF" },
            ]}
          >
            <Text style={styles.gridTitle}>Actions</Text>
            <Text style={styles.gridValue}>{report.totalActions}</Text>
          </View>
        </View>

        {/* Deuxième ligne */}
        <View style={styles.row}>
          <View
            style={[
              styles.gridItem,
              { borderLeftColor: "#FFD700", backgroundColor: "#FFF8E1" },
            ]}
          >
            <Text style={styles.gridTitle}>Solde Actuel</Text>
            <Text style={styles.gridValue}>
              {report.totalCurrentBalance.toFixed(2)} FBu
            </Text>
          </View>

          <View
            style={[
              styles.gridItem,
              { borderLeftColor: "#FF6347", backgroundColor: "#FFECE8" },
            ]}
          >
            <Text style={styles.gridTitle}>Solde des Crédits</Text>
            <Text style={styles.gridValue}>
              {report.totalLoanBalance.toFixed(2)} FBu
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#E0F3FF",
    alignItems: "center",
    padding: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E0F3FF",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 5,
    textAlign: "center",
  },
  backendMessage: {
    backgroundColor: "#D1F7C4",
    color: "#2E7D32",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 16,
    color: "#004080",
    marginBottom: 25,
    textAlign: "center",
  },
  gridContainer: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  gridItem: {
    flex: 1,
    marginHorizontal: 5,
    padding: 20,
    borderRadius: 10,
    borderLeftWidth: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },
  gridTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 10,
  },
  gridValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});
