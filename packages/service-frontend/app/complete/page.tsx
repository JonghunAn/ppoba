import dynamic from 'next/dynamic'

const CompletePage = dynamic(() => import('./CompletePage'), { ssr: false })

export default function Page(): JSX.Element {
  return <CompletePage />
}
