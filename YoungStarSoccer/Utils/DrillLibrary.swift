import Foundation

struct DrillLibrary {
    // MARK: - Speed Drills
    static let sprintDrills: [Drill] = [
        Drill(name: "20-Yard Dash",
              category: .speed, difficulty: .beginner, durationSeconds: 60, reps: 5,
              instructions: [
                "Set up two cones 20 yards apart",
                "Start in a ready stance at the first cone",
                "Sprint as fast as you can to the second cone",
                "Walk back to start and repeat"
              ],
              coachingTips: [
                "Stay on the balls of your feet",
                "Pump your arms forward and back, not side to side",
                "Lean slightly forward as you start"
              ],
              timeTarget: "Under 4.5 seconds",
              equipment: ["2 cones"], isIndoor: false, isCustom: false,
              measurableType: .sprintTime),

        Drill(name: "Shuttle Run",
              category: .speed, difficulty: .intermediate, durationSeconds: 120, reps: 4,
              instructions: [
                "Place 3 cones in a line, 5 yards apart",
                "Start at the first cone",
                "Sprint to the middle cone and back",
                "Then sprint to the far cone and back",
                "That's one rep"
              ],
              coachingTips: [
                "Plant your outside foot hard when turning",
                "Stay low through the turns",
                "Keep your eyes up"
              ],
              timeTarget: "Under 12 seconds per rep",
              equipment: ["3 cones"], isIndoor: false, isCustom: false,
              measurableType: .sprintTime),

        Drill(name: "Ladder Quick Feet",
              category: .speed, difficulty: .beginner, durationSeconds: 90, reps: 6,
              instructions: [
                "Lay the agility ladder flat on the ground",
                "Run through stepping both feet in each box",
                "Go as fast as you can while staying accurate",
                "Walk back and repeat"
              ],
              coachingTips: [
                "Light feet — barely touch the ground",
                "Arms help you move faster",
                "Don't look down after the first few tries"
              ],
              timeTarget: nil,
              equipment: ["Agility ladder (or chalk lines)"], isIndoor: false, isCustom: false,
              measurableType: nil),
    ]

    // MARK: - Shooting Drills
    static let shootingDrills: [Drill] = [
        Drill(name: "Target Shooting",
              category: .shooting, difficulty: .beginner, durationSeconds: 180, reps: 10,
              instructions: [
                "Place the ball 10 yards from the goal or wall target",
                "Pick a corner — top left, top right, bottom left, or bottom right",
                "Shoot with your laces aiming for that corner",
                "Track how many you hit out of 10"
              ],
              coachingTips: [
                "Plant foot next to the ball, pointing at target",
                "Strike through the center of the ball for power",
                "Follow through toward your target"
              ],
              timeTarget: nil,
              equipment: ["Ball", "Goal or wall with targets"], isIndoor: false, isCustom: false,
              measurableType: .shotAccuracy),

        Drill(name: "Rapid Fire Finishing",
              category: .shooting, difficulty: .intermediate, durationSeconds: 120, reps: 8,
              instructions: [
                "Line up 4 balls in a row, each 1 yard apart",
                "Start at the first ball",
                "Shoot, then immediately move to the next ball",
                "Shoot all 4 as quickly as possible",
                "Set up and repeat"
              ],
              coachingTips: [
                "Don't take a big backswing — quick compact strike",
                "Accuracy over power for this drill",
                "Reset your body between each shot"
              ],
              timeTarget: "All 4 shots in under 8 seconds",
              equipment: ["4 balls", "Goal or wall"], isIndoor: false, isCustom: false,
              measurableType: .shotAccuracy),

        Drill(name: "Weak Foot Practice",
              category: .shooting, difficulty: .beginner, durationSeconds: 120, reps: 10,
              instructions: [
                "Stand 8 yards from the target",
                "Shoot using only your weaker foot",
                "Focus on making solid contact first, then aim",
                "Track hits out of 10"
              ],
              coachingTips: [
                "Plant foot a bit wider than usual for balance",
                "Start gentle — accuracy before power",
                "It's okay if it feels weird, that means you're growing!"
              ],
              timeTarget: nil,
              equipment: ["Ball", "Goal or wall"], isIndoor: false, isCustom: false,
              measurableType: .shotAccuracy),
    ]

