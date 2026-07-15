import { GoogleLoginButton } from '@/components/google-login-button'
import { EmailLoginForm } from '@/components/email-login-form'
import { BookOpen, Play, Award } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* 左: ブランドパネル */}
      <div className="hidden hero-gradient lg:flex lg:w-[480px] xl:w-[540px] flex-col justify-between p-10 text-white">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">LearnHub</span>
          </div>
          <p className="text-sm text-white/60">動画講座プラットフォーム</p>
        </div>

        <div className="space-y-8">
          <h2 className="text-3xl font-bold leading-tight tracking-tight">
            スキルアップを、
            <br />
            もっと身近に。
          </h2>
          <div className="space-y-5">
            <div className="flex items-start gap-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10">
                <Play className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">動画で学ぶ</p>
                <p className="text-xs text-white/55 leading-relaxed mt-0.5">プロフェッショナルが作成した動画コンテンツで、効率的にスキルを習得</p>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">進捗を管理</p>
                <p className="text-xs text-white/55 leading-relaxed mt-0.5">学習の進捗を可視化して、モチベーションを維持しながら学習を継続</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-white/30">&copy; 2026 LearnHub. All rights reserved.</p>
      </div>

      {/* 右: ログインフォーム */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-background">
        {/* モバイルのみ: ブランドヘッダー */}
        <div className="mb-8 text-center lg:hidden">
          <div className="inline-flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold text-foreground">LearnHub</span>
          </div>
          <p className="text-xs text-muted-foreground">動画講座プラットフォーム</p>
        </div>

        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">ログイン</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">アカウントにログインして学習を始めましょう</p>
          </div>

          <GoogleLoginButton />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">または</span>
            </div>
          </div>

          <EmailLoginForm />
        </div>
      </div>
    </div>
  )
}
