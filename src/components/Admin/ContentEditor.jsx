import React, { useEffect, useRef, useState } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import { X, Save, Smartphone, Tablet, Monitor, Grid, Settings, Layers, Palette, Info } from 'lucide-react';

export default function ContentEditor({ form, onClose, onSave }) {
  const editorRef = useRef(null);
  const blocksRef = useRef(null);
  const stylesRef = useRef(null);
  const layersRef = useRef(null);
  const traitsRef = useRef(null);
  const selectorsRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState('styles'); // 'styles', 'traits', 'layers'

  useEffect(() => {
    if (!editorRef.current) return;

    const editor = grapesjs.init({
      container: editorRef.current,
      fromElement: true,
      height: '100%',
      width: 'auto',
      storageManager: false,
      blockManager: {
        appendTo: blocksRef.current,
        blocks: [
          {
            id: 'title',
            label: '<div class="gjs-block-label">Título</div>',
            content: '<h1 style="color: #333; margin-bottom: 20px; font-family: sans-serif;">Título del Contenido</h1>',
          },
          {
            id: 'text',
            label: '<div class="gjs-block-label">Texto</div>',
            content: '<p style="color: #666; line-height: 1.5; font-family: sans-serif;">Inserta tu texto descriptivo aquí para informar a tus usuarios.</p>',
          },
          {
            id: 'image',
            label: '<div class="gjs-block-label">Imagen</div>',
            content: { type: 'image' },
            activate: true,
          },
          {
            id: 'video',
            label: '<div class="gjs-block-label">Video</div>',
            content: {
              type: 'video',
              src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
              style: { height: '350px', width: '100%', maxWidth: '615px', margin: '0 auto' }
            },
          },
          {
            id: 'button',
            label: '<div class="gjs-block-label">Botón</div>',
            content: `<div style="text-align: center; padding: 10px;">
              <a class="btn-builder" href="#" style="display: inline-block; padding: 12px 24px; background-color: #0081C9; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; font-family: sans-serif;">Click aquí</a>
            </div>`,
          },
          {
            id: 'divider',
            label: '<div class="gjs-block-label">Divisor</div>',
            content: '<hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;"/>',
          },
          {
            id: 'spacer',
            label: '<div class="gjs-block-label">Espaciador</div>',
            content: '<div style="height: 50px;"></div>',
          },
          {
            id: 'social',
            label: '<div class="gjs-block-label">Redes Sociales</div>',
            content: `
              <div style="display: flex; gap: 20px; justify-content: center; padding: 20px;">
                <a href="#" style="background: #0081C9; color: white; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; text-decoration: none; font-size: 14px; font-family: sans-serif;">F</a>
                <a href="#" style="background: #0081C9; color: white; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; text-decoration: none; font-size: 14px; font-family: sans-serif;">I</a>
                <a href="#" style="background: #0081C9; color: white; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; text-decoration: none; font-size: 14px; font-family: sans-serif;">X</a>
              </div>
            `,
          },
          {
            id: 'nav',
            label: '<div class="gjs-block-label">Navegador</div>',
            content: `
              <nav style="display: flex; gap: 20px; justify-content: center; padding: 20px; border-bottom: 1px solid #eee; font-family: sans-serif;">
                <a href="#" style="text-decoration: none; color: #666; font-size: 0.9rem;">Inicio</a>
                <a href="#" style="text-decoration: none; color: #666; font-size: 0.9rem;">Servicios</a>
                <a href="#" style="text-decoration: none; color: #666; font-size: 0.9rem;">Contacto</a>
              </nav>
            `,
          },
          {
            id: 'html',
            label: '<div class="gjs-block-label">HTML</div>',
            content: '<div style="padding: 10px; background: #f4f4f4; border: 1px dashed #ccc; text-align: center; font-family: sans-serif;">Código HTML Personalizado</div>',
          },
          {
            id: '2cols',
            label: '<div class="gjs-block-label">2 Columnas</div>',
            content: '<div style="display: flex; flex-wrap: wrap;"><div style="flex: 1; min-width: 250px; padding: 20px; border: 1px dashed #eee;">Columna 1</div><div style="flex: 1; min-width: 250px; padding: 20px; border: 1px dashed #eee;">Columna 2</div></div>',
          }
        ]
      },
      selectorManager: {
        appendTo: selectorsRef.current
      },
      traitManager: {
        appendTo: traitsRef.current
      },
      layerManager: {
        appendTo: layersRef.current
      },
      styleManager: {
        appendTo: stylesRef.current,
        sectors: [{
          name: 'General',
          open: false,
          buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom'],
        }, {
          name: 'Dimensiones',
          open: true,
          buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
        }, {
          name: 'Tipografía',
          open: true,
          buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-shadow'],
        }, {
          name: 'Decoración',
          open: true,
          buildProps: ['background-color', 'border-radius', 'border', 'box-shadow', 'background'],
        }, {
          name: 'Extra',
          open: false,
          buildProps: ['opacity', 'transition', 'perspective', 'transform'],
        }]
      },
      panels: { defaults: [] },
    });

    // Handle selection to switch tabs automatically
    editor.on('component:selected', () => {
      // Optional: switch to traits if it's a video or image
      // setActiveTab('traits');
    });

    // Handle existing content
    if (form.content_data) {
      editor.loadProjectData(form.content_data);
    } else if (form.content_html) {
      editor.setComponents(form.content_html);
    }

    editorRef.current.editor = editor;

    return () => {
      if (editor) editor.destroy();
    };
  }, [form]);

  const handleSave = () => {
    const editor = editorRef.current.editor;
    const contentHtml = editor.getHtml() + `<style>${editor.getCss()}</style>`;
    const contentData = editor.getProjectData();
    onSave(contentHtml, contentData);
  };

  const setDevice = (device) => {
    editorRef.current.editor.setDevice(device);
  };

  return (
    <div className="content-editor-overlay" style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'white', zIndex: 2000, display: 'flex', flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <header style={{
        padding: '0.75rem 1.5rem', borderBottom: '1px solid #ddd',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Editor Pro: {form.title}</h2>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button onClick={() => setDevice('Desktop')} className="btn-icon"><Monitor size={18} /></button>
          <button onClick={() => setDevice('Tablet')} className="btn-icon"><Tablet size={18} /></button>
          <button onClick={() => setDevice('Mobile')} className="btn-icon"><Smartphone size={18} /></button>
          <div style={{ width: '1px', height: '24px', backgroundColor: '#eee', margin: '0 8px' }}></div>
          <button onClick={handleSave} className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={18} /> Guardar
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar Left: Blocks */}
        <aside className="editor-sidebar left" style={{ 
          width: '260px', borderRight: '1px solid #ddd', 
          display: 'flex', flexDirection: 'column', backgroundColor: '#fcfcfc' 
        }}>
          <div className="sidebar-header">
            <Grid size={16} />
            <span>ELEMENTOS</span>
          </div>
          <div ref={blocksRef} className="blocks-container" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}></div>
        </aside>

        {/* Canvas Area */}
        <main style={{ flex: 1, backgroundColor: '#eee', position: 'relative', overflow: 'hidden' }}>
          <div ref={editorRef} style={{ height: '100%', width: '100%' }}></div>
        </main>

        {/* Sidebar Right: Tabbed Panels */}
        <aside className="editor-sidebar right" style={{ 
          width: '300px', borderLeft: '1px solid #ddd', 
          display: 'flex', flexDirection: 'column', backgroundColor: '#fcfcfc' 
        }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
            <button 
              className={`tab-btn ${activeTab === 'styles' ? 'active' : ''}`}
              onClick={() => setActiveTab('styles')}
              title="Estilos (Colores, Fuentes)"
            >
              <Palette size={20} />
            </button>
            <button 
              className={`tab-btn ${activeTab === 'traits' ? 'active' : ''}`}
              onClick={() => setActiveTab('traits')}
              title="Configuración (Links, Videos)"
            >
              <Settings size={20} />
            </button>
            <button 
              className={`tab-btn ${activeTab === 'layers' ? 'active' : ''}`}
              onClick={() => setActiveTab('layers')}
              title="Estructura de Capas"
            >
              <Layers size={20} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ display: activeTab === 'styles' ? 'block' : 'none' }}>
              <div className="sidebar-header"><Palette size={14} /> <span>SELECTORES & ESTILOS</span></div>
              <div ref={selectorsRef} style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}></div>
              <div ref={stylesRef} style={{ padding: '0.5rem' }}></div>
            </div>
            
            <div style={{ display: activeTab === 'traits' ? 'block' : 'none' }}>
              <div className="sidebar-header"><Settings size={14} /> <span>AJUSTES DEL ELEMENTO</span></div>
              <div ref={traitsRef} style={{ padding: '1rem' }}></div>
              <div style={{ padding: '1rem', fontSize: '0.8rem', color: '#888', background: '#f0f7ff', border: '1px solid #d0e7ff', margin: '1rem', borderRadius: '8px', display: 'flex', gap: '8px' }}>
                <Info size={24} style={{ flexShrink: 0 }} />
                <span>Para cambiar el link de un <b>Video</b> o <b>Botón</b>, selecciónalo y edita el campo "URL" o "Video ID" aquí arriba.</span>
              </div>
            </div>
            
            <div style={{ display: activeTab === 'layers' ? 'block' : 'none' }}>
              <div className="sidebar-header"><span>ESTRUCTURA DE CAPAS</span></div>
              <div ref={layersRef} style={{ padding: '0.5rem' }}></div>
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        .gjs-cv-canvas { top: 0 !important; width: 100% !important; height: 100% !important; }
        .btn-icon { background: none; border: none; cursor: pointer; color: #555; padding: 8px; border-radius: 6px; display: flex; align-items: center; transition: all 0.2s; }
        .btn-icon:hover { background: #f0f0f0; color: #000; }
        
        .tab-btn { flex: 1; padding: 12px; border: none; background: #fcfcfc; color: #888; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; display: flex; justify-content: center; }
        .tab-btn.active { color: #0081C9; border-bottom-color: #0081C9; background: #fff; }
        .tab-btn:hover:not(.active) { background: #f0f0f0; }

        .editor-sidebar .sidebar-header {
          padding: 0.75rem 1rem; background: #fff; border-bottom: 1px solid #eee;
          display: flex; alignItems: center; gap: 10px; font-size: 0.7rem; font-weight: 700; color: #aaa; letter-spacing: 0.8px;
        }

        /* GrapesJS Custom Styles */
        .gjs-block {
          width: 100% !important; min-height: auto !important; padding: 15px !important; margin-bottom: 12px !important;
          background-color: #fff !important; border: 1px solid #eee !important; border-radius: 10px !important;
          transition: all 0.2s !important; cursor: grab !important; display: block !important; text-align: center !important; color: #444 !important;
        }
        .gjs-block:hover { border-color: #0081C9 !important; box-shadow: 0 4px 12px rgba(0,129,201,0.08) !important; color: #0081C9 !important; }
        .gjs-block-label { font-size: 0.8rem; font-weight: 500; }
        
        /* Layout Manager & Traits */
        .gjs-sm-sector { border-bottom: 1px solid #eee !important; }
        .gjs-sm-title { font-weight: 600 !important; padding: 10px !important; background: #fcfcfc !important; color: #444 !important; font-size: 0.75rem !important; }
        .gjs-sm-properties { padding: 10px !important; }
        .gjs-sm-label { font-size: 0.7rem !important; margin-bottom: 5px !important; color: #888 !important; }
        .gjs-field { background-color: #f0f2f5 !important; border: 1px solid #eee !important; border-radius: 4px !important; padding: 4px 8px !important; color: #333 !important; }
        
        .gjs-trt-trait { padding: 5px 0 !important; }
        .gjs-trt-label { font-size: 0.75rem !important; color: #555 !important; margin-bottom: 4px !important; }
        
        .gjs-selectors-container { padding: 10px !important; }
        .gjs-clm-tags { border: 1px solid #eee !important; padding: 5px !important; border-radius: 4px !important; min-height: 40px !important; }
      `}</style>
    </div>
  );
}
