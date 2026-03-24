import Foundation

struct Constants {
    struct Training {
        static let practiceDaySessionMinutes = 15
        static let offDaySessionMinutes = 30
        static let restDayOfWeek = 0  // Sunday
        static let drillsPerPracticeDay = 3
        static let drillsPerOffDay = 5
        static let restBetweenDrillsSeconds = 30
        static let weeksBeforeDifficultyUpgrade = 4
        static let consistencyThreshold = 0.8
    }

    struct Wellness {
        static let minHealthySleepHours: Double = 8.0
        static let minHealthyWaterGlasses = 6
        static let lowEnergyThreshold = 2
        static let sorenessConsecutiveDayAlert = 3
    }

    struct Gamification {
        static let streakFlameThreshold = 3
        static let maxGoalsPerWeek = 3
    }

    struct Weather {
        static let minSafeTemperatureF: Double = 32
        static let maxSafeTemperatureF: Double = 95
    }
}

struct MotivationQuotes {
    static let afterPersonalRecord = [
        "\"I didn't come this far to only come this far.\" — Megan Rapinoe",
        "\"The more you sweat in practice, the less you bleed in battle.\" — Pelé",
        "\"Hard work beats talent when talent doesn't work hard.\" — Tim Notke",
        "\"You're on fire! Keep that energy going!\" — Coach Mode",
        "\"Records are made to be broken. And you just proved it!\" — Young Star Soccer"
    ]

    static let afterMissedDays = [
        "\"It's not about being the best. It's about being better than yesterday.\" — Wayne Rooney",
        "\"Champions keep playing until they get it right.\" — Billie Jean King",
        "\"Every champion was once a contender who refused to give up.\" — Rocky Balboa",
        "\"The comeback is always stronger than the setback.\" — Coach Mode",
        "\"Today is a great day to get back on the ball!\" — Young Star Soccer"
    ]

    static let restDay = [
        "\"Rest is not idleness. It's the key to your next breakthrough.\" — Coach Mode",
        "\"Your muscles grow when you rest. Today makes tomorrow stronger.\"",
        "\"Even Messi takes rest days. Recharge and come back stronger!\"",
        "\"Recovery is training too. Your body is rebuilding right now.\"",
        "\"Enjoy today off — tomorrow we go again! ⚽\""
    ]

    static let general = [
        "\"The ball is my best friend.\" — Pelé",
        "\"I'm always looking to improve.\" — Cristiano Ronaldo",
        "\"The secret is to believe in your dreams.\" — Neymar Jr.",
        "\"Play for the name on the front of the jersey.\" — Mia Hamm",
        "\"Success is no accident.\" — Pelé",
        "\"If you're not making mistakes, you're not trying hard enough.\" — Abby Wambach",
        "\"Every day is a chance to be better.\" — Coach Mode"
    ]

    static func quote(context: QuoteContext) -> String {
        let quotes: [String]
        switch context {
        case .personalRecord:
            quotes = afterPersonalRecord
        case .missedDays:
            quotes = afterMissedDays
        case .restDay:
            quotes = restDay
        case .general:
            quotes = general
        }
        return quotes.randomElement() ?? quotes[0]
    }

    enum QuoteContext {
        case personalRecord
        case missedDays
        case restDay
        case general
    }
}
