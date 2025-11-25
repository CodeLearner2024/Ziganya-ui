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
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import axios from "axios";

// --- CONSTANTES ---
const PRIMARY_COLOR = "#4C1C8A";

// --- TRADUCTIONS MULTILINGUES ---
const translations = {
  fr: {
    credits: "Crédits",
    requestCredit: "Demander un crédit",
    editCredit: "Modifier le Crédit",
    saveCredit: "Enregistrer un Crédit",
    member: "Membre demandeur",
    amount: "Montant du crédit (FBu)",
    interestRate: "Taux d'intérêt (%)",
    date: "Date de la demande (AAAA-MM-JJ)",
    enterAmount: "Ex: 12000",
    enterInterestRate: "Ex: 12.0",
    enterDate: "AAAA-MM-JJ",
    save: "💾 Enregistrer",
    edit: "💾 Modifier",
    cancel: "Annuler",
    delete: "Supprimer",
    viewDetails: "Voir les détails",
    processCredit: "Traiter le Crédit",
    decision: "Décision",
    confirmDelete: "Confirmation de suppression",
    deleteConfirmationText: "Êtes-vous sûr de vouloir supprimer ce crédit",
    loadingCredits: "Chargement des crédits...",
    noCredits: "Aucun crédit enregistré",
    noMembers: "Aucun membre trouvé",
    actions: "Actions",
    creditDetails: "Détails du crédit",
    close: "Fermer",
    status: "Statut",
    totalAmount: "Total à payer",
    decisionOptions: {
      IN_TREATMENT: "En Cours",
      GRANTED: "Approuvé",
      REFUSED: "Refusé"
    },
    validation: {
      requiredFields: "Veuillez remplir le membre, le montant et le taux d'intérêt.",
      amountPositive: "Le montant doit être un nombre positif.",
      interestRatePositive: "Le taux d'intérêt doit être un nombre positif ou nul.",
      alreadyTreated: "Ce crédit a déjà été traité et ne peut pas être modifié.",
      alreadyTreatedDelete: "Ce crédit a déjà été traité et ne peut pas être supprimé.",
      alreadyTreatedProcess: "Ce crédit a déjà été traité."
    },
    messages: {
      creditUpdated: "Crédit modifié avec succès.",
      creditAdded: "Crédit enregistré avec succès.",
      creditDeleted: "Crédit supprimé.",
      creditProcessed: "Crédit traité avec succès.",
      connectionError: "Erreur de connexion. Impossible de charger les données.",
      error: "Erreur"
    }
  },
  en: {
    credits: "Credits",
    requestCredit: "Request a credit",
    editCredit: "Edit Credit",
    saveCredit: "Save a Credit",
    member: "Applicant Member",
    amount: "Credit Amount (FBu)",
    interestRate: "Interest Rate (%)",
    date: "Request Date (YYYY-MM-DD)",
    enterAmount: "Ex: 12000",
    enterInterestRate: "Ex: 12.0",
    enterDate: "YYYY-MM-DD",
    save: "💾 Save",
    edit: "💾 Edit",
    cancel: "Cancel",
    delete: "Delete",
    viewDetails: "View details",
    processCredit: "Process Credit",
    decision: "Decision",
    confirmDelete: "Delete confirmation",
    deleteConfirmationText: "Are you sure you want to delete this credit",
    loadingCredits: "Loading credits...",
    noCredits: "No credits registered",
    noMembers: "No members found",
    actions: "Actions",
    creditDetails: "Credit details",
    close: "Close",
    status: "Status",
    totalAmount: "Total to pay",
    decisionOptions: {
      IN_TREATMENT: "In Treatment",
      GRANTED: "Granted",
      REFUSED: "Refused"
    },
    validation: {
      requiredFields: "Please fill in member, amount and interest rate.",
      amountPositive: "Amount must be a positive number.",
      interestRatePositive: "Interest rate must be a positive number or zero.",
      alreadyTreated: "This credit has already been processed and cannot be modified.",
      alreadyTreatedDelete: "This credit has already been processed and cannot be deleted.",
      alreadyTreatedProcess: "This credit has already been processed."
    },
    messages: {
      creditUpdated: "Credit updated successfully.",
      creditAdded: "Credit saved successfully.",
      creditDeleted: "Credit deleted.",
      creditProcessed: "Credit processed successfully.",
      connectionError: "Connection error. Unable to load data.",
      error: "Error"
    }
  },
  kdi: {
    credits: "Inguzanyo",
    requestCredit: "Gusaba Inguzanyo",
    editCredit: "Hindura Inguzanyo",
    saveCredit: "Bika Inguzanyo",
    member: "Umunyamuryango Usaba",
    amount: "Amafaranga Y'inguzanyo (FBu)",
    interestRate: "Ingano Y'inyongera (%)",
    date: "Itariki Y'urusobe (AAAA-UU-II)",
    enterAmount: "Urugero: 12000",
    enterInterestRate: "Urugero: 12.0",
    enterDate: "AAAA-UU-II",
    save: "💾 Bika",
    edit: "💾 Hindura",
    cancel: "Hagarika",
    delete: "Siba",
    viewDetails: "Raba Ibisobanuro",
    processCredit: "Kora Inguzanyo",
    decision: "Iciyumviro",
    confirmDelete: "Gusiba Inguzanyo",
    deleteConfirmationText: "Urazi neza ko ushaka gusiba iyi nguzanyo",
    loadingCredits: "Kurondera Inguzanyo...",
    noCredits: "Nta Nguzanyo Yorondetse",
    noMembers: "Nta Munyamuryango Wabonetse",
    actions: "Imitahe",
    creditDetails: "Ibisobanuro Ku Nguzanyo",
    close: "Funga",
    status: "Imimerere",
    totalAmount: "Amafaranga Yose Ayo Kwishura",
    decisionOptions: {
      IN_TREATMENT: "Irakorwa",
      GRANTED: "Yemewe",
      REFUSED: "Yahakanwe"
    },
    validation: {
      requiredFields: "Nyamuneka Uzuze Umunyamuryango, Amafaranga na Ingano Y'inyongera.",
      amountPositive: "Amafaranga Agomba Kuba Ayo Mwiza.",
      interestRatePositive: "Ingano Y'inyongera Igomba Kuba Mwiza Cyangwa Ibanze.",
      alreadyTreated: "Iyi Nguzanyo Yakorwa Kera Kandi Ntishobora Guhindurwa.",
      alreadyTreatedDelete: "Iyi Nguzanyo Yakorwa Kera Kandi Ntishobora Gusibwa.",
      alreadyTreatedProcess: "Iyi Nguzanyo Yakorwa Kera."
    },
    messages: {
      creditUpdated: "Inguzanyo Yahinduwe Neza.",
      creditAdded: "Inguzanyo Yashiriwe Neza.",
      creditDeleted: "Inguzanyo Yasibwe.",
      creditProcessed: "Inguzanyo Yakozwe Neza.",
      connectionError: "Harabayeho Ikosa. Ntishoboka Kurondera Amakuru.",
      error: "Ikosa"
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

const MEMBERS_API = `${API_BASE_URL}/members`;
const CREDITS_API = `${API_BASE_URL}/credits`;
const CREDIT_TREATMENT_API = `${API_BASE_URL}/credit-traitment`;

// Options pour la décision de traitement
const DECISION_OPTIONS = [
    { label: "En Cours (IN_TREATMENT)", value: "IN_TREATMENT" },
    { label: "Approuvé (GRANTED)", value: "GRANTED" },
    { label: "Refusé (REFUSED)", value: "REFUSED" },
];

// Fonction utilitaire pour extraire le message d'erreur du backend
const getBackendErrorMessage = (error) => {
    if (error.response && error.response.data) {
        const data = error.response.data;
        return data.message || data.errorMessage || JSON.stringify(data);
    } else if (error.request) {
        return "Connexion au serveur échouée. Le backend n'est peut-être pas lancé ou l'adresse est incorrecte.";
    } else if (error.message) {
        return `Une erreur s'est produite : ${error.message}`;
    } else {
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

export default function CreditScreen({ navigation, route }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [credits, setCredits] = useState([]);
    const [members, setMembers] = useState([]); 
    const [loadingData, setLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState(route.params?.currentLanguage || 'fr');
    
    // Champs du formulaire de crédit (Ajout/Modification)
    const [amount, setAmount] = useState("");
    const [creditDate, setCreditDate] = useState(getTodayDate());
    const [interestRate, setInterestRate] = useState(""); 
    const [selectedMemberId, setSelectedMemberId] = useState(""); 
    const [editingCreditId, setEditingCreditId] = useState(null); 
    
    // État pour la fonctionnalité de traitement
    const [treatmentModalVisible, setTreatmentModalVisible] = useState(false);
    const [creditToTreat, setCreditToTreat] = useState(null);
    const [selectedDecision, setSelectedDecision] = useState(DECISION_OPTIONS[0].value); 
    
    // Pop-up messages succès/erreur
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [popupType, setPopupType] = useState("success");

    // Pop-up confirmation suppression
    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const [creditToDelete, setCreditToDelete] = useState(null);

    // Fonction de traduction
    const t = (key) => {
        const keys = key.split('.');
        let result = translations[currentLanguage];
        keys.forEach(k => {
            result = result?.[k];
        });
        return result ?? key;
    };

    // Fonction pour obtenir le label traduit du statut
    const getStatusLabel = (statusValue) => {
        return t(`decisionOptions.${statusValue}`) || statusValue || 'N/A';
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
            title: t('credits'),
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

    // Réinitialiser les champs du formulaire (Ajout/Modification)
    const resetForm = () => {
        setAmount("");
        setCreditDate(getTodayDate());
        setInterestRate("");
        setEditingCreditId(null);
        if (members.length > 0 && !selectedMemberId) {
            setSelectedMemberId(members[0].id); 
        } else if (members.length > 0 && editingCreditId === null) {
            setSelectedMemberId(members[0].id);
        }
    };

    // --- CRUD Fonctions ---
    // CORRECTION : Éviter la boucle infinie en retirant t des dépendances
    const loadData = useCallback(async () => {
        setLoadingData(true);
        try {
            const membersResponse = await axios.get(MEMBERS_API);
            const membersData = membersResponse.data.map(m => ({
                id: m.id.toString(),
                name: m.firstname && m.lastname ? `${m.firstname} ${m.lastname}` : `Membre #${m.id}`,
            }));
            setMembers(membersData);
            
            if (membersData.length > 0 && !selectedMemberId) {
                setSelectedMemberId(membersData[0].id);
            }

            const creditsResponse = await axios.get(CREDITS_API);
            setCredits(creditsResponse.data);

        } catch (error) {
            console.error("Erreur lors du chargement des données:", error);
            const errorMessage = getBackendErrorMessage(error);
            showPopup(errorMessage, "error");
        } finally {
            setLoadingData(false);
        }
    }, [selectedMemberId]); // Retirer t des dépendances

    useEffect(() => {
        loadData();
    }, [loadData]);

    const saveCredit = async () => {
        if (!selectedMemberId || !amount || !interestRate) {
            return showPopup(t('validation.requiredFields'), "error");
        }
        if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            return showPopup(t('validation.amountPositive'), "error");
        }
        if (isNaN(parseFloat(interestRate)) || parseFloat(interestRate) < 0) {
            return showPopup(t('validation.interestRatePositive'), "error");
        }
        
        const payload = {
            amount: parseFloat(amount),
            creditDate: creditDate,
            interestRate: parseFloat(interestRate),
            memberId: parseInt(selectedMemberId), 
        };
        
        setIsSubmitting(true);

        try {
            if (editingCreditId) {
                await axios.put(`${CREDITS_API}/${editingCreditId}`, payload);
                showPopup(t('messages.creditUpdated'), "success");
            } else {
                payload.creditDecision = "IN_TREATMENT"; 
                await axios.post(CREDITS_API, payload);
                showPopup(`${t('messages.creditAdded')} ${payload.amount} FBu`, "success");
            }
            
            setModalVisible(false);
            resetForm();
            loadData(); 
        } catch (error) {
            console.error("Erreur d'enregistrement:", error);
            showPopup(getBackendErrorMessage(error), "error");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const editCredit = (credit) => {
        if (credit.creditDecision === 'GRANTED' || credit.creditDecision === 'REFUSED') {
            return showPopup(t('validation.alreadyTreated'), "error");
        }
        setAmount(credit.amount.toString());
        setCreditDate(credit.creditDate);
        setInterestRate(credit.interestRate.toString());
        if (credit.member && credit.member.id) {
            setSelectedMemberId(credit.member.id.toString());
        }
        setEditingCreditId(credit.id);
        setModalVisible(true);
    };

    const confirmDeleteCredit = (credit) => {
        if (credit.creditDecision === 'GRANTED' || credit.creditDecision === 'REFUSED') {
            return showPopup(t('validation.alreadyTreatedDelete'), "error");
        }
        setCreditToDelete(credit);
        setConfirmDeleteVisible(true);
    };

    const performDeleteCredit = async () => {
        if (!creditToDelete) return;
        
        const creditId = creditToDelete.id;
        const memberName = creditToDelete.member 
            ? `${creditToDelete.member.firstname} ${creditToDelete.member.lastname}` 
            : `ID ${creditId}`;

        try {
            await axios.delete(`${CREDITS_API}/${creditId}`);
            loadData();
            showPopup(`${t('messages.creditDeleted')} ${memberName}`, "success");
        } catch (error) {
            console.error("Erreur de suppression:", error);
            showPopup(getBackendErrorMessage(error), "error");
        } finally {
            setCreditToDelete(null);
            setConfirmDeleteVisible(false);
        }
    };

    const viewCredit = (item) => {
        const memberName = item.member 
            ? `${item.member.firstname} ${item.member.lastname}` 
            : `ID ${item.memberId}`;
            
        const totalAmount = item.totalAmountToPay ? item.totalAmountToPay.toLocaleString('fr-FR') : 'N/A';
        
        showPopup(
            `💰 ${t('amount')}: ${item.amount.toLocaleString('fr-FR')} FBu
📅 ${t('date')}: ${item.creditDate}
📊 ${t('interestRate')}: ${item.interestRate}%
💰 ${t('totalAmount')}: ${totalAmount} FBu
🏷️ ${t('status')}: ${getStatusLabel(item.creditDecision)}
👤 ${t('member')}: ${memberName}`,
            "success"
        );
    };
    
    // --- Fonctionnalité de Traitement ---
    const openTreatmentModal = (credit) => {
        if (credit.creditDecision === 'GRANTED' || credit.creditDecision === 'REFUSED') {
            return showPopup(t('validation.alreadyTreatedProcess'), "error");
        }
        setCreditToTreat(credit);
        setSelectedDecision(DECISION_OPTIONS.find(d => d.value === 'GRANTED' || d.value === 'REFUSED') ? 'GRANTED' : DECISION_OPTIONS[0].value);
        setTreatmentModalVisible(true);
    };
    
    const processCreditTreatment = async () => {
        if (!creditToTreat || !selectedDecision) return;
        
        const creditId = creditToTreat.id;
        
        const payload = {
            creditId: creditId,
            decision: selectedDecision,
        };
        
        setIsSubmitting(true);
        
        try {
            await axios.post(CREDIT_TREATMENT_API, payload);
            
            const decisionLabel = DECISION_OPTIONS.find(d => d.value === selectedDecision).label;
            showPopup(`${t('messages.creditProcessed')} #${creditId} : ${decisionLabel}`, "success");
            
            setTreatmentModalVisible(false);
            setCreditToTreat(null);
            loadData();
            
        } catch (error) {
            console.error("Erreur de traitement du crédit:", error);
            showPopup(getBackendErrorMessage(error), "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const CreditItem = ({ item }) => {
        const memberName = item.member 
            ? `${item.member.firstname} ${item.member.lastname}` 
            : `ID Inconnu (${item.memberId || 'N/A'})`;
        
        const statusColor = item.creditDecision === 'IN_TREATMENT' 
            ? 'orange' 
            : item.creditDecision === 'GRANTED' 
            ? 'green' 
            : item.creditDecision === 'REFUSED'
            ? 'red'
            : 'gray';

        const isTreated = item.creditDecision === 'GRANTED' || item.creditDecision === 'REFUSED';
        const showTreatButton = item.creditDecision === 'IN_TREATMENT';
        
        const actionJustificationStyle = isTreated 
            ? { justifyContent: 'flex-end' } 
            : { justifyContent: 'space-around' };

        return (
            <View style={styles.tableRow}>
                <Text style={[styles.cellText, styles.cellMember]}>{memberName}</Text>
                <Text style={[styles.cellText, styles.cellAmount]}>{item.amount ? item.amount.toLocaleString('fr-FR') : '0'} FBu</Text>
                <Text style={[styles.cellText, styles.cellStatus, { color: statusColor, fontWeight: 'bold' }]}>
                    {getStatusLabel(item.creditDecision) || 'N/A'}
                </Text>
                <View style={[styles.cellActions, actionJustificationStyle]}>
                    {showTreatButton && (
                        <TouchableOpacity onPress={() => openTreatmentModal(item)}>
                            <FontAwesome name="hourglass-start" size={22} color="#008CBA" /> 
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => viewCredit(item)}>
                        <MaterialIcons name="info" size={22} color="#004080" />
                    </TouchableOpacity>
                    {!isTreated && (
                        <TouchableOpacity onPress={() => editCredit(item)}>
                            <MaterialIcons name="edit" size={22} color="#FFA500" /> 
                        </TouchableOpacity>
                    )}
                    {!isTreated && (
                        <TouchableOpacity onPress={() => confirmDeleteCredit(item)}>
                            <MaterialIcons name="delete" size={22} color="#FF0000" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            
            {/* Bouton ajouter crédit (Demande) */}
            <TouchableOpacity 
                style={styles.addButton} 
                onPress={() => {
                    resetForm();
                    setModalVisible(true);
                }}
                disabled={popupVisible || treatmentModalVisible || confirmDeleteVisible}
            >
                <Text style={styles.addButtonText}>➕ {t('requestCredit')}</Text>
            </TouchableOpacity>

            {/* Liste des crédits */}
            {loadingData ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#004080" />
                    <Text style={{ marginTop: 10 }}>{t('loadingCredits')}</Text>
                </View>
            ) : credits.length > 0 ? (
                <View style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.headerText, styles.headerMember]}>{t('member')}</Text>
                        <Text style={[styles.headerText, styles.headerAmount]}>{t('amount')}</Text>
                        <Text style={[styles.headerText, styles.headerStatus]}>{t('status')}</Text>
                        <Text style={[styles.headerText, styles.headerActions]}>{t('actions')}</Text>
                    </View>
                    <FlatList
                        data={credits}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={CreditItem}
                    />
                </View>
            ) : (
                <Text style={styles.emptyText}>{t('noCredits')}</Text>
            )}

            {/* MODALE D'AJOUT/MODIFICATION DE CRÉDIT */}
            <Modal 
                animationType="slide" 
                transparent 
                visible={modalVisible && !popupVisible && !treatmentModalVisible && !confirmDeleteVisible}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            {editingCreditId ? t('editCredit') : t('saveCredit')}
                        </Text>
                        <ScrollView>
                            <Text style={styles.label}>{t('member')}</Text>
                            <View style={styles.pickerContainer}>
                                {loadingData && members.length === 0 ? (
                                    <ActivityIndicator size="small" color="#004080" style={{height: 40}} />
                                ) : members.length > 0 ? (
                                    <Picker
                                        selectedValue={selectedMemberId}
                                        onValueChange={(itemValue) => setSelectedMemberId(itemValue)}
                                        style={styles.picker}
                                        enabled={!isSubmitting}
                                    >
                                        {members.map((member) => (
                                            <Picker.Item 
                                                key={member.id} 
                                                label={member.name} 
                                                value={member.id}  
                                            />
                                        ))}
                                    </Picker>
                                ) : (
                                    <Text style={styles.emptyText}>{t('noMembers')}</Text>
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

                            <Text style={styles.label}>{t('interestRate')}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t('enterInterestRate')}
                                keyboardType="numeric"
                                value={interestRate}
                                onChangeText={setInterestRate}
                                editable={!isSubmitting}
                            />

                            <Text style={styles.label}>{t('date')}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t('enterDate')}
                                value={creditDate}
                                onChangeText={setCreditDate}
                                editable={!isSubmitting}
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity 
                                    style={styles.saveButton} 
                                    onPress={saveCredit}
                                    disabled={isSubmitting || members.length === 0}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>
                                            {editingCreditId ? t('edit') : t('save')}
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

            {/* MODALE DE TRAITEMENT DU CRÉDIT */}
            <Modal 
                animationType="slide" 
                transparent 
                visible={treatmentModalVisible && !popupVisible && !confirmDeleteVisible}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            {t('processCredit')} {creditToTreat?.id}
                        </Text>
                        
                        <Text style={styles.label}>
                            {t('decision')} {creditToTreat?.member?.firstname} {creditToTreat?.member?.lastname}
                        </Text>
                        
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={selectedDecision}
                                onValueChange={(itemValue) => setSelectedDecision(itemValue)}
                                style={styles.picker}
                                enabled={!isSubmitting}
                            >
                                {DECISION_OPTIONS.map((option) => (
                                    <Picker.Item 
                                        key={option.value} 
                                        label={option.label} 
                                        value={option.value}  
                                    />
                                ))}
                            </Picker>
                        </View>
                        
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={[styles.saveButton, {backgroundColor: '#1E90FF'}]} 
                                onPress={processCreditTreatment}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>{t('decision')}</Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => {
                                    setTreatmentModalVisible(false);
                                    setCreditToTreat(null);
                                }}
                                disabled={isSubmitting}
                            >
                                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                            </TouchableOpacity>
                        </View>
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
                            {t('deleteConfirmationText')} ?
                        </Text>
                        <View style={{ flexDirection: "row", justifyContent: "space-around", width: "100%" }}>
                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: "#ccc", flex: 1, marginRight: 5 }]}
                                onPress={() => setConfirmDeleteVisible(false)}
                            >
                                <Text style={styles.saveButtonText}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: "#FF0000", flex: 1, marginLeft: 5 }]}
                                onPress={performDeleteCredit}
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
    
    headerAmount: { flex: 1.5, textAlign: "center" },
    cellAmount: { flex: 1.5, textAlign: "center" },

    headerStatus: { flex: 1.5, textAlign: "center" },
    cellStatus: { flex: 1.5, textAlign: "center" },

    headerActions: { flex: 2, textAlign: "right" },
    cellActions: { 
        flex: 2, 
        flexDirection: "row", 
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