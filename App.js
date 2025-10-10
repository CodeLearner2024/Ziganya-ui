import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import MenuScreen from './screens/MenuScreen';
import MembersScreen from './screens/MembersScreen';
import DashboardScreen from './screens/DashboardScreen'
import ContributionScreen from './screens/ContributionScreen'

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Menu" 
          component={MenuScreen} 
          options={{ title: 'Tableau de bord' }} 
        />
    
          <Stack.Screen 
          name="Members" 
          component={MembersScreen} 
          options={{ title: 'Members' }} 
        />

        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
          options={{ title: 'Dashboard' }} // ✅ Ajout de la nouvelle page
        />

        <Stack.Screen 
  name="Contribution" 
  component={ContributionScreen} 
  options={{ title: 'Contribution' }} 
/>
    
      </Stack.Navigator>
    </NavigationContainer>
  );
}
