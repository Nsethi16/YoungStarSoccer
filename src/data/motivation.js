export const quotes = [
  { text: "The more you sweat in training, the less you bleed in combat.", author: "Pele" },
  { text: "I start early, and I stay late, day after day, year after year.", author: "Lionel Messi" },
  { text: "I don't have time for hobbies. At the end of the day, I treat my job as a hobby. It's something I love doing.", author: "David Beckham" },
  { text: "There is always someone out there getting better than you by training harder than you.", author: "Cristiano Ronaldo" },
  { text: "I learned all about life with a ball at my feet.", author: "Ronaldinho" },
  { text: "The secret is to believe in your dreams; in your potential that you can be like your star, keep searching, keep believing, and don't lose faith in yourself.", author: "Neymar" },
  { text: "You have to fight to reach your dream. You have to sacrifice and work hard for it.", author: "Lionel Messi" },
  { text: "I'm living a dream I never want to wake up from.", author: "Cristiano Ronaldo" },
  { text: "Every time I went away I was deceiving my mum. I'd tell her I was going to school but I'd be out on the snowy streets playing football.", author: "Zinedine Zidane" },
  { text: "Quality without results is pointless. Results without quality is boring.", author: "Johan Cruyff" },
  { text: "I once cried because I had no shoes to play soccer, but one day I met a man who had no feet, and I realized how rich I am.", author: "Zinedine Zidane" },
  { text: "Success is no accident. It is hard work, perseverance, learning, studying, sacrifice, and most of all, love of what you are doing.", author: "Pele" },
  { text: "An athlete cannot run with money in his pockets. He must run with hope in his heart and dreams in his head.", author: "Emil Zatopek" },
  { text: "If you want to be the best, you have to do things that other people aren't willing to do.", author: "Kylian Mbappe" },
  { text: "When people succeed, it is because of hard work. Luck has nothing to do with success.", author: "Diego Maradona" },
  { text: "Football is like life — it requires perseverance, self-denial, hard work, sacrifice, dedication, and respect for authority.", author: "Vince Lombardi" },
  { text: "Some people think football is a matter of life and death. I assure you, it's much more important than that.", author: "Bill Shankly" },
  { text: "The ball is round, the game lasts 90 minutes, and everything else is just theory.", author: "Sepp Herberger" },
  { text: "You don't have to be tall, strong, or fast. If you have the skill, the brain, and the desire, you can play.", author: "Andrea Pirlo" },
  { text: "In football, the worst blindness is only seeing the ball.", author: "Nelson Falcao" },
  { text: "Playing football is very simple, but playing simple football is the hardest thing there is.", author: "Johan Cruyff" },
  { text: "Talent without working hard is nothing.", author: "Cristiano Ronaldo" },
  { text: "Everything I have in my career, I owe to football and it has also given me so many bad moments, but good always wins.", author: "Ronaldinho" },
  { text: "In his head, a footballer should be a talent scout, taking note of every weakness of the opposition.", author: "Luka Modric" },
  { text: "You must always try to be the best, but you must never believe that you are.", author: "Andres Iniesta" },
  { text: "The more difficult the victory, the greater the happiness in winning.", author: "Pele" },
  { text: "Don't try to be the next Messi or Ronaldo. Be the first you.", author: "Thierry Henry" },
  { text: "It takes a lot of sacrifice. Your friends go out, you can't go. You must stay focused on your dream.", author: "Didier Drogba" },
  { text: "To win you have to score one more goal than your opponent.", author: "Johan Cruyff" },
  { text: "Football is a game you play with your brain.", author: "Johan Cruyff" },
  { text: "I'm not a perfectionist, but I like to feel that things are done well.", author: "Xavi Hernandez" },
  { text: "Every professional was once an amateur. Every expert was once a beginner.", author: "Ronaldinho" },
];

export const tips = [
  { text: "Always practice with both feet. Being two-footed doubles your options on the field.", category: "Technique" },
  { text: "Keep your head up while dribbling. Great players know what's around them before they receive the ball.", category: "Technique" },
  { text: "Use the inside of your foot for short, accurate passes. It gives you the biggest surface area and best control.", category: "Technique" },
  { text: "When shooting, plant your non-kicking foot beside the ball and point it where you want the shot to go.", category: "Technique" },
  { text: "Lock your ankle when striking the ball. A floppy ankle loses power and accuracy.", category: "Technique" },
  { text: "Before you receive the ball, check your shoulders to see who is around you. This gives you a head start on your next move.", category: "Game IQ" },
  { text: "Always have a plan before the ball comes to you: pass, dribble, or shoot. Decide early.", category: "Game IQ" },
  { text: "Move into space after you pass. Standing still after passing makes you invisible to your teammates.", category: "Game IQ" },
  { text: "Watch professional matches and pick one player in your position. Study their movement, not just the ball.", category: "Game IQ" },
  { text: "Communicate with your teammates. Call for the ball, warn them of defenders, and encourage each other.", category: "Game IQ" },
  { text: "Mistakes are proof that you are trying. The best players make mistakes every game — they just recover fast.", category: "Mindset" },
  { text: "Set one small goal for each training session. Achieving small goals builds confidence for big ones.", category: "Mindset" },
  { text: "Visualize yourself succeeding before a game. Picture making that pass, that save, that goal.", category: "Mindset" },
  { text: "Stay positive on the field even when things go wrong. Negative body language affects the whole team.", category: "Mindset" },
  { text: "Compare yourself only to who you were last week, not to other players. Progress is personal.", category: "Mindset" },
  { text: "Drink water throughout the day, not just during training. Dehydration starts hours before you feel thirsty.", category: "Nutrition" },
  { text: "Eat a meal with carbs and protein 2-3 hours before training. A banana and peanut butter toast is a great pre-game snack.", category: "Nutrition" },
  { text: "Chocolate milk is an excellent recovery drink after a hard session — it has the right mix of carbs and protein.", category: "Nutrition" },
  { text: "Get at least 9 hours of sleep. Your body builds muscle and processes what you learned while you sleep.", category: "Recovery" },
  { text: "Always stretch after training, never skip the cool-down. Five minutes of stretching prevents weeks of injury.", category: "Recovery" },
  { text: "Use a foam roller on sore legs. Rolling out your quads, hamstrings, and calves speeds up recovery.", category: "Recovery" },
  { text: "Take at least one full rest day per week. Rest is when your body actually gets stronger.", category: "Recovery" },
];

/**
 * Returns a deterministic daily quote based on the day of the year.
 * Same quote shows all day, changes at midnight.
 */
export function getDailyQuote(date = new Date()) {
  const dayOfYear = Math.floor(
    (date - new Date(date.getFullYear(), 0, 0)) / 86400000
  );
  return quotes[dayOfYear % quotes.length];
}

/**
 * Returns a deterministic daily tip based on the day of the year.
 * Offset from quotes so they don't cycle in sync.
 */
export function getDailyTip(date = new Date()) {
  const dayOfYear = Math.floor(
    (date - new Date(date.getFullYear(), 0, 0)) / 86400000
  );
  return tips[dayOfYear % tips.length];
}