    // MARK: - Dribbling Drills
    static let dribblingDrills: [Drill] = [
        Drill(name: "Cone Weave",
              category: .dribbling, difficulty: .beginner, durationSeconds: 120, reps: 5,
              instructions: [
                "Set up 5 cones in a line, 2 yards apart",
                "Dribble the ball weaving in and out of each cone",
                "Use the inside and outside of your foot",
                "Turn around at the end and come back"
              ],
              coachingTips: [
                "Small touches — keep the ball close",
                "Use both feet to change direction",
                "Head up! Try not to stare at the ball"
              ],
              timeTarget: "Under 15 seconds",
              equipment: ["5 cones", "Ball"], isIndoor: false, isCustom: false,
              measurableType: .dribblingReps),

        Drill(name: "Figure 8 Dribble",
              category: .dribbling, difficulty: .intermediate, durationSeconds: 90, reps: 6,
              instructions: [
                "Place two cones 3 yards apart",
                "Dribble the ball in a figure-8 pattern around both cones",
                "Use the inside of your right foot going right",
                "Use the inside of your left foot going left",
                "That's one rep"
              ],
              coachingTips: [
                "Stay low and balanced",
                "Soft touches — don't kick it ahead",
                "Speed up as you get comfortable"
              ],
              timeTarget: "Under 10 seconds per figure 8",
              equipment: ["2 cones", "Ball"], isIndoor: false, isCustom: false,
              measurableType: .dribblingReps),

        Drill(name: "1v1 Cone Beat",
              category: .dribbling, difficulty: .advanced, durationSeconds: 90, reps: 5,
              instructions: [
                "Set up a cone as your 'defender' with space behind it",
                "Start 5 yards away with the ball",
                "Dribble toward the cone",
                "Do a skill move (stepover, scissors, or pullback) to get past",
                "Accelerate past the cone"
              ],
              coachingTips: [
                "Slow down before the move, explode after",
                "Sell the fake with your body, not just your feet",
                "Practice the same move 5 times, then try a new one"
              ],
              timeTarget: nil,
              equipment: ["1 cone", "Ball"], isIndoor: false, isCustom: false,
              measurableType: nil),
    ]

    // MARK: - Ball Mastery (Indoor-friendly)
    static let ballMasteryDrills: [Drill] = [
        Drill(name: "Toe Taps",
              category: .ballMastery, difficulty: .beginner, durationSeconds: 60, reps: 50,
              instructions: [
                "Stand with the ball in front of you",
                "Alternate tapping the top of the ball with each foot",
                "Left-right-left-right as fast as you can",
                "Count your taps in 60 seconds"
              ],
              coachingTips: [
                "Stay on the balls of your feet",
                "Light touches — barely tap the ball",
                "Keep your knees slightly bent"
              ],
              timeTarget: "50 taps in 60 seconds",
              equipment: ["Ball (or rolled-up socks)"], isIndoor: true, isCustom: false,
              measurableType: .dribblingReps),

        Drill(name: "Ball Rolls",
              category: .ballMastery, difficulty: .beginner, durationSeconds: 60, reps: 20,
              instructions: [
                "Place your foot on top of the ball",
                "Roll it side to side using the sole of your foot",
                "Switch feet every 10 rolls",
                "Keep the ball under control"
              ],
              coachingTips: [
                "Use the middle of your sole, not your toe",
                "Stay balanced — arms out for support",
                "Speed up as it gets easier"
              ],
              timeTarget: nil,
              equipment: ["Ball"], isIndoor: true, isCustom: false,
              measurableType: nil),

        Drill(name: "Sock Ball Juggling",
              category: .ballMastery, difficulty: .intermediate, durationSeconds: 120, reps: nil,
              instructions: [
                "Roll up a pair of socks into a ball",
                "Drop it and try to keep it in the air with your feet",
                "Count how many touches you get before it drops",
                "Try to beat your record each round"
              ],
              coachingTips: [
                "Lock your ankle — firm foot",
                "Gentle taps up, not kicks",
                "Use your thighs if the ball goes too high"
              ],
              timeTarget: nil,
              equipment: ["Rolled-up socks"], isIndoor: true, isCustom: false,
              measurableType: .dribblingReps),
    ]

