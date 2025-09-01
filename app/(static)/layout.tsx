import Header from '@/components/header'
import { Box } from '@mui/system'

interface StaticLayoutProps {
  children: React.ReactNode
}

export default async function Layout({ children }: StaticLayoutProps) {
  return (
    <Box
      component="main"
      className="flex flex-col h-dvh max-h-dvh overflow-hidden"
    >
      <Header />
      {/* Content area that grows and manages scroll inside */}
      <div className="flex grow overflow-hidden px-5 lg:px-0">
        {/* Allow horizontal scroll if needed, vertical scroll in inner panes */}
        <div className="flex grow min-h-0 min-w-0 overflow-hidden w-full">
          {children}
        </div>
      </div>
    </Box>
  )
}
