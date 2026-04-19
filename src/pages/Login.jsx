import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { supabase } from '../supabase' 

export default function Login() {
    const { login } = useAuth()
    const [form, setForm] = useState({ email: "", password: "" })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: form.email,
                password: form.password,
            })
            if (authError) {
                setError(authError.message)
                setLoading(false)
                return
            }
            const { data: perfil, error: perfilError } = await supabase
                .from('perfiles')
                .select('es_admin, name , color')
                .eq('id', authData.user.id)
                .single()

            if (perfilError) {
                console.error("Error al obtener perfil:", perfilError)
                setError("Error al verificar permisos")
                setLoading(false)
                return
            }

            const userData = {
                ...authData.user,
                name: perfil.name,
                color: perfil.color,
                session: authData.session,
                user_role: perfil.es_admin ? "admin" : "cliente" 
            }

            login(userData)

            if (perfil.es_admin) {
                navigate("/")
            } else {
                navigate("/cliente")
            }

        } catch (err) {
            console.error(err)
            setError("Ocurrió un error inesperado")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-blue-950 to-slate-900'>
            <div className="w-full max-w-md px-6">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 mb-4 shadow-lg shadow-blue-500/40">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Iniciar Sesión</h1>
                    <p className="text-slate-400 mt-1 text-sm">Ingresa tus credenciales para continuar</p>
                </div>

                <form className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-2xl p-8 shadow-2xl">
                    {error && (
                        <div className="mb-5 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
                            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Credenciales incorrectas
                        </div>
                    )}

                    <div className="mb-5">
                        <label htmlFor="email-alternative" className="block mb-2 text-sm font-medium text-slate-300">Correo electrónico</label>
                        <input
                            name="email"
                            onChange={handleChange}
                            type="email"
                            id="email-alternative"
                            className="bg-slate-900/60 border border-slate-600 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full px-4 py-3 placeholder:text-slate-500 outline-none transition"
                            placeholder="correo@ejemplo.com"
                            required
                        />
                    </div>

                    <div className="mb-7">
                        <label htmlFor="password-alternative" className="block mb-2 text-sm font-medium text-slate-300">Contraseña</label>
                        <input
                            name="password"
                            onChange={handleChange}
                            type="password"
                            id="password-alternative"
                            className="bg-slate-900/60 border border-slate-600 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full px-4 py-3 placeholder:text-slate-500 outline-none transition"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold text-sm px-4 py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Ingresando...
                            </span>
                        ) : "Ingresar"}
                    </button>
                </form>
            </div>
        </div>
    )
}
