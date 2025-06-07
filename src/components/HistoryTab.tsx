import type React from "react"
import { View, Text, StyleSheet, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { useNotification } from "../context/NotificationContext"
import { formatNotificationBody } from "../utils/orderUtils"

const HistoryTab: React.FC = () => {
  const { notificationHistory, settings } = useNotification()

  if (notificationHistory.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="notifications-off" size={48} color="#C7C7CC" />
        <Text style={styles.emptyText}>No notifications yet</Text>
        <Text style={styles.emptySubtext}>Send a test notification to see it here</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {notificationHistory.map((order, index) => (
        <View key={index} style={styles.historyItem}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark" size={16} color="#34C759" />
          </View>
          <View style={styles.contentContainer}>
            <Text style={styles.orderTitle}>Order {order.orderId}</Text>
            <Text style={styles.orderBody}>{formatNotificationBody(settings.customBody, order)}</Text>
            <Text style={styles.timestamp}>{new Date(order.timestamp).toLocaleString()}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 300,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E8F5E8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  orderBody: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    lineHeight: 16,
  },
  timestamp: {
    fontSize: 11,
    color: "#999",
  },
})

export default HistoryTab
