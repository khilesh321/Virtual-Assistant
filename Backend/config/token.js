import jwt from "jsonwebtoken";

async function genToken(userId) {
  try {
    const token = await jwt.sign({ id: userId }, process.env.JWT_SECRET, {expiresIn: "10d"})
    return token;
  } catch (e) {
    console.log(e);
  }
}

export default genToken;