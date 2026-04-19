import React from 'react'
import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import ClienteHome from './pages/ClienteHome'
import { useAuth } from './context/useAuth'
export default function App() {
  const {user}=useAuth()
  function PrivateRouteCliente({ children }) {

    if (!user.token) {
      return <Navigate to="/Login"></Navigate>
    }
    return user.rol === "admin" ? <Navigate to="/"></Navigate> : children

  }
  function PrivateRouteAdministrador({ children }) {
    if (!user.token) {
      return <Navigate to="/Login"></Navigate>
    }
    return user.rol === "cliente" ? <Navigate to="/cliente"></Navigate> : children
  }
  return (
    <>
      <Routes>
        <Route path='/' element={<PrivateRouteAdministrador><Home /></PrivateRouteAdministrador>}></Route>
        <Route path='/cliente' element={<PrivateRouteCliente><ClienteHome /></PrivateRouteCliente>}></Route>
        <Route path='/Login' element={<Login />}></Route>
      </Routes>
    </>
  )
}
