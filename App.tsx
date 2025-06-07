"use client"

import { useEffect, useRef, useState } from "react"
import { StatusBar } from "expo-status-bar"
import { StyleSheet, ScrollView, Alert, Platform } from "react-native"
import * as Notifications from "expo-notifications"
import * as Device from "expo-device"
import Constants from "expo-constants"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"

import NotificationManager from "./src/components/NotificationManager"
import { NotificationProvider } from "./src/context/NotificationContext"

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState<string>("")
  const notificationListener = useRef<Notifications.Subscription>()
  const responseListener = useRef<Notifications.Subscription>()

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token)
      }
    })

    // Listen for notifications
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification received:", notification)
    })

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification response:", response)
    })

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current)
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current)
      }
    }
  }, [])

  return (
    <SafeAreaProvider>
      <NotificationProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar style="dark" backgroundColor="#95bf47" />
          <ScrollView style={styles.scrollView}>
            <NotificationManager expoPushToken={expoPushToken} />
          </ScrollView>
        </SafeAreaView>
      </NotificationProvider>
    </SafeAreaProvider>
  )
}

async function registerForPushNotificationsAsync() {
  let token

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#95bf47",
    })
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== "granted") {
      Alert.alert("Failed to get push token for push notification!")
      return
    }

    try {
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId
      if (!projectId) {
        throw new Error("Project ID not found")
      }
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data
    } catch (e) {
      token = `${e}`
    }
  } else {
    Alert.alert("Must use physical device for Push Notifications")
  }

  return token
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
})
