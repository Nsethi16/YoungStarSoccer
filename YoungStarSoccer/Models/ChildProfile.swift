import Foundation
import FirebaseFirestore

struct ChildProfile: Codable, Identifiable {
    @DocumentID var id: String?
    var parentUserId: String
    var name: String
    var age: Int
    var avatarName: String
    var teamName: String
    var teamPracticeDays: [Int] // 0 = Sunday, 6 = Saturday
    var preferredPosition: String
    var currentStreak: Int
    var longestStreak: Int
    var totalSessionsCompleted: Int
    var createdAt: Date
    var updatedAt: Date

    init(parentUserId: String, name: String, age: Int, teamName: String, practiceDays: [Int]) {
        self.parentUserId = parentUserId
        self.name = name
        self.age = age
        self.avatarName = "avatar_default"
        self.teamName = teamName
        self.teamPracticeDays = practiceDays
        self.preferredPosition = "Forward"
        self.currentStreak = 0
        self.longestStreak = 0
        self.totalSessionsCompleted = 0
        self.createdAt = Date()
        self.updatedAt = Date()
    }
}
