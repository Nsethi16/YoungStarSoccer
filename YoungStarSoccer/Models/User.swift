import Foundation
import FirebaseFirestore

struct AppUser: Codable, Identifiable {
    @DocumentID var id: String?
    var email: String
    var displayName: String
    var childProfileId: String?
    var createdAt: Date
    var updatedAt: Date

    init(id: String? = nil, email: String, displayName: String) {
        self.id = id
        self.email = email
        self.displayName = displayName
        self.createdAt = Date()
        self.updatedAt = Date()
    }
}
