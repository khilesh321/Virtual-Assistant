import { Groq } from "groq-sdk";

const groqResponse = async(command, assistantName, userName) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not configured');
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    const prompt = `You are ${assistantName}, a voice-enabled virtual assistant. 
Your responses should be formatted as a JSON object with the following structure:

{
  "type": "<command_type>",
  "userInput": "<processed_command>",
  "response": "<voice_friendly_reply>"
}

Command types:
- "general": For general questions and conversations
- "google_search": For web searches
- "youtube_search": For YouTube searches
- "youtube_play": For direct video/song playback
- "calculator_open": For calculator requests
- "instagram_open": For Instagram access
- "facebook_open": For Facebook access
- "weather_show": For weather information
- "get_time": For current time
- "get_date": For today's date
- "get_day": For current day
- "get_month": For current month
- "get_year": For current year

Guidelines:
1. Remove assistant name from userInput if present
2. For search commands, userInput should only contain search terms
3. Keep responses concise and natural
4. Always identify as created by Khilesh
5. For questions about Khilesh, respond: "Khilesh is my creator, an engineering student at government college chhatrapati sambhajinagar"
6. Handle variations of Khilesh's name (nilesh, klesh, akhilesh) appropriately

Process this command: "${command}"`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful virtual assistant that responds in clean, parseable JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.3,
      max_tokens: 1024,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('Empty response from Groq');
    }

    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    return jsonMatch[0];

  } catch (error) {
    console.error('Groq API error:', error);
    throw error;
  }
};

export default groqResponse;
