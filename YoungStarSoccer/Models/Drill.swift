import Foundation
import FirebaseFirestore

struct Drill: Codable, Identifiable {
    @DocumentID var id: String?
    var name: String
    var category: DrillCategory
    var difficulty: DrillDifficulty
    var durationSeconds: Int
    var reps: Int?
    var instructions: [String]
    var coachingTips: [String]
    var timeTarget: String?
    var equipment: [String]
    var isIndoor: Bool
    var isCustom: Bool
    var measurableType: MeasurableType?
    var nextDifficultyDrillId: String?

    enum DrillCategory: String, Codable, CaseIterable {
        case speed = "Speed"
        case shooting = "Shooting"
        case dribbling = "Dribbling"
        case ballMastery = "Ball Mastery"
        case passing = "Passing"
        case footwork = "Footwork"
    }

    enum DrillDifficulty: String, Codable, CaseIterable {
        case beginner = "Beginner"
        case intermediate = "Intermediate"
        case advanced = "Advanced"
    }

    enum MeasurableType: String, Codable {
        case sprintTime = "Sprint Time"
        case shotAccuracy = "Shot Accuracy"
        case dribblingReps = "Dribbling Reps"
        case passingAccuracy = "Passing Accuracy"
    }
}
