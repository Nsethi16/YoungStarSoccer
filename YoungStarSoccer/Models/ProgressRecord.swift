import Foundation
import FirebaseFirestore

struct ProgressRecord: Codable, Identifiable {
    @DocumentID var id: String?
    var childProfileId: String
    var drillId: String
    var drillName: String
    var measurableType: Drill.MeasurableType
    var value: Double // time in seconds, accuracy %, or rep count
    var isPersonalRecord: Bool
    var date: Date

    init(childProfileId: String, drillId: String, drillName: String,
         measurableType: Drill.MeasurableType, value: Double, date: Date = Date()) {
        self.childProfileId = childProfileId
        self.drillId = drillId
        self.drillName = drillName
        self.measurableType = measurableType
        self.value = value
        self.isPersonalRecord = false
        self.date = date
    }
}

struct SessionLog: Codable, Identifiable {
    @DocumentID var id: String?
    var childProfileId: String
    var trainingPlanId: String
    var dayOfWeek: Int
    var drillsCompleted: Int
    var totalDrills: Int
    var durationMinutes: Int
    var date: Date
    var drillResults: [DrillResult]
}

struct DrillResult: Codable, Identifiable {
    var id: String
    var drillId: String
    var drillName: String
    var completed: Bool
    var measuredValue: Double?
    var notes: String?
}
