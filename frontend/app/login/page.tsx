'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useAuth } from '@/context/authContext'

const loginSchema = z.object({
  username: z.string(),
  password: z.string().min(6, { message: 'Mínimo 6 caracteres' })
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [error, setError] = useState('')
  const {fetchLogin} = useAuth()
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      fetchLogin(data)
      
    } catch (err) {
      console.error(err)
      setError('Error al iniciar sesión')
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-6">Iniciar sesión</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label>Username</label>
          <input
            
            {...register('username')}
            className="w-full border p-2 rounded"
          />
          {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
        </div>

        <div>
          <label>Contraseña</label>
          <input
            type="password"
            {...register('password')}
            className="w-full border p-2 rounded"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Entrar
        </button>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>
    </div>
  )
}
