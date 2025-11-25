import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";

// --- CONSTANTES ---
const PRIMARY_COLOR = "#4C1C8A";

// --- TRADUCTIONS MULTILINGUES ---
const translations = {
  fr: {
    members: "Membres",
    addMember: "Ajouter un membre",
    editMember: "Modifier un membre",
    saveMember: "Enregistrer un membre",
    firstName: "Prénom",
    lastName: "Nom de Famille",
    phoneNumber: "Numéro de Téléphone",
    numberOfShares: "Nombre d'Actions (Parts)",
    enterFirstName: "Entrer le prénom",
    enterLastName: "Entrer le nom de famille",
    enterPhoneNumber: "+257XXXXXXXX",
    enterNumberOfShares: "Entrer le nombre d'actions",
    save: "💾 Enregistrer",
    edit: "💾 Modifier",
    cancel: "Annuler",
    delete: "Supprimer",
    viewDetails: "Voir les détails",
    confirmDelete: "Confirmation de suppression",
    deleteConfirmationText: "Êtes-vous sûr de vouloir supprimer le membre",
    loadingMembers: "Chargement des membres...",
    noMembers: "Aucun membre enregistré",
    name: "Nom et Prénom",
    phone: "Téléphone",
    actions: "Actions",
    memberDetails: "Détails du membre",
    close: "Fermer",
    validation: {
      firstNameRequired: "Le prénom est requis.",
      lastNameRequired: "Le nom est requis.",
      phoneRequired: "Le numéro de téléphone est incomplet.",
      sharesRequired: "Le nombre d'actions doit être un nombre positif."
    },
    messages: {
      memberAdded: "Le membre a été ajouté avec succès.",
      memberUpdated: "Le membre a été modifié avec succès.",
      memberDeleted: "Le membre a été supprimé.",
      connectionError: "Erreur de connexion. Impossible de charger les données.",
      error: "Erreur"
    }
  },
  en: {
    members: "Members",
    addMember: "Add a member",
    editMember: "Edit a member",
    saveMember: "Save a member",
    firstName: "First Name",
    lastName: "Last Name",
    phoneNumber: "Phone Number",
    numberOfShares: "Number of Shares",
    enterFirstName: "Enter first name",
    enterLastName: "Enter last name",
    enterPhoneNumber: "+257XXXXXXXX",
    enterNumberOfShares: "Enter number of shares",
    save: "💾 Save",
    edit: "💾 Edit",
    cancel: "Cancel",
    delete: "Delete",
    viewDetails: "View details",
    confirmDelete: "Delete confirmation",
    deleteConfirmationText: "Are you sure you want to delete the member",
    loadingMembers: "Loading members...",
    noMembers: "No members registered",
    name: "Name",
    phone: "Phone",
    actions: "Actions",
    memberDetails: "Member details",
    close: "Close",
    validation: {
      firstNameRequired: "First name is required.",
      lastNameRequired: "Last name is required.",
      phoneRequired: "Phone number is incomplete.",
      sharesRequired: "Number of shares must be a positive number."
    },
    messages: {
      memberAdded: "Member added successfully.",
      memberUpdated: "Member updated successfully.",
      memberDeleted: "Member deleted.",
      connectionError: "Connection error. Unable to load data.",
      error: "Error"
    }
  },
  kdi: {
    members: "Abanywanyi",
    addMember: "Umu nywanyi Mushasha",
    editMember: "Hindura Umunywanyi",
    saveMember: "Emeza Umunywanyi",
    firstName: "Izina",
    lastName: "Iritazirano",
    phoneNumber: "Numero Ya Telephone",
    numberOfShares: "Igitiri C'Imitahe",
    enterFirstName: "Ak: NDIHOKUBWAYO",
    enterLastName: "aK: Eric",
    enterPhoneNumber: "+257XXXXXXXX",
    enterNumberOfShares: "Ak: 5",
    save: "💾 Emeza",
    edit: "💾 Hindura",
    cancel: "Hagarika",
    delete: "Gufuta",
    viewDetails: "Raba Ibisobanuro",
    confirmDelete: "Gusiba Umunyamuryango",
    deleteConfirmationText: "Urazi neza ko ushaka gusiba umunyamuryango",
    loadingMembers: "Kurondera Abanyamuryango...",
    noMembers: "Nta Munyamuryango Warondetse",
    name: "Amazina",
    phone: "Amaguru",
    actions: "Imitahe",
    memberDetails: "Ibisobanuro Ku Munyamuryango",
    close: "Funga",
    validation: {
      firstNameRequired: "Izina Ry'Umukuru Rirakenewe.",
      lastNameRequired: "Irango Ry'Umuryango Rirakenewe.",
      phoneRequired: "Numero Y'Amaguru Ntihagutse.",
      sharesRequired: "Umubare W'Ingingo Ugomba Kuba Umubare Mwiza."
    },
    messages: {
      memberAdded: "Umunyamuryango Yashiriwe Neza.",
      memberUpdated: "Umunyamuryango Yahinduwe Neza.",
      memberDeleted: "Umunyamuryango Yasibwe.",
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

const API_URL = "https://ziganya.onrender.com/ziganya-managment-system/api/v1/members";
// const API_URL = "http://localhost:8001/ziganya-managment-system/api/v1/members";

// Fonction utilitaire pour extraire le message d'erreur du backend
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

export default function MembersScreen({ navigation, route }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [members, setMembers] = useState([]);
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+257");
  const [manyOfActions, setManyOfActions] = useState("");
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState(route.params?.currentLanguage || 'fr');

  // Pop-up messages succès/erreur
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success"); // success | error

  // Pop-up confirmation suppression
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

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
      title: t('members'),
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

  // Afficher pop-up personnalisé
  const showPopup = (message, type = "success") => {
    setPopupMessage(message);
    setPopupType(type);
    setPopupVisible(true);
    setTimeout(() => setPopupVisible(false), type === "view_detail" ? 5000 : 3500);
  };

  // Fonction de réinitialisation complète du formulaire
  const resetForm = () => {
    setFirstname("");
    setLastname("");
    setPhoneNumber("+257");
    setManyOfActions("");
    setEditingMemberId(null);
  };

  // CORRECTION : Retirer t des dépendances pour éviter la boucle infinie
  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL);
      setMembers(response.data);
    } catch (error) {
      console.error("Erreur de chargement des membres:", error);
      // Utiliser directement la traduction française comme fallback
      showPopup("Erreur de connexion. Impossible de charger les données.", "error");
    } finally {
      setIsLoading(false);
    }
  }, []); // ← Retirer t de ici

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Ajouter ou modifier un membre
  const saveMember = async () => {
    if (!firstname.trim()) return showPopup(t('validation.firstNameRequired'), "error");
    if (!lastname.trim()) return showPopup(t('validation.lastNameRequired'), "error");
    if (!phoneNumber.trim() || phoneNumber.length < 5) return showPopup(t('validation.phoneRequired'), "error");

    const parsedManyOfActions = Number(manyOfActions);
    if (isNaN(parsedManyOfActions) || parsedManyOfActions <= 0) {
      return showPopup(t('validation.sharesRequired'), "error");
    }

    const memberData = {
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      phoneNumber: phoneNumber.trim(),
      manyOfActions: parsedManyOfActions,
    };

    setIsSubmitting(true);
    try {
      if (editingMemberId) {
        await axios.put(`${API_URL}/${editingMemberId}`, memberData);
        showPopup(t('messages.memberUpdated'), "success");
      } else {
        await axios.post(API_URL, memberData);
        showPopup(t('messages.memberAdded'), "success");
      }
      setModalVisible(false);
      resetForm();
      fetchMembers();
    } catch (error) {
      console.error("Erreur d'enregistrement:", error);
      showPopup(getBackendErrorMessage(error), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Préparer confirmation suppression
  const confirmDeleteMember = (member) => {
    setMemberToDelete(member);
    setConfirmDeleteVisible(true);
  };

  // Supprimer le membre après confirmation
  const performDeleteMember = async () => {
    if (!memberToDelete) return;
    const memberId = memberToDelete.id;
    try {
      await axios.delete(`${API_URL}/${memberId}`);
      fetchMembers();
      showPopup(`${t('messages.memberDeleted')} ${memberToDelete.firstname} ${memberToDelete.lastname}`, "success");
    } catch (error) {
      console.error("Erreur de suppression:", error);
      showPopup(getBackendErrorMessage(error), "error");
    } finally {
      setMemberToDelete(null);
      setConfirmDeleteVisible(false);
    }
  };

  // Préparer l'édition
  const editMember = (member) => {
    setFirstname(member.firstname);
    setLastname(member.lastname);
    setPhoneNumber(member.phoneNumber);
    setManyOfActions(member.manyOfActions.toString());
    setEditingMemberId(member.id);
    setModalVisible(true);
  };

  // Voir les détails
  const viewMember = (member) => {
    showPopup(
      `👤 ${t('name')}: ${member.firstname} ${member.lastname}\n📞 ${t('phone')}: ${member.phoneNumber}\n🔢 ${t('actions')}: ${member.manyOfActions}`,
      "view_detail"
    );
  };

  const MemberItem = ({ item }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.cellText, { flex: 2, textAlign: 'left', paddingLeft: 5 }]}>
        {item.lastname} {item.firstname}
      </Text>
      <Text style={[styles.cellText, { flex: 2 }]}>{item.phoneNumber}</Text>
      <View style={[styles.cellActions, { flex: 1.5 }]}>
        <TouchableOpacity onPress={() => viewMember(item)}>
          <MaterialIcons name="info" size={22} color="#004080" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => editMember(item)}>
          <MaterialIcons name="edit" size={22} color="#FFA500" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => confirmDeleteMember(item)}>
          <MaterialIcons name="delete" size={22} color="#FF0000" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Pop-up confirmation suppression */}
      <Modal visible={confirmDeleteVisible} transparent animationType="fade">
        <View style={styles.popupOverlay}>
          <View style={[styles.popupBox, { borderTopColor: "orange", borderTopWidth: 6 }]}>
            <Text style={styles.popupText}>
              {t('deleteConfirmationText')} {memberToDelete?.firstname} {memberToDelete?.lastname} ?
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
                onPress={performDeleteMember}
              >
                <Text style={styles.saveButtonText}>{t('delete')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bouton ajouter membre */}
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>➕ {t('addMember')}</Text>
      </TouchableOpacity>

      {/* Modal ajout/modif */}
      <Modal animationType="slide" transparent visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {editingMemberId ? t('editMember') : t('saveMember')}
            </Text>
            <ScrollView>
              <Text style={styles.label}>{t('firstName')}</Text>
              <TextInput 
                style={styles.input} 
                placeholder={t('enterFirstName')}
                value={firstname} 
                onChangeText={setFirstname}
                editable={!isSubmitting}
              />
              
              <Text style={styles.label}>{t('lastName')}</Text>
              <TextInput 
                style={styles.input} 
                placeholder={t('enterLastName')}
                value={lastname} 
                onChangeText={setLastname}
                editable={!isSubmitting}
              />
              
              <Text style={styles.label}>{t('phoneNumber')}</Text>
              <TextInput 
                style={styles.input} 
                placeholder={t('enterPhoneNumber')}
                keyboardType="phone-pad"
                value={phoneNumber} 
                onChangeText={setPhoneNumber}
                editable={!isSubmitting}
              />
              
              <Text style={styles.label}>{t('numberOfShares')}</Text>
              <TextInput 
                style={styles.input} 
                placeholder={t('enterNumberOfShares')}
                keyboardType="numeric"
                value={manyOfActions} 
                onChangeText={setManyOfActions}
                editable={!isSubmitting}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.saveButton} 
                  onPress={saveMember}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {editingMemberId ? t('edit') : t('save')}
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

      {/* Liste des membres */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#004080" />
          <Text style={{ marginTop: 10 }}>{t('loadingMembers')}</Text>
        </View>
      ) : members.length > 0 ? (
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, { flex: 2, textAlign: 'left', paddingLeft: 5 }]}>
              {t('name')}
            </Text>
            <Text style={[styles.headerText, { flex: 2 }]}>
              {t('phone')}
            </Text>
            <Text style={[styles.headerText, { flex: 1.5 }]}>
              {t('actions')}
            </Text>
          </View>
          <FlatList 
            data={members} 
            keyExtractor={(item) => item.id.toString()} 
            renderItem={MemberItem} 
          />
        </View>
      ) : (
        <Text style={styles.emptyText}>{t('noMembers')}</Text>
      )}

      {/* Pop-up message */}
      <Modal 
        visible={popupVisible} 
        transparent 
        animationType="fade" 
        onRequestClose={() => setPopupVisible(false)}
      >
        <View style={styles.popupOverlay}>
          <View style={[
            styles.popupBox,
            popupType === "error" ? styles.popupError : 
            popupType === "view_detail" ? styles.popupInfo : 
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

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#E0F3FF"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50
  },
  addButton: {
    backgroundColor: "#004080",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16
  },
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
    maxHeight: "95%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#004080",
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "#004080",
    marginTop: 5
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10
  },
  saveButton: {
    backgroundColor: "#004080",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold"
  },
  cancelButton: {
    backgroundColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },
  cancelButtonText: {
    fontWeight: "bold"
  },
  tableContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    flex: 1
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#004080",
    padding: 10
  },
  headerText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center"
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingVertical: 12,
    paddingHorizontal: 5,
    alignItems: "center",
    backgroundColor: '#fff',
  },
  cellText: {
    fontSize: 14,
    color: "#333",
    textAlign: 'center'
  },
  cellActions: {
    flexDirection: "row",
    justifyContent: "space-around"
  },
  emptyText: {
    textAlign: "center",
    color: "#555",
    marginTop: 30,
    fontStyle: "italic"
  },
  popupOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 9999,
    elevation: 10,
  },
  popupBox: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  popupError: {
    borderTopWidth: 6,
    borderTopColor: "#FF0000"
  },
  popupSuccess: {
    borderTopWidth: 6,
    borderTopColor: "#00C851"
  },
  popupInfo: {
    borderTopWidth: 6,
    borderTopColor: "#004080"
  },
  popupText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    color: '#333'
  },
  closeText: {
    color: "#004080",
    fontWeight: "bold"
  },
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