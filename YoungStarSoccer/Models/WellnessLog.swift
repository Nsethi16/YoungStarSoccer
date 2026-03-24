import Foundation
import FirebaseFirestore

struct WellnessLog: Codable, Identifiable {
    @DocumentID var id: String?
    var childProfileId: String
    var date: Date
    var sleepHours: Double
    var waterGlasses: Int
    var energyLevel: Int        // 1-5 scale
    var sorenessAreas: [SorenessArea]
    var notes: String?

    init(childProfileId: String, date: Date = Date()) {
        self.childProfileId = childProfileId
        self.date = date
        self.sleepHours = 8
        self.waterGlasses = 4
        self.energyLevel = 3
        self.sorenessAreas = []
    }
}

struct SorenessArea: Codable, Identifiable {
    var id: String { bodyPart.rawValue }
    var bodyPart: BodyPart
    var severity: Int // 1-3: mild, moderate, severe

    enum BodyPart: String, Codable, CaseIterable {
        case leftAnkle = "Left Ankle"
        case rightAnkle = "Right Ankle"
        case leftKnee = "Left Knee"
        case rightKnee = "Right Knee"
        case leftShin = "Left Shin"
        case rightShin = "Right Shin"
        case leftThigh = "Left Thigh"
        case rightThigh = "Right Thigh"
        case leftHip = "Left Hip"
        case rightHip = "Right Hip"
        case lowerBack = "Lower Back"
        case upperBack = "Upper Back"
    }
}

struct WellnessAlert: Identifiable {
    var id = UUID()
    var type: AlertType
    var message: String
    var recommendation: String

    enum AlertType {
        case lowSleep
        case persistentSoreness
        case lowEnergy
        case dehydration
    }
}
