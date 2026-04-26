import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase' 
import { useAuth } from '../context/useAuth'
import { CheckCircle, LogOut, Settings } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'


export default function ClienteHome() {
    const { user, logout, updateName } = useAuth()
    const [personas, setPersonas] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)
    const [showPopup, setShowPopup] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [newName, setNewName] = useState(user.name || '')
    const [updating, setUpdating] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (!user.token) {
            navigate("/Login")
            return
        }

        async function traerPersonas() {
            try {
                const { data, error } = await supabase
                    .from('personas')
                    .select('*')
                if (error) throw error
                setPersonas(data || [])
            } catch (error) {
                console.error("Error cargando personas:", error.message)
            } finally {
                setLoading(false)
            }
        }
        traerPersonas()
    }, [user.token, navigate])

    
    async function actualizarNombre(e) {
    e.preventDefault()
    if (!newName.trim()) return
    
    setUpdating(true)
    try {
        let currentUserId = user?.id;
        
        if (!currentUserId) {
            const { data: { session } } = await supabase.auth.getSession()
            currentUserId = session?.user?.id
        }

        if (!currentUserId) throw new Error("No se pudo obtener tu ID de usuario.")

        const { error } = await supabase
            .from('perfiles')
            .update({ name: newName })
            .eq('id', currentUserId)

        if (error) throw error

        updateName(newName)
        
        setShowSettings(false)

        toast.success('¡Perfil actualizado!', {
            style: {
                borderRadius: '15px',
                background: '#1e293b',
                color: '#fff',
                border: '1px solid #22c55e'
            },
        })
    } catch (error) {
        alert("Error al actualizar: " + error.message)
    } finally {
        setUpdating(false)
    }
}

    const enviarRespuesta = async (e) => {
        e.preventDefault()
        if (!selected) {
            alert("Por favor, selecciona una opción.")
            return
        }

        setLoading(true)
        try {
            let currentUserId = user?.id
            if (!currentUserId) {
                const { data: { session } } = await supabase.auth.getSession()
                currentUserId = session?.user?.id
            }

            if (!currentUserId) throw new Error("ID de usuario no encontrado.")

            const { error } = await supabase
                .from('respuestas')
                .upsert({ 
                    usuario_id: currentUserId,   
                    persona_id: selected,  
                }, { 
                    onConflict: 'usuario_id' 
                })

            if (error) throw error
            setShowPopup(true)
            
        } catch (error) {
            alert("Error: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    async function salir() {
        await supabase.auth.signOut()
        logout()
        navigate("/Login")
    }
    return (
        <div>
        
            <nav className="flex justify-between items-center px-8 py-4 bg-slate-900 border-b border-slate-800">
                <img src="fifi.png" alt="fifi" className='w-11'/>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-300">Bienvenido, <span className='truncate max-w-25 inline-block align-bottom'>{user.name}</span></span>
                    <button 
                        onClick={salir}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                        <LogOut/>
                    </button>
                </div>
            </nav>
            <Toaster position="top-center" reverseOrder={false} />
            <button className="bg-amber-50 hover:bg-amber-50/90 w-11 py-2 flex items-center justify-center rounded-full text-center m-5" onClick={()=> setShowSettings(true)}>
                <Settings className='text-black'/>
            </button>

            <form onSubmit={enviarRespuesta} className="p-5 py-10 flex flex-col gap-10 items-center justify-center">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 flex-col items-center justify-center gap-5 ">
                {personas.map((persona) => (
                    <label key={persona.id} className={`p-2 overflow-hidden rounded-2xl cursor-pointer transition-all ${
                            selected === persona.id 
                            ? 'bg-blue-600' 
                            : 'bg-slate-900 hover:bg-slate-800'
                        }`}>
                        <div>
                        <img src={persona.foto_url} alt={persona.nombre} className={`rounded-2xl`}/>
                        </div>
                        <input type="radio" name='elegir' required className='hidden' onChange={() => setSelected(persona.id)}
                            checked={selected === persona.id}/>
                    </label>
                ))}
                </div>
                <button className='bg-blue-600 p-4 w-full  rounded-2xl font-bold text-lg max-w-75' type='submit'>Enviar</button>
            </form>

            {showPopup && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-sm w-full shadow-2xl transform transition-all scale-100 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-10">¡Voto Registrado!</h3>
                
                <button 
                    onClick={() => {setShowPopup(false); setSelected(null)}}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl w-full transition-colors shadow-lg shadow-blue-600/20"
                >
                    Entendido
                </button>
            </div>
        </div>
    </div>
)}

                {showSettings && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Configuración</h3>
            
            <form onSubmit={actualizarNombre} className="flex flex-col gap-4">
                <div>
                    <label className="text-xs text-slate-400 uppercase font-black mb-1 block">Nombre de usuario</label>
                    <input 
                        type="text" 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-hidden focus:border-blue-500"
                        placeholder="Tu nombre..."
                    />
                </div>

                <div className="flex gap-2 mt-4">
                    <button 
                        type="button"
                        onClick={() => setShowSettings(false)}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit"
                        disabled={updating}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-2 rounded-xl transition-all"
                    >
                        {updating ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </form>
        </div>
    </div>
)}

        </div>
    )
}