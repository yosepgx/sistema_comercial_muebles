// app/olvide-contrasena/page.tsx  (o pages/olvide-contrasena.tsx si usas el sistema antiguo)

'use client'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import CustomButton from '@/components/customButtom'

export default function OlvideContrasenaPage() {
  const { register, handleSubmit } = useForm()
  const [mensaje, setMensaje] = useState('')
  const [enviado, setEnviado] = useState(false)

  const onSubmit = async (data: any) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}usuarios/olvide-contrasena/`, { 
        method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: data.email }),
    })
      setEnviado(true)
      setMensaje('Si el correo existe, se ha enviado un enlace para restablecer tu contraseña.')
    } catch (error) {
      setMensaje('Ocurrió un error. Intenta nuevamente.')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-4 shadow rounded border">
      <h2 className="text-xl font-bold mb-4">¿Olvidaste tu contraseña?</h2>
      {enviado ? (
        <p>{mensaje}</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            {...register('email', { required: true })}
            className="w-full border px-3 py-2 rounded"
          />
          <CustomButton type='submit'>Enviar</CustomButton>
        </form>
      )}
    </div>
  )
}
