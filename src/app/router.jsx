import React, { Suspense, lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from '../components/Layout/Layout'
import PageSkeleton from '../components/Layout/PageSkeleton'

import GitPage from '../routes/GitPage'
import TerraformPage from '../routes/TerraformPage'
import AnsiblePage from '../routes/AnsiblePage'
import AwsPage from '../routes/AwsPage'
import InterviewPage from '../routes/InterviewPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true,           element: <Navigate to="/git" replace /> },
      { path: 'git',           element: <GitPage /> },
      { path: 'terraform',     element: <TerraformPage /> },
      { path: 'ansible',       element: <AnsiblePage /> },
      { path: 'aws',           element: <AwsPage /> },
      { path: 'interview',     element: <InterviewPage /> },
      { path: '*',             element: (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h2 style={{ color: 'var(--text-main)', fontSize: '2rem' }}>404 - Page Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>The page you are looking for does not exist.</p>
          <a href="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 'bold' }}>&larr; Return Home</a>
        </div>
      )},
    ],
  },
])
