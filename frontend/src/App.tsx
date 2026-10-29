import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TrezoLayout } from './components/Layout/TrezoLayout';
import { Dashboard } from './pages/Dashboard';
import { Colonia } from './pages/Colonia';
import { Historico } from './pages/Historico';
import { Actores } from './pages/Actores';
import { Documentos } from './pages/Documentos';
import { EmediosJobs } from './pages/EmediosJobs';
import { Vigia } from './pages/Vigia';
import { Resumenes } from './pages/Resumenes';
import { Admin } from './pages/Admin';

export const App: React.FC = () => {
  const [rol, setRol] = useState<string>('jefe_operaciones');

  return (
    <BrowserRouter>
      <TrezoLayout rol={rol} onRolChange={setRol}>
        <Routes>
          <Route path="/" element={<Dashboard rol={rol} />} />
          <Route path="/colonia/:id" element={<Colonia />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/actores" element={<Actores />} />
          <Route path="/investigacion" element={<Actores />} />
          <Route path="/documentos" element={<Documentos />} />
          <Route path="/admin/documentos" element={<Documentos />} />
          <Route path="/admin/emedios" element={<EmediosJobs />} />
          <Route path="/admin/vigia" element={<Vigia />} />
          <Route path="/resumenes" element={<Resumenes />} />
          <Route path="/admin/skills" element={<Admin />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </TrezoLayout>
    </BrowserRouter>
  );
};

export default App;
