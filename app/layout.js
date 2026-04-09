import './globals.css';

export const metadata = {
  title: 'Sistem Karyawan - Overtime Management',
  description: 'Employee Overtime Management System - Track overtime, income, and cashflow',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
