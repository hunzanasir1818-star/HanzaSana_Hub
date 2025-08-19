import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; 

//import SignIn from '../screens/Login';
import SplashScreen from '../screens/Splashscreen'; // Ensure the name is correct
import PinPasswordScreen from '../screens/PINPassword';
import LoginPassword from '../screens/LoginPINPassword';
import AudiosRecoveryScreen from '../screens/AudioRecovery';
import PasswordEntryScreen from '../screens/Password';
import VideosRecoveryScreen from '../screens/VideoRecovery';
import LoginPasswordScreen from '../screens/LoginPassword';
import ForgotPasswordScreen from '../screens/ForgotPassword';
//import AllMediaScreen from '../screens/AllMedia';
//import SignUpScreen from '../screens/SignUpScreen';
import Home from "../screens/fileManagement";
import SuccessScreen from '../screens/SuccessScreen'; 
//import RecentsScreen from '../screens/Recents';
import VideoUpload from '../screens/VideoUpload';
import AudioUpload from '../screens/AudioUpload';

import NotificationsScreen from '../screens/Alerts';
//import RemoteLockScreen from '../screens/RemoteLock';
import DataWipeScreen from '../screens/DataWipe';
//import VaultScreen from '../screens/Vault';
//import ChangePinPasswordScreen from '../screens/ChangePinPassword';
import FileRecoveryScreen from '../screens/FileRecovery';
//import CloudSyncScreen from '../screens/CloudSync';
//import SecureSharingScreen from'../screens/SecureSharing';

import HelpAndFeedbackScreen from '../screens/HelpFeedback';
import AboutScreen from '../screens/About';
import LogoutScreen from '../screens/Logout';
 
import { getFirestore } from 'firebase/firestore';
import { firestore_db } from '../Config/FirebaseConfig';


const BaseStack =createNativeStackNavigator();

export default function BaseNavigation() {
  return (
    <NavigationContainer>
      <BaseStack.Navigator>
      <BaseStack.Screen name={"Splash"} component={SplashScreen} options={{ headerShown: false }} />
      {/*<BaseStack.Screen  name={"Login"} component={SignIn}  options={{ title: 'Login' }} />
      <BaseStack.Screen name={"Register"} component={SignUpScreen} options={{ title: 'PINPassword' }} />*/}
      <BaseStack.Screen name={"PinPasswordScreen"} component={PinPasswordScreen} />
      <BaseStack.Screen name={"LoginPINPassword"} component={LoginPassword} options={{ title: 'LoginPINPassword' }}/>
      <BaseStack.Screen name={"Password"} component={PasswordEntryScreen} />
      <BaseStack.Screen name="AudioRecovery" component={AudiosRecoveryScreen} />
      <BaseStack.Screen name={"LoginPassword"} component={LoginPasswordScreen} />
      <BaseStack.Screen name="VideoRecovery" component={VideosRecoveryScreen}  />
      <BaseStack.Screen name={"ForgotPassword"} component={ForgotPasswordScreen} />

      <BaseStack.Screen name={"Success"} component={SuccessScreen}  />
      <BaseStack.Screen name={"fileManagement"} component={Home}  />
      {/*<BaseStack.Screen name={"Recents"} component={RecentsScreen} />*/}
      <BaseStack.Screen name={"VideoUpload"} component={VideoUpload}  />
      <BaseStack.Screen name={"AudioUpload"} component={AudioUpload} />
      <BaseStack.Screen name={"Alerts"} component={NotificationsScreen} />
      {/*<BaseStack.Screen name={"RemoteLock"} component={RemoteLockScreen} />*/}
      <BaseStack.Screen name={"DataWipe"} component={DataWipeScreen} />
     {/*<BaseStack.Screen name='ChangePinPassword' component={ChangePinPasswordScreen}/>*/}
      <BaseStack.Screen name='FileRecovery' component={FileRecoveryScreen}/>
      {/*<BaseStack.Screen name='CloudSync' component={CloudSyncScreen}/>*/}
      {/*<BaseStack.Screen name='SecureSharing' component={SecureSharingScreen}/>*/}
      
      
      <BaseStack.Screen name='Logout' component={LogoutScreen}/>
      <BaseStack.Screen name='About' component={AboutScreen}/>
      <BaseStack.Screen name={"HelpFeedback"} component={HelpAndFeedbackScreen}  />
   

    
    </BaseStack.Navigator>
  </NavigationContainer>
  );
}