import React, { useContext, useRef, useState } from 'react'
import Card from '../components/Card'
import image1 from '../assets/image1.png'
import image2 from '../assets/image2.jpg'
import image3 from '../assets/authBg.png'
import image4 from '../assets/image4.png'
import image5 from '../assets/image5.png'
import image6 from '../assets/image6.jpeg'
import image7 from '../assets/image7.jpeg'
import { LuImagePlus } from "react-icons/lu";
import { userDataContext } from '../context/UserContext2'
import { useNavigate } from 'react-router-dom'
import { IoArrowBackCircleOutline } from "react-icons/io5";

function Customize() {
  const {frontendImage, setFrontendImage, selectedImage, setSelectedImage} = useContext(userDataContext)
  const inputImage = useRef();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleImage = e => {
    const file = e.target.files[0];
    if (file) {
      setFrontendImage(URL.createObjectURL(file));
    }
  } 

  const handleNext = () => {
    setLoading(true);
    // Add small delay to show loading state
    setTimeout(() => {
      navigate('/customize2');
    }, 500);
  };

  return (
    <div className='w-full h-[100vh] flex justify-center items-center flex-col p-[20px] bg-gradient-to-t from-black to-[#030353] relative'>
      <IoArrowBackCircleOutline 
        className="absolute top-[30px] left-[30px] w-[35px] h-[35px] text-white cursor-pointer transition-all duration-300 hover:scale-110"
        onClick={() => navigate('/')}
      />
      <h1 className='text-white text-center text-[30px] mb-[30px]'>Select your <span className='text-blue-500'>Assistant Image</span></h1>
      
      <div className='w-full max-w-[900px] flex justify-center items-center flex-wrap gap-[15px]'>
        <Card image={image1} />
        <Card image={image2} />
        <Card image={image3} />
        <Card image={image4} />
        <Card image={image5} />
        <Card image={image6} />
        <Card image={image7} />

        <div className={`w-[70px] h-[140px] lg:w-[150px] lg:h-[250px] overflow-hidden bg-[#020220] border-2 border-[#0000ff66] rounded-2xl hover:shadow-2xl hover:shadow-blue-950 hover:border-4 hover:border-white cursor-pointer flex justify-center items-center
          ${selectedImage === 'input' ? 'border-4 border-white shadow-2xl shadow-blue-950' : ''}`}
          onClick={() => {
            inputImage.current.click();
            setSelectedImage('input');
          }}
        >
          {frontendImage ? (
            <img src={frontendImage} className='h-full w-full object-cover' />
          ) : (
            <LuImagePlus className='w-[25px] h-[25px] text-white' /> 
          )}
        </div>
        <input 
          type="file" 
          accept='image/*' 
          ref={inputImage} 
          hidden 
          onChange={handleImage}
        />
      </div>
      <button 
        className={`min-w-[150px] h-[60px] py-1.5 bg-white rounded-full font-semibold text-lg mt-[30px] disabled:opacity-50 cursor-pointer transition-all duration-300  hover:bg-blue-500 hover:text-white active:scale-95`} 
        onClick={handleNext}
        disabled={!selectedImage || loading}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Processing...</span>
          </div>
        ) : (
          "Next"
        )}
      </button>
    </div>
  )
}

export default Customize