import Foundation
import FirebaseFirestore

struct WeeklyReview: Codable, Identifiable {
    @DocumentID var id: String?
    var childProfileId: String
    var weekStartDate: Date
    var sessionsCompleted: Int
    var totalSessions: Int
    var totalDrillsCompleted: Int
    var totalMinutesTrained: Int
    var biggestImprovement: String?
    var personalRecordsSet: Int
    var reflectionHard: String?
    var goalsForNextWeek: [String]
    var createdAt: Date

    init(childProfileId: String, weekStartDate: Date) {
        self.childProfileId = childProfileId
        self.weekStartDate = weekStartDate
        self.sessionsCompleted = 0
        self.totalSessions = 0
        self.totalDrillsCompleted = 0
        self.totalMinutesTrained = 0
        self.personalRecordsSet = 0
        self.goalsForNextWeek = []
        self.createdAt = Date()
    }
}
