import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { User, ClipboardCheck, Info, LogOut, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function UserDashboard() {
  const [user, setUser] = useState(null)
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate('/login')
      return
    }
    setUser(user)

    const { data: resp } = await supabase
      .from('responses')
      .select('*, forms(title)')
      .eq('user_id', user.id)
    
    setResponses(resp || [])
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Loader2 className="animate-spin" size={48} color="var(--primary)" />
    </div>
  )

  return (
    <div className="container" style={{ maxWidth: '1000px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <img src="/img/logo.png" alt="Logo" style={{ maxWidth: '120px', marginBottom: '0.5rem' }} />
          <h1>Mi Perfil ECRI</h1>
        </div>
        <button className="btn" onClick={handleLogout} style={{ border: '1px solid var(--border)' }}>
          <LogOut size={18} /> Salir
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Profile Card */}
        <section className="card glass">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>{user.user_metadata?.first_name} {user.user_metadata?.last_name}</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.email}</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
              <ClipboardCheck size={20} color="var(--primary)" />
              <span>{responses.length} Formularios completados</span>
            </div>
          </div>
        </section>

        {/* Info Card */}
        <section className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Info size={24} />
            <h3 style={{ margin: 0 }}>Información de ECRI</h3>
          </div>
          <p style={{ fontSize: '0.95rem', opacity: 0.9 }}>
            Gracias por ser parte de nuestra red de salud. Aquí podrás ver el historial de tus participaciones y acceder a recursos exclusivos según tu perfil de salud.
          </p>
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '0.85rem' }}>
            Pronto habilitaremos nuevas actualizaciones sobre servicios de salud gratuitos en tu zona.
          </div>
        </section>
      </div>

      <h2 style={{ marginTop: '3rem', marginBottom: '1.5rem' }}>Mis Respuestas</h2>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {responses.map(res => (
          <div key={res.id} className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: 0 }}>{res.forms?.title || 'Formulario'}</h4>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Enviado el {new Date(res.created_at).toLocaleDateString()} a las {new Date(res.created_at).toLocaleTimeString()}
              </p>
            </div>
            <button className="btn" style={{ background: 'var(--background)', fontSize: '0.85rem' }} onClick={() => alert('Detalle de respuesta en desarrollo')}>
              Ver Detalle
            </button>
          </div>
        ))}
        {responses.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
            Aún no has enviado ninguna respuesta.
          </div>
        )}
      </div>
    </div>
  )
}
