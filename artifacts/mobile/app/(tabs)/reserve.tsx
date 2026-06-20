import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useUser } from "@/contexts/UserContext";
import { Reservation } from "@/contexts/UserContext";
import { useColors } from "@/hooks/useColors";

const TIME_SLOTS = [
  "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM",
  "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
  "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM",
];

const UPCOMING_DAYS = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return {
    label: d.toLocaleDateString("en-IN", { weekday: "short" }),
    date: d.getDate(),
    full: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    isToday: i === 0,
  };
});

type SeatingType = "indoor" | "outdoor";

export default function ReserveScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addReservation, reservations, cancelReservation } = useUser();

  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTime, setSelectedTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [seating, setSeating] = useState<SeatingType>("indoor");
  const [requests, setRequests] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const activeReservations = reservations.filter((r) => r.status !== "cancelled");
  const cancelledReservations = reservations.filter((r) => r.status === "cancelled");

  const handleConfirm = () => {
    if (!selectedTime) {
      Alert.alert("Select Time", "Please choose a time slot for your reservation.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newRes: Reservation = {
      id: Date.now().toString(),
      date: UPCOMING_DAYS[selectedDay].full,
      time: selectedTime,
      guests,
      seating,
      requests,
      status: "confirmed",
    };
    addReservation(newRes);
    setSelectedTime("");
    setRequests("");
    setGuests(2);
    Alert.alert(
      "Table Reserved! 🎉",
      `Your table for ${guests} on ${UPCOMING_DAYS[selectedDay].full} at ${selectedTime} (${seating === "indoor" ? "Indoor" : "Outdoor"}) has been confirmed. See you soon!`
    );
  };

  const STATUS_COLORS: Record<string, string> = {
    confirmed: "#4CAF50",
    pending: "#C8973A",
    cancelled: "#888",
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>Reserve Table</Text>
          {reservations.length > 0 && (
            <Pressable onPress={() => setShowHistory(!showHistory)}>
              <Text style={[styles.historyBtn, { color: colors.gold }]}>
                {showHistory ? "New Booking" : "My Bookings"}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {showHistory ? (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
          {reservations.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="calendar" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No reservations yet</Text>
            </View>
          ) : (
            reservations.map((r) => (
              <View key={r.id} style={[styles.resCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.resHeader}>
                  <View>
                    <Text style={[styles.resDate, { color: colors.foreground }]}>{r.date} · {r.time}</Text>
                    <Text style={[styles.resInfo, { color: colors.mutedForeground }]}>
                      {r.guests} guests · {r.seating === "indoor" ? "Indoor" : "Outdoor"}
                    </Text>
                  </View>
                  <View style={[styles.resBadge, { backgroundColor: STATUS_COLORS[r.status] + "22" }]}>
                    <Text style={[styles.resBadgeText, { color: STATUS_COLORS[r.status] }]}>
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </Text>
                  </View>
                </View>
                {r.requests ? (
                  <Text style={[styles.resRequests, { color: colors.mutedForeground }]}>Note: {r.requests}</Text>
                ) : null}
                {r.status !== "cancelled" && (
                  <Pressable
                    onPress={() => {
                      Alert.alert("Cancel Reservation", "Are you sure you want to cancel this reservation?", [
                        { text: "No", style: "cancel" },
                        { text: "Yes, Cancel", style: "destructive", onPress: () => cancelReservation(r.id) },
                      ]);
                    }}
                    style={styles.cancelBtn}
                  >
                    <Text style={styles.cancelBtnText}>Cancel Booking</Text>
                  </Pressable>
                )}
              </View>
            ))
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: bottomPad + 90 }} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.foreground }]}>Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20, paddingRight: 8, gap: 8 }}>
              {UPCOMING_DAYS.map((day, idx) => {
                const active = idx === selectedDay;
                return (
                  <Pressable
                    key={idx}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedDay(idx); }}
                    style={[styles.dayBtn, { backgroundColor: active ? colors.gold : colors.card, borderColor: active ? colors.gold : colors.border }]}
                  >
                    <Text style={[styles.dayLabel, { color: active ? "#000" : colors.mutedForeground }]}>{day.isToday ? "Today" : day.label}</Text>
                    <Text style={[styles.dayNum, { color: active ? "#000" : colors.foreground }]}>{day.date}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.foreground }]}>Select Time</Text>
            <View style={styles.timeGrid}>
              {TIME_SLOTS.map((slot) => {
                const active = slot === selectedTime;
                return (
                  <Pressable
                    key={slot}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedTime(slot); }}
                    style={[
                      styles.timeSlot,
                      { backgroundColor: active ? colors.gold : colors.card, borderColor: active ? colors.gold : colors.border },
                    ]}
                  >
                    <Text style={[styles.timeSlotText, { color: active ? "#000" : colors.mutedForeground, fontWeight: active ? "700" : "500" }]}>
                      {slot}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={[styles.section, styles.sectionPad]}>
            <Text style={[styles.label, { color: colors.foreground }]}>Number of Guests</Text>
            <View style={[styles.guestRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Pressable
                onPress={() => { if (guests > 1) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setGuests(guests - 1); } }}
                style={[styles.guestBtn, { borderColor: colors.border }]}
              >
                <Feather name="minus" size={18} color={guests > 1 ? colors.foreground : colors.border} />
              </Pressable>
              <View style={styles.guestCenter}>
                <Text style={[styles.guestNum, { color: colors.foreground }]}>{guests}</Text>
                <Text style={[styles.guestLabel, { color: colors.mutedForeground }]}>Guests</Text>
              </View>
              <Pressable
                onPress={() => { if (guests < 20) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setGuests(guests + 1); } }}
                style={[styles.guestBtn, { borderColor: colors.border }]}
              >
                <Feather name="plus" size={18} color={guests < 20 ? colors.foreground : colors.border} />
              </Pressable>
            </View>
          </View>

          <View style={[styles.section, styles.sectionPad]}>
            <Text style={[styles.label, { color: colors.foreground }]}>Seating Preference</Text>
            <View style={styles.seatingRow}>
              {(["indoor", "outdoor"] as SeatingType[]).map((s) => {
                const active = seating === s;
                return (
                  <Pressable
                    key={s}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSeating(s); }}
                    style={[
                      styles.seatingBtn,
                      { borderColor: active ? colors.gold : colors.border, backgroundColor: active ? colors.goldDim : colors.card },
                    ]}
                  >
                    <Feather
                      name={s === "indoor" ? "home" : "sun"}
                      size={20}
                      color={active ? colors.gold : colors.mutedForeground}
                    />
                    <Text style={[styles.seatingText, { color: active ? colors.gold : colors.mutedForeground }]}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={[styles.section, styles.sectionPad]}>
            <Text style={[styles.label, { color: colors.foreground }]}>Special Requests</Text>
            <TextInput
              style={[styles.requestsInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              placeholder="Birthday celebration, dietary needs, high chair..."
              placeholderTextColor={colors.mutedForeground}
              value={requests}
              onChangeText={setRequests}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Feather name="info" size={16} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
              Reservations held for 15 minutes. Please arrive on time. For large groups (10+), call us directly.
            </Text>
          </View>
        </ScrollView>
      )}

      {!showHistory && (
        <View style={[styles.confirmBar, { paddingBottom: bottomPad + 12 }]}>
          <View style={[styles.summaryPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.summaryPillText, { color: colors.mutedForeground }]}>
              {UPCOMING_DAYS[selectedDay].full} · {selectedTime || "No time"} · {guests} guests
            </Text>
          </View>
          <Pressable
            onPress={handleConfirm}
            style={[styles.confirmBtn, { backgroundColor: colors.gold }]}
          >
            <Feather name="calendar" size={18} color="#000" />
            <Text style={styles.confirmText}>Confirm Reservation</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 28, fontWeight: "900", letterSpacing: -0.5 },
  historyBtn: { fontSize: 14, fontWeight: "600" },
  section: { marginBottom: 24 },
  sectionPad: { paddingHorizontal: 20 },
  label: { fontSize: 16, fontWeight: "700", marginBottom: 12, paddingLeft: 20 },
  dayBtn: { width: 60, alignItems: "center", borderRadius: 14, borderWidth: 1, paddingVertical: 12 },
  dayLabel: { fontSize: 11, marginBottom: 4 },
  dayNum: { fontSize: 20, fontWeight: "800" },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 20 },
  timeSlot: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 9 },
  timeSlotText: { fontSize: 13 },
  guestRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  guestBtn: { paddingHorizontal: 24, paddingVertical: 16, borderWidth: 0 },
  guestCenter: { flex: 1, alignItems: "center" },
  guestNum: { fontSize: 32, fontWeight: "800" },
  guestLabel: { fontSize: 12 },
  seatingRow: { flexDirection: "row", gap: 12 },
  seatingBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 16,
  },
  seatingText: { fontSize: 15, fontWeight: "700" },
  requestsInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    fontSize: 14,
    minHeight: 90,
    textAlignVertical: "top",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18 },
  confirmBar: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 12, gap: 10 },
  summaryPill: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
  summaryPillText: { fontSize: 12, textAlign: "center" },
  confirmBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 16, paddingVertical: 16 },
  confirmText: { fontSize: 16, fontWeight: "800", color: "#000" },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 16 },
  resCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 8 },
  resHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  resDate: { fontSize: 14, fontWeight: "700", marginBottom: 3 },
  resInfo: { fontSize: 12 },
  resBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  resBadgeText: { fontSize: 12, fontWeight: "600" },
  resRequests: { fontSize: 12, fontStyle: "italic" },
  cancelBtn: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: "rgba(229,57,53,0.1)" },
  cancelBtnText: { fontSize: 12, fontWeight: "600", color: "#E53935" },
});
