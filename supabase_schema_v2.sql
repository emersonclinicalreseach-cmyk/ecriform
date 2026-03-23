-- 1. Eliminar tablas anteriores si existen (¡CUIDADO! Se perderán los datos actuales)
DROP TABLE IF EXISTS responses;
DROP TABLE IF EXISTS forms;
DROP TABLE IF EXISTS profiles;

-- 2. Crear tabla de perfiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Crear tabla de formularios (CON ID NUMÉRICO AUTOINCREMENTAL)
CREATE TABLE forms (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Crear tabla de respuestas (CON ID NUMÉRICO EN FORM_ID)
CREATE TABLE responses (
  id SERIAL PRIMARY KEY,
  form_id INT REFERENCES forms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
