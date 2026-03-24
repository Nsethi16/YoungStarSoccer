import Foundation
import FirebaseFirestore

struct TrainingPlan: Codable, Identifiable {
    @DocumentID var id: String?
    var childProfileId: String
    var weekStartDate: Date
    var days: [TrainingDay]
    var createdAt: Date

    init(childProfileId: String, weekStartDate: Date, days: [TrainingDay]) {
        self.childProfileId = childProfileId
        self.weekStartDate = weekStartDate
        self.days = days
        self.createdAt = Date()
    }
}

struct TrainingDay: Codable, Identifiable {
    var id: String { "\(dayOfWeek)-\(type.rawValue)" }
    var dayOfWeek: Int // 0 = Sunday
    var type: DayType
    var drills: [PlannedDrill]
    var isCompleted: Bool
    var completedAt: Date?

    enum DayType: String, Codable {
        case teamPractice  // shorter solo workout
        case offDay        // longer skill-focused session
        case restDay       // Sunday rest
        case indoor        // weather fallback
    }
}

struct PlannedDrill: Codable, Identifiable {
    var id: String
    var drillId: String
    var order: Int
    var customDurationSeconds: Int?
    var customReps: Int?
    var isCompleted: Bool
    var completedAt: Date?

    init(drillId: String, order: Int, customDuration: Int? = nil, customReps: Int? = nil) {
        self.id = UUID().uuidString
        self.drillId = drillId
        self.order = order
        self.customDurationSeconds = customDuration
        self.customReps = customReps
        self.isCompleted = false
    }
}
