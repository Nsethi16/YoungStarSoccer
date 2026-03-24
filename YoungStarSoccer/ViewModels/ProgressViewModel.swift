import Foundation

@MainActor
class ProgressViewModel: ObservableObject {
    @Published var records: [ProgressRecord] = []
    @Published var sessionLogs: [SessionLog] = []
    @Published var personalRecords: [String: ProgressRecord] = [:] // drillId -> best record
    @Published var isLoading = false
    @Published var newPersonalRecord: ProgressRecord?

    private let firestoreService = FirestoreService.shared

    func loadProgress(childProfileId: String) async {
        isLoading = true
        defer { isLoading = false }

        do {
            records = try await firestoreService.getProgressRecords(childProfileId: childProfileId)
            sessionLogs = try await firestoreService.getSessionLogs(childProfileId: childProfileId)
            buildPersonalRecords()
        } catch {
            print("Error loading progress: \(error)")
        }
    }

    func logResult(childProfileId: String, drill: Drill, value: Double) async {
        guard let drillId = drill.id, let measurableType = drill.measurableType else { return }

        var record = ProgressRecord(
            childProfileId: childProfileId,
            drillId: drillId,
            drillName: drill.name,
            measurableType: measurableType,
            value: value
        )

        // Check if it's a personal record
        let isLowerBetter = measurableType == .sprintTime
        if let currentBest = personalRecords[drillId] {
            let isBetter = isLowerBetter ? value < currentBest.value : value > currentBest.value
            if isBetter {
                record.isPersonalRecord = true
                newPersonalRecord = record
                AudioService.shared.announcePersonalRecord()
            }
        } else {
            // First record is always a PR
            record.isPersonalRecord = true
            newPersonalRecord = record
        }

        do {
            _ = try await firestoreService.saveProgressRecord(record)
            records.insert(record, at: 0)
            if record.isPersonalRecord {
                personalRecords[drillId] = record
            }
        } catch {
            print("Error saving progress: \(error)")
        }
    }

    func saveSessionLog(childProfileId: String, trainingPlanId: String, dayOfWeek: Int,
                        drillResults: [DrillResult], durationMinutes: Int) async {
        let log = SessionLog(
            childProfileId: childProfileId,
            trainingPlanId: trainingPlanId,
            dayOfWeek: dayOfWeek,
            drillsCompleted: drillResults.filter(\.completed).count,
            totalDrills: drillResults.count,
            durationMinutes: durationMinutes,
            date: Date(),
            drillResults: drillResults
        )

        do {
            _ = try await firestoreService.saveSessionLog(log)
            sessionLogs.insert(log, at: 0)
        } catch {
            print("Error saving session log: \(error)")
        }
    }

    private func buildPersonalRecords() {
        personalRecords = [:]
        for record in records where record.isPersonalRecord {
            if personalRecords[record.drillId] == nil {
                personalRecords[record.drillId] = record
            }
        }
    }

    func weekOverWeekData(for drillId: String) -> [(week: String, value: Double)] {
        let drillRecords = records.filter { $0.drillId == drillId }.sorted { $0.date < $1.date }
        let calendar = Calendar.current

        var weeklyAverages: [(week: String, value: Double)] = []
        let grouped = Dictionary(grouping: drillRecords) { record in
            calendar.component(.weekOfYear, from: record.date)
        }

        for (week, records) in grouped.sorted(by: { $0.key < $1.key }) {
            let avg = records.map(\.value).reduce(0, +) / Double(records.count)
            weeklyAverages.append((week: "Wk \(week)", value: avg))
        }

        return weeklyAverages
    }

    func totalSessionsThisWeek() -> Int {
        let weekStart = Date().startOfWeek
        return sessionLogs.filter { $0.date >= weekStart }.count
    }
}
