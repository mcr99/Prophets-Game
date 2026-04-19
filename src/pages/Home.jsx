import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { supabase } from '../supabase'

export default function Home() {
    const [votos, setVotos] = useState([])
    const [loading, setLoading] = useState(true)
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [show, setShow] = useState(false)

    function salir() {
        logout()
        navigate("/Login")
    }

    useEffect(() => {
        if (!user.token) {
            navigate("/Login")
            return
        }

        async function traerVotos() {
            setLoading(true)
            try {
                const [respuestasRes, perfilesRes, personasRes] = await Promise.all([
                    supabase.from('respuestas').select('*'),
                    supabase.from('perfiles').select('id, name'),
                    supabase.from('personas').select('id, nombre, foto_url')
                ])

                if (respuestasRes.error) throw respuestasRes.error
                const listaFormateada = respuestasRes.data.map(voto => {
                    const perfil = perfilesRes.data?.find(p => p.id === voto.usuario_id)
                    const persona = personasRes.data?.find(pers => pers.id === voto.persona_id)

                    return {
                        id: voto.id,
                        usuarioNombre: perfil?.name || 'Usuario desconocido',
                        elegidoNombre: persona?.nombre || 'Candidato',
                        elegidoFoto: persona?.foto_url || ''
                    }
                })

                setVotos(listaFormateada)
            } catch (error) {
                console.error("Error en el panel de admin:", error.message)
            } finally {
                setLoading(false)
            }
        }

        traerVotos()
    }, [user.token, navigate])

    return (
        <div className='relative'>
            <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-8 py-4 flex items-center justify-between">
                <img src="fifi.png" alt="fifi" className='w-11'/>
                <div className="flex items-center gap-4">
                    <span className="text-slate-400 text-sm hidden md:block">Admin: <span className="text-white font-semibold">{user.name}</span></span>
                    <button onClick={salir} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm transition-all border border-red-500/10">Salir</button>
                </div>
            </header>

            <button className="bg-amber-50 hover:bg-amber-50/90 w-11 p-2 rounded-full sticky left-5 top-25 z-10" onClick={() => setShow(!show)}>
                <img src="paw.png" alt="paw"/>
            </button>
            <main className="h-screen p-8 sm:w-[80%] lg:w-[75%] 2xl:w-[70%] mx-auto">

                
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-500 font-medium">Sincronizando base de datos...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {votos.map((item) => (
                            <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300">
                                <div className="aspect-4/5 relative">
                                    <img src={item.elegidoFoto} alt={item.elegidoNombre} className={`${show? "hidden" : "flex"} w-full h-full object-cover`} />
                                    <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-transparent to-transparent"></div>
                                    <div className="absolute bottom-4 left-5 right-5">
                                        <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Elegido:</p>
                                        <p className={`${show? "hidden" : "flex"} text-xl font-bold truncate`}>{item.elegidoNombre}</p>
                                    </div>
                                </div>
                                
                                <div className="p-5 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-blue-400">
                                        {item.usuarioNombre.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs text-slate-500 font-bold uppercase">Votante</p>
                                        <p className="text-sm font-semibold truncate text-slate-200">{item.usuarioNombre}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}