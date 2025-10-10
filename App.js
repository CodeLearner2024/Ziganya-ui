import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import MenuScreen from './screens/MenuScreen';
import MembersScreen from './screens/MembersScreen';
// import SettingsScreen from './screens/SettingsScreen'; // nouveau

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
        {/* <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ title: 'Paramètres' }} 
        /> */}
          <Stack.Screen 
          name="Members" 
          component={MembersScreen} 
          options={{ title: 'Members' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
