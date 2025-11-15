import React, { useEffect, useState, useCallback } from "react";
import { View, ScrollView, StyleSheet, Text, Button, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import axios from "axios";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

// --- Configuration API ---
const API_BASE_URL = "https://ziganya.onrender.com/ziganya-managment-system/api/v1";
// const API_BASE_URL = "http://localhost:8001/ziganya-managment-system/api/v1";

const ALL_MEMBERS_REPORT_API = `${API_BASE_URL}/reports/all-members`;
const GENERAL_REPORT_API = `${API_BASE_URL}/reports/general`; // 👈 Nouvelle API pour le rapport général

// --- Composant Principal (Gestion des Onglets) ---
export default function App() {
    const [activeTab, setActiveTab] = useState('members'); // 'members' ou 'general'

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Rapports du Système</Text>

            {/* Zone des Onglets */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'members' && styles.activeTab]}
                    onPress={() => setActiveTab('members')}
                >
                    <Text style={[styles.tabText, activeTab === 'members' && styles.activeTabText]}>Rapport Membres</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'general' && styles.activeTab]}
                    onPress={() => setActiveTab('general')}
                >
                    <Text style={[styles.tabText, activeTab === 'general' && styles.activeTabText]}>Rapport Général</Text>
                </TouchableOpacity>
            </View>

            {/* Contenu de l'Onglet */}
            <View style={styles.contentContainer}>
                {activeTab === 'members' ? (
                    <MembersReport />
                ) : (
                    <GeneralReport />
                )}
            </View>
        </View>
    );
}

// ------------------------------------------
// Composant du Rapport des Membres (Ancien App)
// ------------------------------------------
function MembersReport() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(ALL_MEMBERS_REPORT_API);
            setMembers(response.data);
        } catch (error) {
            Alert.alert("Erreur", "Impossible de récupérer les données des membres.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const formatAmount = (amount) => {
        return amount ? amount.toLocaleString('fr-FR') : '0';
    };

    const generatePDF = async () => {
        if (members.length === 0) {
            return Alert.alert("Information", "Aucune donnée de membre à imprimer.");
        }
        
        const date = new Date().toLocaleDateString();

        let htmlContent = `
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { text-align: center; color: #007BFF; }
                    p { text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px; }
                    th { background-color: #f0f0f0; color: #333; }
                    .total-row td { font-weight: bold; background-color: #e6f7ff; }
                </style>
            </head>
            <body>
                <h1>Rapport des Membres</h1>
                <p>Date du rapport : <strong>${date}</strong></p>
                <table>
                    <thead>
                        <tr>
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
                                <td>${formatAmount(m.actions)}</td>
                                <td>${formatAmount(m.contributedAmount)} FBu</td>
                                <td>${formatAmount(m.loanAmount)} FBu</td>
                                <td>${formatAmount(m.refundAmount)} FBu</td>
                                <td>${formatAmount(m.interestAmount)} FBu</td>
                                <td class="total-row-cell">${formatAmount(m.totalAmount)} FBu</td>
                            </tr>
                        `
                            )
                            .join("")}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        try {
            const { uri } = await Print.printToFileAsync({ html: htmlContent });
            await Sharing.shareAsync(uri);
        } catch (error) {
            Alert.alert("Erreur", "Échec de la génération du PDF des membres.");
            console.error("PDF Error:", error);
        }
    };

    return (
        <View style={reportStyles.reportContainer}>
            <Text style={reportStyles.dateText}>Date de la dernière mise à jour : {new Date().toLocaleDateString()}</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" style={reportStyles.loadingIndicator} />
            ) : (
                <>
                    <ScrollView style={reportStyles.scroll}>
                        {members.map((item, index) => (
                            <View key={index} style={reportStyles.card}>
                                <Text style={reportStyles.name}>
                                    {item.memberResponse.firstname} {item.memberResponse.lastname}
                                </Text>
                                <Text style={reportStyles.phone}>{item.memberResponse.phoneNumber}</Text>

                                <View style={reportStyles.row}>
                                    <Text style={reportStyles.label}>Actions</Text>
                                    <Text style={reportStyles.value}>{formatAmount(item.actions)}</Text>
                                </View>
                                <View style={reportStyles.row}>
                                    <Text style={reportStyles.label}>Contribution</Text>
                                    <Text style={reportStyles.value}>{formatAmount(item.contributedAmount)} FBu</Text>
                                </View>
                                <View style={reportStyles.row}>
                                    <Text style={reportStyles.label}>Prêt</Text>
                                    <Text style={reportStyles.value}>{formatAmount(item.loanAmount)} FBu</Text>
                                </View>
                                <View style={reportStyles.row}>
                                    <Text style={reportStyles.label}>Remboursement</Text>
                                    <Text style={reportStyles.value}>{formatAmount(item.refundAmount)} FBu</Text>
                                </View>
                                <View style={reportStyles.row}>
                                    <Text style={reportStyles.label}>Intérêt</Text>
                                    <Text style={reportStyles.value}>{formatAmount(item.interestAmount)} FBu</Text>
                                </View>
                                <View style={[reportStyles.row, reportStyles.totalRow]}>
                                    <Text style={[reportStyles.label, reportStyles.totalLabel]}>Total</Text>
                                    <Text style={[reportStyles.value, reportStyles.totalValue]}>{formatAmount(item.totalAmount)} FBu</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                    <View style={reportStyles.buttonContainer}>
                        <Button title="Générer le PDF" onPress={generatePDF} color="#007BFF" disabled={loading || members.length === 0} />
                    </View>
                </>
            )}
        </View>
    );
}

