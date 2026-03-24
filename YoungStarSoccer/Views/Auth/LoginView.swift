import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var email = ""
    @State private var password = ""
    @State private var showSignUp = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 30) {
                Spacer()

                // Logo
                VStack(spacing: 12) {
                    Image(systemName: "soccerball")
                        .font(.system(size: 80))
                        .foregroundStyle(.green)
                    Text("Young Star Soccer")
                        .font(.largeTitle.bold())
                    Text("Train like a champion")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                // Login Form
                VStack(spacing: 16) {
                    TextField("Email", text: $email)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                        .padding()
                        .background(.ultraThinMaterial)
                        .cornerRadius(12)

                    SecureField("Password", text: $password)
                        .textContentType(.password)
                        .padding()
                        .background(.ultraThinMaterial)
                        .cornerRadius(12)
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
                        await authViewModel.signIn(email: email, password: password)
                    }
                } label: {
                    Text("Sign In")
                        .font(.headline)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(.green)
                        .cornerRadius(12)
                }
                .padding(.horizontal)
                .disabled(email.isEmpty || password.isEmpty)

                Button("Don't have an account? Sign Up") {
                    showSignUp = true
                }
                .foregroundStyle(.green)

                Spacer()
            }
            .navigationDestination(isPresented: $showSignUp) {
                SignUpView()
            }
        }
    }
}
