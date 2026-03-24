// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "YoungStarSoccer",
    platforms: [.iOS(.v17)],
    dependencies: [
        .package(url: "https://github.com/firebase/firebase-ios-sdk.git", from: "11.0.0"),
    ],
    targets: [
        .executableTarget(
            name: "YoungStarSoccer",
            dependencies: [
                .product(name: "FirebaseAuth", package: "firebase-ios-sdk"),
                .product(name: "FirebaseFirestore", package: "firebase-ios-sdk"),
                .product(name: "FirebaseStorage", package: "firebase-ios-sdk"),
            ],
            path: "YoungStarSoccer"
        ),
    ]
)
