import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function MenuScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tableau de bord</Text>

      <TouchableOpacity 
  style={styles.button} 
  onPress={() => navigation.navigate("Dashboard")}
>
  <Text style={styles.buttonText}>Dashboard</Text>
</TouchableOpacity>

      <TouchableOpacity style={styles.button}
       onPress={() => navigation.navigate("Members")}
      >
        
        <Text style={styles.buttonText}>Members</Text>
      </TouchableOpacity>

      <TouchableOpacity
  style={styles.button}
  onPress={() => navigation.navigate("Contribution")}
>
  <Text style={styles.buttonText}>Contribution</Text>
</TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText} 
        onPress={() => navigation.navigate("Credit")}
        >Credit</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Remboursement</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Report</Text>
      </TouchableOpacity>

      <TouchableOpacity
  style={styles.button}
  // onPress={() => navigation.navigate("Settings")}
>

  <Text style={styles.buttonText}>Paramètres</Text>
</TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E0F3FF",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#004080",
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 10,
    marginVertical: 10,
    width: "90%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
