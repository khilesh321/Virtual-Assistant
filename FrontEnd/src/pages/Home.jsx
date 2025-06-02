import React, { useContext, useEffect, useRef, useState, useCallback } from 'react'
import { userDataContext } from '../context/userContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import listeningGif from '../assets/user.gif'
import speakingGif from '../assets/ai.gif'
import { HiMenu } from 'react-icons/hi'
import { IoMdClose } from 'react-icons/io'

function Home() {
  const { userData, setUserData, serverUrl, getGeminiResponse } = useContext(userDataContext)
  const navigate = useNavigate()

  // States & refs
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [userText, setUserText] = useState(null)
  const [aiText, setAiText] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isSpeakingRef = useRef(false)
  const isRecognizingRef = useRef(false)
  const recognitionRef = useRef(null)
  const voicesRef = useRef([])

  const synth = window.speechSynthesis

  // 1. Cache available voices aur console pe print karo
  useEffect(() => {
    const loadVoices = () => {
      const available = synth.getVoices()
      if (available.length) {
        voicesRef.current = available
        // console.log(
        //   'Available voices:',
        //   available.map((v, i) => `${i}: ${v.name} (${v.lang})`)
        // )
      }
    }
    loadVoices()
    synth.onvoiceschanged = loadVoices
  }, [])

  // 2. Logout handler
  // const handleLogout = async () => {
  //   try {
  //     await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true })
  //     setUserData(null)
  //     navigate('/signin')
  //   } catch (error) {
  //     setUserData(null)
  //     console.error(error)
  //   }
  // }

  // 3. General function to stop recognition
  const stopRecognition = () => {
    if (recognitionRef.current && isRecognizingRef.current) {
      recognitionRef.current.onend = null
      recognitionRef.current.stop()
      isRecognizingRef.current = false
      setListening(false)
    }
  }

  // 4. text-to-speech with default male voice (index 4)
  const speak = (text) => {
    if (!text) return

    try {
      // Update voices list
      const available = synth.getVoices()
      if (available.length) voicesRef.current = available

      // Cancel any ongoing speech
      if (synth.speaking) synth.cancel()

      // Stop recognition to avoid overlap
      stopRecognition()

      const utterance = new SpeechSynthesisUtterance(text)

      // Directly choose index 4 (Microsoft Ravi - English (India))
      const defaultMale = voicesRef.current[4]
      if (defaultMale) {
        utterance.voice = defaultMale
        utterance.lang = defaultMale.lang
        console.log('Using default male voice:', defaultMale.name, defaultMale.lang)
      } else {
        // Agar index 4 na mile (fallback), toh first available en-IN ya hi-IN
        const indianVoice =
          voicesRef.current.find(v => v.lang.toLowerCase().includes('en-in')) ||
          voicesRef.current.find(v => v.lang.toLowerCase().includes('hi-in')) ||
          voicesRef.current.find(v => v.lang.toLowerCase().includes('en-us'))
        if (indianVoice) {
          utterance.voice = indianVoice
          utterance.lang = indianVoice.lang
          console.log('Fallback voice:', indianVoice.name, indianVoice.lang)
        }
      }

      utterance.rate = 1.5
      utterance.pitch = 1

      setSpeaking(true)
      isSpeakingRef.current = true

      utterance.onerror = () => {
        setSpeaking(false)
        isSpeakingRef.current = false
        safeRecognition()
      }

      utterance.onend = () => {
        setSpeaking(false)
        isSpeakingRef.current = false
        setAiText(null)
        safeRecognition()
      }

      synth.speak(utterance)
    } catch (error) {
      console.error('Error in speak():', error)
      setSpeaking(false)
      isSpeakingRef.current = false
      safeRecognition()
    }
  }

  // 5. Start recognition if not already listening or speaking
  const startRecognition = () => {
    if (isRecognizingRef.current || isSpeakingRef.current) return
    try {
      recognitionRef.current.start()
    } catch {
      setTimeout(() => safeRecognition(), 500)
    }
  }

  // 6. Retry recognition in case of invalid state
  const safeRecognition = useCallback(() => {
    if (!isSpeakingRef.current && !isRecognizingRef.current) {
      try {
        recognitionRef.current.start()
      } catch(e) {
        console.log(e);
      }
    }
  }, [])

  // 7. Handle commands (Google, YouTube, etc.)
  const handleCommand = (data) => {
    const { type, userInput, response } = data
    speak(response)
    switch (type) {
      case 'google_search':
        window.open(`https://www.google.com/search?q=${encodeURIComponent(userInput)}`, '_blank')
        break
      case 'youtube_search':
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`, '_blank')
        break
      case 'youtube_play':
        window.open(
          `https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}&sp=EgIQAQ%253D%253D`,
          '_blank'
        )
        break
      case 'calculator_open':
        window.open('https://www.google.com/search?q=calculator', '_blank')
        break
      case 'instagram_open':
        window.open('https://www.instagram.com', '_blank')
        break
      case 'facebook_open':
        window.open('https://www.facebook.com', '_blank')
        break
      case 'weather_show':
        window.open('https://www.google.com/search?q=weather', '_blank')
        break
      default:
        break
    }
  }

  // 8. Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      isRecognizingRef.current = true
      setListening(true)
      console.log('Voice recognition started...')
    }

    recognition.onerror = (event) => {
      isRecognizingRef.current = false
      setListening(false)
      if (event.error !== 'aborted' && !isSpeakingRef.current) {
        setTimeout(() => safeRecognition(), 500)
      }
    }

    recognition.onresult = async (e) => {
      try {
        const transcript = e.results[e.results.length - 1][0].transcript.trim()
        console.log('User said:', transcript)
        if (transcript.toLowerCase().includes(userData?.assistantName?.toLowerCase())) {
          const command = transcript.replace(new RegExp(userData.assistantName, 'i'), '').trim()
          setUserText(command)

          // Mark speaking = true to prevent immediate re-start
          isSpeakingRef.current = true
          setSpeaking(true)

          recognition.stop()
          isRecognizingRef.current = false
          setListening(false)

          const response = await getGeminiResponse(command)
          console.log('Assistant response:', response)
          setAiText(response.response)
          handleCommand(response)
          setUserText(null)
        }
      } catch (error) {
        console.error('Error processing speech:', error)
      }
    }

    recognition.onend = () => {
      isRecognizingRef.current = false
      setListening(false)
      if (!isSpeakingRef.current) {
        safeRecognition()
      }
    }

    recognitionRef.current = recognition
    return () => {
      recognition.stop()
      isRecognizingRef.current = false
      setListening(false)
    }
  }, [userData, getGeminiResponse, safeRecognition])

  // 9. Stop recognition before navigating
  const stopRecognitionAndNavigate = (path) => {
    stopRecognition()
    navigate(path)
  }

  // Logout handler with recognition stop and navigation
  const handleLogoutAndNavigate = async () => {
    stopRecognition()
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true })
      setUserData(null)
      navigate('/signin')
    } catch (error) {
      setUserData(null)
      navigate('/signin')
      console.error(error)
    }
  }

  // Button handler to stop recognition only
  const handleStopListening = () => {
    stopRecognition()
  }

  // Button handler to stop speaking
  const handleStopSpeaking = () => {
    if (synth.speaking) {
      synth.cancel()
      setSpeaking(false)
      isSpeakingRef.current = false
      setAiText(null)
      safeRecognition()
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-6 bg-gradient-to-t from-black to-[#030353] relative">
      {/* Hamburger Menu */}
      <button
        className="md:hidden px-4 py-2 absolute top-5 right-5 text-white z-50"
        onClick={() => setIsMenuOpen(prev => !prev)}
      >
        {isMenuOpen ? <IoMdClose className="w-8 h-8" /> : <HiMenu className="w-8 h-8" />}
      </button>

      {isMenuOpen && (
        <div className="md:hidden absolute top-0 right-0 mt-16 mr-4 bg-white rounded-lg shadow-lg p-4 flex flex-col gap-3 z-40">
          <button
            className="px-4 py-2 text-lg font-semibold hover:bg-blue-500 hover:text-white rounded-lg transition"
            onClick={() => {
              setIsMenuOpen(false)
              stopRecognitionAndNavigate('/customize')
            }}
          >
            Customize
          </button>
          <button
            className="px-4 py-2 text-lg font-semibold hover:bg-red-500 hover:text-white rounded-lg transition"
            onClick={() => {
              setIsMenuOpen(false)
              handleLogoutAndNavigate()
            }}
          >
            Logout
          </button>
        </div>
      )}

      {/* Desktop Buttons */}
      <div className="hidden md:flex flex-row gap-3 absolute top-24 right-5">
        <button
          className="px-4 py-3 bg-white rounded-full font-semibold text-lg hover:bg-blue-500 hover:text-white transition"
          onClick={() => stopRecognitionAndNavigate('/customize')}
        >
          Customize Your Assistant
        </button>
      </div>
      <button
        className="hidden md:block px-5 py-3 bg-white rounded-full font-semibold text-lg absolute top-5 right-5 hover:bg-red-500 hover:text-white transition"
        onClick={handleLogoutAndNavigate}
      >
        Logout
      </button>

      {/* Assistant Image */}
      <div className="w-72 h-96 flex items-center justify-center overflow-hidden rounded-3xl shadow-lg border-2 border-blue-300">
        <img
          src={userData?.assistantImage}
          alt="Assistant"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Assistant Name */}
      <h1 className="text-white text-2xl font-bold">I'm {userData?.assistantName}</h1>

      {/* Start/Stop Listening Button */}
      {!listening && !speaking && (
        <button
          className="px-6 py-3 bg-green-600 text-white rounded-full font-semibold text-lg hover:bg-green-700 transition flex items-center gap-2"
          onClick={startRecognition}
        >
          Start Listening
        </button>
      )}
      {listening && !speaking && (
        <button
          className="px-6 py-3 bg-yellow-500 text-white rounded-full font-semibold text-lg hover:bg-yellow-600 transition flex items-center gap-2"
          onClick={handleStopListening}
        >
          Stop Listening
        </button>
      )}
      {speaking && (
        <button
          className="px-6 py-3 bg-yellow-500 text-white rounded-full font-semibold text-lg hover:bg-yellow-600 transition flex items-center gap-2"
          onClick={handleStopSpeaking}
        >
          <span className="ml-2">Stop Speaking</span>
        </button>
      )}

      {/* Animation GIF */}
      {listening && !speaking && <img className="w-48" src={listeningGif} alt="Listening" />}
      {speaking && <img className="w-48" src={speakingGif} alt="Speaking" />}

      {/* Display userText or aiText */}
      <h1 className="text-white text-center px-4">{userText || aiText || ''}</h1>
    </div>
  )
}

export default Home
