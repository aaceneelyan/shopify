"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { View, StyleSheet, Alert } from "react-native"
import * as Notifications from "expo-notifications"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { useNotification } from "../context/NotificationContext"
import Header from "./Header"
import StatusCard from "./StatusCard"
import SettingsCard from "./SettingsCard"
import { generateRandomOrder, formatNotificationBody } from "../utils/orderUtils"

interface Props {
  expoPushToken: string
}

const NotificationManager: React.FC<Props> = ({ expoPushToken }) => {
  const {
    settings,
    addToHistory,
    isScheduleActive,
    setIsScheduleActive,
    notificationsEnabled,
    setNotificationsEnabled,
  } = useNotification()

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const notificationCountRef = useRef(0)
  const lastResetDateRef = useRef(new Date().toDateString())

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const showIOSNotification = async (order: any) => {
    const body = formatNotificationBody(settings.customBody, order)

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Order ${order.orderId}`,
          body: body,
          data: {
            orderId: order.orderId,
            amount: order.amount,
            items: order.items,
          },
          sound: true,
          priority: Notifications.AndroidImportance.HIGH,
          sticky: false,
          autoDismiss: false,
        },
        trigger: null, // Show immediately
      })

      addToHistory(order)
    } catch (error) {
      console.error("Error showing notification:", error)
      Alert.alert("Error", "Failed to show notification")
    }
  }

  const enableNotifications = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync()
      if (status === "granted") {
        setNotificationsEnabled(true)
        await AsyncStorage.setItem("notifications-enabled", "true")

        // Send welcome notification
        const welcomeOrder = {
          items: 1,
          amount: "49.99",
          store: settings.storeName,
          timestamp: Date.now(),
          orderId: "#1001",
        }
        await showIOSNotification(welcomeOrder)
      } else {
        Alert.alert("Permission Denied", "Notifications permission was denied")
      }
    } catch (error) {
      console.error("Error enabling notifications:", error)
      Alert.alert("Error", "Failed to enable notifications")
    }
  }

  const disableNotifications = async () => {
    setNotificationsEnabled(false)
    await AsyncStorage.setItem("notifications-enabled", "false")
    stopSchedule()
  }

  const startSchedule = async () => {
    if (!notificationsEnabled) return

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    const currentDate = new Date().toDateString()
    if (lastResetDateRef.current !== currentDate) {
      notificationCountRef.current = 0
      lastResetDateRef.current = currentDate
    }

    const frequencyMinutes = Number.parseInt(settings.frequency)
    const intervalMs = frequencyMinutes * 60 * 1000

    intervalRef.current = setInterval(async () => {
      if (notificationCountRef.current >= settings.maxNotifications) {
        return
      }

      const currentDate = new Date().toDateString()
      if (lastResetDateRef.current !== currentDate) {
        notificationCountRef.current = 0
        lastResetDateRef.current = currentDate
      }

      const order = generateRandomOrder(settings.storeName, settings.orderThreshold)

      if (Number.parseFloat(order.amount) >= settings.orderThreshold) {
        await showIOSNotification(order)
        notificationCountRef.current++
      }
    }, intervalMs)

    setIsScheduleActive(true)
    await AsyncStorage.setItem("notification-schedule-active", "true")
  }

  const stopSchedule = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsScheduleActive(false)
    await AsyncStorage.setItem("notification-schedule-active", "false")
  }

  const sendTest = async () => {
    if (notificationsEnabled) {
      const testOrder = generateRandomOrder(settings.storeName, settings.orderThreshold)
      await showIOSNotification(testOrder)
    } else {
      Alert.alert("Notifications Disabled", "Please enable notifications first")
    }
  }

  return (
    <View style={styles.container}>
      <Header />
      <StatusCard
        notificationsEnabled={notificationsEnabled}
        isScheduleActive={isScheduleActive}
        onEnableNotifications={enableNotifications}
        onDisableNotifications={disableNotifications}
        onStartSchedule={startSchedule}
        onStopSchedule={stopSchedule}
        onSendTest={sendTest}
      />
      <SettingsCard />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

export default NotificationManager
