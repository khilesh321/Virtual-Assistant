import jwt from 'jsonwebtoken';

const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if(!token) return res.status(401).json({message: 'Unauthorized: No token'})
    const decoded = await jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.id;  // Changed from decoded to decoded.id
    next()  
  } catch (err) {
    console.log(err);
    return res.status(401).json({message: 'Unauthorized: Invalid token'})
  }
}

export default isAuth;