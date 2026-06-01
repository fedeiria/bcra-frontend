# BCRA Dashboard - Frontend 📈

Interfaz moderna y reactiva desarrollada en **Angular 19** para la visualización de indicadores financieros del Banco Central de la República Argentina (BCRA).

---

## 🚀 Características

* **🌐 Visualización en Tiempo Real**: Consulta de variables monetarias y estadísticas cambiarias de forma directa.
* **📊 Historiales Detallados**: Tablas interactivas con la evolución histórica de divisas y tasas.
* **🎨 Diseño Profesional**: Interfaz construida con **Bootstrap 5**, optimizada para la lectura de datos financieros complejos.
* **⚠️ Feedback al Usuario**: Manejo de errores intuitivo mediante alertas dinámicas (Animate.css) y estados de carga (Spinners).
* **🏗️ Arquitectura Limpia**: Uso de componentes *Standalone* y servicios modulares altamente escalables.

---

## 🛠️ Stack Tecnológico

| Herramienta | Uso |
| :--- | :--- |
| **Angular 20** | Framework de desarrollo principal. |
| **Bootstrap 5** | Estilos, grillas y maquetación responsiva. |
| **Bootstrap Icons** | Librería de iconos vectoriales. |
| **Animate.css** | Animaciones para componentes de alerta. |

---

## ⚙️ Configuración del Entorno

La aplicación consume un middleware propio construido en **NestJS**. Para una comunicación correcta, configurá los archivos de entorno:

### 🌍 Producción (`src/environments/environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://central-deudores-backend.onrender.com/api'
};

### Desarrollo (`src/environments/environment.ts`)

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};

## 📦 Instalación y Uso

Clonar el repositorio:

```bash
git clone https://github.com/fedeiria/bcra-frontend.git

Instalar dependencias:

2. **Instalar dependencias:**
   ```bash
npm install

3. **Ejecutar en desarrollo:**
   ```bash
ng serve

🚀 Navegá a http://localhost:4200/