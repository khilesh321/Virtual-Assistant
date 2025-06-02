import genToken from "../config/token.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signUp = async (req, res) => {
  try {
    const {name, email, password} = req.body;

    const existEmail = await User.findOne({email});

    if(existEmail) return res.status(400).json({message: "Email already exists!"});
    if(password.length < 6) return res.status(400).json({message: "Password must be atleast 6 chars"});

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({name, password:hashedPassword, email});

    const token = await genToken(user._id);
    res.cookie("token",token, {
      httpOnly:true,
      maxAge: 7*24*60*60*1000,
      sameSite: "strict",
      secure: false
    })

    return res.status(201).json(user)

  } catch (e) {
    return res.status(500).json({message: `signup error ${e}`})
  }
}

export const logIn = async (req, res) => {
  try {
    const {email, password} = req.body;

    const user = await User.findOne({email});

    if(!user) return res.status(400).json({message: "Email doesn't exists!"});
    
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch) return res.status(400).json({message: "Incorrect Password!"});
    

    const token = await genToken(user._id);
    res.cookie("token",token, {
      httpOnly:true,
      maxAge: 7*24*60*60*1000,
      sameSite: "strict",
      secure: false
    })

    return res.status(200).json(user)

  } catch (e) {
    return res.status(500).json({message: `signup error ${e}`})
  }
}

export const logOut = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({message: "Logout Successfully"})
  } catch (e) {
    return res.status(500).json({message: `logout error : ${e}`})
  }
}