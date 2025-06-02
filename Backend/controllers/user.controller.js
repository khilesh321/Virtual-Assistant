import { response } from "express";
import uploadOnCloudinary from "../config/cloudinary.js";
import geminiResponse from "../gemini.js";
import User from "../models/user.model.js"; // Add .js extension
import moment from "moment/moment.js";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password");
    if(!user) return res.status(400).json({message: 'user not found!'})
    return res.status(200).json(user)
  } catch (err) {
    return res.status(500).json({message: 'get current user error'})
  }
}

export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body;
    let assistantImage;

    if (req.file) {
      // Handle file upload
      assistantImage = await uploadOnCloudinary(req.file.path);
    } else if (imageUrl) {
      // Use the provided image URL directly
      assistantImage = imageUrl;
    } else {
      return res.status(400).json({ message: 'No image provided' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.userId, 
      { assistantName, assistantImage },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
    
  } catch (error) {
    console.error('Update assistant error:', error);
    return res.status(400).json({ message: 'Error in Updating Assistant' });
  }
}

export const askToAssistant = async(req,res) => {
  try {
    const {command} = req.body;
    const user = await User.findById(req.userId);
    user.history.push(command)
    user.save();
    const userName = user.name;
    const assistantName = user.assistantName;

    const result = await geminiResponse(command, assistantName, userName);
    
    try {
      // Find the first occurrence of '{' and last occurrence of '}'
      const jsonStart = result.indexOf('{');
      const jsonEnd = result.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd <= jsonStart) {
        console.error("Invalid JSON format in response:", result);
        return res.status(400).json({
          type: 'error',
          response: "Sorry, I couldn't understand that response"
        });
      }

      const jsonStr = result.slice(jsonStart, jsonEnd);
      let gemResult;
      try {
        gemResult = JSON.parse(jsonStr);
      } catch (e) {
        console.error("JSON parsing failed:", e, "Response string:", jsonStr);
        return res.status(400).json({
          type: 'error',
          response: "Sorry, I couldn't understand that response"
        });
      }
      const {type} = gemResult;

      switch(type){
        case 'get_date' : 
          return res.json({
            type,
            userInput: gemResult.userInput,
            response: `current date is ${moment().format("YYYY-MM-DD")}`
          });

        case 'get_time' : 
          return res.json({
            type,
            userInput: gemResult.userInput,
            response: `current time is ${moment().format("hh:mm A")}`
          });

        case 'get_day' : 
          return res.json({
            type,
            userInput: gemResult.userInput,
            response: `today is ${moment().format("dddd")}`
          });

        case 'get_month' : 
          return res.json({
            type,
            userInput: gemResult.userInput,
            response: `Current month is ${moment().format("MMMM")}`
          });

        case 'get_year' : 
          return res.json({
            type,
            userInput: gemResult.userInput,
            response: `Current year is ${moment().year()}`
          });

        case 'general':
        case 'google_search':
        case 'youtube_search':
        case 'youtube_play':
        case 'calculator_open':
        case 'instagram_open':
        case 'facebook_open':
        case 'weather_show':
          return res.json({
            type,
            userInput: gemResult.userInput,
            response: gemResult.response
          });
          
        default:
          return res.json({
            type: 'unknown',
            userInput: gemResult.userInput,
            response: "I'm not sure how to handle that request. Could you please try something else?"
          });
      }

    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return res.status(400).json({
        type: 'error',
        response: "Sorry, I couldn't understand that response"
      });
    }
  } catch (error) {
    console.error("Assistant error:", error);
    return res.status(500).json({
      type: 'error',
      response: "Sorry, something went wrong. Please try again."
    });
  }
}