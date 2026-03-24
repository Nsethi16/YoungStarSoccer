import Foundation
import FirebaseFirestore

class FirestoreService {
    static let shared = FirestoreService()
    private let db = Firestore.firestore()
    private init() {}

    // MARK: - User
    func createUser(_ user: AppUser, id: String) async throws {
        try db.collection("users").document(id).setData(from: user)
    }

    func getUser(id: String) async throws -> AppUser? {
        let doc = try await db.collection("users").document(id).getDocument()
        return try? doc.data(as: AppUser.self)
    }

    // MARK: - Child Profile
    func createChildProfile(_ profile: ChildProfile) async throws -> String {
        let ref = try db.collection("childProfiles").addDocument(from: profile)
        return ref.documentID
    }

    func getChildProfile(parentUserId: String) async throws -> ChildProfile? {
        let snapshot = try await db.collection("childProfiles")
            .whereField("parentUserId", isEqualTo: parentUserId)
            .limit(to: 1)
            .getDocuments()
        return try? snapshot.documents.first?.data(as: ChildProfile.self)
    }

    func updateChildProfile(_ profile: ChildProfile) async throws {
        guard let id = profile.id else { return }
        try db.collection("childProfiles").document(id).setData(from: profile)
    }

    // MARK: - Drills
    func saveDrill(_ drill: Drill) async throws -> String {
        let ref = try db.collection("drills").addDocument(from: drill)
        return ref.documentID
    }

    func getDrills() async throws -> [Drill] {
        let snapshot = try await db.collection("drills").getDocuments()
        return snapshot.documents.compactMap { try? $0.data(as: Drill.self) }
    }

    func seedDrillsIfNeeded() async throws {
        let snapshot = try await db.collection("drills").limit(to: 1).getDocuments()
        if snapshot.documents.isEmpty {
            for drill in DrillLibrary.allDrills {
                _ = try await saveDrill(drill)
            }
        }
    }

    // MARK: - Training Plan
    func saveTrainingPlan(_ plan: TrainingPlan) async throws -> String {
        if let id = plan.id {
            try db.collection("trainingPlans").document(id).setData(from: plan)
            return id
        }
        let ref = try db.collection("trainingPlans").addDocument(from: plan)
        return ref.documentID
    }

