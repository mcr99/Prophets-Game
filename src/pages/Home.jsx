import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { supabase } from '../supabase'
import { AlertTriangle, LogOut, RefreshCcw, Trash } from 'lucide-react'




export default function Home() {
    const [votos, setVotos] = useState([])
    const [loading, setLoading] = useState(true)
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [show, setShow] = useState(true)
    const [showConfirm, setShowConfirm] = useState(false)

    const traerVotos = useCallback(async () => {
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
    }, [])

    async function ejecutarBorrado() {
    try {
        setLoading(true)
        setShowConfirm(false)

        const { error } = await supabase
            .from('respuestas')
            .delete()
            .gt('id', '00000000-0000-0000-0000-000000000000')

        if (error) throw error
        
        setVotos([])

    } catch (error) {
        alert("Error al borrar votos: " + (error.message || "Error desconocido"))
        console.error("Detalle completo:", error)
    } finally {
        setLoading(false)
    }
}

    function salir() {
        logout()
        navigate("/Login")
    }

    useEffect(() => {
        if (!user.token) {
            navigate("/Login")
            return
        }
        traerVotos()
    }, [user.token, navigate, traerVotos])

    return (
        <div className='relative'>
            <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-8 py-4 flex items-center justify-between">
                <img src="fifi.png" alt="fifi" className='w-11'/>
                <div className="flex items-center gap-4">
                    <span className="text-slate-400 text-sm hidden md:block">Admin: <span className="text-white font-semibold">{user.name}</span></span>
                    <button onClick={salir} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm transition-all border border-red-500/10">
                        <LogOut/>
                    </button>
                </div>
            </header>

            <div className='sticky w-11 flex flex-col gap-2 left-5 top-[45%] my-10 z-10'>
            <button className="bg-amber-50 hover:bg-amber-50/90 w-11 p-2 rounded-full" onClick={() => setShow(!show)}>
                <img src="paw.png" alt="paw"/>
            </button>
            <button className="bg-amber-50 hover:bg-amber-50/90 w-11 p-2 rounded-full text-center" onClick={() => setShowConfirm(true)}>
                <Trash className='text-red-600'/>
            </button>
            <button className="bg-amber-50 hover:bg-amber-50/90 w-11 p-2 rounded-full text-center" onClick={traerVotos}>
                <RefreshCcw className='text-black'/>
            </button>
            </div>
            <main className=" p-8 sm:w-[80%] lg:w-[75%] 2xl:w-[70%] mx-auto my-10">

                
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
                                        <p className="text-2xl font-bold truncate text-slate-200">{item.usuarioNombre}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl transform animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            
                            <h3 className="text-xl font-bold text-white mb-10">¿Reiniciar votación?</h3>
                            
                            <div className="flex gap-3 w-full">
                                <button 
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 px-4 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={ejecutarBorrado}
                                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-95"
                                >
                                    Sí, borrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </main>
        </div>
    )
}