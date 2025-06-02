import axios from 'axios'

const geminiResponse = async(command, assistantName, userName) => {
  try {
    const apiUrl = process.env.GEMINI_API_URL;
    const prompt = `You are a virtual assistant named ${assistantName} created by ${userName}.
You are not Google. You will now behave like a voice-enabled assistant.

Your task is to understand the user's natural language input and respond with a JSON object like this:

{
"type": "general" | "google_search" | "youtube_search" | "youtube_play" | "get_time" | "get_date" | "get_day" | "get_month" | "get_year" |"calculator_open" | "instagram_open" | "facebook_open" | "weather_show",
"userInput": "<original user inputs>" (only remove your name from userinput if exists) and agar kisi ne google ya youtube pe kuch search karne ko bola hai to userinput me only bo search waala text jaye,
"response": "<a short spoken response to read out loud to the user>"
}

Instructions:
- "type": determine the intent of the user.
- "userInput": original sentence the user spoke.
- "response": A short voice-friendly reply, e.g., "Sure, playing it now", "Here's what I found", "Today is Tuesday", etc.

Type meanings:
- "general": if it's a factual or informational question.
aur agar koi aisa question puchta hai jiska answer tumhe pata hai usko bhi general category me rakho bus short answer dena.
- "google_search": if user wants to search something on Google.
- "youtube_search": if user wants to search something on YouTube.
- "youtube_play": if user wants to directly play a video or song.
- "calculator_open": if user wants to open a calculator .
- "instagram_open": if user wants to open instagram .
- "facebook_open": if user wants to open facebook.
- "weather-show": if user wants to know weather
- "get_time": if user asks for current time.
- "get_date": if user asks for today's date.
- "get_day": if user asks what day it is.
- "get_month": if user asks for the current month.
- "get_year": if user asks for the current year.

Important:
- Use Khilesh name (agar koi puche kisme banaya)
- respond like I'm created by Khilesh (if anyone ask about it, don't say you are Google's model)
- if anyone ask about nilesh, klesh, akhilesh means similar words like 'Khilesh' then respond as i mentioned below
- if someone ask about me (Khilesh) then respond like this Khilesh is my creator, an engineering student at government college chhatrapati sambhajinagar
- Only respond with the JSON object, nothing else.

now your userInput- ${command}
`;

    console.log('Sending request to Gemini with command:', command);
    
    const result = await axios.post(apiUrl, {
      "contents": [{
          "parts": [{
              "text": prompt
          }]
      }]
    });

    console.log('Raw Gemini response:', JSON.stringify(result.data));

    if (!result.data || !result.data.candidates || !result.data.candidates[0].content.parts[0].text) {
      console.error('Invalid or empty response from Gemini API');
      return JSON.stringify({
        type: 'general',
        userInput: command.replace(new RegExp(assistantName, 'i'), '').trim(),
        response: "I apologize, but I'm having trouble processing that request right now. Could you try again?"
      });
    }

    const responseText = result.data.candidates[0].content.parts[0].text;
    console.log('Gemini response text:', responseText);

    // Validate JSON format
    try {
      // Find the JSON object in the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      // Parse and validate the JSON
      const parsedResponse = JSON.parse(jsonMatch[0]);
      if (!parsedResponse.type || !parsedResponse.response) {
        throw new Error('Invalid response structure');
      }

      return jsonMatch[0]; // Return the valid JSON string
    } catch (jsonError) {
      console.error('JSON processing error:', jsonError);
      // Fallback response
      return JSON.stringify({
        type: 'general',
        userInput: command.replace(new RegExp(assistantName, 'i'), '').trim(),
        response: "I understood your request but had trouble processing it. Could you rephrase that?"
      });
    }

  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    // More specific error handling
    const errorResponse = {
      type: 'error',
      userInput: command.replace(new RegExp(assistantName, 'i'), '').trim(),
      response: "I encountered a technical issue. Please try again in a moment."
    };

    if (error.response?.status === 429) {
      errorResponse.response = "I'm receiving too many requests right now. Please try again in a few seconds.";
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      errorResponse.response = "I'm having trouble connecting to my services. Please check your internet connection.";
    }

    return JSON.stringify(errorResponse);
  }
}

export default geminiResponse;