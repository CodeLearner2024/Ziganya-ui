import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, ImageBackground, Dimensions, TouchableOpacity } from "react-native";
import axios from "axios";
import { PieChart } from "react-native-chart-kit";
import { MaterialIcons } from "@expo/vector-icons";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// --- CONSTANTES ---
const PRIMARY_COLOR = "#4C1C8A";
const screenWidth = Dimensions.get("window").width;
const MAX_CONTENT_WIDTH = 600;
const CURRENT_BALANCE_COLOR = '#1E90FF';
const LOAN_BALANCE_COLOR = '#FF6347';
const BACKGROUND_IMAGE = require('../assets/yeah.jpg');

// --- TRADUCTIONS MULTILINGUES ---
const translations = {
    fr: {
        dashboard: "Tableau de Bord",
        managementSystem: "Système de Gestion",
        loadingDashboard: "Chargement du Tableau de Bord...",
        dataLoadError: "Erreur lors du chargement des données. Veuillez réessayer.",
        members: "Membres",
        actions: "Actions",
        currentBalance: "Solde Actuel",
        loanBalance: "Solde de Prêts",
        currency: "Fbu",
        balanceDistribution: "Répartition du Solde",
        noFinancialData: "Aucune donnée financière disponible pour le graphique.",
        connectionStatus: {
            connected: "Connecté en temps réel",
            disconnected: "Déconnecté",
            connecting: "Connexion en cours..."
        }
    },
    en: {
        dashboard: "Dashboard",
        managementSystem: "Management System",
        loadingDashboard: "Loading Dashboard...",
        dataLoadError: "Error loading data. Please try again.",
        members: "Members",
        actions: "Actions",
        currentBalance: "Current Balance",
        loanBalance: "Loan Balance",
        currency: "Fbu",
        balanceDistribution: "Balance Distribution",
        noFinancialData: "No financial data available for the chart.",
        connectionStatus: {
            connected: "Real-time connected",
            disconnected: "Disconnected",
            connecting: "Connecting..."
        }
    },
    kdi: {
        dashboard: "Ikirangaminsi",
        managementSystem: "Uburyo Bwo Kugenzura",
        loadingDashboard: "Kurondera Ikirangaminsi...",
        dataLoadError: "Harabayeho Ikosa Mugukurira Amakuru. Gerageza Gusubira.",
        members: "Abanywanyi",
        actions: "Imitahe",
        currentBalance: "Amafaranga Ahari",
        loanBalance: "Ingurane Ziriko Zirwishurwa",
        currency: "Fbu",
        balanceDistribution: "Ikiranguzo C'amafaranga",
        noFinancialData: "Ntibishoboka Kurondera Amakuru Y'amafaranga Y'ikiranguzo.",
        connectionStatus: {
            connected: "Ubutumwa Bwihuse Bwakuwe",
            disconnected: "Uhagaritse",
            connecting: "Ubutumwa Burakuwe..."
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

// --- COMPOSANT PIE CHART ---
const BalancePieChart = ({ currentBalance, loanBalance, t }) => {
    const totalBalance = (currentBalance || 0) + (loanBalance || 0);

    if (totalBalance === 0) {
        return (
            <View style={chartStyles.chartContainer}>
                <Text style={chartStyles.chartTitle}>{t('balanceDistribution')}</Text>
                <Text style={chartStyles.noDataText}>{t('noFinancialData')}</Text>
            </View>
        );
    }

    const currentPercentage = ((currentBalance / totalBalance) * 100).toFixed(1);
    const loanPercentage = ((loanBalance / totalBalance) * 100).toFixed(1);

    const data = [
        { name: t('currentBalance'), population: currentBalance, color: CURRENT_BALANCE_COLOR },
        { name: t('loanBalance'), population: loanBalance, color: LOAN_BALANCE_COLOR }
    ];

    const chartWidth = Math.min(screenWidth, MAX_CONTENT_WIDTH) * 0.9;

    return (
        <View style={chartStyles.chartContainer}>
            <View style={chartStyles.legendContainer}>
                <View style={chartStyles.legendItem}>
                    <View style={[chartStyles.legendColorBox, { backgroundColor: CURRENT_BALANCE_COLOR }]} />
                    <Text style={chartStyles.legendText}>{t('currentBalance')} : {currentPercentage}%</Text>
                </View>
                <View style={chartStyles.legendItem}>
                    <View style={[chartStyles.legendColorBox, { backgroundColor: LOAN_BALANCE_COLOR }]} />
                    <Text style={chartStyles.legendText}>{t('loanBalance')} : {loanPercentage}%</Text>
                </View>
            </View>
            <PieChart
                data={data}
                width={chartWidth}
                height={220}
                chartConfig={{
                    backgroundColor: "#ffffff",
                    backgroundGradientFrom: "#FFFFFF",
                    backgroundGradientTo: "#F7F9FC",
                    color: (opacity = 1) => `rgba(0, 88, 168, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"20"}
                center={[10, 0]}
            />
        </View>
    );
};

// --- COMPOSANT STATUT DE CONNEXION ---
const ConnectionStatus = ({ isConnected, t }) => (
    <View style={[
        connectionStyles.statusContainer,
        isConnected ? connectionStyles.connected : connectionStyles.disconnected
    ]}>
        <View style={[
            connectionStyles.statusDot,
            isConnected ? connectionStyles.connectedDot : connectionStyles.disconnectedDot
        ]} />
        <Text style={connectionStyles.statusText}>
            {isConnected ? t('connectionStatus.connected') : t('connectionStatus.disconnected')}
        </Text>
    </View>
);

// --- COMPOSANT PRINCIPAL ---
export default function DashboardScreen({ navigation, route }) {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState(route.params?.currentLanguage || 'fr');
    const ws = useRef(null);

    const t = (key) => {
        const keys = key.split('.');
        let result = translations[currentLanguage];
        keys.forEach(k => { result = result?.[k]; });
        return result ?? key;
    };

    const handleLanguageChange = (newLanguage) => setCurrentLanguage(newLanguage);

    const API_URL = "https://ziganya.onrender.com/ziganya-managment-system/api/v1/reports";
    const WS_URL = "https://ziganya.onrender.com/ziganya-managment-system/api/v1/ws"; // SockJS nécessite http/https

    // const API_URL = "http://localhost:8001/ziganya-managment-system/api/v1/reports";
    // const WS_URL = "http://localhost:8001/ziganya-managment-system/api/v1/ws"; // SockJS nécessite http/https

    // WebSocket STOMP
const connectWebSocket = () => {
    console.log("🔄 Tentative de connexion WebSocket...");
    
    const stompClient = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        debug: (str) => {
            console.log("STOMP:", str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        
        onConnect: (frame) => {
            console.log("✅ CONNECTÉ au WebSocket!", frame);
            setIsConnected(true);

            stompClient.subscribe("/topic/dashboard", (message) => {
                console.log("📨 Message reçu:", message.body);
                try {
                    const data = JSON.parse(message.body);
                    setReport(prev => ({ ...prev, ...data }));
                } catch (error) {
                    console.error("❌ Erreur parsing:", error);
                }
            });
        },
        
        onWebSocketError: (error) => {
            console.error("❌ Erreur WebSocket:", error);
            setIsConnected(false);
        },
        
        onStompError: (frame) => {
            console.error("❌ Erreur STOMP:", frame.headers['message'], frame.body);
            setIsConnected(false);
        },
        
        onDisconnect: () => {
            console.log("🔌 Déconnecté");
            setIsConnected(false);
        }
    });

    stompClient.activate();
    ws.current = stompClient;
};

    // Fetch API
    const fetchInitialData = async () => {
        try {
            const response = await axios.get(API_URL);
            setReport(response.data);
        } catch (error) {
            console.error("Erreur lors du chargement du rapport:", error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
        connectWebSocket();

        return () => {
            ws.current?.deactivate();
        };
    }, []);

    useEffect(() => {
        navigation.setOptions({
            title: t('dashboard'),
            headerRight: () => (
                <View style={headerStyles.headerRight}>
                    <ConnectionStatus isConnected={isConnected} t={t} />
                    <LanguageSelector currentLanguage={currentLanguage} onLanguageChange={handleLanguageChange} />
                </View>
            )
        });
    }, [navigation, t, currentLanguage, isConnected]);

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#004080" />
                <Text>{t('loadingDashboard')}</Text>
            </View>
        );
    }

    if (!report) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{t('dataLoadError')}</Text>
            </View>
        );
    }

    const formatValue = (value) => typeof value === 'number' ? value.toLocaleString('fr-FR') : '0';
    const formatCurrency = (value) => 
        typeof value === 'number' 
            ? `${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ${t('currency')}`
            : `0.00 ${t('currency')}`;

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.headerContainer}>
                <ImageBackground source={BACKGROUND_IMAGE} style={styles.imageBackground}>
                    <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' }} />
                    <View style={styles.headerContent}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.mainTitle}>
                                <Text style={{fontWeight: '900'}}>ZIGANYA</Text>{"\n"}
                                <Text style={{fontSize: 14}}>{t('managementSystem')}</Text>
                            </Text>
                        </View>
                    </View>
                    {report.message && (
                        <View style={styles.messageBox}>
                            <Text style={styles.messageText}>{report.message}</Text>
                        </View>
                    )}
                </ImageBackground>
            </View>

            <View style={styles.mainContentContainer}>
                <View style={styles.dataCardsContainer}>
                    <View style={styles.row}>
                        <View style={[styles.gridItem, styles.greenCard]}>
                            <Text style={styles.gridValue}>{formatValue(report.totalMembers)}</Text>
                            <Text style={styles.gridTitle}>{t('members').toUpperCase()}</Text>
                        </View>
                        <View style={[styles.gridItem, styles.blueCard]}>
                            <Text style={styles.gridValue}>{formatValue(report.totalActions)}</Text>
                            <Text style={styles.gridTitle}>{t('actions').toUpperCase()}</Text>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.gridItem, styles.yellowCard]}>
                            <Text style={styles.gridValue}>{formatCurrency(report.totalCurrentBalance)}</Text>
                            <Text style={styles.gridTitle}>{t('currentBalance').toUpperCase()}</Text>
                        </View>
                        <View style={[styles.gridItem, styles.redCard]}>
                            <Text style={styles.gridValue}>{formatCurrency(report.totalLoanBalance)}</Text>
                            <Text style={styles.gridTitle}>{t('loanBalance').toUpperCase()}</Text>
                        </View>
                    </View>
                </View>

                <BalancePieChart 
                    currentBalance={report.totalCurrentBalance}
                    loanBalance={report.totalLoanBalance}
                    t={t}
                />
            </View>
        </ScrollView>
    );
}

// ----------------------------------------------------------------------
// STYLES
// ----------------------------------------------------------------------
const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: "#FFFFFF", paddingBottom: 20 },
    loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F4F7FF" },
    mainContentContainer: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', paddingHorizontal: 15 },
    headerContainer: { width: '100%', height: 250, overflow: 'hidden' },
    imageBackground: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', paddingHorizontal: 20, paddingTop: 10 },
    titleContainer: { flex: 1 },
    mainTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', textAlign: 'left', marginBottom: 5, letterSpacing: 1, textShadowColor: 'rgba(0, 0, 0, 0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
    messageBox: { backgroundColor: 'rgba(255, 255, 255, 0.3)', paddingVertical: 5, paddingHorizontal: 15, borderRadius: 5, marginTop: 10, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.5)' },
    messageText: { color: '#FFFFFF', fontSize: 12, fontWeight: '500', textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
    dataCardsContainer: { marginTop: -40, zIndex: 10 },
    row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
    gridItem: { flex: 1, marginHorizontal: 5, paddingVertical: 15, paddingHorizontal: 10, borderRadius: 10, shadowColor: "#000", shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 5, alignItems: 'center', justifyContent: 'center' },
    gridTitle: { fontSize: 12, fontWeight: "700", color: "#FFFFFF", marginTop: 5, textAlign: 'center' },
    gridValue: { fontSize: 20, fontWeight: "bold", color: "#FFFFFF", textAlign: 'center' },
    greenCard: { backgroundColor: '#38A370', borderBottomWidth: 5, borderBottomColor: '#2E8B57' },
    blueCard: { backgroundColor: '#004080', borderBottomWidth: 5, borderBottomColor: '#003366' },
    yellowCard: { backgroundColor: '#FFA500', borderBottomWidth: 5, borderBottomColor: '#FF8C00' },
    redCard: { backgroundColor: '#D9534F', borderBottomWidth: 5, borderBottomColor: '#C9302C' },
    errorText: { color: "red", fontSize: 16, padding: 20 },
});

const headerStyles = StyleSheet.create({ headerRight: { marginRight: 15, flexDirection: 'row', alignItems: 'center', zIndex: 100 } });
const chartStyles = StyleSheet.create({
    chartContainer: { marginVertical: 20, alignItems: 'center' },
    chartTitle: { fontSize: 14, fontWeight: 'bold', color: '#004080', marginBottom: 10, textAlign: 'center' },
    noDataText: { fontSize: 14, color: '#888', marginTop: 10 },
    legendContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10, width: '100%' },
    legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 15 },
    legendColorBox: { width: 12, height: 12, borderRadius: 3, marginRight: 6 },
    legendText: { fontSize: 12, color: '#333', fontWeight: '600' }
});
const embeddedStyles = StyleSheet.create({
    languageContainer: { position: 'relative', zIndex: 999 },
    languageButton: { flexDirection: 'row', alignItems: 'center', padding: 5, borderRadius: 5, backgroundColor: '#fff', borderWidth: 1, borderColor: PRIMARY_COLOR },
    languageButtonText: { fontWeight: '700', color: PRIMARY_COLOR, marginRight: 3 },
    languageDropdown: { position: 'absolute', top: 35, left: 0, backgroundColor: '#fff', borderWidth: 1, borderColor: PRIMARY_COLOR, borderRadius: 5, width: 120 },
    languageOption: { padding: 8 },
    languageOptionSelected: { backgroundColor: PRIMARY_COLOR },
    languageOptionText: { color: PRIMARY_COLOR },
    languageOptionTextSelected: { color: '#fff' },
    overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }
});
const connectionStyles = StyleSheet.create({
    statusContainer: { flexDirection: 'row', alignItems: 'center', marginRight: 10, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5 },
    statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 5 },
    statusText: { fontSize: 12 },
    connected: { backgroundColor: '#E6F7FF' },
    disconnected: { backgroundColor: '#FFE6E6' },
    connectedDot: { backgroundColor: '#1E90FF' },
    disconnectedDot: { backgroundColor: '#FF6347' }
});
