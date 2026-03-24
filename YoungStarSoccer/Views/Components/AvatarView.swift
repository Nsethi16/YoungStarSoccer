import SwiftUI

struct AvatarView: View {
    var size: CGFloat = 50

    var body: some View {
        ZStack {
            Circle()
                .fill(
                    LinearGradient(
                        colors: [.green, .mint],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: size, height: size)

            Image(systemName: "figure.soccer")
                .font(.system(size: size * 0.45))
                .foregroundStyle(.white)
        }
    }
}
