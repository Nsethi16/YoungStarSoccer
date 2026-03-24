import SwiftUI

enum DashboardMode {
    case child
    case parent
}

class AppState: ObservableObject {
    @Published var dashboardMode: DashboardMode = .child
    @Published var selectedTab: Tab = .home
    @Published var showOnboarding: Bool = false

    enum Tab: String, CaseIterable {
        case home = "Home"
        case train = "Train"
        case progress = "Progress"
        case badges = "Badges"
        case settings = "Settings"

        var icon: String {
            switch self {
            case .home: return "house.fill"
            case .train: return "figure.run"
            case .progress: return "chart.line.uptrend.xyaxis"
            case .badges: return "trophy.fill"
            case .settings: return "gearshape.fill"
            }
        }
    }

    func toggleDashboardMode() {
        dashboardMode = dashboardMode == .child ? .parent : .child
    }
}
