import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { loginUserBySub } from "../services/authService"
import { ClipLoader } from "react-spinners"
import toast, { Toaster } from "react-hot-toast"

const LoginPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const attemptLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      await loginUserBySub()
      navigate("/dashboard")
    } catch (err) {
      console.error("Błąd logowania:", err)
      setError("Nie udało się zalogować. Spróbuj ponownie.")
      toast.error("Nie udało się zalogować. Spróbuj ponownie.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    attemptLogin()
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      {loading ? (
        <>
          <ClipLoader size={60} color="#3b82f6" />
          <p className="mt-4 text-gray-700">Logowanie...</p>
        </>
      ) : error ? (
        <>
          <h1 className="text-2xl font-bold mb-4 text-red-600">Błąd logowania</h1>
          <p className="mb-6 text-gray-700">{error}</p>
          <button
            onClick={attemptLogin}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Spróbuj ponownie
          </button>
        </>
      ) : null}
    </div>
  )
}

export default LoginPage
