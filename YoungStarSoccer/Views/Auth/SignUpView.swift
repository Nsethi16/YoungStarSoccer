import SwiftUI

struct SignUpView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @Environment(\.dismiss) var dismiss
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var displayName = ""

    private var isValid: Bool {
        !email.isEmpty && !password.isEmpty && password == confirmPassword && !displayName.isEmpty && password.count >= 6
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                VStack(spacing: 8) {
                    Image(systemName: "person.badge.plus")
                        .font(.system(size: 50))
                        .foregroundStyle(.green)
                    Text("Create Account")
                        .font(.title.bold())
                    Text("Set up a parent account to get started")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                .padding(.top, 20)

                VStack(spacing: 16) {
                    TextField("Your Name", text: $displayName)
                        .textContentType(.name)
                        .padding()
                        .background(.ultraThinMaterial)
                        .cornerRadius(12)

                    TextField("Email", text: $email)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                        .padding()
                        .background(.ultraThinMaterial)
                        .cornerRadius(12)

                    SecureField("Password (min 6 characters)", text: $password)
                        .textContentType(.newPassword)
                        .padding()
                        .background(.ultraThinMaterial)
                        .cornerRadius(12)

                    SecureField("Confirm Password", text: $confirmPassword)
                        .textContentType(.newPassword)
                        .padding()
                        .background(.ultraThinMaterial)
                        .cornerRadius(12)

                    if !confirmPassword.isEmpty && password != confirmPassword {
                        Text("Passwords don't match")
                            .font(.caption)
                            .foregroundStyle(.red)
                    }
                }
                .padding(.horizontal)

                if let error = authViewModel.errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundStyle(.red)
                        .padding(.horizontal)
                }

                Button {
                    Task {
                        await authViewModel.signUp(email: email, password: password, displayName: displayName)
                    }
                } label: {
                    Text("Create Account")
                        .font(.headline)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(isValid ? Color.green : Color.gray)
                        .cornerRadius(12)
                }
                .padding(.horizontal)
                .disabled(!isValid)
            }
        }
        .navigationTitle("Sign Up")
        .navigationBarTitleDisplayMode(.inline)
    }
}
