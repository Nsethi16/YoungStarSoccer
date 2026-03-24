import SwiftUI

struct ParentDashboardView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @EnvironmentObject var appState: AppState
    @StateObject private var progressVM = ProgressViewModel()
    @StateObject private var wellnessVM = WellnessViewModel()
    @StateObject private var trainingVM = TrainingViewModel()
    @StateObject private var reviewVM = WeeklyReviewViewModel()
    @StateObject private var weatherVM = WeatherViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Weather Banner
                    WeatherBannerView(weatherVM: weatherVM, trainingVM: trainingVM)

                    // Quick Stats
                    statsOverview

                    // Wellness Alerts
                    if !wellnessVM.alerts.isEmpty {
                        wellnessAlertSection
                    }

                    // This Week's Progress
                    weekProgressSection

                    // Wellness Quick Check-in
                    wellnessQuickAction

                    // Actions
                    parentActions
                }
                .padding()
            }
            .navigationTitle("Parent Dashboard")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        appState.toggleDashboardMode()
                    } label: {
                        Image(systemName: "figure.child")
                            .foregroundStyle(.green)
                    }
                }
            }
            .task {
                if let profileId = authViewModel.childProfile?.id {
                    await progressVM.loadProgress(childProfileId: profileId)
                    await wellnessVM.loadWellnessData(childProfileId: profileId)
                    await trainingVM.loadTrainingPlan(childProfileId: profileId)
                    await weatherVM.checkWeather()
                }
            }
        }
    }

    private var statsOverview: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
            StatCard(title: "This Week", value: "\(progressVM.totalSessionsThisWeek())",
                     subtitle: "sessions", icon: "figure.run", color: .green)
            StatCard(title: "Streak", value: "\(authViewModel.childProfile?.currentStreak ?? 0)",
                     subtitle: "days", icon: "flame.fill", color: .orange)
            StatCard(title: "Total", value: "\(authViewModel.childProfile?.totalSessionsCompleted ?? 0)",
                     subtitle: "sessions", icon: "trophy.fill", color: .blue)
            StatCard(title: "Records", value: "\(progressVM.personalRecords.count)",
                     subtitle: "personal bests", icon: "star.fill", color: .yellow)
        }
    }

    private var wellnessAlertSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("⚠️ Wellness Alerts")
                .font(.headline)
                .foregroundStyle(.orange)

            ForEach(wellnessVM.alerts) { alert in
                VStack(alignment: .leading, spacing: 4) {
                    Text(alert.message)
                        .font(.subheadline.bold())
                    Text(alert.recommendation)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.orange.opacity(0.1))
                .cornerRadius(10)
            }
        }
    }

    private var weekProgressSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("This Week")
                .font(.headline)

            if let plan = trainingVM.currentPlan {
                ForEach(plan.days) { day in
                    HStack {
                        let dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
                        Text(dayNames[day.dayOfWeek])
                            .font(.subheadline)
                            .frame(width: 40, alignment: .leading)

                        if day.type == .restDay {
                            Text("Rest")
                                .font(.caption)
                                .foregroundStyle(.blue)
                        } else {
                            ProgressView(value: Double(day.drills.filter(\.isCompleted).count),
                                        total: Double(max(day.drills.count, 1)))
                                .tint(day.isCompleted ? .green : .blue)

                            Text("\(day.drills.filter(\.isCompleted).count)/\(day.drills.count)")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }

                        if day.isCompleted {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundStyle(.green)
                        }
                    }
                }
            }
        }
        .padding()
        .background(.ultraThinMaterial)
        .cornerRadius(16)
    }

    private var wellnessQuickAction: some View {
        NavigationLink {
            WellnessCheckInView()
        } label: {
            HStack {
                Image(systemName: "heart.fill")
                    .foregroundStyle(.red)
                Text("Daily Wellness Check-in")
                    .font(.subheadline.bold())
                Spacer()
                if wellnessVM.todayLog != nil {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                } else {
                    Text("Not done")
                        .font(.caption)
                        .foregroundStyle(.orange)
                }
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding()
            .background(.ultraThinMaterial)
            .cornerRadius(12)
        }
        .buttonStyle(.plain)
    }

    private var parentActions: some View {
        VStack(spacing: 12) {
            NavigationLink {
                WeeklyPlanView()
            } label: {
                ActionRow(icon: "calendar", title: "Edit Training Plan", color: .blue)
            }

            NavigationLink {
                ProgressOverviewView()
            } label: {
                ActionRow(icon: "chart.line.uptrend.xyaxis", title: "View Progress Charts", color: .green)
            }

            NavigationLink {
                WellnessTrendsView()
            } label: {
                ActionRow(icon: "heart.text.square", title: "Wellness Trends", color: .red)
            }

            NavigationLink {
                WeeklyReviewView()
            } label: {
                ActionRow(icon: "doc.text", title: "Weekly Review & PDF Report", color: .purple)
            }
        }
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let subtitle: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(color)
            Text(value)
                .font(.title.bold())
            VStack(spacing: 2) {
                Text(title)
                    .font(.caption.bold())
                Text(subtitle)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(.ultraThinMaterial)
        .cornerRadius(12)
    }
}

struct ActionRow: View {
    let icon: String
    let title: String
    let color: Color

    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundStyle(color)
                .frame(width: 30)
            Text(title)
                .font(.subheadline)
            Spacer()
            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding()
        .background(.ultraThinMaterial)
        .cornerRadius(12)
    }
}
