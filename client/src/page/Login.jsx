"use client"
import { auth } from "../firebase"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { useNavigate, Link } from "react-router-dom"
import { Crown } from "lucide-react"
import toast, { Toaster } from 'react-hot-toast';

const Login = ({ setUsername }) => {
  const navigate = useNavigate()

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      setUsername(user.displayName || user.email)
      navigate("/chess")
    } catch (error) {
      console.error("Google sign-in error:", error.message)
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error("Popup closed before sign-in completed")
      } else if (error.code === 'auth/cancelled-popup-request') {
        toast.error("Sign-in cancelled")
      } else {
        toast.error("Failed to sign in with Google. Please try again.")
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
    <Toaster/>
      <div className="max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <Crown className="h-8 w-8 text-yellow-400" />
            <span className="text-2xl font-bold">ChessMax</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Welcome to ChessMax</h1>
          <p className="text-gray-400">Sign in with Google to start playing chess</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
          <div className="mb-6">
            <Crown className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Ready to Play?</h2>
            <p className="text-gray-400 text-sm">Join millions of chess players worldwide</p>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-4 rounded-md transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-lg">Continue with Google</span>
          </button>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">By signing in, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors duration-200">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
