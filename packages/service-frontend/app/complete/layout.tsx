import { ContentWrapper } from '@/app/components'

export const dynamic = 'force-dynamic'

interface Props {
  children: React.ReactNode
}

export default function Layout({ children }: Props): JSX.Element {
  return <ContentWrapper>{children}</ContentWrapper>
}
