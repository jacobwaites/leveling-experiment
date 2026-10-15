import React from 'react'
import { createRoot } from 'react-dom/client'
import * as AppModule from './App'
import './index.css'

const mod = AppModule as Record<string, unknown>
const App = (mod.default ?? Object.values(mod).find((v) => typeof v === 'function')) as React.ComponentType

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
