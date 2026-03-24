import Foundation
import SwiftUI

// MARK: - Date Extensions
extension Date {
    var startOfWeek: Date {
        let calendar = Calendar.current
        return calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: self))!
    }

    var dayOfWeek: Int {
        Calendar.current.component(.weekday, from: self) - 1 // 0 = Sunday
    }

    var isToday: Bool {
        Calendar.current.isDateInToday(self)
    }

    var dayName: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE"
        return formatter.string(from: self)
    }

    var shortDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        return formatter.string(from: self)
    }

    func daysAgo(_ days: Int) -> Date {
        Calendar.current.date(byAdding: .day, value: -days, to: self)!
    }
}

// MARK: - Color Theme
extension Color {
    static let youngStarGreen = Color(red: 0.2, green: 0.78, blue: 0.35)
    static let youngStarGold = Color(red: 1.0, green: 0.84, blue: 0.0)
    static let youngStarBlue = Color(red: 0.2, green: 0.5, blue: 0.9)
    static let fieldGreen = Color(red: 0.13, green: 0.55, blue: 0.13)
}

// MARK: - Time Formatting
extension Int {
    var timerString: String {
        let minutes = self / 60
        let seconds = self % 60
        return String(format: "%d:%02d", minutes, seconds)
    }

    var durationString: String {
        if self < 60 { return "\(self)s" }
        let minutes = self / 60
        let seconds = self % 60
        if seconds == 0 { return "\(minutes) min" }
        return "\(minutes) min \(seconds)s"
    }
}

// MARK: - Double formatting
extension Double {
    var oneDecimal: String {
        String(format: "%.1f", self)
    }

    var percentString: String {
        String(format: "%.0f%%", self)
    }
}

// MARK: - Array Extensions
extension Array {
    func chunked(into size: Int) -> [[Element]] {
        stride(from: 0, to: count, by: size).map {
            Array(self[$0..<Swift.min($0 + size, count)])
        }
    }
}
