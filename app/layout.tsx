import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';
export const metadata: Metadata = { title: { default: 'Vivaha — Digital Wedding Invitations', template: '%s | Vivaha' }, description: 'A beautiful home for your wedding invitation.' };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}<Toaster richColors position="top-right"/></body></html>}
