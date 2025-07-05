import { Link } from "react-router-dom"
import { Crown, Zap, Users, Trophy } from "lucide-react"

export const Landing = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Crown className="h-8 w-8 text-yellow-400" />
            <span className="text-2xl font-bold">ChessMax</span>
          </div>
          <Link to="/login">
            <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-2 rounded-md transition-colors duration-200">
              Login
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
            Master the Game
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Elevate your chess skills with our advanced platform. Play, learn, and compete with players worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/login">
              <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-3 text-lg rounded-md transition-colors duration-200">
                Start Playing
              </button>
            </Link>
            <button className="border border-gray-600 text-white hover:bg-gray-800 px-8 py-3 text-lg rounded-md bg-transparent transition-colors duration-200">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Chess Board Visual */}
        <div className="mt-16 relative">
          <div className="grid grid-cols-8 gap-0 w-80 h-80 mx-auto rounded-lg overflow-hidden shadow-2xl">
            {Array.from({ length: 64 }, (_, i) => {
              const row = Math.floor(i / 8)
              const col = i % 8
              const isLight = (row + col) % 2 === 0
              return (
                <div
                  key={i}
                  className={`aspect-square ${
                    isLight ? "bg-amber-100" : "bg-amber-800"
                  } flex items-center justify-center text-2xl`}
                >
                  {/* Add some chess pieces for visual appeal */}
                  {i === 0 && "♜"}
                  {i === 7 && "♜"}
                  {i === 56 && "♖"}
                  {i === 63 && "♖"}
                  {i === 4 && "♚"}
                  {i === 60 && "♔"}
                </div>
              )
            })}
          </div>
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-400 rounded-full animate-pulse delay-1000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-800 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose ChessMax?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-gray-900 border border-gray-700 hover:border-gray-600 transition-colors duration-200">
              <Zap className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
              <p className="text-gray-400">
                Experience seamless gameplay with our optimized chess engine and real-time multiplayer.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-gray-900 border border-gray-700 hover:border-gray-600 transition-colors duration-200">
              <Users className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Global Community</h3>
              <p className="text-gray-400">
                Connect with millions of chess players worldwide and find opponents at your skill level.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-gray-900 border border-gray-700 hover:border-gray-600 transition-colors duration-200">
              <Trophy className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Competitive Play</h3>
              <p className="text-gray-400">
                Participate in tournaments, climb the leaderboards, and earn achievements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-yellow-400 mb-2">1M+</div>
              <div className="text-gray-400">Active Players</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-400 mb-2">50K+</div>
              <div className="text-gray-400">Daily Games</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-green-400 mb-2">200+</div>
              <div className="text-gray-400">Countries</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-purple-400 mb-2">24/7</div>
              <div className="text-gray-400">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Begin Your Journey?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of players who have already discovered the ultimate chess experience.
          </p>
          <Link to="/login">
            <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-12 py-4 text-xl rounded-md transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
              Create Account
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Crown className="h-6 w-6 text-yellow-400" />
              <span className="text-lg font-semibold text-white">ChessMax</span>
            </div>
            <div className="flex space-x-6 text-gray-400 text-sm">
              <a href="#" className="hover:text-white transition-colors duration-200">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors duration-200">
                Terms
              </a>
              <a href="#" className="hover:text-white transition-colors duration-200">
                Support
              </a>
              <a href="#" className="hover:text-white transition-colors duration-200">
                Contact
              </a>
            </div>
          </div>
          <div className="text-center text-gray-400 text-sm mt-4 pt-4 border-t border-gray-800">
            <p>&copy; 2024 ChessMax. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}


