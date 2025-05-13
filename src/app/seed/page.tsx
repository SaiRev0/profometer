'use client';

import { useState } from 'react';

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSeedCourses = async () => {
    try {
      setLoading(true);
      setMessage('');
      const response = await fetch('/api/seed/courses', {
        method: 'POST'
      });
      const data = await response.json();
      setMessage(data.message || data.error);
    } catch (error) {
      setMessage('Failed to seed courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDepartments = async () => {
    try {
      setLoading(true);
      setMessage('');
      const response = await fetch('/api/seed/departments', {
        method: 'POST'
      });
      const data = await response.json();
      setMessage(data.message || data.error);
    } catch (error) {
      setMessage('Failed to seed departments');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedProfessors = async () => {
    try {
      setLoading(true);
      setMessage('');
      const response = await fetch('/api/seed/professors', {
        method: 'POST'
      });
      const data = await response.json();
      setMessage(data.message || data.error);
    } catch (error) {
      setMessage('Failed to seed professors');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container mx-auto p-4'>
      <h1 className='mb-4 text-2xl font-bold'>Database Seeding</h1>
      <div className='space-y-4'>
        <div className='flex gap-4'>
          <button
            onClick={handleSeedDepartments}
            disabled={loading}
            className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-400'>
            {loading ? 'Seeding...' : 'Seed Departments'}
          </button>
          <button
            onClick={handleSeedProfessors}
            disabled={loading}
            className='rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:bg-gray-400'>
            {loading ? 'Seeding...' : 'Seed Professors'}
          </button>
          <button
            onClick={handleSeedCourses}
            disabled={loading}
            className='rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600 disabled:bg-gray-400'>
            {loading ? 'Seeding...' : 'Seed Courses'}
          </button>
        </div>
        {message && (
          <p className={`mt-4 ${message.includes('success') ? 'text-green-500' : 'text-red-500'}`}>{message}</p>
        )}
      </div>
    </div>
  );
}
