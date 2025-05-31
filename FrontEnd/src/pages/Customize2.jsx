import { useContext, useState } from "react"
import { userDataContext } from "../assets/context/userContext"
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { IoArrowBackCircleOutline } from "react-icons/io5"

function Customize2() {
  const {userData, backendImage, selectedImage, serverUrl, setUserData} = useContext(userDataContext);
  const [assistantName, setAssistantName] = useState(userData?.assistantName || "")
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleUpdateAssistant = async () => {
    try {
      setLoading(true);
      setError(null);
      let formData = new FormData()
      formData.append("assistantName", assistantName)
      
      if (backendImage) {
        formData.append('assistantImage', backendImage)
      } else if (selectedImage) {
        formData.append('assistantImage', selectedImage)
      } else {
        throw new Error('No image selected');
      }

      const result = await axios.post(`${serverUrl}/api/user/update`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      if (result.data) {
        setUserData(result.data);
        navigate('/');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating assistant');
      console.error("Error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='w-full h-[100vh] flex justify-center items-center flex-col p-[20px] bg-gradient-to-t from-black to-[#030353] relative'>
      <IoArrowBackCircleOutline className="absolute top-[30px] left-[30px] w-[35px] h-[35px] text-white cursor-pointer transition-all duration-300 hover:scale-110"
        onClick={() => navigate('/customize')}
      />
      <h1 className='text-white text-center text-[30px] mb-[30px]'>Enter your <span className='text-blue-500'>Assistant Name</span></h1>
      <input 
          className='w-full max-w-[600px] h-[60px] px-[20px] py-[10px] outline-none border-2 border-white bg-transparent rounded-2xl text-white text-lg placeholder-gray-300' 
          type="text" 
          name="name"
          id="signup-name" 
          value={assistantName}
          placeholder='eg. CHETANA...' 
          required
          onChange={e => setAssistantName(e.target.value)}
      />
      {error && (
        <div className="text-red-500 bg-red-100 px-4 py-2 rounded-lg mt-4">
          {error}
        </div>
      )}
      <button 
        className={`min-w-[150px] h-[60px] py-2 px-5 bg-white rounded-full font-semibold text-lg mt-[30px] cursor-pointer transition-all duration-500 ${!assistantName.trim() ? 'opacity-0' : 'opacity-100'} ${loading ? 'bg-gray-300' : ''}`}
        onClick={handleUpdateAssistant}
        disabled={loading || !assistantName.trim()}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
            <span>Processing...</span>
          </div>
        ) : (
          "Finally Create Your Assistant"
        )}
      </button>
    </div>
  )
}

export default Customize2