import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; 

import SplashScreen from './src/screens/Splashscreen'; 
import PinPasswordScreen from './src/screens/PINPassword';
import LoginPassword from './src/screens/LoginPINPassword';
import AudiosRecoveryScreen from './src/screens/AudioRecovery';
import PasswordEntryScreen from './src/screens/Password';
import VideosRecoveryScreen from './src/screens/VideoRecovery';
import LoginPasswordScreen from './src/screens/LoginPassword';
import ForgotPasswordScreen from './src/screens/ForgotPassword';
import Home from "./src/screens/fileManagement";
import SuccessScreen from './src/screens/SuccessScreen'; 
import VideoUpload from './src/screens/VideoUpload';
import AudioUpload from './src/screens/AudioUpload';
import NotificationsScreen from './src/screens/Alerts';
import DataWipeScreen from './src/screens/DataWipe';
import FileRecoveryScreen from './src/screens/FileRecovery';
import HelpAndFeedbackScreen from './src/screens/HelpFeedback';
import AboutScreen from './src/screens/About';
import LogoutScreen from './src/screens/Logout';
import AccountSettingsScreen from './src/screens/Settings';
import FirstScreen from './src/screens/FirstScreen';
import { getFirestore } from 'firebase/firestore';
import { firestore_db } from './src/Config/FirebaseConfig';

const BaseStack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <BaseStack.Navigator>
        <BaseStack.Screen name={"Splash"} component={SplashScreen} options={{ headerShown: false }} />
        <BaseStack.Screen name={"PinPasswordScreen"} component={PinPasswordScreen} />
        <BaseStack.Screen name={"LoginPINPassword"} component={LoginPassword} options={{ title: 'LoginPINPassword' }}/>
        <BaseStack.Screen name={"Password"} component={PasswordEntryScreen} />
        <BaseStack.Screen name={"LoginPassword"} component={LoginPasswordScreen} />
        <BaseStack.Screen name={"ForgotPassword"} component={ForgotPasswordScreen} />
        <BaseStack.Screen name={"Success"} component={SuccessScreen}  />
        <BaseStack.Screen name={"fileManagement"} component={Home}  />
        <BaseStack.Screen name={"VideoUpload"} component={VideoUpload}  />
        <BaseStack.Screen name={"AudioUpload"} component={AudioUpload} />
        <BaseStack.Screen name="VideoRecovery" component={VideosRecoveryScreen}  />
        <BaseStack.Screen name="AudioRecovery" component={AudiosRecoveryScreen} />
        <BaseStack.Screen name={"Alerts"} component={NotificationsScreen} />
        <BaseStack.Screen name={"DataWipe"} component={DataWipeScreen} />
        <BaseStack.Screen name='FileRecovery' component={FileRecoveryScreen}/>
        <BaseStack.Screen name='Logout' component={LogoutScreen}/>
        <BaseStack.Screen name='About' component={AboutScreen}/>
        <BaseStack.Screen name={"HelpFeedback"} component={HelpAndFeedbackScreen}  />
        <BaseStack.Screen name={"Settings"} component={AccountSettingsScreen}  />
        <BaseStack.Screen name={"FirstScreen"} component={FirstScreen}  />

      </BaseStack.Navigator>
    </NavigationContainer>
  );
}
