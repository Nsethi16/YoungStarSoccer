import Foundation
import FirebaseFirestore

struct Badge: Codable, Identifiable {
    @DocumentID var id: String?
    var name: String
    var description: String
    var iconName: String
    var category: BadgeCategory
    var requirement: BadgeRequirement
    var isSecret: Bool

    enum BadgeCategory: String, Codable, CaseIterable {
        case streak = "Streak"
        case volume = "Volume"
        case skill = "Skill"
        case special = "Special"
    }
}

struct BadgeRequirement: Codable {
    var type: RequirementType
    var value: Int

    enum RequirementType: String, Codable {
        case streakDays
        case totalDrills
        case totalSessions
        case categoryDrills   // value = count, paired with category
        case personalRecords
        case weeklyGoalsMet
    }
}

struct EarnedBadge: Codable, Identifiable {
    @DocumentID var id: String?
    var childProfileId: String
    var badgeId: String
    var earnedAt: Date
}

struct DailyChallenge: Codable, Identifiable {
    @DocumentID var id: String?
    var title: String
    var description: String
    var category: Drill.DrillCategory
    var date: Date
    var isCompleted: Bool
}

let preloadedBadges: [Badge] = [
    Badge(name: "First Touch", description: "Complete your first training session",
          iconName: "star.fill", category: .special,
          requirement: BadgeRequirement(type: .totalSessions, value: 1), isSecret: false),
    Badge(name: "Hat Trick", description: "Train 3 days in a row",
          iconName: "flame.fill", category: .streak,
          requirement: BadgeRequirement(type: .streakDays, value: 3), isSecret: false),
    Badge(name: "On Fire", description: "Train 7 days in a row",
          iconName: "flame.circle.fill", category: .streak,
          requirement: BadgeRequirement(type: .streakDays, value: 7), isSecret: false),
    Badge(name: "Unstoppable", description: "Train 30 days in a row",
          iconName: "bolt.shield.fill", category: .streak,
          requirement: BadgeRequirement(type: .streakDays, value: 30), isSecret: false),
    Badge(name: "Golden Boot", description: "Complete 50 shooting drills",
          iconName: "shoe.fill", category: .volume,
          requirement: BadgeRequirement(type: .categoryDrills, value: 50), isSecret: false),
    Badge(name: "Speed Demon", description: "Complete 50 speed drills",
          iconName: "hare.fill", category: .volume,
          requirement: BadgeRequirement(type: .categoryDrills, value: 50), isSecret: false),
    Badge(name: "Weak Foot Warrior", description: "Complete 25 drills with your weak foot focus",
          iconName: "figure.soccer", category: .skill,
          requirement: BadgeRequirement(type: .categoryDrills, value: 25), isSecret: false),
    Badge(name: "Century Club", description: "Complete 100 total training sessions",
          iconName: "medal.fill", category: .volume,
          requirement: BadgeRequirement(type: .totalSessions, value: 100), isSecret: false),
    Badge(name: "Record Breaker", description: "Set 10 personal records",
          iconName: "trophy.fill", category: .skill,
          requirement: BadgeRequirement(type: .personalRecords, value: 10), isSecret: false),
    Badge(name: "Goal Getter", description: "Meet your weekly goals 4 weeks in a row",
          iconName: "target", category: .special,
          requirement: BadgeRequirement(type: .weeklyGoalsMet, value: 4), isSecret: false),
]

let dailyChallengeTemplates: [String] = [
    "Every shot aims for the far post today",
    "Use only your weak foot for the first 5 minutes",
    "Invent a new move and try it 5 times",
    "Do every drill at full speed — no walking",
    "Try to beat your best dribbling time by 1 second",
    "Take 10 extra shots after your session",
    "Practice your celebration after every made shot",
    "Do 5 extra toe taps between every drill",
    "Try juggling the ball 10 times without dropping",
    "Sprint back to start position after every drill",
    "Practice with your eyes up — no looking at the ball during dribbling",
    "Challenge yourself: complete the whole session without stopping",
    "Add 5 extra reps to every drill today",
    "Try a new skill move you've never done before",
]
