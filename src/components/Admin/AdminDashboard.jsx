import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import * as XLSX from 'xlsx'
import { 
  Plus, 
  Download, 
  Filter, 
  Search, 
  Copy, 
  Power, 
  PowerOff,
  ChevronRight,
  Calendar,
  User,
  Activity
} from 'lucide-react'

export default function AdminDashboard() {
  const [forms, setForms] = useState([])
  const [responses, setResponses] = useState([])
  const [selectedForm, setSelectedForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    diagnosis: '',
    search: ''
  })

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('forms').select('*').order('created_at', { ascending: false })
    if (!error) setForms(data)
    setLoading(false)
  }

  const fetchResponses = async (formId) => {
    const { data, error } = await supabase
      .from('responses')
      .select('*')
      .eq('form_id', formId)
    if (!error) setResponses(data)
    setSelectedForm(forms.find(f => f.id === formId))
  }

  const toggleFormStatus = async (id, currentStatus) => {
    await supabase.from('forms').update({ active: !currentStatus }).eq('id', id)
    fetchForms()
  }

  const exportToExcel = () => {
    const dataToExport = filteredResponses.map(r => ({
      Fecha: new Date(r.created_at).toLocaleDateString(),
      Hora: new Date(r.created_at).toLocaleTimeString(),
      Nombre: r.data.firstName,
      Apellido: r.data.lastName,
      Email: r.data.email,
      Telefono: r.data.phone,
      Diagnosticos: r.data.medicalConditions.join(', '),
      Otro: r.data.otherMedical || '',
      Terminos: r.data.terms ? 'Sí' : 'No',
      Actualizaciones: r.data.updates ? 'Sí' : 'No',
      Interes_Futuro: r.data.futureStudies ? 'Sí' : 'No',
      Edad_Verificada: r.data.ageVerified ? 'Sí' : 'No'
    }))

    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Respuestas')
    XLSX.writeFile(wb, `ECRI_Respuestas_${selectedForm?.title || 'Form'}.xlsx`)
  }

  const copyLink = (id) => {
    const link = `${window.location.origin}/f/${id}`
    navigator.clipboard.writeText(link)
    alert('Enlace copiado al portapapeles')
  }

  const filteredResponses = responses.filter(r => {
    const matchesSearch = !filters.search || 
      `${r.data.firstName} ${r.data.lastName} ${r.data.email} ${r.data.phone}`.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesDiagnosis = !filters.diagnosis || r.data.medicalConditions.includes(filters.diagnosis)
    
    const date = new Date(r.created_at)
    const matchesDateFrom = !filters.dateFrom || date >= new Date(filters.dateFrom)
    const matchesDateTo = !filters.dateTo || date <= new Date(filters.dateTo)

    return matchesSearch && matchesDiagnosis && matchesDateFrom && matchesDateTo
  })

  const createNewForm = async () => {
    const title = prompt('Título del nuevo formulario:')
    if (!title) return
    
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('forms').insert({
      title,
      description: 'Nuevo formulario generado automáticamente',
      active: true,
      created_by: user.id
    })
    
    if (error) alert('Error al crear formulario: ' + error.message)
    else fetchForms()
  }

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Placeholder or Top Nav */}
      <div style={{ flex: 1, padding: '2rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>Panel Administrativo</h1>
          <button className="btn btn-primary" onClick={createNewForm}>
            <Plus size={18} /> Crear Formulario
          </button>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: selectedForm ? '350px 1fr' : '1fr', gap: '2rem' }}>
          {/* Forms List */}
          <section className="card">
            <h3 style={{ marginBottom: '1.5rem' }}>Tus Formularios</h3>
            {loading ? <p>Cargando...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {forms.map(form => (
                  <div 
                    key={form.id} 
                    className={`form-item ${selectedForm?.id === form.id ? 'active' : ''}`}
                    style={{ 
                      padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px',
                      cursor: 'pointer', transition: 'all 0.2s',
                      backgroundColor: selectedForm?.id === form.id ? 'rgba(0, 129, 201, 0.05)' : 'transparent',
                      borderColor: selectedForm?.id === form.id ? 'var(--primary)' : 'var(--border)'
                    }}
                    onClick={() => fetchResponses(form.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ margin: 0 }}>{form.title}</h4>
                      <span style={{ 
                        fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px',
                        background: form.active ? '#ECFDF3' : '#F2F4F7',
                        color: form.active ? '#027A48' : '#344054',
                        fontWeight: 600
                      }}>
                        {form.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button className="btn" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={(e) => { e.stopPropagation(); copyLink(form.id); }}>
                        <Copy size={14} /> Link
                      </button>
                      <button className="btn" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={(e) => { e.stopPropagation(); toggleFormStatus(form.id, form.active); }}>
                        {form.active ? <PowerOff size={14} /> : <Power size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Responses View */}
          {selectedForm && (
            <section className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>Respuestas: {selectedForm.title}</h3>
                <button className="btn btn-primary" onClick={exportToExcel} disabled={filteredResponses.length === 0}>
                  <Download size={18} /> Exportar Excel
                </button>
              </div>

              {/* Advanced Filters */}
              <div className="filters glass" style={{ padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.8rem' }}>Desde</label>
                  <input type="date" className="form-control" value={filters.dateFrom} onChange={e => setFilters(prev => ({...prev, dateFrom: e.target.value}))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.8rem' }}>Hasta</label>
                  <input type="date" className="form-control" value={filters.dateTo} onChange={e => setFilters(prev => ({...prev, dateTo: e.target.value}))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.8rem' }}>Diagnóstico</label>
                  <select className="form-control" value={filters.diagnosis} onChange={e => setFilters(prev => ({...prev, diagnosis: e.target.value}))}>
                    <option value="">Todos</option>
                    <option value="Diabetes">Diabetes</option>
                    <option value="Hipertensión">Hipertensión</option>
                    <option value="Obesidad o sobrepeso">Obesidad</option>
                    {/* Add more as needed */}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.8rem' }}>Buscar</label>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" className="form-control" style={{ paddingLeft: '2.5rem' }} 
                      placeholder="Nombre, email..." 
                      value={filters.search} onChange={e => setFilters(prev => ({...prev, search: e.target.value}))} 
                    />
                  </div>
                </div>
              </div>

              <div className="table-container" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '1rem' }}>Usuario</th>
                      <th style={{ padding: '1rem' }}>Contacto</th>
                      <th style={{ padding: '1rem' }}>Fecha</th>
                      <th style={{ padding: '1rem' }}>Consentimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResponses.map(r => (
                      <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 600 }}>{r.data.firstName} {r.data.lastName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.data.email}</div>
                        </td>
                        <td style={{ padding: '1rem' }}>{r.data.phone}</td>
                        <td style={{ padding: '1rem' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px',
                            background: r.data.terms ? '#D1FADF' : '#FEE4E2',
                            color: r.data.terms ? '#027A48' : '#B42318'
                          }}>
                            {r.data.terms ? 'ACEPTÓ' : 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredResponses.length === 0 && (
                      <tr>
                        <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No se encontraron respuestas con los filtros aplicados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
