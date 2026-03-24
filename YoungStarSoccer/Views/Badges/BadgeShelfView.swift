import SwiftUI

struct BadgeShelfView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var badgeVM = BadgeViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Daily Challenge
                    if let challenge = badgeVM.todayChallenge {
                        DailyChallengeView(challenge: challenge)
                    }

                    // Earned badges
                    let earned = preloadedBadges.filter { badgeVM.isEarned($0) }
                    if !earned.isEmpty {
                        badgeGrid(title: "🏆 Earned", badges: earned, earned: true)
                    }

                    // Locked badges
                    let locked = preloadedBadges.filter { !badgeVM.isEarned($0) }
                    if !locked.isEmpty {
                        badgeGrid(title: "🔒 Keep Going!", badges: locked, earned: false)
                    }
                }
                .padding()
            }
            .navigationTitle("Badges & Trophies")
            .task {
                if let profileId = authViewModel.childProfile?.id {
                    await badgeVM.loadBadges(childProfileId: profileId)
                }
            }
        }
    }

    private func badgeGrid(title: String, badges: [Badge], earned: Bool) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                ForEach(badges) { badge in
                    BadgeCard(badge: badge, isEarned: earned)
                }
            }
        }
    }
}

struct BadgeCard: View {
    let badge: Badge
    let isEarned: Bool

    var body: some View {
        VStack(spacing: 8) {
            ZStack {
                Circle()
                    .fill(isEarned ? Color.yellow.opacity(0.2) : Color.gray.opacity(0.1))
                    .frame(width: 70, height: 70)
                Image(systemName: badge.iconName)
                    .font(.title)
                    .foregroundStyle(isEarned ? .yellow : .gray.opacity(0.4))
            }

            Text(badge.name)
                .font(.caption.bold())
                .multilineTextAlignment(.center)
                .lineLimit(2)

            Text(badge.description)
                .font(.caption2)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .lineLimit(2)
        }
        .padding(8)
        .background(.ultraThinMaterial)
        .cornerRadius(12)
        .opacity(isEarned ? 1 : 0.7)
    }
}

struct DailyChallengeView: View {
    let challenge: DailyChallenge

    var body: some View {
        VStack(spacing: 12) {
            HStack {
                Image(systemName: "bolt.fill")
                    .foregroundStyle(.purple)
                Text("Daily Challenge")
                    .font(.headline)
                Spacer()
                if challenge.isCompleted {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                }
            }

            Text(challenge.description)
                .font(.body)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding()
        .background(Color.purple.opacity(0.1))
        .cornerRadius(12)
    }
}
