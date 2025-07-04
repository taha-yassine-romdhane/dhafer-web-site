'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import * as z from 'zod'

const signupSchema = z.object({
  username: z.string().min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères'),
  email: z.string().email('Format d\'email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
  phoneNumber: z.string().optional()
    .refine(
      (val) => !val || val === '' || /^\d{8}$/.test(val), 
      'Le numéro de téléphone doit contenir exactement 8 chiffres'
    )
}).refine(
  (data) => data.password === data.confirmPassword, 
  {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword']
  }
)

export default function SignUp() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const [validationErrors, setValidationErrors] = useState<z.ZodIssue[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setValidationErrors([])
    setLoading(true)
    
    try {
      // Validate form data with Zod
      const validationResult = signupSchema.safeParse(formData)
      
      if (!validationResult.success) {
        setValidationErrors(validationResult.error.issues)
        throw new Error('Veuillez corriger les erreurs de validation')
      }
      
      console.log('Submitting form...')
      // First create the user account
      const res = await fetch('/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      })
  
      console.log('Response status:', res.status)
      const data = await res.json()
      console.log('Response data:', data)
  
      if (!res.ok) {
        throw new Error(data.error || 'Error creating account')
      }
      
      // If phone number is provided, subscribe to SMS
      if (formData.phoneNumber && formData.phoneNumber.trim()) {
        try {
          const smsRes = await fetch('/api/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.token}` // Pass the token from signup
            },
            body: JSON.stringify({
              phoneNumber: formData.phoneNumber,
              source: 'signup_page'
            }),
          })
          
          const smsData = await smsRes.json()
          console.log('SMS subscription response:', smsData)
          
          // Even if SMS subscription fails, we continue with account creation success
        } catch (smsErr) {
          console.error('SMS subscription error:', smsErr)
          // We don't throw here as the account was still created successfully
        }
      }
  
      router.push('/login?success=Account created successfully')
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  // Helper function to get field-specific validation errors
  const getFieldError = (fieldName: string) => {
    return validationErrors.find(error => error.path.includes(fieldName))?.message
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] to-[#F0E6D2] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt="Dar-Koftan Logo"
            width={120}
            height={120}
            className="mx-auto"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Créer un nouveau compte
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Déjà un compte?{' '}
          <Link href="/login" className="font-medium text-[#7c3f61] hover:text-[#B59851] transition-colors duration-200">
            Connectez-vous
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/90 backdrop-blur-sm py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-white/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Nom d'utilisateur
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 rounded-lg border ${getFieldError('username') ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:ring-2 focus:ring-[#7c3f61] focus:border-[#7c3f61] transition-all duration-200`}
                  placeholder="Nom d'utilisateur"
                />
              </div>
              {getFieldError('username') && (
                <p className="text-sm text-red-600 mt-1">{getFieldError('username')}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 rounded-lg border ${getFieldError('email') ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:ring-2 focus:ring-[#7c3f61] focus:border-[#7c3f61] transition-all duration-200`}
                  placeholder="Email"
                />
              </div>
              {getFieldError('email') && (
                <p className="text-sm text-red-600 mt-1">{getFieldError('email')}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 rounded-lg border ${getFieldError('password') ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:ring-2 focus:ring-[#7c3f61] focus:border-[#7c3f61] transition-all duration-200`}
                  placeholder="Mot de passe"
                />
              </div>
              {getFieldError('password') && (
                <p className="text-sm text-red-600 mt-1">{getFieldError('password')}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 rounded-lg border ${getFieldError('confirmPassword') ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:ring-2 focus:ring-[#7c3f61] focus:border-[#7c3f61] transition-all duration-200`}
                  placeholder="Confirmer le mot de passe"
                />
              </div>
              {getFieldError('confirmPassword') && (
                <p className="text-sm text-red-600 mt-1">{getFieldError('confirmPassword')}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Numéro de téléphone (optionnel)
              </label>
              <div className="mt-1">
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`block w-full px-4 py-3 rounded-lg border ${getFieldError('phoneNumber') ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:ring-2 focus:ring-[#7c3f61] focus:border-[#7c3f61] transition-all duration-200`}
                  placeholder="Votre numéro de téléphone"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Format: 8 chiffres (ex: 98000000)</p>
              {getFieldError('phoneNumber') && (
                <p className="text-sm text-red-600 mt-1">{getFieldError('phoneNumber')}</p>
              )}
              <p className="text-xs text-gray-500">En fournissant votre numéro, vous acceptez de recevoir nos mises à jour par SMS</p>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#7c3f61] hover:bg-[#B59851] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7c3f61] transition-all duration-200"
              >
                {loading ? 'Chargement...' : 'Créer un compte'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
