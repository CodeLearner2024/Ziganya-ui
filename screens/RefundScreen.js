import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";

// --- CONSTANTES ---
const PRIMARY_COLOR = "#4C1C8A";

// --- TRADUCTIONS MULTILINGUES ---
const translations = {
  fr: {
    refunds: "Remboursements",
    addRefund: "Enregistrer un remboursement",
    editRefund: "Modifier le Remboursement",
    saveRefund: "Enregistrer un Remboursement",
    credit: "Crédit concerné",
    amount: "Montant du remboursement (FBu)",
    date: "Date du remboursement (AAAA-MM-JJ)",
    enterAmount: "Ex: 5000",
    enterDate: "AAAA-MM-JJ",
    save: "💾 Enregistrer",
    edit: "💾 Modifier",
    cancel: "Annuler",
    delete: "Supprimer",
    viewDetails: "Voir les détails",
    confirmDelete: "Confirmation de suppression",
    deleteConfirmationText: "Êtes-vous sûr de vouloir supprimer ce remboursement de",
    forCredit: "pour le crédit #",
    loadingRefunds: "Chargement des remboursements...",
    noRefunds: "Aucun remboursement enregistré",
    noCredits: "Aucun crédit 'Approuvé' (GRANTED) disponible.",
    member: "Membre",
    creditId: "Crédit ID",
    refundAmount: "Montant Remb.",
    actions: "Actions",
    refundDetails: "Détails du remboursement",
    close: "Fermer",
    validation: {
      requiredFields: "Veuillez remplir le montant, la date et sélectionner un crédit.",
      amountPositive: "Le montant doit être un nombre positif.",
      noGrantedCredits: "❌ Aucun crédit approuvé (GRANTED) n'est disponible pour un remboursement."
    },
    messages: {
      refundUpdated: "Remboursement modifié avec succès.",
      refundAdded: "Remboursement enregistré avec succès.",
      refundDeleted: "Remboursement supprimé.",
      connectionError: "Erreur de connexion. Impossible de charger les données.",
      error: "Erreur"
    },
    details: {
      amountRefunded: "Montant Remboursé",
      refundDate: "Date du Remboursement",
      creditId: "Crédit ID",
      initialAmount: "Montant initial",
      member: "Membre"
    }
  },
  en: {
    refunds: "Refunds",
    addRefund: "Register a refund",
    editRefund: "Edit Refund",
    saveRefund: "Save a Refund",
    credit: "Related Credit",
    amount: "Refund Amount (FBu)",
    date: "Refund Date (YYYY-MM-DD)",
    enterAmount: "Ex: 5000",
    enterDate: "YYYY-MM-DD",
    save: "💾 Save",
    edit: "💾 Edit",
    cancel: "Cancel",
    delete: "Delete",
    viewDetails: "View details",
    confirmDelete: "Delete confirmation",
    deleteConfirmationText: "Are you sure you want to delete this refund of",
    forCredit: "for credit #",
    loadingRefunds: "Loading refunds...",
    noRefunds: "No refunds registered",
    noCredits: "No 'Granted' credits available.",
    member: "Member",
    creditId: "Credit ID",
    refundAmount: "Refund Amount",
    actions: "Actions",
    refundDetails: "Refund details",
    close: "Close",
    validation: {
      requiredFields: "Please fill in amount, date and select a credit.",
      amountPositive: "Amount must be a positive number.",
      noGrantedCredits: "❌ No approved credits (GRANTED) available for refund."
    },
    messages: {
      refundUpdated: "Refund updated successfully.",
      refundAdded: "Refund saved successfully.",
      refundDeleted: "Refund deleted.",
      connectionError: "Connection error. Unable to load data.",
      error: "Error"
    },
    details: {
      amountRefunded: "Amount Refunded",
      refundDate: "Refund Date",
      creditId: "Credit ID",
      initialAmount: "Initial amount",
      member: "Member"
    }
  },
  kdi: {
    refunds: "Kwishura",
    addRefund: "Andika Kwishura",
    editRefund: "Hindura Kwishura",
    saveRefund: "Bika Kwishura",
    credit: "Inguzanyo Ihuriweho",
    amount: "Amafaranga Yo Gushyura (FBu)",
    date: "Itariki Yo Gushyura (AAAA-UU-II)",
    enterAmount: "Urugero: 5000",
    enterDate: "AAAA-UU-II",
    save: "💾 Bika",
    edit: "💾 Hindura",
    cancel: "Hagarika",
    delete: "Siba",
    viewDetails: "Raba Ibisobanuro",
    confirmDelete: "Gusiba Kwishura",
    deleteConfirmationText: "Urazi neza ko ushaka gusiba iyi kwishura",
    forCredit: "kuri inguzanyo #",
    loadingRefunds: "Kurondera Kwishura...",
    noRefunds: "Nta Kwishura Byorondetse",
    noCredits: "Nta Nguzanyo 'Zemewe' Zihari.",
    member: "Umunyamuryango",
    creditId: "Inguzanyo ID",
    refundAmount: "Amafaranga Yishuwe",
    actions: "Imitahe",
    refundDetails: "Ibisobanuro Ku Kwishura",
    close: "Funga",
    validation: {
      requiredFields: "Nyamuneka Uzuze Amafaranga, Itariki na Guhitamo Inguzanyo.",
      amountPositive: "Amafaranga Agomba Kuba Ayo Mwiza.",
      noGrantedCredits: "❌ Nta Nguzanyo Zemewe (GRANTED) Zihari Yo Gushyura."
    },
    messages: {
      refundUpdated: "Kwishura Byahinduwe Neza.",
      refundAdded: "Kwishura Byashiriwe Neza.",
      refundDeleted: "Kwishura Byasibwe.",
      connectionError: "Harabayeho Ikosa. Ntishoboka Kurondera Amakuru.",
      error: "Ikosa"
    },
    details: {
      amountRefunded: "Amafaranga Yishuwe",
      refundDate: "Itariki Yo Gushyura",
      creditId: "Inguzanyo ID",
      initialAmount: "Amafaranga Yo Mbere",
      member: "Umunyamuryango"
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

// --- Configuration API et Constantes ---
const API_BASE_URL = "https://ziganya.onrender.com/ziganya-managment-system/api/v1";
// const API_BASE_URL = "http://localhost:8001/ziganya-managment-system/api/v1";
const REFUNDS_API = `${API_BASE_URL}/refunds`;
const CREDITS_API = `${API_BASE_URL}/credits`;

// Fonction utilitaire pour extraire le message d'erreur du backend
const getBackendErrorMessage = (error) => {
    if (error.response && error.response.data) {
        const data = error.response.data;
        return data.message || data.errorMessage || JSON.stringify(data);
    } 
    else if (error.request) {
        return "❌ Connexion au serveur échouée. Le backend n'est peut-être pas lancé ou l'adresse est incorrecte.";
    } 
    else if (error.message) {
        return `Une erreur s'est produite : ${error.message}`;
    } 
    else {
        return "Une erreur inconnue est survenue.";
    }
};

// Obtient la date du jour au format YYYY-MM-DD
const getTodayDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function RefundScreen({ navigation, route }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [refunds, setRefunds] = useState([]);
    const [grantedCredits, setGrantedCredits] = useState([]); 
    const [loadingData, setLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState(route.params?.currentLanguage || 'fr');
    
    // Champs du formulaire de remboursement (Ajout/Modification)
    const [amount, setAmount] = useState("");
    const [refundDate, setRefundDate] = useState(getTodayDate());
    const [selectedCreditId, setSelectedCreditId] = useState(""); 
    const [editingRefundId, setEditingRefundId] = useState(null); 
    
    // Pop-up messages succès/erreur
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [popupType, setPopupType] = useState("success");

    // Pop-up confirmation suppression
    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const [refundToDelete, setRefundToDelete] = useState(null);

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
            title: t('refunds'),
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

    const showPopup = (message, type = "success") => {
        setPopupMessage(message);
        setPopupType(type);
        setPopupVisible(true);
        setTimeout(() => setPopupVisible(false), 3500);
    };

    const resetForm = () => {
        setAmount("");
        setRefundDate(getTodayDate());
        setEditingRefundId(null);
        if (grantedCredits.length > 0) {
            setSelectedCreditId(grantedCredits[0].id.toString());
        }
    };

    // --- Chargement des données ---
    // CORRECTION : Éviter la boucle infinie en retirant t des dépendances
    const loadData = useCallback(async () => {
        setLoadingData(true);
        try {
            const creditsResponse = await axios.get(CREDITS_API);
            
            const filteredCredits = creditsResponse.data
                .filter(c => c.creditDecision === 'GRANTED')
                .map(c => ({
                    id: c.id.toString(),
                    label: `${t('creditId')} #${c.id} - ${c.amount.toLocaleString('fr-FR')} FBu - ${c.member?.firstname || t('member')}`,
                    member: c.member,
                }));
                
            setGrantedCredits(filteredCredits);
            
            if (filteredCredits.length > 0 && !selectedCreditId) {
                setSelectedCreditId(filteredCredits[0].id);
            }

            const refundsResponse = await axios.get(REFUNDS_API);
            
            const enhancedRefunds = refundsResponse.data.map(refund => {
                const creditInfo = refund.credit; 
                
                const memberName = creditInfo?.member 
                    ? `${creditInfo.member.firstname} ${creditInfo.member.lastname}` 
                    : `${t('creditId')} ${refund.creditId || 'N/A'} (${t('member')} ${t('notFound')})`;
                
                return {
                    ...refund,
                    creditDetails: creditInfo,
                    creditId: creditInfo?.id || refund.creditId,
                    memberName: memberName 
                };
            });
            setRefunds(enhancedRefunds);

        } catch (error) {
            console.error("Erreur lors du chargement des données:", error);
            const errorMessage = getBackendErrorMessage(error);
            showPopup(errorMessage, "error");
        } finally {
            setLoadingData(false);
        }
    }, [selectedCreditId]); // Retirer t des dépendances

    useEffect(() => {
        loadData();
    }, [loadData]);

    // --- CRUD Fonctions ---

    const saveRefund = async () => {
        if (!selectedCreditId || !amount || !refundDate) {
            return showPopup(t('validation.requiredFields'), "error");
        }
        if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            return showPopup(t('validation.amountPositive'), "error");
        }
        
        const payload = {
            amount: parseFloat(amount),
            creditId: parseInt(selectedCreditId), 
            refundDate: refundDate,
        };
        
        setIsSubmitting(true);

        try {
            if (editingRefundId) {
                await axios.put(`${REFUNDS_API}/${editingRefundId}`, payload);
                showPopup(t('messages.refundUpdated'), "success");
            } else {
                await axios.post(REFUNDS_API, payload);
                showPopup(`${t('messages.refundAdded')} ${payload.amount} FBu`, "success");
            }
            
            setModalVisible(false);
            resetForm();
            loadData();
        } catch (error) {
            console.error("Erreur d'enregistrement du remboursement:", error);
            showPopup(getBackendErrorMessage(error), "error");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const editRefund = (refund) => {
        setAmount(refund.amount.toString());
        setRefundDate(refund.refundDate);
        setSelectedCreditId(refund.creditId.toString());
        setEditingRefundId(refund.id);
        setModalVisible(true);
    };

    const confirmDeleteRefund = (refund) => {
        setRefundToDelete(refund);
        setConfirmDeleteVisible(true);
    };

    const performDeleteRefund = async () => {
        if (!refundToDelete) return;
        
        const refundId = refundToDelete.id;
        const memberName = refundToDelete.memberName;

        try {
            await axios.delete(`${REFUNDS_API}/${refundId}`);
            loadData();
            showPopup(`${t('messages.refundDeleted')} ${memberName}`, "success");
        } catch (error) {
            console.error("Erreur de suppression du remboursement:", error);
            showPopup(getBackendErrorMessage(error), "error");
        } finally {
            setRefundToDelete(null);
            setConfirmDeleteVisible(false);
        }
    };

    const viewRefund = (item) => {
        const creditAmount = item.creditDetails?.amount.toLocaleString('fr-FR') || 'N/A';
        const memberName = item.memberName; 
            
        showPopup(
            `💰 ${t('details.amountRefunded')}: ${item.amount.toLocaleString('fr-FR')} FBu
📅 ${t('details.refundDate')}: ${item.refundDate}
💳 ${t('details.creditId')}: ${item.creditId} (${t('details.initialAmount')}: ${creditAmount} FBu)
👤 ${t('details.member')}: ${memberName}`,
            "success"
        );
    };

    const RefundItem = ({ item }) => {
        return (
            <View style={styles.tableRow}>
                <Text style={[styles.cellText, styles.cellMember]}>{item.memberName}</Text> 
                <Text style={[styles.cellText, styles.cellCreditId]}>{item.creditId}</Text>
                <Text style={[styles.cellText, styles.cellAmount]}>
                    {item.amount ? item.amount.toLocaleString('fr-FR') : '0'} FBu
                </Text>
                <View style={styles.cellActions}>
                    <TouchableOpacity onPress={() => viewRefund(item)}>
                        <MaterialIcons name="info" size={22} color="#004080" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => editRefund(item)}>
                        <MaterialIcons name="edit" size={22} color="#FFA500" /> 
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => confirmDeleteRefund(item)}>
                        <MaterialIcons name="delete" size={22} color="#FF0000" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const canAddRefund = grantedCredits.length > 0;

    return (
        <View style={styles.container}>
            
            {/* Bouton ajouter remboursement */}
            <TouchableOpacity 
                style={[styles.addButton, !canAddRefund && styles.disabledButton]} 
                onPress={() => {
                    resetForm();
                    setModalVisible(true);
                }}
                disabled={popupVisible || confirmDeleteVisible || !canAddRefund}
            >
                <Text style={styles.addButtonText}>➕ {t('addRefund')}</Text>
            </TouchableOpacity>
            
            {!canAddRefund && (
                 <Text style={[styles.emptyText, {color: 'red'}]}>
                    {t('validation.noGrantedCredits')}
                 </Text>
            )}

            {/* Liste des remboursements */}
            {loadingData ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#004080" />
                    <Text style={{ marginTop: 10 }}>{t('loadingRefunds')}</Text>
                </View>
            ) : refunds.length > 0 ? (
                <View style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.headerText, styles.headerMember]}>{t('member')}</Text>
                        <Text style={[styles.headerText, styles.headerCreditId]}>{t('creditId')}</Text>
                        <Text style={[styles.headerText, styles.headerAmount]}>{t('refundAmount')}</Text>
                        <Text style={[styles.headerText, styles.headerActions]}>{t('actions')}</Text>
                    </View>
                    <FlatList
                        data={refunds}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={RefundItem}
                    />
                </View>
            ) : (
                <Text style={styles.emptyText}>{t('noRefunds')}</Text>
            )}

            {/* MODALE D'AJOUT/MODIFICATION DE REMBOURSEMENT */}
            <Modal 
                animationType="slide" 
                transparent 
                visible={modalVisible && !popupVisible && !confirmDeleteVisible}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            {editingRefundId ? t('editRefund') : t('saveRefund')}
                        </Text>
                        <ScrollView>
                            <Text style={styles.label}>{t('credit')}</Text>
                            <View style={styles.pickerContainer}>
                                {grantedCredits.length > 0 ? (
                                    <Picker
                                        selectedValue={selectedCreditId}
                                        onValueChange={(itemValue) => setSelectedCreditId(itemValue)}
                                        style={styles.picker}
                                        enabled={!isSubmitting}
                                    >
                                        {grantedCredits.map((credit) => (
                                            <Picker.Item 
                                                key={credit.id} 
                                                label={credit.label} 
                                                value={credit.id}  
                                            />
                                        ))}
                                    </Picker>
                                ) : (
                                    <Text style={styles.emptyText}>{t('noCredits')}</Text>
                                )}
                            </View>

                            <Text style={styles.label}>{t('amount')}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t('enterAmount')}
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                                editable={!isSubmitting}
                            />

                            <Text style={styles.label}>{t('date')}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t('enterDate')}
                                value={refundDate}
                                onChangeText={setRefundDate}
                                editable={!isSubmitting}
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity 
                                    style={styles.saveButton} 
                                    onPress={saveRefund}
                                    disabled={isSubmitting || grantedCredits.length === 0}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>
                                            {editingRefundId ? t('edit') : t('save')}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => {
                                        setModalVisible(false);
                                        resetForm();
                                    }}
                                    disabled={isSubmitting}
                                >
                                    <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Pop-up confirmation suppression */}
            <Modal 
                visible={confirmDeleteVisible && !popupVisible} 
                transparent 
                animationType="fade"
            >
                <View style={styles.popupOverlay}>
                    <View style={[styles.popupBox, { borderTopColor: "orange", borderTopWidth: 6 }]}>
                        <Text style={styles.popupText}>
                            {t('deleteConfirmationText')} {refundToDelete?.amount.toLocaleString('fr-FR')} FBu {t('forCredit')}{refundToDelete?.creditId} ?
                        </Text>
                        <View style={{ flexDirection: "row", justifyContent: "space-around", width: "100%", marginTop: 10 }}>
                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: "#ccc", flex: 1, marginRight: 5 }]}
                                onPress={() => setConfirmDeleteVisible(false)}
                            >
                                <Text style={styles.saveButtonText}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: "#FF0000", flex: 1, marginLeft: 5 }]}
                                onPress={performDeleteRefund}
                            >
                                <Text style={styles.saveButtonText}>{t('delete')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Pop-up message (Succès/Erreur) */}
            <Modal 
                visible={popupVisible} 
                transparent 
                animationType="fade"
            >
                <View style={styles.popupOverlay}>
                    <View
                        style={[
                            styles.popupBox,
                            popupType === "error" ? styles.popupError : styles.popupSuccess,
                        ]}
                    >
                        <Text style={styles.popupText}>{popupMessage}</Text>
                        <TouchableOpacity onPress={() => setPopupVisible(false)}>
                            <Text style={styles.closeText}>{t('close')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// Styles
const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#E0F3FF" },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    
    addButton: {
        backgroundColor: "#004080", 
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 20,
    },
    disabledButton: {
        backgroundColor: "#A9A9A9",
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
    label: { fontWeight: "bold", marginBottom: 5, color: "#004080", marginTop: 10 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        marginBottom: 15,
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    picker: {
        height: 40,
        width: '100%',
    },
    
    modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
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
    headerText: { color: "#fff", fontWeight: "bold" },

    headerMember: { flex: 2.5, textAlign: "left" },
    cellMember: { flex: 2.5, textAlign: "left" },
    
    headerCreditId: { flex: 1.5, textAlign: "center" },
    cellCreditId: { flex: 1.5, textAlign: "center" },

    headerAmount: { flex: 2, textAlign: "center" },
    cellAmount: { flex: 2, textAlign: "center" },

    headerActions: { flex: 2, textAlign: "right" },
    cellActions: { 
        flex: 2, 
        flexDirection: "row", 
        justifyContent: 'space-around', 
        minWidth: 100,
    }, 

    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        paddingVertical: 10,
        paddingHorizontal: 5,
        alignItems: "center",
    },
    cellText: { fontSize: 14, color: "#000" },
    emptyText: { textAlign: "center", color: "#555", marginTop: 30, fontStyle: "italic" },

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