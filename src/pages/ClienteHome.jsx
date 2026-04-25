import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase' 
import { useAuth } from '../context/useAuth'
import { LogOut } from 'lucide-react'


export default function ClienteHome() {
    const [personas, setPersonas] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)
    const [showPopup, setShowPopup] = useState(false)
    const { user, logout } = useAuth()
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

    useEffect(() => {
        if (!user.id) return;

        async function traerVoto() {
            try {
                const { data } = await supabase
                    .from('respuestas')
                    .select('persona_id')
                    .eq('usuario_id', user.id)
                    .maybeSingle()
                
                if (data) setSelected(data.persona_id)
            } catch (error) {
                console.warn("No se pudo recuperar el voto previo")
            }
        }
        traerVoto()
    }, [user.id])

    const enviarRespuesta = async (e) => {
        e.preventDefault();
        if (!selected) {
            alert("Por favor, selecciona una opción.");
            return;
        }

        setLoading(true);
        try {
            let currentUserId = user?.id;
            if (!currentUserId) {
                const { data: { session } } = await supabase.auth.getSession();
                currentUserId = session?.user?.id;
            }

            if (!currentUserId) throw new Error("ID de usuario no encontrado.");

            const { error } = await supabase
                .from('respuestas')
                .upsert({ 
                    usuario_id: currentUserId,   
                    persona_id: selected,  
                }, { 
                    onConflict: 'usuario_id' 
                });

            if (error) throw error;
            setShowPopup(true)
            
        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

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
                    <span className="text-sm text-slate-300">Bienvenido, <b>{user.name}</b></span>
                    <button 
                        onClick={salir}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                        <LogOut/>
                    </button>
                </div>
            </nav>

            <form onSubmit={enviarRespuesta} className="p-5 py-20 flex flex-col gap-10 items-center justify-center">
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
                {/* Icono de Check Animado */}
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-10">¡Voto Registrado!</h3>
                
                <button 
                    onClick={() => setShowPopup(false)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl w-full transition-colors shadow-lg shadow-blue-600/20"
                >
                    Entendido
                </button>
            </div>
        </div>
    </div>
)}
        </div>
    )
}