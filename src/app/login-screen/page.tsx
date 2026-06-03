import React from 'react';
import LoginForm from './components/LoginForm';
import LoginBrand from './components/LoginBrand';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-[hsl(var(--background))]">
      <LoginBrand />
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <LoginForm />
      </div>
    </div>
  );
}