import Foundation
import FirebaseAuth

@MainActor
class AuthViewModel: ObservableObject {
    @Published var user: AppUser?
    @Published var childProfile: ChildProfile?
    @Published var isLoading = true
    @Published var errorMessage: String?

    private var authHandle: AuthStateDidChangeListenerHandle?

    init() {
        listenToAuthState()
    }

    deinit {
        if let handle = authHandle {
            AuthService.shared.removeAuthStateListener(handle)
        }
    }

    private func listenToAuthState() {
        authHandle = AuthService.shared.addAuthStateListener { [weak self] userId in
            Task { @MainActor in
                guard let self = self else { return }
                if let userId = userId {
                    await self.loadUserData(userId: userId)
                } else {
                    self.user = nil
                    self.childProfile = nil
                }
                self.isLoading = false
            }
        }
    }

    private func loadUserData(userId: String) async {
        do {
            user = try await FirestoreService.shared.getUser(id: userId)
            childProfile = try await FirestoreService.shared.getChildProfile(parentUserId: userId)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func signUp(email: String, password: String, displayName: String) async {
        do {
            errorMessage = nil
            let userId = try await AuthService.shared.signUp(email: email, password: password)
            let newUser = AppUser(id: userId, email: email, displayName: displayName)
            try await FirestoreService.shared.createUser(newUser, id: userId)
            user = newUser
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func signIn(email: String, password: String) async {
        do {
            errorMessage = nil
            _ = try await AuthService.shared.signIn(email: email, password: password)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func signOut() {
        do {
            try AuthService.shared.signOut()
            user = nil
            childProfile = nil
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func createChildProfile(name: String, age: Int, teamName: String, practiceDays: [Int]) async {
        guard let userId = user?.id else { return }
        do {
            var profile = ChildProfile(parentUserId: userId, name: name, age: age,
                                       teamName: teamName, practiceDays: practiceDays)
            let profileId = try await FirestoreService.shared.createChildProfile(profile)
            profile.id = profileId
            childProfile = profile

            // Seed drills and generate first training plan
            try await FirestoreService.shared.seedDrillsIfNeeded()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func updateChildProfile(_ profile: ChildProfile) async {
        do {
            try await FirestoreService.shared.updateChildProfile(profile)
            childProfile = profile
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