    // MARK: - Passing Drills
    static let passingDrills: [Drill] = [
        Drill(name: "Wall Passing",
              category: .passing, difficulty: .beginner, durationSeconds: 120, reps: 20,
              instructions: [
                "Stand 5 yards from a wall",
                "Pass the ball against the wall with your inside foot",
                "Control the return with your other foot",
                "Alternate left and right foot passes"
              ],
              coachingTips: [
                "Lock your ankle on the pass",
                "Cushion the ball when it comes back",
                "Aim for the same spot on the wall every time"
              ],
              timeTarget: nil,
              equipment: ["Ball", "Wall"], isIndoor: true, isCustom: false,
              measurableType: .passingAccuracy),

        Drill(name: "Target Pass",
              category: .passing, difficulty: .intermediate, durationSeconds: 120, reps: 10,
              instructions: [
                "Place a cone or target 10 yards away",
                "Pass the ball trying to hit the target",
                "Track how many you hit out of 10",
                "Move the target further away as you improve"
              ],
              coachingTips: [
                "Look at your target before you pass",
                "Follow through toward the target",
                "Plant foot points where you want the ball to go"
              ],
              timeTarget: nil,
              equipment: ["Ball", "1 cone or target"], isIndoor: false, isCustom: false,
              measurableType: .passingAccuracy),
    ]

    // MARK: - Indoor Footwork
    static let footworkDrills: [Drill] = [
        Drill(name: "Hallway Footwork",
              category: .footwork, difficulty: .beginner, durationSeconds: 90, reps: 4,
              instructions: [
                "Find a clear hallway or long room",
                "Dribble the ball slowly down the hallway",
                "Use only the sole of your foot to guide it",
                "Turn at the end and come back with the other foot"
              ],
              coachingTips: [
                "Tiny touches to stay in control",
                "Keep the ball glued to your foot",
                "Walls are your friend — use them as bumpers"
              ],
              timeTarget: nil,
              equipment: ["Ball or rolled-up socks"], isIndoor: true, isCustom: false,
              measurableType: nil),

        Drill(name: "Laundry Basket Shooting",
              category: .footwork, difficulty: .beginner, durationSeconds: 120, reps: 10,
              instructions: [
                "Put a laundry basket on its side as a goal",
                "Use a sock ball",
                "Stand 5 feet away and try to shoot into the basket",
                "Track how many you score out of 10"
              ],
              coachingTips: [
                "Same technique as real shooting — plant and strike",
                "Aim low to get it in the basket",
                "This is great weak foot practice too!"
              ],
              timeTarget: nil,
              equipment: ["Laundry basket", "Sock ball"], isIndoor: true, isCustom: false,
              measurableType: .shotAccuracy),
    ]

    // MARK: - All Drills
    static var allDrills: [Drill] {
        sprintDrills + shootingDrills + dribblingDrills + ballMasteryDrills + passingDrills + footworkDrills
    }

    static var outdoorDrills: [Drill] {
        allDrills.filter { !$0.isIndoor }
    }

    static var indoorDrills: [Drill] {
        allDrills.filter { $0.isIndoor }
    }

    static func drills(for category: Drill.DrillCategory) -> [Drill] {
        allDrills.filter { $0.category == category }
    }
}
