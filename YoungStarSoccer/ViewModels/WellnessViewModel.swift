import Foundation

@MainActor
class WellnessViewModel: ObservableObject {
    @Published var todayLog: WellnessLog?
    @Published var recentLogs: [WellnessLog] = []
    @Published var alerts: [WellnessAlert] = []
    @Published var isLoading = false

    private let firestoreService = FirestoreService.shared

    func loadWellnessData(childProfileId: String) async {
        isLoading = true
        defer { isLoading = false }

        do {
            todayLog = try await firestoreService.getTodayWellnessLog(childProfileId: childProfileId)
            recentLogs = try await firestoreService.getWellnessLogs(childProfileId: childProfileId)
            checkForAlerts()
        } catch {
            print("Error loading wellness: \(error)")
        }
    }

    func saveTodayLog(childProfileId: String) async {
        guard var log = todayLog else {
            todayLog = WellnessLog(childProfileId: childProfileId)
            return
        }

        do {
            let logId = try await firestoreService.saveWellnessLog(log)
            if todayLog?.id == nil {
                todayLog?.id = logId
            }
            // Refresh data
            recentLogs = try await firestoreService.getWellnessLogs(childProfileId: childProfileId)
            checkForAlerts()
        } catch {
            print("Error saving wellness log: \(error)")
        }
    }

    private func checkForAlerts() {
        alerts = []
        let recentDays = Array(recentLogs.prefix(3))
        guard recentDays.count >= 2 else { return }

        // Low sleep check
        let lowSleepDays = recentDays.filter { $0.sleepHours < Constants.Wellness.minHealthySleepHours }
        if lowSleepDays.count >= 2 {
            alerts.append(WellnessAlert(
                type: .lowSleep,
                message: "\(lowSleepDays.count) of the last \(recentDays.count) nights had less than \(Int(Constants.Wellness.minHealthySleepHours)) hours of sleep",
                recommendation: "Consider an earlier bedtime. Good sleep helps muscles recover and keeps energy high for training."
            ))
        }

        // Persistent soreness check
        if recentDays.count >= Constants.Wellness.sorenessConsecutiveDayAlert {
            let commonSoreAreas = findPersistentSoreness(logs: recentDays)
            for area in commonSoreAreas {
                alerts.append(WellnessAlert(
                    type: .persistentSoreness,
                    message: "\(area) has been sore for \(recentDays.count) consecutive days",
                    recommendation: "Consider reducing training intensity or taking an extra rest day. If soreness persists, consult a doctor."
                ))
            }
        }

        // Low energy check
        let lowEnergyDays = recentDays.filter { $0.energyLevel <= Constants.Wellness.lowEnergyThreshold }
        if lowEnergyDays.count >= 2 {
            alerts.append(WellnessAlert(
                type: .lowEnergy,
                message: "Energy has been low for \(lowEnergyDays.count) of the last \(recentDays.count) days",
                recommendation: "Make sure they're eating well and staying hydrated. Consider lighter training sessions."
            ))
        }

        // Dehydration check
        let lowWaterDays = recentDays.filter { $0.waterGlasses < Constants.Wellness.minHealthyWaterGlasses }
        if lowWaterDays.count >= 2 {
            alerts.append(WellnessAlert(
                type: .dehydration,
                message: "Water intake has been below \(Constants.Wellness.minHealthyWaterGlasses) glasses on \(lowWaterDays.count) recent days",
                recommendation: "Encourage drinking water throughout the day, especially before and after training."
            ))
        }
    }

    private func findPersistentSoreness(logs: [WellnessLog]) -> [String] {
        var areaCounts: [String: Int] = [:]
        for log in logs {
            for area in log.sorenessAreas {
                areaCounts[area.bodyPart.rawValue, default: 0] += 1
            }
        }
        return areaCounts.filter { $0.value >= Constants.Wellness.sorenessConsecutiveDayAlert }.map(\.key)
    }

    // Wellness trend data for charts
    func sleepTrend() -> [(date: String, hours: Double)] {
        recentLogs.reversed().map { ($0.date.shortDate, $0.sleepHours) }
    }

    func energyTrend() -> [(date: String, level: Int)] {
        recentLogs.reversed().map { ($0.date.shortDate, $0.energyLevel) }
    }

    func waterTrend() -> [(date: String, glasses: Int)] {
        recentLogs.reversed().map { ($0.date.shortDate, $0.waterGlasses) }
    }
}
