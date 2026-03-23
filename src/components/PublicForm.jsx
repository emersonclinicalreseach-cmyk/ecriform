import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

const medicalOptions = [
  'Diabetes',
  'Hipertensión',
  'Colesterol y/o triglicéridos altos',
  'Ataque cardíaco y/o derrame cerebral',
  'Enfermedad visual',
  'Estrés, depresión, ansiedad, trastorno alimentario',
  'Obesidad o sobrepeso',
  'Fibromas (uterinos)',
  'Virus del Papiloma Humano',
  'Enfermedades de Transmisión Sexual',
  'Otro'
]

export default function PublicForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: false,
    updates: false,
    futureStudies: false,
    ageVerified: false,
    medicalConditions: [],
    otherMedical: ''
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      if (name === 'medicalConditions') {
        const updated = checked 
          ? [...formData.medicalConditions, value]
          : formData.medicalConditions.filter(item => item !== value)
        setFormData(prev => ({ ...prev, medicalConditions: updated }))
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }))
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.firstName) newErrors.firstName = 'El nombre es obligatorio'
    if (!formData.lastName) newErrors.lastName = 'El apellido es obligatorio'
    if (!formData.email) newErrors.email = 'El email es obligatorio'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'El formato del email no es válido'
    
    if (!formData.phone) newErrors.phone = 'El teléfono es obligatorio'
    if (!formData.password) newErrors.password = 'La contraseña es obligatoria'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden'
    
    if (!formData.terms) newErrors.terms = 'Debes aceptar los términos y condiciones'
    if (!formData.futureStudies) newErrors.futureStudies = 'Debes confirmar tu interés en comunicados'
    if (!formData.ageVerified) newErrors.ageVerified = 'Debes verificar que eres mayor de 16 años'
    
    if (formData.medicalConditions.length === 0) {
      newErrors.medicalConditions = 'Debes seleccionar al menos una opción'
    }
    
    if (formData.medicalConditions.includes('Otro') && !formData.otherMedical) {
      newErrors.otherMedical = 'Por favor especifica tu condición'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setLoading(true)
    try {
      // 1. Create User in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        }
      })

      if (authError) throw authError

      // 2. Save Profile (if trigger not available)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          role: 'user'
        })
      
      // Ignore conflict if it exists (e.g. trigger already created it)
      if (profileError && profileError.code !== '23505') throw profileError

      // 3. Save Response
      const { error: responseError } = await supabase
        .from('responses')
        .insert({
          form_id: parseInt(id),
          user_id: authData.user.id,
          data: {
            ...formData,
            submitted_at: new Date().toISOString()
          }
        })

      if (responseError) throw responseError

      setSubmitted(true)
    } catch (error) {
      console.error(error)
      alert('Error al procesar el formulario: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="container" style={{ textAlign: 'center' }}>
        <div className="card glass">
          <CheckCircle size={64} color="var(--success)" style={{ marginBottom: '1rem' }} />
          <h1>¡Bienvenido a ECRI!</h1>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
            Ya puedes ingresar posteriormente con tu correo y contraseña para ver tus respuestas enviadas e información adicional.
          </p>
          <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={() => navigate('/login')}>
            Ir al Inicio de Sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <img src="/img/logo.png" alt="ECRI Logo" style={{ maxWidth: '200px', marginBottom: '1.5rem' }} />
        <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
          <img src="/img/premio.png" alt="Premio" style={{ width: '100%', display: 'block' }} />
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '2rem', borderBottom: '2px solid var(--primary)', display: 'inline-block', paddingBottom: '0.5rem' }}>
          Registro de Participante
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label>Nombre *</label>
              <input 
                type="text" name="firstName" className="form-control" 
                value={formData.firstName} onChange={handleChange} 
              />
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <label>Apellido *</label>
              <input 
                type="text" name="lastName" className="form-control" 
                value={formData.lastName} onChange={handleChange} 
              />
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input 
              type="email" name="email" className="form-control" 
              value={formData.email} onChange={handleChange} 
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Teléfono *</label>
            <input 
              type="tel" name="phone" className="form-control" 
              value={formData.phone} onChange={handleChange} 
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label>Contraseña *</label>
              <input 
                type="password" name="password" className="form-control" 
                value={formData.password} onChange={handleChange} 
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            <div className="form-group">
              <label>Confirmar contraseña *</label>
              <input 
                type="password" name="confirmPassword" className="form-control" 
                value={formData.confirmPassword} onChange={handleChange} 
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>

          <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid var(--border)' }} />

          <div className="form-group">
            <label>Ha sufrido o ha sido diagnosticado/tratado por: *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
              {medicalOptions.map(option => (
                <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'normal', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" name="medicalConditions" value={option}
                    checked={formData.medicalConditions.includes(option)}
                    onChange={handleChange}
                    style={{ width: '18px', height: '18px' }}
                  />
                  {option}
                </label>
              ))}
            </div>
            {formData.medicalConditions.includes('Otro') && (
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <input 
                  type="text" name="otherMedical" className="form-control" 
                  placeholder="Especifique cuál"
                  value={formData.otherMedical} onChange={handleChange} 
                />
                {errors.otherMedical && <span className="error-message">{errors.otherMedical}</span>}
              </div>
            )}
            {errors.medicalConditions && <span className="error-message" style={{ display: 'block', marginTop: '1rem' }}>{errors.medicalConditions}</span>}
          </div>

          <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid var(--border)' }} />

          <div className="checkbox-section">
            <label style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" name="terms" checked={formData.terms} 
                onChange={handleChange} style={{ marginTop: '0.25rem', flexShrink: 0 }} 
              />
              <span style={{ fontSize: '0.9rem' }}>
                Al marcar esta casilla, usted acepta los Términos y condiciones de ECRI incluida nuestra política de privacidad. *
              </span>
            </label>
            {errors.terms && <div className="error-message" style={{ marginBottom: '1.5rem', marginTop: '-1rem' }}>{errors.terms}</div>}

            <label style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" name="updates" checked={formData.updates} 
                onChange={handleChange} style={{ marginTop: '0.25rem', flexShrink: 0 }} 
              />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Por favor envíeme actualizaciones sobre servicios de salud gratuitos o de bajo costo, ensayos clínicos e información de salud importante como miembro de ECRI. Es posible que se apliquen tarifas estándar de mensajería móvil y usted puede optar por no recibir noticias nuestras en cualquier momento.
              </span>
            </label>

            <h4 style={{ marginBottom: '1rem' }}>Opciones de registro</h4>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Seleccione todas las opciones a continuación que reflejen su interés por participar.</p>

            <label style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" name="futureStudies" checked={formData.futureStudies} 
                onChange={handleChange} style={{ marginTop: '0.25rem', flexShrink: 0 }} 
              />
              <span style={{ fontSize: '0.9rem' }}>
                Me interesa recibir comunicados sobre estudios futuros. Es posible que se apliquen cargos de mensajería móvil comunes; puede optar por dejar de recibir nuestros comunicados en cualquier momento. *
              </span>
            </label>
            {errors.futureStudies && <div className="error-message" style={{ marginBottom: '1.5rem', marginTop: '-1rem' }}>{errors.futureStudies}</div>}

            <label style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" name="ageVerified" checked={formData.ageVerified} 
                onChange={handleChange} style={{ marginTop: '0.25rem', flexShrink: 0 }} 
              />
              <span style={{ fontSize: '0.9rem' }}>Verifico que tengo al menos 16 años. *</span>
            </label>
            {errors.ageVerified && <div className="error-message" style={{ marginBottom: '1.5rem', marginTop: '-1rem' }}>{errors.ageVerified}</div>}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? <><Loader2 className="animate-spin" /> Procesando...</> : 'Inscribirse'}
          </button>
        </form>
      </div>
    </div>
  )
}
