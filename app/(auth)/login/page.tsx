import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GoogleLoginButton } from '@/components/google-login-button'
import { EmailLoginForm } from '@/components/email-login-form'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">ログイン</CardTitle>
          <CardDescription>メールアドレスとパスワードを入力してください</CardDescription>
        </CardHeader>
        <CardContent>
          <GoogleLoginButton />
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">または</span>
            </div>
          </div>
          <EmailLoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
