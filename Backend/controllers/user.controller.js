import { response } from "express";
import uploadOnCloudinary from "../config/cloudinary.js";
import groqResponse from "../groq.js";
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
    if (!command?.trim()) {
      return res.status(400).json({
        type: 'error',
        response: "Please provide a command"
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        type: 'error',
        response: "User not found"
      });
    }

    // Save command to history
    user.history.push(command);
    await user.save();

    // Get response from Groq
    const result = await groqResponse(command, user.assistantName || 'Assistant', user.name);
    
    try {
      // Parse response
      const groqResult = JSON.parse(result);
      const {type, userInput} = groqResult;

      // Handle different command types
      switch(type) {
        case 'get_date':
          return res.json({
            type,
            userInput,
            response: `Current date is ${moment().format("YYYY-MM-DD")}`
          });

        case 'get_time':
          return res.json({
            type,
            userInput,
            response: `Current time is ${moment().format("hh:mm A")}`
          });

        case 'get_day':
          return res.json({
            type,
            userInput,
            response: `Today is ${moment().format("dddd")}`
          });

        case 'get_month':
          return res.json({
            type,
            userInput,
            response: `Current month is ${moment().format("MMMM")}`
          });

        case 'get_year':
          return res.json({
            type,
            userInput,
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
          return res.json(groqResult);

        default:
          return res.json({
            type: 'unknown',
            userInput,
            response: "I'm not sure how to handle that request. Could you please try something else?"
          });
      }

    } catch (parseError) {
      console.error("Parse error:", parseError);
      return res.status(400).json({
        type: 'error',
        userInput: command,
        response: "I couldn't understand that response"
      });
    }
  } catch (error) {
    console.error("Assistant error:", error);
    return res.status(500).json({
      type: 'error',
      userInput: command || '',
      response: "Sorry, something went wrong. Please try again."
    });
  }
}