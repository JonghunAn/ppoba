import dynamic from 'next/dynamic'

const LoginPage = dynamic(() => import('./LoginPage'), { ssr: false })

export default function Page(): JSX.Element {
  return <LoginPage />
}
