import SwiftUI

struct WeeklyReviewView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var reviewVM = WeeklyReviewViewModel()
    @StateObject private var progressVM = ProgressViewModel()
    @StateObject private var wellnessVM = WellnessViewModel()

    @State private var reflectionText = ""
    @State private var goals: [String] = ["", "", ""]
    @State private var showShareSheet = false

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                if let review = reviewVM.currentReview {
                    reviewContent(review)
                } else {
                    generateSection
                }

                // Past reviews
                if !reviewVM.pastReviews.isEmpty {
                    pastReviewsSection
                }
            }
            .padding()
        }
        .navigationTitle("Weekly Review")
        .task {
            if let profileId = authViewModel.childProfile?.id {
                await reviewVM.loadReviews(childProfileId: profileId)
                await progressVM.loadProgress(childProfileId: profileId)
                await wellnessVM.loadWellnessData(childProfileId: profileId)
            }
        }
        .sheet(isPresented: $showShareSheet) {
            if let data = reviewVM.pdfData {
                ShareSheet(items: [data])
            }
        }
    }

    private var generateSection: some View {
        VStack(spacing: 16) {
            Image(systemName: "doc.text.magnifyingglass")
                .font(.system(size: 50))
                .foregroundStyle(.purple)

            Text("Ready for your weekly review?")
                .font(.title3.bold())

            Text("Let's see how the week went and set goals for next week.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            Button {
                generateReview()
            } label: {
                Label("Generate Review", systemImage: "sparkles")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(.purple)
                    .cornerRadius(12)
            }
        }
        .padding()
        .background(.ultraThinMaterial)
        .cornerRadius(16)
    }

    private func reviewContent(_ review: WeeklyReview) -> some View {
        VStack(spacing: 16) {
            // Summary
            VStack(alignment: .leading, spacing: 12) {
                Text("📊 This Week's Summary")
                    .font(.headline)

                HStack(spacing: 16) {
                    ReviewStat(label: "Sessions", value: "\(review.sessionsCompleted)/\(review.totalSessions)")
                    ReviewStat(label: "Drills", value: "\(review.totalDrillsCompleted)")
                    ReviewStat(label: "Minutes", value: "\(review.totalMinutesTrained)")
                    ReviewStat(label: "PRs", value: "\(review.personalRecordsSet)")
                }
            }
            .padding()
            .background(.ultraThinMaterial)
            .cornerRadius(12)

            // Biggest improvement
            if let improvement = review.biggestImprovement {
                HStack {
                    Image(systemName: "trophy.fill")
                        .foregroundStyle(.yellow)
                    Text(improvement)
                        .font(.subheadline.bold())
                }
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(.yellow.opacity(0.1))
                .cornerRadius(12)
            }

            // Reflection
            VStack(alignment: .leading, spacing: 8) {
                Text("💭 What felt hard this week?")
                    .font(.headline)
                TextEditor(text: $reflectionText)
                    .frame(minHeight: 60)
                    .padding(8)
                    .background(.ultraThinMaterial)
                    .cornerRadius(8)
            }

            // Goals
            GoalSettingView(goals: $goals)

            // Save & Export
            HStack(spacing: 12) {
                Button {
                    saveReview()
                } label: {
                    Label("Save Review", systemImage: "square.and.arrow.down")
                        .font(.subheadline.bold())
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(.green)
                        .cornerRadius(12)
                }

                Button {
                    exportPDF()
                } label: {
                    Label("Export PDF", systemImage: "doc.fill")
                        .font(.subheadline.bold())
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(.blue)
                        .cornerRadius(12)
                }
            }
        }
    }

    private var pastReviewsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("📋 Past Reviews")
                .font(.headline)

            ForEach(reviewVM.pastReviews) { review in
                HStack {
                    VStack(alignment: .leading) {
                        Text("Week of \(review.weekStartDate.shortDate)")
                            .font(.subheadline.bold())
                        Text("\(review.sessionsCompleted)/\(review.totalSessions) sessions • \(review.personalRecordsSet) PRs")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    Image(systemName: "chevron.right")
                        .foregroundStyle(.secondary)
                }
                .padding()
                .background(.ultraThinMaterial)
                .cornerRadius(10)
            }
        }
    }

    private func generateReview() {
        guard let profileId = authViewModel.childProfile?.id else { return }
        Task {
            let review = await reviewVM.generateWeeklyReview(
                childProfileId: profileId,
                sessionLogs: progressVM.sessionLogs,
                progressRecords: progressVM.records
            )
            reviewVM.currentReview = review
        }
    }

    private func saveReview() {
        guard var review = reviewVM.currentReview else { return }
        review.reflectionHard = reflectionText
        review.goalsForNextWeek = goals.filter { !$0.isEmpty }
        Task {
            await reviewVM.saveReview(review)
        }
    }

    private func exportPDF() {
        guard let review = reviewVM.currentReview else { return }
        reviewVM.generatePDF(
            review: review,
            childName: authViewModel.childProfile?.name ?? "Player",
            progressRecords: progressVM.records,
            wellnessLogs: wellnessVM.recentLogs
        )
        showShareSheet = true
    }
}

struct ReviewStat: View {
    let label: String
    let value: String

    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title3.bold())
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
}

struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}