// ------------------------------------------
// Composant du Rapport Général (Nouveau)
// ------------------------------------------
function GeneralReport() {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchGeneralReport = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(GENERAL_REPORT_API);
            setReport(response.data);
        } catch (error) {
            Alert.alert("Erreur", "Impossible de récupérer le rapport général.");
            console.error(error);
            setReport(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGeneralReport();
    }, [fetchGeneralReport]);

    const formatAmount = (amount) => {
        return amount ? amount.toLocaleString('fr-FR') : '0';
    };
    
    // Ajout d'une fonction pour générer le PDF du rapport général
    const generateGeneralPDF = async () => {
        if (!report) {
            return Alert.alert("Information", "Aucune donnée de rapport général à imprimer.");
        }

        const date = new Date().toLocaleDateString();

        let htmlContent = `
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { text-align: center; color: #007BFF; }
                    p { text-align: center; }
                    .report-box { width: 80%; margin: 20px auto; border: 2px solid #007BFF; border-radius: 10px; padding: 15px; }
                    .report-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #ccc; }
                    .report-row:last-child { border-bottom: none; }
                    .label { font-weight: bold; color: #555; }
                    .value { font-weight: bold; color: #000; }
                    .highlight { color: #007BFF; font-size: 1.1em; }
                </style>
            </head>
            <body>
                <h1>Rapport Général du Système</h1>
                <p>Date du rapport : <strong>${date}</strong></p>
                <div class="report-box">
                    <div class="report-row">
                        <span class="label">Nombre total de Membres</span>
                        <span class="value highlight">${report.manyofMembers}</span>
                    </div>
                    <div class="report-row">
                        <span class="label">Total des Actions</span>
                        <span class="value">${formatAmount(report.actions)}</span>
                    </div>
                    <div class="report-row">
                        <span class="label">Montant total Contribué</span>
                        <span class="value">${formatAmount(report.contributedAmount)} FBu</span>
                    </div>
                    <div class="report-row">
                        <span class="label">Montant total des Prêts</span>
                        <span class="value">${formatAmount(report.creditedAmount)} FBu</span>
                    </div>
                    <div class="report-row">
                        <span class="label">Montant total des Intérêts</span>
                        <span class="value">${formatAmount(report.interestAmount)} FBu</span>
                    </div>
                    <div class="report-row">
                        <span class="label">Pénalités de Contribution</span>
                        <span class="value">${formatAmount(report.contributionLatePenalityAmount)} FBu</span>
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            const { uri } = await Print.printToFileAsync({ html: htmlContent });
            await Sharing.shareAsync(uri);
        } catch (error) {
            Alert.alert("Erreur", "Échec de la génération du PDF général.");
            console.error("PDF Error:", error);
        }
    };


    return (
        <View style={reportStyles.reportContainer}>
            <Text style={reportStyles.dateText}>Généré le : {new Date().toLocaleDateString()}</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" style={reportStyles.loadingIndicator} />
            ) : report ? (
                <ScrollView contentContainerStyle={reportStyles.scrollContent}>
                    <View style={reportStyles.generalCard}>
                        {/* Nombre total de Membres */}
                        <View style={reportStyles.generalRow}>
                            <Text style={reportStyles.generalLabel}>Nombre de Membres</Text>
                            <Text style={reportStyles.generalValueImportant}>{report.manyofMembers}</Text>
                        </View>
                        
                        <View style={reportStyles.generalDivider} />

                        {/* Total des Actions */}
                        <View style={reportStyles.generalRow}>
                            <Text style={reportStyles.generalLabel}>Total des Actions</Text>
                            <Text style={reportStyles.generalValue}>{formatAmount(report.actions)}</Text>
                        </View>

                        {/* Montant total Contribué */}
                        <View style={reportStyles.generalRow}>
                            <Text style={reportStyles.generalLabel}>Total Contribué (FBu)</Text>
                            <Text style={reportStyles.generalValue}>{formatAmount(report.contributedAmount)} FBu</Text>
                        </View>

                        {/* Montant total des Prêts (Credited) */}
                        <View style={reportStyles.generalRow}>
                            <Text style={reportStyles.generalLabel}>Total des Prêts (FBu)</Text>
                            <Text style={reportStyles.generalValue}>{formatAmount(report.creditedAmount)} FBu</Text>
                        </View>

                        {/* Montant total des Intérêts */}
                        <View style={reportStyles.generalRow}>
                            <Text style={reportStyles.generalLabel}>Total Intérêts (FBu)</Text>
                            <Text style={reportStyles.generalValue}>{formatAmount(report.interestAmount)} FBu</Text>
                        </View>

                        {/* Pénalités de Contribution */}
                        <View style={reportStyles.generalRow}>
                            <Text style={reportStyles.generalLabel}>Pénalités de Contribution (FBu)</Text>
                            <Text style={reportStyles.generalValue}>{formatAmount(report.contributionLatePenalityAmount)} FBu</Text>
                        </View>
                    </View>
                </ScrollView>
            ) : (
                <Text style={reportStyles.errorText}>Impossible d'afficher le rapport général.</Text>
            )}

            <View style={reportStyles.buttonContainer}>
                <Button 
                    title="Générer le PDF" 
                    onPress={generateGeneralPDF} 
                    color="#007BFF" 
                    disabled={loading || !report} 
                />
            </View>
        </View>
    );
}

// ------------------------------------------
// Styles
// ------------------------------------------

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40, // Pour gérer la barre de statut
        backgroundColor: "#f9f9f9",
    },
    header: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#007BFF",
        textAlign: "center",
        marginBottom: 10,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#e6f7ff',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#007BFF',
    },
    tabButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: '#007BFF',
    },
    tabText: {
        color: '#007BFF',
        fontWeight: 'bold',
    },
    activeTabText: {
        color: '#fff',
    },
    contentContainer: {
        flex: 1,
        padding: 15,
    },
});

const reportStyles = StyleSheet.create({
    reportContainer: {
        flex: 1,
    },
    dateText: {
        textAlign: "center",
        marginBottom: 15,
        color: "#555",
        fontSize: 12,
    },
    loadingIndicator: {
        marginTop: 50,
    },
    scroll: {
        marginBottom: 10,
    },
    // Styles pour les cartes Membres
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
        paddingHorizontal: 5,
    },
    // Styles pour le Rapport Général
    generalCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginTop: 10,
    },
    generalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    generalLabel: {
        fontSize: 15,
        color: "#333",
        fontWeight: '500',
    },
    generalValue: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#222",
    },
    generalValueImportant: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#007BFF",
    },
    generalDivider: {
        height: 2,
        backgroundColor: '#007BFF',
        marginVertical: 10,
    },
    errorText: {
        textAlign: 'center',
        color: 'red',
        marginTop: 50,
        fontSize: 16,
    }
});