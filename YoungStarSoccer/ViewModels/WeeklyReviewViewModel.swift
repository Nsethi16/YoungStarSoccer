import Foundation
import SwiftUI

@MainActor
class WeeklyReviewViewModel: ObservableObject {
    @Published var currentReview: WeeklyReview?
    @Published var pastReviews: [WeeklyReview] = []
    @Published var isLoading = false
    @Published var pdfData: Data?

    private let firestoreService = FirestoreService.shared

    func loadReviews(childProfileId: String) async {
        isLoading = true
        defer { isLoading = false }

        do {
            pastReviews = try await firestoreService.getWeeklyReviews(childProfileId: childProfileId)
        } catch {
            print("Error loading reviews: \(error)")
        }
    }

    func generateWeeklyReview(childProfileId: String, sessionLogs: [SessionLog],
                               progressRecords: [ProgressRecord]) async -> WeeklyReview {
        let weekStart = Date().startOfWeek
        let weekLogs = sessionLogs.filter { $0.date >= weekStart }

        var review = WeeklyReview(childProfileId: childProfileId, weekStartDate: weekStart)
        review.sessionsCompleted = weekLogs.count
        review.totalSessions = 6 // Mon–Sat
        review.totalDrillsCompleted = weekLogs.reduce(0) { $0 + $1.drillsCompleted }
        review.totalMinutesTrained = weekLogs.reduce(0) { $0 + $1.durationMinutes }

        let weekRecords = progressRecords.filter { $0.date >= weekStart && $0.isPersonalRecord }
        review.personalRecordsSet = weekRecords.count

        if let bestPR = weekRecords.first {
            review.biggestImprovement = "New personal record in \(bestPR.drillName)!"
        }

        return review
    }

    func saveReview(_ review: WeeklyReview) async {
        do {
            var saved = review
            let id = try await firestoreService.saveWeeklyReview(review)
            saved.id = id
            currentReview = saved
            pastReviews.insert(saved, at: 0)
        } catch {
            print("Error saving review: \(error)")
        }
    }

    func generatePDF(review: WeeklyReview, childName: String,
                     progressRecords: [ProgressRecord], wellnessLogs: [WellnessLog]) {
        pdfData = PDFService.shared.generateWeeklyReviewPDF(
            review: review,
            childName: childName,
            progressRecords: progressRecords,
            wellnessLogs: wellnessLogs
        )
    }
}
