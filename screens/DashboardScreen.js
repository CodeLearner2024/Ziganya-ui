import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, ImageBackground, Dimensions } from "react-native";
import axios from "axios";
import { PieChart } from "react-native-chart-kit";

// --- Configuration et Constantes ---

// Largeur de l'écran (pour le graphique)
const screenWidth = Dimensions.get("window").width;
// Largeur maximale du contenu (pour éviter l'étirement sur grands écrans/tablettes)
const MAX_CONTENT_WIDTH = 600; 

const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#F7F9FC",
    color: (opacity = 1) => `rgba(0, 88, 168, ${opacity})`, 
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

const CURRENT_BALANCE_COLOR = '#1E90FF'; // Bleu Vif
const LOAN_BALANCE_COLOR = '#FF6347';      // Rouge Corail

const BACKGROUND_IMAGE_URI = 'https://i.imgur.com/gK9lYpS.png'; 

// Composant pour le graphique (maintenant un Pie Chart)
const BalancePieChart = ({ currentBalance, loanBalance }) => {
    const totalBalance = currentBalance + loanBalance;
    
    if (!totalBalance || totalBalance === 0) {
      return (
        <View style={chartStyles.chartContainer}>
            <Text style={chartStyles.chartTitle}>Répartition des Soldes (Proportion)</Text>
            <Text style={chartStyles.noDataText}>Aucune donnée financière disponible pour la répartition.</Text>
        </View>
      );
    }

    const currentPercentage = ((currentBalance / totalBalance) * 100).toFixed(1);
    const loanPercentage = ((loanBalance / totalBalance) * 100).toFixed(1);
    
    const data = [
      {
        // CORRECTION: Utilisation de guillemets droits simples ou doubles pour une chaîne vide
        // Ceci garantit qu'il n'y a pas de problème de parsing de caractère.
        name: "", 
        population: currentBalance, 
        color: CURRENT_BALANCE_COLOR,
      },
      {
        name: "",
        population: loanBalance,
        color: LOAN_BALANCE_COLOR,
      }
    ];

    // Calcul de la largeur du graphique pour l'adaptabilité
    const chartWidth = Math.min(screenWidth, MAX_CONTENT_WIDTH) * 0.9;

    return (
        <View style={chartStyles.chartContainer}>
            {/* Légende personnalisée (avec Rectangles) */}
            <View style={chartStyles.legendContainer}>
                <View style={chartStyles.legendItem}>
                    <View style={[chartStyles.legendColorBox, { backgroundColor: CURRENT_BALANCE_COLOR }]} />
                    <Text style={chartStyles.legendText}>Solde Actuel : {currentPercentage}%</Text>
                </View>
                <View style={chartStyles.legendItem}>
                    <View style={[chartStyles.legendColorBox, { backgroundColor: LOAN_BALANCE_COLOR }]} />
                    <Text style={chartStyles.legendText}>Solde des Crédits : {loanPercentage}%</Text>
                </View>
            </View>

            {/* Diagramme Circulaire */}
            <PieChart
                data={data}
                width={chartWidth} // Utilise la largeur calculée
                height={220}
                chartConfig={chartConfig}
                accessor={"population"} 
                backgroundColor={"transparent"}
                paddingLeft={"20"}
                center={[10, 0]} 
            />
        </View>
    );
};


