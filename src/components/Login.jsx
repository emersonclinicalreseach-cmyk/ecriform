import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { LogIn, Loader2 } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      
      // Check role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()
      
      if (profile?.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/user')
      }
    } catch (error) {
      alert('Error de inicio de sesión: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="card glass" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/img/logo.png" alt="Logo" style={{ maxWidth: '150px', marginBottom: '1rem' }} />
          <h2>Iniciar Sesión</h2>
        </div>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" className="form-control" value={email} 
              onChange={(e) => setEmail(e.target.value)} required 
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password" className="form-control" value={password} 
              onChange={(e) => setPassword(e.target.value)} required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <><LogIn size={18} /> Entrar</>}
          </button>
        </form>
      </div>
    </div>
  )
}
