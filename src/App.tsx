import { useEffect } from 'react'
import { Toolbar } from './components/Toolbar'
import { ConfigPanel } from './components/ConfigPanel'
import { PiecesList } from './components/PiecesList'
import { PropertiesPanel } from './components/PropertiesPanel'
import { Viewport3D } from './components/Viewport3D'
import { Dashboard } from './components/Dashboard'
import { OrthographicView } from './components/OrthographicView'
import { useProjectStore } from './stores/projectStore'

export default function App() {
  const currentProject = useProjectStore((s) => s.currentProject)
  const showOrthographicView = useProjectStore((s) => s.showOrthographicView)
  const loadAllProjects = useProjectStore((s) => s.loadAllProjects)

  useEffect(() => {
    loadAllProjects()
  }, [loadAllProjects])

  if (!currentProject) {
    return <Dashboard />
  }

  return (
    <div className="flex flex-col h-screen">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 border-r border-neutral-200 flex flex-col overflow-hidden bg-white">
          <ConfigPanel />
          <div className="border-t border-neutral-200 flex-1 overflow-hidden">
            <PiecesList />
          </div>
        </div>
        <div className="flex-1 min-h-0 min-w-0">
          <Viewport3D />
        </div>
        <div className="w-72 border-l border-neutral-200 bg-white overflow-hidden">
          <PropertiesPanel />
        </div>
      </div>
      {showOrthographicView && <OrthographicView />}
    </div>
  )
}