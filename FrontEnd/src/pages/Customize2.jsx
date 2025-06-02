import { useContext, useState } from "react"
import { userDataContext } from "../context/UserContext2"
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
        // If selectedImage is a URL from the predefined images
        formData.append('imageUrl', selectedImage)
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
        // Add a small delay to ensure state is updated
        setTimeout(() => {
          navigate('/');
        }, 100);
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
      <form
        className="w-full max-w-[600px] flex flex-col items-center"
        onSubmit={(e) => {
          e.preventDefault();
          if (assistantName.trim() && !loading) {
            handleUpdateAssistant();
          }
      }}>
        <input 
          className='w-full h-[60px] px-[20px] py-[10px] outline-none border-2 border-white bg-transparent rounded-2xl text-white text-lg placeholder-gray-300 transition-all duration-300 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/20' 
          type="text" 
          name="name"
          id="signup-name"
          value={assistantName}
          placeholder='eg. CHETANA...' 
          required
          onChange={e => setAssistantName(e.target.value)}
        />
        {error && (
          <div className="text-red-500 bg-red-100 px-4 py-2 rounded-lg mt-4 w-full text-center">
            {error}
          </div>
        )}
        <button
          type="submit"
          className={`min-w-[150px] h-[60px] py-2 px-5 bg-white rounded-full font-semibold text-lg mt-[30px] disabled:opacity-50 cursor-pointer transition-all duration-300 hover:bg-blue-500 hover:text-white active:scale-95`}
          disabled={loading || !assistantName.trim()}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </div>
          ) : (
            "Finally Create Your Assistant"
          )}
        </button>
      </form>
    </div>
  )
}

export default Customize2