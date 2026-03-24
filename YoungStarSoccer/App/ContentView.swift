import SwiftUI

struct ContentView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @EnvironmentObject var appState: AppState

    var body: some View {
        Group {
            if authViewModel.isLoading {
                LoadingView()
            } else if authViewModel.user == nil {
                LoginView()
            } else if appState.showOnboarding || authViewModel.childProfile == nil {
                OnboardingView()
            } else {
                MainTabView()
            }
        }
        .animation(.easeInOut, value: authViewModel.user?.id)
    }
}

struct LoadingView: View {
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "soccerball")
                .font(.system(size: 60))
                .foregroundStyle(.green)
                .symbolEffect(.pulse)
            Text("Young Star Soccer")
                .font(.title.bold())
                .foregroundStyle(.primary)
        }
    }
}

struct MainTabView: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        TabView(selection: $appState.selectedTab) {
            ForEach(AppState.Tab.allCases, id: \.self) { tab in
                tabContent(for: tab)
                    .tabItem {
                        Label(tab.rawValue, systemImage: tab.icon)
                    }
                    .tag(tab)
            }
        }
        .tint(.green)
    }

    @ViewBuilder
    private func tabContent(for tab: AppState.Tab) -> some View {
        switch tab {
        case .home:
            DashboardRouter()
        case .train:
            WeeklyPlanView()
        case .progress:
            ProgressOverviewView()
        case .badges:
            BadgeShelfView()
        case .settings:
            SettingsView()
        }
    }
}

struct DashboardRouter: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        switch appState.dashboardMode {
        case .child:
            ChildDashboardView()
        case .parent:
            ParentDashboardView()
        }
    }
}

struct SettingsView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @EnvironmentObject var appState: AppState

    var body: some View {
        NavigationStack {
            List {
                Section("Account") {
                    if let profile = authViewModel.childProfile {
                        HStack {
                            Image(systemName: "person.circle.fill")
                                .font(.title)
                                .foregroundStyle(.green)
                            VStack(alignment: .leading) {
                                Text(profile.name).font(.headline)
                                Text("Age \(profile.age)").font(.caption).foregroundStyle(.secondary)
                            }
                        }
                    }
                }

                Section("Dashboard") {
                    Button {
                        appState.toggleDashboardMode()
                    } label: {
                        HStack {
                            Text("Switch to \(appState.dashboardMode == .child ? "Parent" : "Child") View")
                            Spacer()
                            Image(systemName: appState.dashboardMode == .child ? "person.fill" : "figure.child")
                        }
                    }
                }

                Section("Training") {
                    NavigationLink("Edit Practice Schedule") {
                        PracticeScheduleEditor()
                    }
                    NavigationLink("Manage Drills") {
                        DrillEditorView()
                    }
                }

                Section {
                    Button("Sign Out", role: .destructive) {
                        authViewModel.signOut()
                    }
                }
            }
            .navigationTitle("Settings")
        }
    }
}

struct PracticeScheduleEditor: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var practiceDays: Set<Int> = []
    let dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    var body: some View {
        List {
            Section("Team Practice Days") {
                ForEach(0..<7, id: \.self) { day in
                    Toggle(dayNames[day], isOn: Binding(
                        get: { practiceDays.contains(day) },
                        set: { isOn in
                            if isOn { practiceDays.insert(day) }
                            else { practiceDays.remove(day) }
                        }
                    ))
                }
            }

            Section {
                Button("Save Schedule") {
                    Task {
                        if var profile = authViewModel.childProfile {
                            profile.teamPracticeDays = Array(practiceDays).sorted()
                            await authViewModel.updateChildProfile(profile)
                        }
                    }
                }
                .frame(maxWidth: .infinity)
                .bold()
            }
        }
        .navigationTitle("Practice Schedule")
        .onAppear {
            if let profile = authViewModel.childProfile {
                practiceDays = Set(profile.teamPracticeDays)
            }
        }
    }
}
