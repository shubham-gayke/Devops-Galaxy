import React, { Suspense, lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from '../components/Layout/Layout'
import PageSkeleton from '../components/Layout/PageSkeleton'

// Code-split each route — the JS chunk for each page only downloads when the
// user navigates to that route. None of these are loaded at startup.
const GitPage       = lazy(() => import('../routes/GitPage'))
const TerraformPage = lazy(() => import('../routes/TerraformPage'))
const AnsiblePage   = lazy(() => import('../routes/AnsiblePage'))
const AwsPage       = lazy(() => import('../routes/AwsPage'))
const InterviewPage = lazy(() => import('../routes/InterviewPage'))

const withSuspense = (Component) => (
  <Suspense fallback={<PageSkeleton />}>
    <Component />
  </Suspense>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true,           element: <Navigate to="/git" replace /> },
      { path: 'git',           element: withSuspense(GitPage) },
      { path: 'terraform',     element: withSuspense(TerraformPage) },
      { path: 'ansible',       element: withSuspense(AnsiblePage) },
      { path: 'aws',           element: withSuspense(AwsPage) },
      { path: 'interview',     element: withSuspense(InterviewPage) },
    ],
  },
])
