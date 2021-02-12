/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Button,
  StatusBar,
  Alert,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

import dynamicLinks from '@react-native-firebase/dynamic-links';

import messaging from '@react-native-firebase/messaging';

const App: () => React$Node = () => {
  const [user, setUser] = useState('No one :(');

  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('Message handled in the background!', remoteMessage);
  });

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  };

  const getFcmToken = async () => {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      console.log('Your Firebase Token is:', fcmToken);
    } else {
      console.log('Failed', 'No token received');
    }
  };

  // firebase push notification
  useEffect(() => {
    requestUserPermission();
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });
    return unsubscribe;
  });

  //  firebase dynamic linking listener
  useEffect(() => {
    dynamicLinks()
      .getInitialLink()
      .then((link) => {
        handleDynamicLink(link);
      });
    const linkingListener = dynamicLinks().onLink(handleDynamicLink);
    return () => {
      linkingListener();
    };
  }, []);

  function handleDynamicLink(link) {
    if (link) {
      const name = link.url.replace('https://electricbirdcage.com/', '');
      setUser(name);
    }
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <View style={styles.scrollView}>
          {global.HermesInternal == null ? null : (
            <View style={styles.engine}>
              <Text style={styles.footer}>Engine: Hermes</Text>
            </View>
          )}
          <View style={styles.body}>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>This page is for:</Text>
              <Text style={styles.sectionName}>{user}</Text>
            </View>
            <View style={styles.buttonContainer}>
              <Button title="SEND NOTIFICATION" />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  buttonContainer: {
    marginTop: 32,
    paddingHorizontal: 36,
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionName: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: Colors.black,
  },
});

export default App;
