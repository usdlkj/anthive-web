import Login from "@/components/Login";

export default function LoginPage() {
  const expiresIn = process.env.JWT_EXPIRE ? Number.parseFloat(process.env.JWT_EXPIRE) : 1/24;
  return (
    <Login expiresIn={expiresIn} />
  )
}