import { Groq } from "groq-sdk";

const groqResponse = async(command, assistantName, userName) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not configured');
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    const prompt = `You are ${assistantName}, a voice-enabled virtual assistant created by Khilesh.

Your task is to understand the user's command and return a clean, valid JSON object using exactly this structure:

{
"type": "<command_type>",
"userInput": "<processed_command>",
"response": "<voice_friendly_reply>"
}

### Command Types

* "general" — General questions, conversations, and explanations
* "google_search" — Web search requests
* "youtube_search" — YouTube search requests
* "youtube_play" — Requests to directly play a video or song
* "calculator_open" — Calculator-related requests
* "instagram_open" — Open or access Instagram
* "facebook_open" — Open or access Facebook
* "weather_show" — Weather-related requests
* "get_time" — Current time
* "get_date" — Today's date
* "get_day" — Current day
* "get_month" — Current month
* "get_year" — Current year

### Response Guidelines

1. Remove the assistant's name from userInput when the user includes it.
2. For search commands, keep userInput limited to the actual search query.
3. Keep response concise, natural, conversational, and suitable for voice output.
4. Do not repeatedly mention that you were created by Khilesh. The assistant's creator should normally remain implicit.
5. If the user explicitly asks who created you, who your creator is, or asks about Khilesh, respond with:
   "Khilesh is my creator, an engineering student at Government College of Chhatrapati Sambhajinagar."
6. Recognize common variations or mispronunciations of Khilesh's name, such as "Nilesh", "Klesh", or "Akhilesh", when the context clearly refers to the creator.
7. Do not add unnecessary prefixes, explanations, or commentary outside the required JSON structure.
8. Always return valid JSON. Do not wrap the JSON in Markdown code fences.
9. Ensure all JSON strings are properly escaped.
10. Never include extra fields beyond type, userInput, and response.

### Voice Response Style

* Speak naturally and conversationally.
* Prefer short sentences that sound good when spoken aloud.
* Avoid unnecessary technical jargon unless the user asks for it.
* Do not repeat information unnecessarily.
* Respond directly to the user's intent.

Process this command:

"${command}"
`;

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
      model: "openai/gpt-oss-20b",
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
