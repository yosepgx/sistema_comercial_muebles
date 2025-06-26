'use client'
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { string, z } from 'zod';
import { Tusuario } from '../types/usuarioType';
import { useEffect, useState } from 'react';
import { GetUsuarioDetailApi, PostUsuarioAPI, SingUpUsuarioAPI, UpdateUsuarioAPI } from '@/api/usuarioApis';
import { useParams, useRouter } from 'next/navigation';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { GetRolListApi } from '@/api/rolesApis';
import { BotonesFinales } from '../botonesFinales';
const usernameRegex = /^[a-zA-Z0-9@.+\-_]+$/;

const formSchema = z.object({
    id: z.string(),
    username: z.string().regex(
    usernameRegex,
    'El nombre de usuario solo puede contener letras, números y los caracteres @ . + - _ sin espacios intermedios.'
    ),
    email: z.string().email({ message: 'Correo electrónico inválido' }),
    rol: string(),
    is_active: z.string(),
    password: z.string().optional(), //TODO: validacion de campo minimo contraseña
})

type FormValues = z.infer<typeof formSchema>


const formSchemaSend = formSchema.transform(data => ({
    ...data,
    id: parseInt(data.id, 10),
    groups: data.rol?[data.rol]:[],
    is_active: data.is_active === "true",
  })
)

type Props = {
  tipo: 'nuevo' | 'edicion'
}

export default function FormularioUsuario({tipo}: Props){
    const [loading, setLoading] = useState(true);
    const router = useRouter()
    const {id} = useParams()
    const form = useForm<z.infer<typeof formSchema>>({
          resolver: zodResolver(formSchema),
          defaultValues: {
            id: '',
            username: '',
            password: '',
            email: '',
            rol: 'administrador',
            is_active: 'true',
            //password undefined
          }});

    const cargarUsuario = (usuario: Tusuario | null) => {
        if(!usuario)return;
        console.log("usuario cargado", usuario)
        form.setValue('id', `${usuario.id}`);
        form.setValue('username', usuario.username);
        form.setValue('email', usuario.email);
        form.setValue('rol', usuario.groups[0]);
        form.setValue('is_active', `${usuario.is_active}`);
      }
      
    useEffect(()=>{
        if(tipo ==='edicion' && id){
            GetUsuarioDetailApi(null, parseInt(id as string, 10)).then(
                data => cargarUsuario(data)
            ).finally(() => setLoading(false))
        }
        
      },[tipo,id])
      
    const onSubmit = async (rawdata: FormValues) => {
        //check si roles existen
        const verified = formSchemaSend.parse(rawdata)
        const {rol , ...data} = verified
        const roles = await GetRolListApi(null);
        const roleNames = roles.map((role: { name: string }) => role.name);
        const requiredRoles = ['administrador', 'ventas', 'logistica'];
        const allRolesExist = requiredRoles.every(role => roleNames.includes(role));

        if (allRolesExist) {
            if(tipo === "nuevo"){
                //await PostUsuarioAPI(null,data);
                await SingUpUsuarioAPI(null,data)
            }
            else{
                await UpdateUsuarioAPI(null,data.id,data);
            }
            router.push('/ajustes/usuarios')
        }
        else{
            console.warn("No existen todos los roles necesarios")
        }
    }


    if(loading && tipo === 'edicion')return (<div>Cargando...</div>)
      
    return (
        <div>
          <Form {...form}> 
           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                control = {form.control}
                name = "id"
                render={({field}) => (
                    <FormItem className='flex flex-col' hidden = {tipo === 'nuevo'}>
                    <FormLabel> Código del usuario</FormLabel>
                    <FormControl>
                        <Input type = "text" {...field}  disabled={true}/>
                    </FormControl>
                    <FormMessage className="min-h-[24px]"/>
                    </FormItem>
                )}
                />
                <FormField
                control = {form.control}
                name = "username"
                render={({field}) => (
                    <FormItem className='flex flex-col'>
                    <FormLabel> Nombres del usuario</FormLabel>
                    <FormControl>
                        <Input type = "text" {...field}/>
                    </FormControl>
                    <FormMessage className="min-h-[24px]"/>
                    </FormItem>
                )}
                />
                
                
                <FormField
                control = {form.control}
                name = "email"
                render={({field}) => (
                    <FormItem className='flex flex-col'>
                    <FormLabel> Email del usuario</FormLabel>
                    <FormControl>
                        <Input type = "text" {...field}/>
                    </FormControl>
                    <FormMessage className="min-h-[24px]"/>
                    </FormItem>
                )}
                />
                {tipo === 'nuevo' && 
                <FormField
                control = {form.control}
                name = "password"
                render={({field}) => (
                    <FormItem className='flex flex-col'>
                    <FormLabel> Contraseña</FormLabel>
                    <FormControl>
                        <Input type = "password" {...field}/>
                    </FormControl>
                    <FormMessage className="min-h-[24px]"/>
                    </FormItem>
                )}
                />}
                <FormField
                control = {form.control}
                name = "rol"
                render={({field}) => (
                    <FormItem className='flex flex-col'>
                    <FormLabel> Rol del usuario</FormLabel>
                    <Select onValueChange = {field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar rol"/>
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="administrador">Administrador</SelectItem>
                        <SelectItem value="ventas">Ventas</SelectItem>
                        <SelectItem value="logistica">Logistica</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage className="min-h-[24px]"/>
                    </FormItem>
                )}
                />
                <FormField
                control = {form.control}
                name = "is_active"
                render={({field}) => (
                    <FormItem className='flex flex-col'>
                    <FormLabel> Activo</FormLabel>
                    <Select onValueChange = {field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estado activo/inactivo"/>
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="true">Activo</SelectItem>
                        <SelectItem value="false">Inactivo</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage className="min-h-[24px]"/>
                    </FormItem>
                )}
                />
                <BotonesFinales ruteo={()=>router.push('/ajustes/usuarios')}></BotonesFinales>
           </form>
          </Form>
            
        </div>

    )
}