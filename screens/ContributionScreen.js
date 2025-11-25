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
    contributions: "Contributions",
    addContribution: "Ajouter une contribution",
    editContribution: "Modifier la contribution",
    saveContribution: "Enregistrer une contribution",
    member: "Membre",
    amount: "Montant (FBu)",
    description: "Description",
    month: "Mois",
    contributionType: "Type de Contribution",
    date: "Date (AAAA-MM-JJ)",
    enterAmount: "Ex: 48000",
    enterDescription: "Description de la transaction (facultatif)",
    enterDate: "AAAA-MM-JJ",
    save: "💾 Enregistrer",
    edit: "💾 Modifier",
    cancel: "Annuler",
    delete: "Supprimer",
    viewDetails: "Voir les détails",
    confirmDelete: "Confirmation de suppression",
    deleteConfirmationText: "Êtes-vous sûr de vouloir supprimer cette contribution",
    loadingContributions: "Chargement des contributions...",
    noContributions: "Aucune contribution enregistrée",
    noMembers: "Aucun membre trouvé",
    actions: "Actions",
    contributionDetails: "Détails de la contribution",
    close: "Fermer",
    months: {
      JANUARY: "Janvier",
      FEBRUARY: "Février",
      MARCH: "Mars",
      APRIL: "Avril",
      MAY: "Mai",
      JUNE: "Juin",
      JULY: "Juillet",
      AUGUST: "Août",
      SEPTEMBER: "Septembre",
      OCTOBER: "Octobre",
      NOVEMBER: "Novembre",
      DECEMBER: "Décembre"
    },
    contributionStatuses: {
      ACTIVATION_ACCOUNT: "Activation du Compte",
      CONTRIBUTION: "Contribution Mensuelle"
    },
    validation: {
      requiredFields: "Veuillez remplir le membre, le montant, le mois et le type de contribution.",
      amountPositive: "Le montant doit être un nombre positif."
    },
    messages: {
      contributionUpdated: "Contribution modifiée avec succès.",
      contributionAdded: "Contribution enregistrée avec succès.",
      contributionDeleted: "Contribution supprimée.",
      connectionError: "Erreur de connexion. Impossible de charger les données.",
      error: "Erreur"
    }
  },
  en: {
    contributions: "Contributions",
    addContribution: "Add a contribution",
    editContribution: "Edit contribution",
    saveContribution: "Save a contribution",
    member: "Member",
    amount: "Amount (FBu)",
    description: "Description",
    month: "Month",
    contributionType: "Contribution Type",
    date: "Date (YYYY-MM-DD)",
    enterAmount: "Ex: 48000",
    enterDescription: "Transaction description (optional)",
    enterDate: "YYYY-MM-DD",
    save: "💾 Save",
    edit: "💾 Edit",
    cancel: "Cancel",
    delete: "Delete",
    viewDetails: "View details",
    confirmDelete: "Delete confirmation",
    deleteConfirmationText: "Are you sure you want to delete this contribution",
    loadingContributions: "Loading contributions...",
    noContributions: "No contributions registered",
    noMembers: "No members found",
    actions: "Actions",
    contributionDetails: "Contribution details",
    close: "Close",
    months: {
      JANUARY: "January",
      FEBRUARY: "February",
      MARCH: "March",
      APRIL: "April",
      MAY: "May",
      JUNE: "June",
      JULY: "July",
      AUGUST: "August",
      SEPTEMBER: "September",
      OCTOBER: "October",
      NOVEMBER: "November",
      DECEMBER: "December"
    },
    contributionStatuses: {
      ACTIVATION_ACCOUNT: "Account Activation",
      CONTRIBUTION: "Monthly Contribution"
    },
    validation: {
      requiredFields: "Please fill in member, amount, month and contribution type.",
      amountPositive: "Amount must be a positive number."
    },
    messages: {
      contributionUpdated: "Contribution updated successfully.",
      contributionAdded: "Contribution saved successfully.",
      contributionDeleted: "Contribution deleted.",
      connectionError: "Connection error. Unable to load data.",
      error: "Error"
    }
  },
  kdi: {
    contributions: "Inkunga",
    addContribution: "Ongerwa Inkunga",
    editContribution: "Hindura Inkunga",
    saveContribution: "Bika Inkunga",
    member: "Umunyamuryango",
    amount: "Amafaranga (FBu)",
    description: "Ibisobanuro",
    month: "Ukwezi",
    contributionType: "Ubwoko Bw'Inkunga",
    date: "Itariki (AAAA-UU-II)",
    enterAmount: "Urugero: 48000",
    enterDescription: "Ibisobanuro By'Ubucuruzi (Bishoboka)",
    enterDate: "AAAA-UU-II",
    save: "💾 Bika",
    edit: "💾 Hindura",
    cancel: "Hagarika",
    delete: "Siba",
    viewDetails: "Raba Ibisobanuro",
    confirmDelete: "Gusiba Inkunga",
    deleteConfirmationText: "Urazi neza ko ushaka gusiba iyi nkunga",
    loadingContributions: "Kurondera Inkunga...",
    noContributions: "Nta Nkunga Yorondetse",
    noMembers: "Nta Munyamuryango Wabonetse",
    actions: "Imitahe",
    contributionDetails: "Ibisobanuro Ku Nkunga",
    close: "Funga",
    months: {
      JANUARY: "Nzero",
      FEBRUARY: "Ruhuhuma",
      MARCH: "Ntwarante",
      APRIL: "Ndamukiza",
      MAY: "Rusama",
      JUNE: "Ruheshi",
      JULY: "Mukakaro",
      AUGUST: "Myandagaro",
      SEPTEMBER: "Nyakanga",
      OCTOBER: "Gitugutu",
      NOVEMBER: "Munyonyo",
      DECEMBER: "Kigarama"
    },
    contributionStatuses: {
      ACTIVATION_ACCOUNT: "Gutanga Konti",
      CONTRIBUTION: "Inkunga Y'ukwezi"
    },
    validation: {
      requiredFields: "Nyamuneka Uzuze Umunyamuryango, Amafaranga, Ukwezi na Ubwoko Bw'Inkunga.",
      amountPositive: "Amafaranga Agomba Kuba Ayo Mwiza."
    },
    messages: {
      contributionUpdated: "Inkunga Yahinduwe Neza.",
      contributionAdded: "Inkunga Yashiriwe Neza.",
      contributionDeleted: "Inkunga Yasibwe.",
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

// --- Configuration API ---
const API_BASE_URL = "https://ziganya.onrender.com/ziganya-managment-system/api/v1";
// const API_BASE_URL = "http://localhost:8001/ziganya-managment-system/api/v1";

const MEMBERS_API = `${API_BASE_URL}/members`;
const CONTRIBUTIONS_API = `${API_BASE_URL}/contributions`;

// --- Énumération ContributionStatus (Type de Contribution) ---
const CONTRIBUTION_STATUSES = [
    { label: "Activation du Compte", value: "ACTIVATION_ACCOUNT" },
    { label: "Contribution Mensuelle", value: "CONTRIBUTION" },
];

// --- Fonction utilitaire ---
const getBackendErrorMessage = (error) => {
    if (error.response && error.response.data) {
        const data = error.response.data;
        return data.message || data.errorMessage || JSON.stringify(data);
    } else if (error.message) {
        return error.message;
    } else {
        return "Une erreur inconnue est survenue.";
    }
};

const getTodayDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- Composant principal ---
export default function ContributionScreen({ navigation, route }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [contributions, setContributions] = useState([]);
    const [members, setMembers] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState(route.params?.currentLanguage || 'fr');

    // Champs du formulaire
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [selectedMemberId, setSelectedMemberId] = useState("");
    const [contributionDate, setContributionDate] = useState(getTodayDate());
    const [month, setMonth] = useState("JANUARY");
    const [status, setStatus] = useState(CONTRIBUTION_STATUSES[0].value);
    const [editingContributionId, setEditingContributionId] = useState(null);

    // Pop-up messages
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [popupType, setPopupType] = useState("success");

    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const [contributionToDelete, setContributionToDelete] = useState(null);

    // Fonction de traduction
    const t = (key) => {
        const keys = key.split('.');
        let result = translations[currentLanguage];
        keys.forEach(k => {
            result = result?.[k];
        });
        return result ?? key;
    };

    // Fonction pour obtenir le label lisible du statut/type
    const getStatusLabel = (statusValue) => {
        return t(`contributionStatuses.${statusValue}`) || statusValue || 'N/A';
    };

    // Fonction pour obtenir le label du mois
    const getMonthLabel = (monthValue) => {
        return t(`months.${monthValue}`) || monthValue || 'N/A';
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
            title: t('contributions'),
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
        if (type !== "view_detail") {
            setTimeout(() => setPopupVisible(false), 5000);
        }
    };

    const resetForm = () => {
        setAmount("");
        setDescription("");
        setContributionDate(getTodayDate());
        setMonth("JANUARY");
        setStatus(CONTRIBUTION_STATUSES[0].value);
        setEditingContributionId(null);
        if (members.length > 0 && !selectedMemberId) {
            setSelectedMemberId(members[0].id);
        } else if (members.length === 0) {
             setSelectedMemberId("");
        }
    };

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

            const contributionsResponse = await axios.get(CONTRIBUTIONS_API);
            setContributions(contributionsResponse.data);
        } catch (error) {
            console.error("Erreur lors du chargement des données:", error);
            showPopup(t('messages.connectionError'), "error");
        } finally {
            setLoadingData(false);
        }
    }, [selectedMemberId]); // Retirer t des dépendances

    useEffect(() => {
        loadData();
    }, [loadData]);

    const saveContribution = async () => {
        // Validation avant soumission
        if (!selectedMemberId || !amount || !month || !status) {
             return showPopup(t('validation.requiredFields'), "error");
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return showPopup(t('validation.amountPositive'), "error");
        }

        const payload = {
            amount: parsedAmount,
            description: description.trim() || null,
            memberId: parseInt(selectedMemberId),
            contributionDate: contributionDate,
            month: month,
            status: status,
        };

        setIsSubmitting(true);

        try {
            if (editingContributionId) {
                await axios.put(`${CONTRIBUTIONS_API}/${editingContributionId}`, payload);
                showPopup(t('messages.contributionUpdated'), "success");
            } else {
                await axios.post(CONTRIBUTIONS_API, payload);
                showPopup(`${t('messages.contributionAdded')} ${payload.amount.toLocaleString('fr-FR')} FBu`, "success");
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

    const editContribution = (contribution) => {
        setAmount(contribution.amount ? contribution.amount.toString() : "");
        setDescription(contribution.description || "");
        setContributionDate(contribution.contributionDate || getTodayDate());
        setMonth(contribution.month || "JANUARY");
        setStatus(contribution.status || CONTRIBUTION_STATUSES[0].value);
        setSelectedMemberId(contribution.member?.id?.toString() || contribution.memberId?.toString() || "");
        setEditingContributionId(contribution.id);
        setModalVisible(true);
    };

    const confirmDeleteContribution = (contribution) => {
        setContributionToDelete(contribution);
        setConfirmDeleteVisible(true);
    };

    const performDeleteContribution = async () => {
        if (!contributionToDelete) return;
        const contributionId = contributionToDelete.id;
        const memberName = contributionToDelete.member
            ? `${contributionToDelete.member.firstname} ${contributionToDelete.member.lastname}`
            : `ID ${contributionId}`;
        try {
            await axios.delete(`${CONTRIBUTIONS_API}/${contributionId}`);
            loadData();
            showPopup(`${t('messages.contributionDeleted')} ${memberName}`, "success");
        } catch (error) {
            console.error("Erreur de suppression:", error);
            showPopup(getBackendErrorMessage(error), "error");
        } finally {
            setContributionToDelete(null);
            setConfirmDeleteVisible(false);
        }
    };

    const viewContribution = (item) => {
        const memberName = item.member
            ? `${item.member.firstname} ${item.member.lastname}`
            : `ID ${item.memberId}`;

        const detailMessage =
            `👤 ${t('member')}: **${memberName}**\n` +
            `💰 ${t('amount')}: **${item.amount ? item.amount.toLocaleString('fr-FR') : 'N/A'} FBu**\n` +
            `🏷️ ${t('contributionType')}: **${getStatusLabel(item.status)}**\n` +
            `📅 ${t('date')}: ${item.contributionDate || 'N/A'}\n` +
            `🗓 ${t('month')}: ${getMonthLabel(item.month) || 'N/A'}\n` +
            `📝 ${t('description')}: ${item.description || 'N/A'}`;

        showPopup(detailMessage, "view_detail");
    };

    const ContributionItem = ({ item }) => {
        const memberName = item.member
            ? `${item.member.firstname} ${item.member.lastname}`
            : `ID Inconnu (${item.memberId || 'N/A'})`;
        return (
            <View style={styles.tableRow}>
                <Text style={[styles.cellText, { flex: 2, textAlign: 'left', paddingLeft: 5 }]}>{memberName}</Text>
                <Text style={[styles.cellText, { flex: 2 }]}>{item.amount ? item.amount.toLocaleString('fr-FR') : '0'} FBu</Text>
                <View style={[styles.cellActions, { flex: 1.5 }]}>
                    <TouchableOpacity onPress={() => viewContribution(item)}>
                        <MaterialIcons name="info" size={22} color="#004080" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => editContribution(item)}>
                        <MaterialIcons name="edit" size={22} color="#FFA500" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => confirmDeleteContribution(item)}>
                        <MaterialIcons name="delete" size={22} color="#FF0000" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>

            {/* Confirmation suppression */}
            <Modal visible={confirmDeleteVisible} transparent animationType="fade">
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
                                onPress={performDeleteContribution}
                            >
                                <Text style={styles.saveButtonText}>{t('delete')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Bouton ajouter */}
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => { resetForm(); setSelectedMemberId(members.length > 0 ? members[0].id : ""); setModalVisible(true); }}
                disabled={members.length === 0 && !loadingData}
            >
                <Text style={styles.addButtonText}>➕ {t('addContribution')}</Text>
            </TouchableOpacity>

            {/* Modal ajout/modif */}
            <Modal animationType="slide" transparent visible={modalVisible}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            {editingContributionId ? t('editContribution') : t('saveContribution')}
                        </Text>
                        <ScrollView>
                            {/* Membre */}
                            <Text style={styles.label}>{t('member')} *</Text>
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

                            {/* Montant */}
                            <Text style={styles.label}>{t('amount')} *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t('enterAmount')}
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                                editable={!isSubmitting}
                            />

                            {/* Description */}
                            <Text style={styles.label}>{t('description')}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t('enterDescription')}
                                value={description}
                                onChangeText={setDescription}
                                editable={!isSubmitting}
                            />

                            {/* Mois */}
                            <Text style={styles.label}>{t('month')} *</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={month}
                                    onValueChange={(value) => setMonth(value)}
                                    style={styles.picker}
                                    enabled={!isSubmitting}
                                >
                                    {["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"].map(m => (
                                        <Picker.Item key={m} label={getMonthLabel(m)} value={m} />
                                    ))}
                                </Picker>
                            </View>

                            {/* Type de Contribution (Status) */}
                            <Text style={styles.label}>{t('contributionType')} *</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={status}
                                    onValueChange={(value) => setStatus(value)}
                                    style={styles.picker}
                                    enabled={!isSubmitting}
                                >
                                    {CONTRIBUTION_STATUSES.map((s) => (
                                        <Picker.Item key={s.value} label={getStatusLabel(s.value)} value={s.value} />
                                    ))}
                                </Picker>
                            </View>

                            {/* Date */}
                            <Text style={styles.label}>{t('date')} *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t('enterDate')}
                                value={contributionDate}
                                onChangeText={setContributionDate}
                                editable={!isSubmitting}
                            />

                            {/* Boutons */}
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={styles.saveButton}
                                    onPress={saveContribution}
                                    disabled={isSubmitting || members.length === 0}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.saveButtonText}>
                                            {editingContributionId ? t('edit') : t('save')}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => { setModalVisible(false); resetForm(); }}
                                    disabled={isSubmitting}
                                >
                                    <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Liste */}
            {loadingData ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#004080" />
                    <Text style={{ marginTop: 10 }}>{t('loadingContributions')}</Text>
                </View>
            ) : contributions.length > 0 ? (
                <View style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.headerText, { flex: 2, textAlign: 'left', paddingLeft: 5 }]}>{t('member')}</Text>
                        <Text style={[styles.headerText, { flex: 2 }]}>{t('amount')}</Text>
                        <Text style={[styles.headerText, { flex: 1.5 }]}>{t('actions')}</Text>
                    </View>
                    <FlatList
                        data={contributions}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={ContributionItem}
                    />
                </View>
            ) : (
                <Text style={styles.emptyText}>{t('noContributions')}</Text>
            )}

            {/* Pop-up message */}
            <Modal visible={popupVisible} transparent animationType="fade" onRequestClose={() => setPopupVisible(false)}>
                <View style={styles.popupOverlay}>
                    <View style={[
                        styles.popupBox,
                        popupType === "error" ? styles.popupError :
                        popupType === "view_detail" ? { backgroundColor: "#fff", borderTopColor: "#004080", borderTopWidth: 6 } :
                        styles.popupSuccess,
                    ]}>
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

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#E0F3FF" },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    addButton: { backgroundColor: "#004080", padding: 15, borderRadius: 10, alignItems: "center", marginBottom: 20 },
    addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
    modalContainer: { width: "90%", backgroundColor: "#fff", borderRadius: 10, padding: 20, maxHeight: "95%" },
    modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center", color: "#004080" },
    label: { fontWeight: "bold", marginBottom: 5, color: "#004080", marginTop: 10 },
    input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 15, backgroundColor: '#fff' },
    pickerContainer: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginBottom: 15, overflow: 'hidden', backgroundColor: '#fff' },
    picker: { height: 40, width: '100%' },
    modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 10, marginBottom: 10 },
    saveButton: { backgroundColor: "#004080", padding: 12, borderRadius: 8, flex: 1, marginRight: 5, alignItems: "center" },
    saveButtonText: { color: "#fff", fontWeight: "bold" },
    cancelButton: { backgroundColor: "#ccc", padding: 12, borderRadius: 8, flex: 1, marginLeft: 5, alignItems: "center" },
    cancelButtonText: { fontWeight: "bold" },
    tableContainer: { backgroundColor: "#fff", borderRadius: 10, overflow: "hidden", flex: 1 },
    tableHeader: { flexDirection: "row", backgroundColor: "#004080", padding: 10 },
    headerText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
    tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f0f0f0", paddingVertical: 12, paddingHorizontal: 5, backgroundColor: '#fff' },
    cellText: { fontSize: 14, color: "#333", textAlign: 'center' },
    cellActions: { flexDirection: "row", justifyContent: "space-around" },
    emptyText: { textAlign: "center", color: "#555", marginTop: 30, fontStyle: "italic" },
    popupOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.4)",
        zIndex: 9999,
        elevation: 10,
    },
    popupBox: { width: "80%", padding: 20, borderRadius: 10, alignItems: "center" },
    popupSuccess: { backgroundColor: "#E0FBE2", borderTopWidth: 6, borderTopColor: "#00C851" },
    popupError: { backgroundColor: "#FFE5E5", borderTopWidth: 6, borderTopColor: "#FF0000" },
    popupText: { fontSize: 16, textAlign: "center", marginBottom: 10, color: "#333" },
    closeText: { fontWeight: "bold", color: "#004080" },
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