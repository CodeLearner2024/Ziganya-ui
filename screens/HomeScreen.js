import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import { FontAwesome5, MaterialIcons, Entypo, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen({ navigation }) {
  return (
    <LinearGradient
      colors={["#E0F3FF", "#005EB8"]}
      style={styles.gradientBackground}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/512/3222/3222791.png" }}
            style={styles.image}
          />
          <Text style={styles.title}>
            AVEC <Text style={styles.subTitle}>Ziganya</Text>
          </Text>
        </View>

        {/* TITRE PRINCIPAL */}
        <Text style={styles.mainText}>Community Savings & Credit Management</Text>

        {/* DETAILS */}
        <View style={styles.details}>

          {/* Members Management */}
          <View style={styles.detailItem}>
            <Ionicons name="people-circle-outline" size={26} color="#007bff" />
            <Text style={styles.detailText}>Members Management</Text>
          </View>

          {/* Contribution Management */}
          <View style={styles.detailItem}>
            <FontAwesome5 name="hand-holding-usd" size={22} color="#007bff" />
            <Text style={styles.detailText}>Contribution Management</Text>
          </View>

          {/* Credit Management */}
          <View style={styles.detailItem}>
            <FontAwesome5 name="credit-card" size={22} color="#007bff" />
            <Text style={styles.detailText}>Credit Management</Text>
          </View>

          {/* Refund Management */}
          <View style={styles.detailItem}>
            <Entypo name="cycle" size={24} color="#007bff" />
            <Text style={styles.detailText}>Refund Management</Text>
          </View>

          {/* Settings */}
          <View style={styles.detailItem}>
            <Ionicons name="settings-outline" size={24} color="#007bff" />
            <Text style={styles.detailText}>Settings & Parameters</Text>
          </View>
        </View>

        {/* FOOTER */}
        <Text style={styles.footerText}>
          Saving Together for a Better Future 💙
        </Text>

        {/* BOUTON CONTINUE */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Menu")}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "#005EB8",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#003366",
  },
  subTitle: {
    fontSize: 20,
    color: "#004080",
  },
  mainText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#003366",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  details: {
    width: "100%",
    marginTop: 10,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#ffffffa0",
    padding: 10,
    borderRadius: 10,
  },
  detailText: {
    fontSize: 16,
    marginLeft: 10,
    color: "#003366",
    fontWeight: "500",
  },
  footerText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 25,
    color: "#003366",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#004080",
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 10,
    marginTop: 30,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
