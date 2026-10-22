import { Metadata } from 'next'
import { Demo } from '@/views/demo'
import { demoMetadata } from '@/config/seo'

export const metadata: Metadata = demoMetadata

export default function Page() {
  return <Demo />
}

