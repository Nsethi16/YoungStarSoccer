import SwiftUI

struct ChildDashboardView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @EnvironmentObject var appState: AppState
    @StateObject private var trainingVM = TrainingViewModel()
    @StateObject private var badgeVM = BadgeViewModel()
    @StateObject private var progressVM = ProgressViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Avatar & Greeting
                    headerSection

                    // Streak & Daily Challenge
                    streakAndChallengeSection

                    // Today's Training
                    todayTrainingSection

                    // Motivation Quote
                    MotivationQuoteView(streak: authViewModel.childProfile?.currentStreak ?? 0)

                    // Trophy Shelf Preview
                    trophyPreview
                }
                .padding()
            }
            .navigationTitle("⚽ Let's Train!")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        appState.toggleDashboardMode()
                    } label: {
                        Image(systemName: "person.fill")
                            .foregroundStyle(.green)
                    }
                }
            }
            .task {
                if let profileId = authViewModel.childProfile?.id {
                    await trainingVM.loadTrainingPlan(childProfileId: profileId)
                    await badgeVM.loadBadges(childProfileId: profileId)
                    await progressVM.loadProgress(childProfileId: profileId)
                }
            }
        }
    }

    private var headerSection: some View {
        HStack(spacing: 16) {
            AvatarView(size: 70)

            VStack(alignment: .leading, spacing: 4) {
                Text("Hey, \(authViewModel.childProfile?.name ?? "Star")! 👋")
                    .font(.title2.bold())

                let sessions = authViewModel.childProfile?.totalSessionsCompleted ?? 0
                Text("\(sessions) sessions completed")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            Spacer()
        }
        .padding()
        .background(.ultraThinMaterial)
        .cornerRadius(16)
    }

    private var streakAndChallengeSection: some View {
        HStack(spacing: 12) {
            // Streak
            VStack(spacing: 8) {
                StreakFlameView(streak: authViewModel.childProfile?.currentStreak ?? 0)
                Text("\(authViewModel.childProfile?.currentStreak ?? 0) day streak")
                    .font(.caption.bold())
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.orange.opacity(0.1))
            .cornerRadius(12)

            // Daily Challenge
            if let challenge = badgeVM.todayChallenge {
                VStack(spacing: 8) {
                    Image(systemName: "bolt.fill")
                        .font(.title)
                        .foregroundStyle(.purple)
                    Text("Daily Challenge")
                        .font(.caption.bold())
                    Text(challenge.description)
                        .font(.caption2)
                        .multilineTextAlignment(.center)
                        .lineLimit(2)
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.purple.opacity(0.1))
                .cornerRadius(12)
            }
        }
    }

    private var todayTrainingSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Today's Training")
                    .font(.headline)
                Spacer()
                if let session = trainingVM.todaySession {
                    Text(session.type == .restDay ? "Rest Day 😴" : "\(session.drills.count) drills")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            if let session = trainingVM.todaySession {
                if session.type == .restDay {
                    HStack {
                        Image(systemName: "bed.double.fill")
                            .font(.title)
                            .foregroundStyle(.blue)
                        Text("Rest day — recharge for tomorrow!")
                            .font(.subheadline)
                    }
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(12)
                } else {
                    ForEach(session.drills) { plannedDrill in
                        if let drill = trainingVM.drill(for: plannedDrill.drillId) {
                            HStack {
                                Image(systemName: plannedDrill.isCompleted ? "checkmark.circle.fill" : "circle")
                                    .foregroundStyle(plannedDrill.isCompleted ? .green : .gray)

                                VStack(alignment: .leading) {
                                    Text(drill.name)
                                        .font(.subheadline.bold())
                                    Text(drill.category.rawValue)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                                Spacer()
                                Text(drill.durationSeconds.durationString)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            .padding(.vertical, 4)
                        }
                    }

                    NavigationLink {
                        GuidedSessionView(trainingVM: trainingVM, progressVM: progressVM)
                    } label: {
                        Label("Start Training", systemImage: "play.fill")
                            .font(.headline)
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(.green)
                            .cornerRadius(12)
                    }
                }
            }
        }
        .padding()
        .background(.ultraThinMaterial)
        .cornerRadius(16)
    }

    private var trophyPreview: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("🏆 Trophy Shelf")
                    .font(.headline)
                Spacer()
                NavigationLink("See All") {
                    BadgeShelfView()
                }
                .font(.caption)
            }

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(preloadedBadges.prefix(5)) { badge in
                        VStack(spacing: 4) {
                            Image(systemName: badge.iconName)
                                .font(.title2)
                                .foregroundStyle(badgeVM.isEarned(badge) ? .yellow : .gray.opacity(0.3))
                            Text(badge.name)
                                .font(.caption2)
                                .lineLimit(1)
                        }
                        .frame(width: 60)
                    }
                }
            }
        }
        .padding()
        .background(.ultraThinMaterial)
        .cornerRadius(16)
    }
}
