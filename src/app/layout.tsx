export const metadata = {
  title: 'DocuMate',
  description: 'Simplify customer management, jobs, and invoicing',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}