    func getCurrentTrainingPlan(childProfileId: String) async throws -> TrainingPlan? {
        let calendar = Calendar.current
        let startOfWeek = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: Date()))!

        let snapshot = try await db.collection("trainingPlans")
            .whereField("childProfileId", isEqualTo: childProfileId)
            .whereField("weekStartDate", isGreaterThanOrEqualTo: Timestamp(date: startOfWeek))
            .order(by: "weekStartDate", descending: true)
            .limit(to: 1)
            .getDocuments()

        return try? snapshot.documents.first?.data(as: TrainingPlan.self)
    }

    // MARK: - Progress Records
    func saveProgressRecord(_ record: ProgressRecord) async throws -> String {
        let ref = try db.collection("progressRecords").addDocument(from: record)
        return ref.documentID
    }

    func getProgressRecords(childProfileId: String, drillId: String? = nil, limit: Int = 50) async throws -> [ProgressRecord] {
        var query: Query = db.collection("progressRecords")
            .whereField("childProfileId", isEqualTo: childProfileId)
            .order(by: "date", descending: true)
            .limit(to: limit)

        if let drillId = drillId {
            query = db.collection("progressRecords")
                .whereField("childProfileId", isEqualTo: childProfileId)
                .whereField("drillId", isEqualTo: drillId)
                .order(by: "date", descending: true)
                .limit(to: limit)
        }

        let snapshot = try await query.getDocuments()
        return snapshot.documents.compactMap { try? $0.data(as: ProgressRecord.self) }
    }

    func getPersonalRecord(childProfileId: String, drillId: String, measurableType: Drill.MeasurableType) async throws -> ProgressRecord? {
        let isLowerBetter = measurableType == .sprintTime
        let snapshot = try await db.collection("progressRecords")
            .whereField("childProfileId", isEqualTo: childProfileId)
            .whereField("drillId", isEqualTo: drillId)
            .order(by: "value", descending: !isLowerBetter)
            .limit(to: 1)
            .getDocuments()
        return try? snapshot.documents.first?.data(as: ProgressRecord.self)
    }

    // MARK: - Session Logs
    func saveSessionLog(_ log: SessionLog) async throws -> String {
        let ref = try db.collection("sessionLogs").addDocument(from: log)
        return ref.documentID
    }

    func getSessionLogs(childProfileId: String, since: Date? = nil) async throws -> [SessionLog] {
        var query: Query = db.collection("sessionLogs")
            .whereField("childProfileId", isEqualTo: childProfileId)
            .order(by: "date", descending: true)

        if let since = since {
            query = query.whereField("date", isGreaterThanOrEqualTo: Timestamp(date: since))
        }

        let snapshot = try await query.limit(to: 100).getDocuments()
        return snapshot.documents.compactMap { try? $0.data(as: SessionLog.self) }
    }

    // MARK: - Wellness
    func saveWellnessLog(_ log: WellnessLog) async throws -> String {
        if let id = log.id {
            try db.collection("wellnessLogs").document(id).setData(from: log)
            return id
        }
        let ref = try db.collection("wellnessLogs").addDocument(from: log)
        return ref.documentID
    }

    func getWellnessLogs(childProfileId: String, limit: Int = 14) async throws -> [WellnessLog] {
        let snapshot = try await db.collection("wellnessLogs")
            .whereField("childProfileId", isEqualTo: childProfileId)
            .order(by: "date", descending: true)
            .limit(to: limit)
            .getDocuments()
        return snapshot.documents.compactMap { try? $0.data(as: WellnessLog.self) }
    }

    func getTodayWellnessLog(childProfileId: String) async throws -> WellnessLog? {
        let calendar = Calendar.current
        let startOfDay = calendar.startOfDay(for: Date())
        let endOfDay = calendar.date(byAdding: .day, value: 1, to: startOfDay)!

        let snapshot = try await db.collection("wellnessLogs")
            .whereField("childProfileId", isEqualTo: childProfileId)
            .whereField("date", isGreaterThanOrEqualTo: Timestamp(date: startOfDay))
            .whereField("date", isLessThan: Timestamp(date: endOfDay))
            .limit(to: 1)
            .getDocuments()
        return try? snapshot.documents.first?.data(as: WellnessLog.self)
    }

    // MARK: - Badges
    func saveEarnedBadge(_ badge: EarnedBadge) async throws {
        _ = try db.collection("earnedBadges").addDocument(from: badge)
    }

    func getEarnedBadges(childProfileId: String) async throws -> [EarnedBadge] {
        let snapshot = try await db.collection("earnedBadges")
            .whereField("childProfileId", isEqualTo: childProfileId)
            .getDocuments()
        return snapshot.documents.compactMap { try? $0.data(as: EarnedBadge.self) }
    }

    // MARK: - Weekly Review
    func saveWeeklyReview(_ review: WeeklyReview) async throws -> String {
        if let id = review.id {
            try db.collection("weeklyReviews").document(id).setData(from: review)
            return id
        }
        let ref = try db.collection("weeklyReviews").addDocument(from: review)
        return ref.documentID
    }

    func getWeeklyReviews(childProfileId: String, limit: Int = 10) async throws -> [WeeklyReview] {
        let snapshot = try await db.collection("weeklyReviews")
            .whereField("childProfileId", isEqualTo: childProfileId)
            .order(by: "weekStartDate", descending: true)
            .limit(to: limit)
            .getDocuments()
        return snapshot.documents.compactMap { try? $0.data(as: WeeklyReview.self) }
    }
}
