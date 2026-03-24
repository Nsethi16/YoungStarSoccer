import Foundation

@MainActor
class BadgeViewModel: ObservableObject {
    @Published var allBadges: [Badge] = preloadedBadges
    @Published var earnedBadges: [EarnedBadge] = []
    @Published var todayChallenge: DailyChallenge?
    @Published var newBadgeEarned: Badge?

    private let firestoreService = FirestoreService.shared

    func loadBadges(childProfileId: String) async {
        do {
            earnedBadges = try await firestoreService.getEarnedBadges(childProfileId: childProfileId)
            generateDailyChallenge()
        } catch {
            print("Error loading badges: \(error)")
        }
    }

    func checkAndAwardBadges(childProfileId: String, streak: Int, totalSessions: Int,
                              categoryDrillCounts: [String: Int], personalRecordCount: Int) async {
        for badge in allBadges {
            guard !earnedBadges.contains(where: { $0.badgeId == badge.id }) else { continue }

            var earned = false
            switch badge.requirement.type {
            case .streakDays:
                earned = streak >= badge.requirement.value
            case .totalSessions:
                earned = totalSessions >= badge.requirement.value
            case .totalDrills:
                let total = categoryDrillCounts.values.reduce(0, +)
                earned = total >= badge.requirement.value
            case .categoryDrills:
                // Check any category reaching the threshold
                earned = categoryDrillCounts.values.contains { $0 >= badge.requirement.value }
            case .personalRecords:
                earned = personalRecordCount >= badge.requirement.value
            case .weeklyGoalsMet:
                break // Tracked separately in weekly review
            }

            if earned {
                let earnedBadge = EarnedBadge(childProfileId: childProfileId,
                                               badgeId: badge.id ?? badge.name,
                                               earnedAt: Date())
                do {
                    try await firestoreService.saveEarnedBadge(earnedBadge)
                    earnedBadges.append(earnedBadge)
                    newBadgeEarned = badge
                    AudioService.shared.playCelebration()
                } catch {
                    print("Error saving badge: \(error)")
                }
            }
        }
    }

    func isEarned(_ badge: Badge) -> Bool {
        earnedBadges.contains { $0.badgeId == (badge.id ?? badge.name) }
    }

    private func generateDailyChallenge() {
        let calendar = Calendar.current
        let dayOfYear = calendar.ordinality(of: .day, in: .year, for: Date()) ?? 0
        let challengeIndex = dayOfYear % dailyChallengeTemplates.count
        let template = dailyChallengeTemplates[challengeIndex]

        todayChallenge = DailyChallenge(
            title: "Daily Challenge",
            description: template,
            category: Drill.DrillCategory.allCases[dayOfYear % Drill.DrillCategory.allCases.count],
            date: Date(),
            isCompleted: false
        )
    }
}
