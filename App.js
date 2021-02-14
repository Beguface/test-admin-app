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
  const [token, setToken] = useState(null);

  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('Message handled in the background!', remoteMessage);
  });

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
      getFcmToken();
      if (token) {
        try {
          await fetch('https://test-admin-frontend.vercel.app/api', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token,
            }),
          });
        } catch (error) {
          console.error(error);
        }
      }
      console.log('Authorization status:', authStatus);
    }
  };

  const getFcmToken = async () => {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      setToken(fcmToken);
    }
  };

  // firebase push notification
  useEffect(() => {
    requestUserPermission();
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log(remoteMessage.notification.body);
      const {
        notification: {body},
      } = remoteMessage;
      Alert.alert('A new message arrived!', body);
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

  //handles

  const handleDynamicLink = (link) => {
    if (link) {
      const name = link.url.replace(
        'https://test-admin-frontend.vercel.app/',
        '',
      );
      setUser(name);
    }
  };

  const handleSendNotification = async () => {
    if (user !== 'No one :(') {
      try {
        await fetch(
          'https://test-admin-frontend.vercel.app/api/users/notifications',
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user,
            }),
          },
        );
      } catch (error) {
        console.error(error);
      }
    }
  };

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
              <Button
                title="SEND NOTIFICATION"
                disabled={user === 'No one :('}
                onPress={handleSendNotification}
              />
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
    flexDirection: 'column',
    justifyContent: 'center',
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
