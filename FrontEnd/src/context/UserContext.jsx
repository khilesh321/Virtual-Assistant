import { createContext, useEffect, useState } from "react"
import axios from "axios";

export const userDataContext = createContext()
function UserContext({children}) {
  const serverUrl = 'https://virtual-assistant-backend-8muf.onrender.com';
  const [userData, setUserData] = useState(null);
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const handleCurrentUser = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/user/current`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setUserData(result.data);
      // console.log(result.data);
    } catch (error) {
      console.log("User authentication error:", error.response?.data || error.message);
    }
  }

  const getGeminiResponse = async(command) => {
    try {
      const result = await axios.post(`${serverUrl}/api/user/asktoassistant`,
        {command}, 
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!result.data) {
        throw new Error('Empty response from server');
      }
      return result.data;
      
    } catch (error) {
      console.error("Gemini response error:", error?.response?.data || error.message);
      return {
        type: 'error',
        userInput: command,
        response: error?.response?.data?.response || 'Sorry, I had trouble processing that request.'
      };
    }
  }

  useEffect(() => {
    handleCurrentUser()
  }, [])
  const value = {serverUrl, userData, setUserData, frontendImage, setFrontendImage, backendImage, setBackendImage, selectedImage, setSelectedImage, getGeminiResponse}
  return (
    <div>
      <userDataContext.Provider value={value}>
        {children}
      </userDataContext.Provider>
    </div>
  )
}

export default UserContext
