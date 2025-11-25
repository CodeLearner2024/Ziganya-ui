import React, { useEffect, useState, useCallback } from "react";
import { View, ScrollView, StyleSheet, Text, Button, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

// --- CONSTANTES ---
const PRIMARY_COLOR = "#4C1C8A";

// --- TRADUCTIONS MULTILINGUES ---
const translations = {
  fr: {
    reports: "Rapports du Système",
    membersReport: "Rapport Membres",
    generalReport: "Rapport Général",
    lastUpdate: "Date de la dernière mise à jour",
    generatedOn: "Généré le",
    member: "Membre",
    phone: "Téléphone",
    actions: "Actions",
    contribution: "Contribution",
    loan: "Prêt",
    refund: "Remboursement",
    interest: "Intérêt",
    total: "Total",
    totalMembers: "Total des membres",
    totalGeneral: "Total général",
    generatePDF: "Générer le PDF",
    noData: "Aucune donnée à imprimer.",
    error: "Erreur",
    connectionError: "Impossible de récupérer les données.",
    pdfError: "Échec de la génération du PDF.",
    generalReportData: {
      totalMembers: "Nombre total de Membres",
      totalActions: "Total des Actions",
      totalContributed: "Montant total Contribué",
      totalLoans: "Montant total des Prêts",
      totalInterests: "Montant total des Intérêts",
      contributionPenalties: "Pénalités de Contribution"
    },
    messages: {
      loading: "Chargement...",
      noData: "Aucune donnée disponible",
      connectionError: "Erreur de connexion"
    }
  },
  en: {
    reports: "System Reports",
    membersReport: "Members Report",
    generalReport: "General Report",
    lastUpdate: "Last update date",
    generatedOn: "Generated on",
    member: "Member",
    phone: "Phone",
    actions: "Shares",
    contribution: "Contribution",
    loan: "Loan",
    refund: "Refund",
    interest: "Interest",
    total: "Total",
    totalMembers: "Total members",
    totalGeneral: "Total general",
    generatePDF: "Generate PDF",
    noData: "No data to print.",
    error: "Error",
    connectionError: "Unable to retrieve data.",
    pdfError: "PDF generation failed.",
    generalReportData: {
      totalMembers: "Total Number of Members",
      totalActions: "Total Shares",
      totalContributed: "Total Contributed Amount",
      totalLoans: "Total Loan Amount",
      totalInterests: "Total Interest Amount",
      contributionPenalties: "Contribution Penalties"
    },
    messages: {
      loading: "Loading...",
      noData: "No data available",
      connectionError: "Connection error"
    }
  },
  kdi: {
    reports: "Raporo Z'Ubucukumbuzi",
    membersReport: "Raporo Y'abanyamuryango",
    generalReport: "Raporo Nshinganwa",
    lastUpdate: "Itariki Yo Gusubiramo",
    generatedOn: "Yakozwe Ku",
    member: "Umunyamuryango",
    phone: "Amaguru",
    actions: "Ingingo",
    contribution: "Inkunga",
    loan: "Inguzanyo",
    refund: "Kwishura",
    interest: "Inyongera",
    total: "Igiteranyo",
    totalMembers: "Abanyamuryango Bose",
    totalGeneral: "Igiteranyo Cyose",
    generatePDF: "Kora PDF",
    noData: "Nta Makuru Yo Gucapwa.",
    error: "Ikosa",
    connectionError: "Ntishoboka Kubona Amakuru.",
    pdfError: "Gukora PDF Byanze.",
    generalReportData: {
      totalMembers: "Umubare W'abanyamuryango Bose",
      totalActions: "Ingingo Zose",
      totalContributed: "Amafaranga Yose Yatanzwe",
      totalLoans: "Amafaranga Y'inguzanyo Zose",
      totalInterests: "Amafaranga Y'inyongera Yose",
      contributionPenalties: "Amafaranga Yo Kuriha Inkunga"
    },
    messages: {
      loading: "Kurondera...",
      noData: "Nta Makuru Ahari",
      connectionError: "Ikosa Ry'ubwumvikane"
    }
  }
};

// --- COMPOSANT SÉLECTEUR DE LANGUE ---
const LanguageSelector = ({ currentLanguage, onLanguageChange }) => {
  const [showSelector, setShowSelector] = useState(false);
  const languagesList = [
    { code: 'fr', name: 'FR', fullName: 'Français' },
    { code: 'en', name: 'EN', fullName: 'English' },
    { code: 'kdi', name: 'KDI', fullName: 'Kirundi' }
  ];

  const currentLang = languagesList.find(lang => lang.code === currentLanguage);

  return (
    <View style={embeddedStyles.languageContainer}>
      <TouchableOpacity 
        style={embeddedStyles.languageButton} 
        onPress={() => setShowSelector(!showSelector)}
      >
        <Text style={embeddedStyles.languageButtonText}>
          {currentLang?.name}
        </Text>
        <MaterialIcons 
          name={showSelector ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
          size={16} 
          color={PRIMARY_COLOR} 
        />
      </TouchableOpacity>
      
      {showSelector && (
        <View style={embeddedStyles.languageDropdown}>
          {languagesList.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                embeddedStyles.languageOption,
                currentLanguage === lang.code && embeddedStyles.languageOptionSelected
              ]}
              onPress={() => {
                onLanguageChange(lang.code);
                setShowSelector(false);
              }}
            >
              <Text style={[
                embeddedStyles.languageOptionText,
                currentLanguage === lang.code && embeddedStyles.languageOptionTextSelected
              ]}>
                {lang.fullName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {showSelector && (
        <TouchableOpacity 
          style={embeddedStyles.overlay} 
          onPress={() => setShowSelector(false)} 
          activeOpacity={1} 
        />
      )}
    </View>
  );
};

// --- Configuration API ---
const API_BASE_URL = "https://ziganya.onrender.com/ziganya-managment-system/api/v1";
// const API_BASE_URL = "http://localhost:8001/ziganya-managment-system/api/v1";

const ALL_MEMBERS_REPORT_API = `${API_BASE_URL}/reports/all-members`;
const GENERAL_REPORT_API = `${API_BASE_URL}/reports/general`;

// --- Composant Principal (Gestion des Onglets) ---
export default function ReportScreen({ route }) {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('members');
    const [currentLanguage, setCurrentLanguage] = useState(route.params?.currentLanguage || 'fr');

    // Fonction de traduction
    const t = (key) => {
        const keys = key.split('.');
        let result = translations[currentLanguage];
        keys.forEach(k => {
            result = result?.[k];
        });
        return result ?? key;
    };

    // Mettre à jour la langue si elle change dans les paramètres de route
    useEffect(() => {
        if (route.params?.currentLanguage) {
            setCurrentLanguage(route.params.currentLanguage);
        }
    }, [route.params?.currentLanguage]);

    // Configurer le header avec le sélecteur de langue
    useEffect(() => {
        navigation.setOptions({
            title: t('reports'),
            headerRight: () => (
                <View style={headerStyles.headerRight}>
                    <LanguageSelector 
                        currentLanguage={currentLanguage} 
                        onLanguageChange={setCurrentLanguage} 
                    />
                </View>
            )
        });
    }, [navigation, t, currentLanguage]);

    return (
        <View style={styles.container}>
            {/* Zone des Onglets */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'members' && styles.activeTab]}
                    onPress={() => setActiveTab('members')}
                >
                    <Text style={[styles.tabText, activeTab === 'members' && styles.activeTabText]}>
                        {t('membersReport')}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'general' && styles.activeTab]}
                    onPress={() => setActiveTab('general')}
                >
                    <Text style={[styles.tabText, activeTab === 'general' && styles.activeTabText]}>
                        {t('generalReport')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Contenu de l'Onglet */}
            <View style={styles.contentContainer}>
                {activeTab === 'members' ? (
                    <MembersReport currentLanguage={currentLanguage} />
                ) : (
                    <GeneralReport currentLanguage={currentLanguage} />
                )}
            </View>
        </View>
    );
}

// ------------------------------------------
// Composant du Rapport des Membres (Version Tableau)
// ------------------------------------------
function MembersReport({ currentLanguage }) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fonction de traduction
    const t = (key) => {
        const keys = key.split('.');
        let result = translations[currentLanguage];
        keys.forEach(k => {
            result = result?.[k];
        });
        return result ?? key;
    };

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(ALL_MEMBERS_REPORT_API);
            setMembers(response.data);
        } catch (error) {
            Alert.alert(t('error'), t('connectionError'));
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
            return Alert.alert("Information", t('noData'));
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
                <h1>${t('membersReport')}</h1>
                <p>${t('generatedOn')} : <strong>${date}</strong></p>
                <table>
                    <thead>
                        <tr>
                            <th>${t('member')}</th>
                            <th>${t('phone')}</th>
                            <th>${t('actions')}</th>
                            <th>${t('contribution')}</th>
                            <th>${t('loan')}</th>
                            <th>${t('refund')}</th>
                            <th>${t('interest')}</th>
                            <th>${t('total')}</th>
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
            Alert.alert(t('error'), t('pdfError'));
            console.error("PDF Error:", error);
        }
    };

    return (
        <View style={reportStyles.reportContainer}>
            <Text style={reportStyles.dateText}>{t('lastUpdate')} : {new Date().toLocaleDateString()}</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" style={reportStyles.loadingIndicator} />
            ) : (
                <>
                    {/* En-tête du tableau */}
                    <View style={reportStyles.tableHeader}>
                        <Text style={[reportStyles.headerCell, reportStyles.nameHeader]}>{t('member')}</Text>
                        <Text style={[reportStyles.headerCell, reportStyles.phoneHeader]}>{t('phone')}</Text>
                        <Text style={[reportStyles.headerCell, reportStyles.actionsHeader]}>{t('actions')}</Text>
                        <Text style={[reportStyles.headerCell, reportStyles.amountHeader]}>{t('contribution')}</Text>
                        <Text style={[reportStyles.headerCell, reportStyles.amountHeader]}>{t('loan')}</Text>
                        <Text style={[reportStyles.headerCell, reportStyles.amountHeader]}>{t('refund')}</Text>
                        <Text style={[reportStyles.headerCell, reportStyles.amountHeader]}>{t('interest')}</Text>
                        <Text style={[reportStyles.headerCell, reportStyles.totalHeader]}>{t('total')}</Text>
                    </View>

                    {/* Corps du tableau avec ScrollView */}
                    <ScrollView style={reportStyles.tableBody} showsVerticalScrollIndicator={true}>
                        {members.map((item, index) => (
                            <View key={index} style={[
                                reportStyles.tableRow,
                                index % 2 === 0 ? reportStyles.evenRow : reportStyles.oddRow
                            ]}>
                                {/* Colonne Nom */}
                                <View style={[reportStyles.tableCell, reportStyles.nameCell]}>
                                    <Text style={reportStyles.nameText} numberOfLines={2}>
                                        {item.memberResponse.firstname} {item.memberResponse.lastname}
                                    </Text>
                                </View>

                                {/* Colonne Téléphone */}
                                <View style={[reportStyles.tableCell, reportStyles.phoneCell]}>
                                    <Text style={reportStyles.phoneText}>{item.memberResponse.phoneNumber}</Text>
                                </View>

                                {/* Colonne Actions */}
                                <View style={[reportStyles.tableCell, reportStyles.actionsCell]}>
                                    <Text style={reportStyles.actionsText}>{formatAmount(item.actions)}</Text>
                                </View>

                                {/* Colonne Contribution */}
                                <View style={[reportStyles.tableCell, reportStyles.amountCell]}>
                                    <Text style={reportStyles.amountText}>{formatAmount(item.contributedAmount)}</Text>
                                </View>

                                {/* Colonne Prêt */}
                                <View style={[reportStyles.tableCell, reportStyles.amountCell]}>
                                    <Text style={reportStyles.amountText}>{formatAmount(item.loanAmount)}</Text>
                                </View>

                                {/* Colonne Remboursement */}
                                <View style={[reportStyles.tableCell, reportStyles.amountCell]}>
                                    <Text style={reportStyles.amountText}>{formatAmount(item.refundAmount)}</Text>
                                </View>

                                {/* Colonne Intérêt */}
                                <View style={[reportStyles.tableCell, reportStyles.amountCell]}>
                                    <Text style={reportStyles.amountText}>{formatAmount(item.interestAmount)}</Text>
                                </View>

                                {/* Colonne Total */}
                                <View style={[reportStyles.tableCell, reportStyles.totalCell]}>
                                    <Text style={reportStyles.totalText}>{formatAmount(item.totalAmount)}</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                    {/* Résumé en bas du tableau */}
                    <View style={reportStyles.tableFooter}>
                        <Text style={reportStyles.footerText}>
                            {t('totalMembers')}: {members.length}
                        </Text>
                        <Text style={reportStyles.footerText}>
                            {t('totalGeneral')}: {formatAmount(members.reduce((sum, item) => sum + (item.totalAmount || 0), 0))} FBu
                        </Text>
                    </View>

                    <View style={reportStyles.buttonContainer}>
                        <Button title={t('generatePDF')} onPress={generatePDF} color="#007BFF" disabled={loading || members.length === 0} />
                    </View>
                </>
            )}
        </View>
    );
}

