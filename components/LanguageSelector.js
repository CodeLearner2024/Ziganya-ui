import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { getAvailableLanguages } from '../locales';

const PRIMARY_COLOR = "#4C1C8A";

const LanguageSelector = ({ compact = false }) => {
  const { language, changeLanguage } = useLanguage();
  const [showSelector, setShowSelector] = useState(false);
  const languages = getAvailableLanguages();

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    setShowSelector(false);
  };

  if (compact) {
    return (
      <View style={styles.languageContainer}>
        <TouchableOpacity 
          style={styles.languageButtonCompact}
          onPress={() => setShowSelector(!showSelector)}
        >
          <Text style={styles.languageButtonTextCompact}>
            {language.toUpperCase()}
          </Text>
          <MaterialIcons 
            name={showSelector ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
            size={16} 
            color={PRIMARY_COLOR} 
          />
        </TouchableOpacity>

        {showSelector && (
          <View style={styles.languageDropdown}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  language === lang.code && styles.languageOptionSelected
                ]}
                onPress={() => handleLanguageChange(lang.code)}
              >
                <Text style={[
                  styles.languageOptionText,
                  language === lang.code && styles.languageOptionTextSelected
                ]}>
                  {lang.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.languageContainerFull}>
      <Text style={styles.languageLabel}>Langue:</Text>
      {languages.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.languageButtonFull,
            language === lang.code && styles.languageButtonFullSelected
          ]}
          onPress={() => handleLanguageChange(lang.code)}
        >
          <Text style={[
            styles.languageButtonTextFull,
            language === lang.code && styles.languageButtonTextFullSelected
          ]}>
            {lang.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  languageContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  languageButtonCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
    minWidth: 60,
    justifyContent: 'space-between',
  },
  languageButtonTextCompact: {
    fontSize: 12,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginRight: 4,
  },
  languageDropdown: {
    position: 'absolute',
    top: 35,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 120,
  },
  languageOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  languageOptionSelected: {
    backgroundColor: PRIMARY_COLOR + '20',
  },
  languageOptionText: {
    fontSize: 12,
    color: '#333',
  },
  languageOptionTextSelected: {
    color: PRIMARY_COLOR,
    fontWeight: 'bold',
  },
  languageContainerFull: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  languageLabel: {
    fontSize: 14,
    color: '#333',
    marginRight: 10,
  },
  languageButtonFull: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 4,
  },
  languageButtonFullSelected: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  languageButtonTextFull: {
    fontSize: 12,
    color: '#333',
  },
  languageButtonTextFullSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default LanguageSelector;