export default function DashboardScreen() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // CORRECTION DE L'URL: Assurez-vous que l'URL locale est accessible.
  // L'utilisation d'une adresse IP privée comme 192.168.x.x est courante en développement,
  // mais une URL non atteignable peut générer une erreur fatale dans certains environnements.
  const API_URL = "https://ziganya.onrender.com/ziganya-managment-system/api/v1/reports";
  // const API_URL = "http://localhost:8001/ziganya-managment-system/api/v1/reports";

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(API_URL);
        setReport(response.data);
      } catch (error) {
        // Loggez l'erreur de manière plus sécurisée, sans exposer tout l'objet d'erreur
        console.error("Erreur lors du chargement du rapport. Vérifiez l'URL et l'état du serveur.", error.message);
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
        <Text>Chargement du Tableau de Bord...</Text>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Impossible de charger les données. Vérifiez la connexion.</Text>
      </View>
    );
  }
  
  // Formatage des valeurs
  const formatValue = (value) => {
    // Ajout d'une vérification de type pour éviter des erreurs potentielles de toLocaleString
    return typeof value === 'number' ? value.toLocaleString('fr-FR') : '0';
  };
  
  const formatCurrency = (value) => {
    // Ajout d'une vérification de type pour toFixed
    if (typeof value === 'number') {
        return `${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FBu`;
    }
    return '0.00 FBu';
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
        {/* Entête et fond de l'image (pleine largeur) */}
        <View style={styles.headerContainer}>
            <ImageBackground
              source={{ uri: BACKGROUND_IMAGE_URI }}
              style={styles.imageBackground}
              imageStyle={styles.imageStyle}
            >
                <View style={styles.overlay} /> 

                <Text style={styles.mainTitle}>
                    <Text style={{fontWeight: '900'}}>ZIGANYA</Text>{"\n"}
                    <Text style={{fontSize: 14}}>MANAGEMENT SYSTEM</Text>
                </Text>
            
                {report.message && (
                    <View style={styles.messageBox}>
                        <Text style={styles.messageText}>{report.message}</Text>
                    </View>
                )}
            </ImageBackground>
        </View>

        {/* CONTENEUR PRINCIPAL du CONTENU: Limite la largeur du contenu pour l'adaptabilité */}
        <View style={styles.mainContentContainer}>
            {/* Les cartes de données */}
            <View style={styles.dataCardsContainer}>
                <View style={styles.row}>
                  <View style={[styles.gridItem, styles.greenCard]}>
                    <Text style={styles.gridValue}>{formatValue(report.totalMembers)}</Text>
                    <Text style={styles.gridTitle}>MEMBRES</Text>
                  </View>
                  <View style={[styles.gridItem, styles.blueCard]}>
                    <Text style={styles.gridValue}>{formatValue(report.totalActions)}</Text>
                    <Text style={styles.gridTitle}>ACTIONS</Text>
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.gridItem, styles.yellowCard]}>
                    <Text style={styles.gridValue}>{formatCurrency(report.totalCurrentBalance)}</Text>
                    <Text style={styles.gridTitle}>SOLDE ACTUEL</Text>
                  </View>
                  <View style={[styles.gridItem, styles.redCard]}>
                    <Text style={styles.gridValue}>{formatCurrency(report.totalLoanBalance)}</Text>
                    <Text style={styles.gridTitle}>SOLDE DES CRÉDITS</Text>
                  </View>
                </View>
            </View>
            
            {/* Le Diagramme Circulaire (Pie Chart) */}
            <BalancePieChart 
              currentBalance={report.totalCurrentBalance}
              loanBalance={report.totalLoanBalance}
            /> 
        </View>
    </ScrollView>
  );
}

// ----------------------------------------------------------------------
// STYLES
// ----------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    paddingBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F7FF",
  },
  
  // NOUVEAU CONTENEUR pour limiter la largeur du contenu sur les grands écrans
  mainContentContainer: {
      width: '100%',
      maxWidth: MAX_CONTENT_WIDTH, 
      alignSelf: 'center', 
      paddingHorizontal: 15, // Marge latérale
  },

  /* Entête (pleine largeur) */
  headerContainer: {
    width: '100%',
    height: 250,
    overflow: 'hidden',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0058A8',
  },
  imageStyle: {
    opacity: 0.3,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 88, 168, 0.7)',
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 5,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  messageBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },

  /* Styles des cartes de données */
  dataCardsContainer: {
    marginTop: -40,
    zIndex: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  gridItem: {
    flex: 1,
    marginHorizontal: 5, // Ajout de petites marges entre les cartes
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 5,
    textAlign: 'center',
  },
  gridValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: 'center',
  },
  
  // Couleurs des cartes
  greenCard: {
    backgroundColor: '#38A370',
    borderBottomWidth: 5,
    borderBottomColor: '#2E8B57',
  },
  blueCard: {
    backgroundColor: '#004080',
    borderBottomWidth: 5,
    borderBottomColor: '#003366',
  },
  yellowCard: {
    backgroundColor: '#FFA500',
    borderBottomWidth: 5,
    borderBottomColor: '#FF8C00',
  },
  redCard: {
    backgroundColor: '#D9534F',
    borderBottomWidth: 5,
    borderBottomColor: '#C9302C',
  },
  
  errorText: {
    color: "red",
    fontSize: 16,
    padding: 20,
  },
});

// Styles spécifiques au graphique et la légende
const chartStyles = StyleSheet.create({
    chartContainer: {
        marginVertical: 20,
        alignItems: 'center',
    },
    chartTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#004080',
        marginBottom: 10,
        textAlign: 'center',
    },
    noDataText: {
        fontSize: 14,
        color: '#888',
        marginTop: 10,
    },
    // Styles de la Légende
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
        width: '100%',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 15,
    },
    legendColorBox: {
        width: 12,
        height: 12,
        borderRadius: 3, 
        marginRight: 6,
    },
    legendText: {
        fontSize: 12,
        color: '#333',
        fontWeight: '600', 
    }
});