// ------------------------------------------
// Composant du Rapport Général
// ------------------------------------------
function GeneralReport({ currentLanguage }) {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fonction de traduction
    const t = (key) => {
        const keys = key.split('.');
        let result = translations[currentLanguage];
        keys.forEach(k => {
            result = result?.[k];
        });
        return result ?? key;
    };

    const fetchGeneralReport = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(GENERAL_REPORT_API);
            setReport(response.data);
        } catch (error) {
            Alert.alert(t('error'), t('connectionError'));
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
    
    const generateGeneralPDF = async () => {
        if (!report) {
            return Alert.alert("Information", t('noData'));
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
                <h1>${t('generalReport')}</h1>
                <p>${t('generatedOn')} : <strong>${date}</strong></p>
                <div class="report-box">
                    <div class="report-row">
                        <span class="label">${t('generalReportData.totalMembers')}</span>
                        <span class="value highlight">${report.manyofMembers}</span>
                    </div>
                    <div class="report-row">
                        <span class="label">${t('generalReportData.totalActions')}</span>
                        <span class="value">${formatAmount(report.actions)}</span>
                    </div>
                    <div class="report-row">
                        <span class="label">${t('generalReportData.totalContributed')}</span>
                        <span class="value">${formatAmount(report.contributedAmount)} FBu</span>
                    </div>
                    <div class="report-row">
                        <span class="label">${t('generalReportData.totalLoans')}</span>
                        <span class="value">${formatAmount(report.creditedAmount)} FBu</span>
                    </div>
                    <div class="report-row">
                        <span class="label">${t('generalReportData.totalInterests')}</span>
                        <span class="value">${formatAmount(report.interestAmount)} FBu</span>
                    </div>
                    <div class="report-row">
                        <span class="label">${t('generalReportData.contributionPenalties')}</span>
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
            Alert.alert(t('error'), t('pdfError'));
            console.error("PDF Error:", error);
        }
    };

    return (
        <View style={reportStyles.reportContainer}>
            <Text style={reportStyles.dateText}>{t('generatedOn')} : {new Date().toLocaleDateString()}</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" style={reportStyles.loadingIndicator} />
            ) : report ? (
                <ScrollView contentContainerStyle={reportStyles.scrollContent}>
                    <View style={reportStyles.generalCard}>
                        <View style={reportStyles.generalRow}>
                            <Text style={reportStyles.generalLabel}>{t('generalReportData.totalMembers')}</Text>
                            <Text style={reportStyles.generalValueImportant}>{report.manyofMembers}</Text>
                        </View>
                        
                        <View style={reportStyles.generalDivider} />

                        <View style={reportStyles.generalRow}>
                            <Text style={reportStyles.generalLabel}>{t('generalReportData.totalActions')}</Text>
                            <Text style={reportStyles.generalValue}>{formatAmount(report.actions)}</Text>
                        </View>

                        <View style={reportStyles.generalRow}>
                            <Text style={reportStyles.generalLabel}>{t('generalReportData.totalContributed')}</Text>
                            <Text style={reportStyles.generalValue}>{formatAmount(report.contributedAmount)} FBu</Text>
                        </View>

                        <View style={reportStyles.generalRow}>
                            <Text style={reportStyles.generalLabel}>{t('generalReportData.totalLoans')}</Text>
                            <Text style={reportStyles.generalValue}>{formatAmount(report.creditedAmount)} FBu</Text>
                        </View>

                        <View style={reportStyles.generalRow}>
                            <Text style={reportStyles.generalLabel}>{t('generalReportData.totalInterests')}</Text>
                            <Text style={reportStyles.generalValue}>{formatAmount(report.interestAmount)} FBu</Text>
                        </View>

                        <View style={reportStyles.generalRow}>
                            <Text style={reportStyles.generalLabel}>{t('generalReportData.contributionPenalties')}</Text>
                            <Text style={reportStyles.generalValue}>{formatAmount(report.contributionLatePenalityAmount)} FBu</Text>
                        </View>
                    </View>
                </ScrollView>
            ) : (
                <Text style={reportStyles.errorText}>{t('messages.connectionError')}</Text>
            )}

            <View style={reportStyles.buttonContainer}>
                <Button 
                    title={t('generatePDF')} 
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
        backgroundColor: "#f9f9f9",
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
    
    // Styles pour le tableau des membres
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#007BFF',
        paddingVertical: 12,
        paddingHorizontal: 5,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    headerCell: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
        textAlign: 'center',
    },
    nameHeader: { flex: 1.5 },
    phoneHeader: { flex: 1.2 },
    actionsHeader: { flex: 0.8 },
    amountHeader: { flex: 1 },
    totalHeader: { flex: 1 },
    
    tableBody: {
        flex: 1,
        marginBottom: 10,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        minHeight: 50,
    },
    evenRow: {
        backgroundColor: '#fff',
    },
    oddRow: {
        backgroundColor: '#f8f9fa',
    },
    tableCell: {
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    nameCell: { flex: 1.5 },
    phoneCell: { flex: 1.2 },
    actionsCell: { flex: 0.8 },
    amountCell: { flex: 1 },
    totalCell: { flex: 1 },
    
    nameText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#333',
        textAlign: 'left',
    },
    phoneText: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
    },
    actionsText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    amountText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    totalText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#007BFF',
        textAlign: 'center',
    },
    
    tableFooter: {
        backgroundColor: '#e6f7ff',
        padding: 10,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        marginBottom: 10,
    },
    footerText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#007BFF',
        textAlign: 'center',
        marginVertical: 2,
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

const headerStyles = StyleSheet.create({
    headerRight: {
        marginRight: 15,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 100
    }
});

const embeddedStyles = StyleSheet.create({
    languageContainer: {
        position: 'relative',
        zIndex: 999
    },
    languageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
        borderRadius: 5,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: PRIMARY_COLOR
    },
    languageButtonText: {
        fontWeight: '700',
        color: PRIMARY_COLOR,
        marginRight: 3
    },
    languageDropdown: {
        position: 'absolute',
        top: 35,
        left: 0,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: PRIMARY_COLOR,
        borderRadius: 5,
        width: 120
    },
    languageOption: {
        padding: 8
    },
    languageOptionSelected: {
        backgroundColor: PRIMARY_COLOR
    },
    languageOptionText: {
        color: PRIMARY_COLOR
    },
    languageOptionTextSelected: {
        color: '#fff'
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1
    }
});