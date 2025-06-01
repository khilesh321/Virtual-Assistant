import React, { useContext, useState } from 'react'
import bg from '../assets/authBg.png'
import { IoEye, IoEyeOff } from "react-icons/io5";
import {useNavigate} from 'react-router-dom'
import { userDataContext } from '../context/userContext';
import axios from 'axios'

function SignIn() {
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {serverUrl, setUserData} = useContext(userDataContext)

  async function handleSignIn(e){
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const result = await axios.post(`${serverUrl}/api/auth/signin`, {
        email, password: pass
      }, {
        withCredentials: true,
      });
      
      // console.log('SignIn successful:', result.data);
      setUserData(result.data)
      navigate('/');
    } catch (err) {
      setError(err.response.data || { message: 'An error occurred during signup' });
      console.error('SignIn error:', err.response.data || err);
      setUserData(null)
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='w-full h-[100vh] bg-cover flex justify-center items-center' style={{backgroundImage: `url(${bg})`}}>
      <form className='w-[90%] h-[600px] max-w-[500px] px-[20px] bg-[#00000060] backdrop-blur shadow-lg shadow-black flex flex-col justify-center items-center gap-[20px]' onSubmit={handleSignIn}>
        <h1 className='text-white text-[30px] font-semibold mb-[30px]'>SignIn to the <span className='text-blue-400 font-bold'>Virtual Assistant</span></h1>
        <input 
          className='w-full h-[60px] px-[20px] py-[10px] outline-none border-2 border-white bg-transparent rounded-2xl text-white text-lg placeholder-gray-300 transition-all duration-300 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/20' 
          type="email" 
          name='email' 
          id="signin-email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          placeholder='Email...' 
          required
        />
        <div className='w-full relative'>
          <input 
            className='w-full h-[60px] px-[20px] py-[10px] outline-none border-2 border-white bg-transparent rounded-2xl text-white text-lg placeholder-gray-300 transition-all duration-300 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/20' 
            type={showPass?"text":"password"} 
            value={pass} 
            onChange={e => setPass(e.target.value)} 
            name='pass' 
            id="signin-password" 
            placeholder='Password...' 
            required
          />
          {showPass ? (
            <IoEyeOff className='absolute top-[18px] right-[20px] w-[25px] h-[25px] text-zinc-300 cursor-pointer' onClick={() => setShowPass(false)} />
          ) : (
            <IoEye className='absolute top-[18px] right-[20px] w-[25px] h-[25px] text-zinc-300 cursor-pointer' onClick={() => setShowPass(true)} />
          )}
        </div>
        {error && <div className="w-full text-center py-1 rounded-xl text-red-500 bg-red-200">*{error.message}</div>}
        <button 
          disabled={loading}
          className='w-[150px] h-[60px] bg-white rounded-full font-semibold text-lg mt-[30px] disabled:opacity-50 transition-all duration-300 hover:bg-blue-500 hover:text-white active:scale-95'
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Signing in...</span>
            </div>
          ) : (
            'Sign In'
          )}
        </button>
        <p className='text-white text-[18px]'>Want to create a new account ? <span className='text-blue-400 cursor-pointer' onClick={() => navigate('/signup')}>Sign Up</span></p>
      </form>
    </div>
  )
}

export default SignIn