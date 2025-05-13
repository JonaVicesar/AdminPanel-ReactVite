import React, { useState, useEffect } from 'react';
import { Upload, X, Save, LogOut, Edit, Trash2, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
//import { supabase } from '../../src/supabase';  
import { useAuth } from './auth/AuthProvider'; // Asegúrate de que la ruta sea correcta
import './styles/AdminPanel.css';

const AdminPanel = () => {
  const [view, setView] = useState('list'); // 'list', 'create', 'edit'
  const [projects, setProjects] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [projectData, setProjectData] = useState({
    id: null,
    title: '',
    description: '',
    category: 'cocinas',
    features: [''], // caracteristicas del proyecto
    duration: '',
    materials: '',
    user: {
      nameandSurname: '',
      phone: ''
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    images: []
  });
  const { logout } = useAuth();

  const { user } = useAuth(); // obtener el usuario actual del AuthProvider
  console.log("currentUser:", user.nameandSurname);
  

  useEffect(() => {
    if (user?.user) {
      setProjectData(prev => ({
        ...prev,
        user: user.user 
      }));
    }
  }, [user]);
  

  // Cargar proyectos del localStorage al iniciar
  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  // Guardar proyectos en localStorage cuando cambian
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:3001/projects');
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        }
      } catch (error) {
        console.error('Error al cargar proyectos:', error);
      }
    };
  
    fetchProjects();
  }, []);

  const resetForm = () => {
    setProjectData({
      id: null,
      title: '',
      description: '',
      category: 'cocinas',
      features: [''],
      duration: '',
      materials: '',
      user: {
        nameandSurname: user.nameandSurname,
        phone: user.phone
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: []
    });
    setSelectedFiles([]);
    setPreviews([]);
    setEditingProjectId(null);
  };

  const handleFilesSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addFeature = () => {
    setProjectData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...projectData.features];
    newFeatures[index] = value;
    setProjectData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const projectToSave = {
      ...projectData,
      id: editingProjectId || Date.now().toString(),
      user: {
        nameandSurname: user.nameandSurname,
        phone: user.phone,
      },
      images: previews,
      createdAt: editingProjectId ? projects.find(p => p.id === editingProjectId).createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    console.log("User:", user);

    try {
      let response;
      
      if (editingProjectId) {
        
        response = await fetch(`http://localhost:3001/projects/${editingProjectId}`, {
          
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(projectToSave),
        });
        
      } else {
        // crea un nuevo proyecto
        response = await fetch('http://localhost:3001/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(projectToSave),
        });
      }
  
      if (response.ok) {
        // Recargar proyectos tras guardar
        const updatedResponse = await fetch('http://localhost:3001/projects');
        if (updatedResponse.ok) {
          const data = await updatedResponse.json();
          setProjects(data);
        }
        
        resetForm();
        setView('list');
      }
    } catch (error) {
      console.error('Error al guardar proyecto:', error);
      alert('Error al guardar el proyecto');
    }
  };

  const handleEdit = (project) => {
    setProjectData({
      ...project,
      features: project.features.length ? project.features : ['']
    });
    setPreviews(project.images || []);
    setSelectedFiles([]);  
    setEditingProjectId(project.id);
    setView('edit');
  };

  const handleDelete = async (projectId) => {
  const projectToDelete = projects.find(p => p.id === projectId);

  if (user?.phone === projectToDelete?.user?.phone) {
    if (window.confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
      try {
        const response = await fetch(`http://localhost:3001/projects/${projectId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setProjects(prev => prev.filter(project => project.id !== projectId));
        }
      } catch (error) {
        console.error('Error al eliminar proyecto:', error);
        alert('Error al eliminar el proyecto');
      }
    }
  } else {
    alert('No tienes permiso para eliminar este proyecto.');
  }
};


  const handleLogout = () => {
    logout(); 
    localStorage.removeItem('projects'); 
    window.location.href = '/'; 
  };



  return (
    <div className="admin-container">
      {/* Header con título y botones de acción */}
      <div className="admin-header">
        <h1 className="admin-title">Panel de Administración</h1>
        <div className="admin-actions">
          {view === 'list' && (
            <button 
              onClick={() => { resetForm(); setView('create'); }} 
              className="btn btn-primary"
            >
              <Plus className="icon-small" /> Nuevo Proyecto
            </button>
          )}
          <button onClick={handleLogout} className="btn btn-logout">
            <LogOut className="icon-small" /> Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Vista de lista de proyectos */}
      {view === 'list' && (
        <Card className="card">
          <CardHeader>
            <CardTitle className="card-title">Proyectos</CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="empty-state">
                <p>No hay proyectos disponibles.</p>
                <button 
                  onClick={() => { resetForm(); setView('create'); }} 
                  className="btn btn-primary mt-2"
                >
                  <Plus className="icon-small" /> Crear Primer Proyecto
                </button>
              </div>
            ) : (
              <div className="projects-grid">
                {projects.map(project => (
                  <div key={project.id} className="project-card">
                    <div className="project-image">
                      {project.images && project.images[0] ? (
                        <img src={project.images[0]} alt={project.title} />
                      ) : (
                        <div className="no-image">Sin imagen</div>
                      )}
                    </div>
                    <div className="project-info">
                      <h3>{project.title}</h3>
                      <p className="project-category">{project.category}</p>
                      <p className="project-description">{project.description.substring(0, 100)}...</p>
                    </div>
                    <div className="project-actions">
                      <button 
                        onClick={() => handleEdit(project)} 
                        className="btn btn-edit"
                      >
                        <Edit className="icon-small" />
                      </button>
                      <button 
                        onClick={() => handleDelete(project.id)} 
                        className="btn btn-delete"
                      >
                        <Trash2 className="icon-small" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Formulario para crear o editar proyectos */}
      {(view === 'create' || view === 'edit') && (
        <Card className="card">
          <CardHeader>
            <CardTitle className="card-title">
              {view === 'create' ? 'Nuevo Proyecto' : 'Editar Proyecto'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="card-content">
              <div className="two-columns">
                <div className="form-group">
                  <label className="label">Título del Proyecto</label>
                  <input
                    type="text"
                    value={projectData.title}
                    onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label">Categoría</label>
                  <select
                    value={projectData.category}
                    onChange={(e) => setProjectData({ ...projectData, category: e.target.value })}
                    className="input"
                  >
                    <option value="otros">Otros</option>
                    <option value="muebles">Muebles</option>
                    <option value="salas">Salas</option>
                    <option value="comedores">Comedores</option>
                    <option value="escritorios">Escritorios</option>
                    <option value="bibliotecas">Bibliotecas</option>
                    <option value="mesas">Mesas y Sillas</option>
                    <option value="cocinas">Cocinas</option>
                    <option value="puertas">Puertas</option>
                    <option value="habitaciones">Habitaciones</option>
                    <option value="oficina">Oficina</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="label">Descripción</label>
                <textarea
                  value={projectData.description}
                  onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                  className="textarea"
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Materiales Utilizados</label>
                <input
                  type="text"
                  value={projectData.materials}
                  onChange={(e) => setProjectData({ ...projectData, materials: e.target.value })}
                  className="input"
                  placeholder="ej: MDF, Melamina, Espejos, etc"
                />
              </div>

              <div className="form-group">
                <label className="label">Duración del Proyecto</label>
                <input
                  type="text"
                  value={projectData.duration}
                  onChange={(e) => setProjectData({ ...projectData, duration: e.target.value })}
                  className="input"
                  placeholder="ej: 6 semanas"
                />
              </div>

              <div className="form-group">
                <label className="label">Características</label>
                {projectData.features.map((feature, index) => (
                  <div key={index} className="feature-input">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="input"
                      placeholder="ej: Iluminación LED integrada"
                    />
                    {index === projectData.features.length - 1 && (
                      <button
                        type="button"
                        onClick={addFeature}
                        className="btn btn-add"
                      >
                        +
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label className="label">Imágenes del Proyecto</label>
                <div className="image-grid">
                  {previews.map((preview, index) => (
                    <div key={index} className="image-preview">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="remove-btn"
                      >
                        <X className="icon-small" />
                      </button>
                    </div>
                  ))}
                  {previews.length < 5 && (
                    <label className="upload-box">
                      <Upload className="icon" />
                      <p className="upload-text">Añadir fotos</p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFilesSelect}
                        multiple
                        required
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => { setView('list'); resetForm(); }}
                  className="btn btn-cancel"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-save"
                >
                  <Save className="icon-small" />
                  {view === 'create' ? 'Publicar Proyecto' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminPanel;