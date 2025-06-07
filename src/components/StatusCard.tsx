import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface Props {
  notificationsEnabled: boolean
  isScheduleActive: boolean
  onEnableNotifications: () => void
  onDisableNotifications: () => void
  onStartSchedule: () => void
  onStopSchedule: () => void
  onSendTest: () => void
}

const StatusCard: React.FC<Props> = ({
  notificationsEnabled,
  isScheduleActive,
  onEnableNotifications,
  onDisableNotifications,
  onStartSchedule,
  onStopSchedule,
  onSendTest,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="notifications" size={20} color="#007AFF" />
        <Text style={styles.title}>Notification Status</Text>
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Push Notifications</Text>
        <View style={[styles.badge, notificationsEnabled ? styles.enabledBadge : styles.disabledBadge]}>
          <Text style={[styles.badgeText, notificationsEnabled ? styles.enabledText : styles.disabledText]}>
            {notificationsEnabled ? "Enabled" : "Disabled"}
          </Text>
        </View>
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Auto Notifications</Text>
        <View style={[styles.badge, isScheduleActive ? styles.activeBadge : styles.disabledBadge]}>
          <Text style={[styles.badgeText, isScheduleActive ? styles.activeText : styles.disabledText]}>
            {isScheduleActive ? "Active" : "Inactive"}
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        {!notificationsEnabled ? (
          <TouchableOpacity style={styles.primaryButton} onPress={onEnableNotifications}>
            <Ionicons name="notifications" size={16} color="white" style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>Enable Notifications</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.primaryButton, isScheduleActive ? styles.stopButton : styles.startButton]}
              onPress={isScheduleActive ? onStopSchedule : onStartSchedule}
            >
              <Text style={styles.primaryButtonText}>
                {isScheduleActive ? "Stop Auto Notifications" : "Start Auto Notifications"}
              </Text>
            </TouchableOpacity>
            <View style={styles.secondaryButtonRow}>
              <TouchableOpacity style={styles.secondaryButton} onPress={onSendTest}>
                <Text style={styles.secondaryButtonText}>Test</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={onDisableNotifications}>
                <Text style={styles.secondaryButtonText}>Disable</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginLeft: 8,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 16,
    color: "#333",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  enabledBadge: {
    backgroundColor: "#34C759",
  },
  activeBadge: {
    backgroundColor: "#007AFF",
  },
  disabledBadge: {
    backgroundColor: "#8E8E93",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  enabledText: {
    color: "white",
  },
  activeText: {
    color: "white",
  },
  disabledText: {
    color: "white",
  },
  buttonContainer: {
    marginTop: 16,
  },
  buttonGroup: {
    gap: 8,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  startButton: {
    backgroundColor: "#34C759",
  },
  stopButton: {
    backgroundColor: "#FF3B30",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    marginRight: 8,
  },
  secondaryButtonRow: {
    flexDirection: "row",
    gap: 8,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#C7C7CC",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
  },
})

export default StatusCard
