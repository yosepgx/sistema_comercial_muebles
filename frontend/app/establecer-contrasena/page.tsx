// app/establecer-contrasena/page.tsx  (o pages/establecer-contrasena.tsx)

'use client'
import { useForm } from 'react-hook-form'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import CustomButton from '@/components/customButtom'

function EstablecerContrasena() {
  const { register, handleSubmit } = useForm()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [tokenValido, setTokenValido] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const uid = searchParams.get('uid')
  const token = searchParams.get('token')

  useEffect(() => {
    if (uid && token) {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}usuarios/verificar-token/?uid=${uid}&token=${token}`
      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (data.valid) setTokenValido(true)
          else setMensaje('Token inválido o expirado.')
        })
        .catch(() => {
          setMensaje('Error al verificar el token.')
        })
    }
  }, [uid, token])


  const onSubmit = async (data: any) => {
    if (data.nueva_contrasena !== data.confirmar_contrasena) {
      setMensaje('Las contraseñas no coinciden.')
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}usuarios/establecer-contrasena/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid,
          token,
          nueva_contrasena: data.nueva_contrasena,
          confirmar_contrasena: data.confirmar_contrasena,
        }),
      })

      const result = await response.json()
      if (response.ok) {
        setMensaje('Contraseña actualizada. Serás redirigido al login.')
        setTimeout(() => router.push('/login'), 3000)
      } else {
        setMensaje(result?.error || 'Error al establecer la contraseña.')
      }
    } catch (error) {
      setMensaje('Error de red. Intenta de nuevo.')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-4 shadow rounded border">
      <h2 className="text-xl font-bold mb-4">Establecer nueva contraseña</h2>
      {tokenValido ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="password"
            placeholder="Nueva contraseña"
            {...register('nueva_contrasena', { required: true })}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            {...register('confirmar_contrasena', { required: true })}
            className="w-full border px-3 py-2 rounded"
          />
          <CustomButton type="submit">Guardar</CustomButton>
        </form>
      ) : (
        <p>{mensaje}</p>
      )}
    </div>
  )
}

export default function EstablecerContrasenaPage(){
    return(
        <Suspense>
            <EstablecerContrasena/>
        </Suspense>
    )
}