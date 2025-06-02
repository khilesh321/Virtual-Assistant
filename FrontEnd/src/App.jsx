import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Customize from './pages/Customize'
import Home from './pages/Home'
import { userDataContext } from './context/userContext'
import Customize2 from './pages/Customize2'

function App() {
  const { userData } = useContext(userDataContext)
  return (
    <Routes>
      <Route path='/' element={(userData?.assistantImage && userData?.assistantName) ? <Home/> : <Navigate to={'/customize'} />} ></Route>
      <Route path='/signup' element={userData ? <Navigate to={'/'}/> : <SignUp/>} ></Route>
      <Route path='/signin' element={userData ? <Navigate to={'/'}/> : <SignIn/>} ></Route>
      <Route path='/customize' element={userData ? <Customize/> : <Navigate to={'/signin'} />} ></Route>
      <Route path='/customize2' element={userData ? <Customize2/> : <Navigate to={'/signin'} />} ></Route>
    </Routes>
  )
}

export default App