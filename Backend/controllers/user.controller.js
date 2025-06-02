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
    await user.save();
    
    console.log('Processing command:', command);
    
    const result = await geminiResponse(command, user.assistantName, user.name);
    console.log('Gemini result:', result);

    try {
      // Always try to parse the result, whether it's a string or object
      const gemResult = typeof result === 'string' ? JSON.parse(result) : result;
      
      // Validate the response structure
      if (!gemResult || !gemResult.type || !gemResult.response) {
        throw new Error('Invalid response structure');
      }

      // Handle specific types
      switch(gemResult.type) {
        case 'get_date':
          return res.json({
            type: gemResult.type,
            userInput: gemResult.userInput,
            response: `Current date is ${moment().format("YYYY-MM-DD")}`
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
          return res.json(gemResult);
        
        default:
          return res.json({
            type: 'general',
            userInput: gemResult.userInput || command,
            response: gemResult.response || "I'm not sure how to handle that request. Could you try something else?"
          });
      }
    } catch (parseError) {
      console.error('Response parsing error:', parseError);
      return res.status(400).json({
        type: 'error',
        userInput: command,
        response: "I'm having trouble understanding the response. Please try again."
      });
    }
  } catch (error) {
    console.error('Assistant error:', error);
    return res.status(500).json({
      type: 'error',
      userInput: command,
      response: "Sorry, I encountered an error. Please try again in a moment."
    });
  }
}