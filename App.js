import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LanguageProvider } from './context/LanguageContext'; // ✅ Ajout
import HomeScreen from './screens/HomeScreen';
import MenuScreen from './screens/MenuScreen';
import MembersScreen from './screens/MembersScreen';
import DashboardScreen from './screens/DashboardScreen'
import ContributionScreen from './screens/ContributionScreen'
import CreditScreen from './screens/CreditScreen';
import AssociationScreen from './screens/AssociationScreen'
import RefundScreen from './screens/RefundScreen'
import ReportScreen from './screens/ReportScreen'

const Stack = createNativeStackNavigator();

// ✅ Créer un composant Navigation pour utiliser le hook
function Navigation() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Menu" 
        component={MenuScreen} 
        options={{ title: 'Menu' }} // Les titres seront gérés dans chaque écran
      />
      <Stack.Screen 
        name="Members" 
        component={MembersScreen} 
        options={{ title: 'Members' }} 
      />
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen 
        name="Remboursement" 
        component={RefundScreen}
        options={{ title: 'Remboursement' }}
      />
      <Stack.Screen 
        name="Contribution" 
        component={ContributionScreen} 
        options={{ title: 'Contribution' }} 
      />
      <Stack.Screen 
        name="Credit" 
        component={CreditScreen} 
        options={{ title: 'Credit' }} 
      />
      <Stack.Screen 
        name="Parametres" 
        component={AssociationScreen} 
        options={{ title: 'Paramètres' }} 
      />
      <Stack.Screen 
        name="Report" 
        component={ReportScreen}
        options={{ title: 'Report' }} 
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <LanguageProvider> {/* ✅ Encapsulation avec le provider de langue */}
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </LanguageProvider>
  );
}