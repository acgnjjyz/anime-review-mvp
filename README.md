# AniMemo MVP

Next.js + TypeScript + Tailwind CSS + Prisma + PostgreSQL + Supabase Auth で作る、アニメレビューサイトのMVPです。

## 主な機能

- トップページ
- アニメ一覧、検索、絞り込み、ページネーション
- アニメ詳細
- ユーザー登録、ログイン、ログアウト
- レビュー投稿、編集、削除
- コメント投稿、編集、削除
- レビューいいね、通報
- コメント通報
- 平均点ランキング
- お気に入り
- マイページ
- 管理画面
- 作品CRUD、公開/非公開
- 管理者によるレビュー/コメント削除
- ModerationLog、Report、UserRoleChangeLog

## 技術構成

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Supabase Auth

## セットアップ

依存関係をインストールします。

```bash
npm.cmd install
```

`.env` がない場合は `.env.example` をコピーします。

```powershell
Copy-Item .env.example .env
```

`.env` はGit管理しません。秘密情報をREADMEやコードに直書きしないでください。

## Supabase Dashboardで確認する場所

### Project URL

1. Supabase Dashboardで対象プロジェクトを開く
2. `Project Settings` を開く
3. `API` を開く
4. `Project URL` を `.env` の `NEXT_PUBLIC_SUPABASE_URL` に設定する

例:

```env
NEXT_PUBLIC_SUPABASE_URL="https://xxxxxxxxxxxx.supabase.co"
```

### anon key / publishable key

1. `Project Settings > API` を開く
2. `Project API keys` を見る
3. `anon public` または `publishable` key を `.env` の `NEXT_PUBLIC_SUPABASE_ANON_KEY` に設定する

注意:

- `service_role` key は使いません
- `service_role` key を `NEXT_PUBLIC_` 変数に入れないでください

### Database connection string

1. `Project Settings > Database` を開く
2. `ORMs` または `Connection string` を開く
3. Prisma向けURLをCopyボタンでコピーする
4. `DATABASE_URL` には `pooler.supabase.com:6543` のURLを設定する
5. `DIRECT_URL` には `pooler.supabase.com:5432` のURLを設定する
6. `[YOUR-PASSWORD]` をDatabase passwordに置き換える

例:

```env
DATABASE_URL="postgresql://postgres.xxxxx:your_password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxxx:your_password@aws-0-region.pooler.supabase.com:5432/postgres"
```

`aws-...pooler.supabase.com` のように `...` が入った省略URLは使えません。必ずSupabase DashboardのCopyボタンで完全なURLをコピーしてください。

### Database password

Database passwordはSupabaseプロジェクト作成時に設定したDBパスワードです。

分からない場合:

1. `Project Settings > Database` を開く
2. `Database password` または `Reset database password` を探す
3. 必要なら新しいパスワードに変更する
4. connection stringの `[YOUR-PASSWORD]` を置き換える

パスワードに `@`、`#`、`%`、`/`、`?`、`&`、`:` などが入る場合はURLエンコードが必要です。迷う場合は英数字だけのパスワードに変更すると接続確認が楽です。

### Authentication Site URL

1. Supabase Dashboardの `Authentication` を開く
2. `URL Configuration` を開く
3. `Site URL` にローカル開発URLを設定する

```text
http://localhost:3000
```

### Redirect URLs

`Authentication > URL Configuration > Redirect URLs` に以下を追加します。

```text
http://localhost:3000/auth/callback
http://localhost:3000/**
```

別ポートで開発する場合は、そのポートも追加してください。

例:

```text
http://localhost:3001/auth/callback
http://localhost:3001/**
```

## .env に入れる値

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
DATABASE_URL="postgresql://postgres.your-project-ref:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.your-project-ref:password@aws-0-region.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
ADMIN_EMAILS="admin@example.com"
```

## 起動手順

Supabaseの値を `.env` に入れたら、次の順番で進めます。

```bash
npm.cmd run env:check
npm.cmd run db:push
npm.cmd run db:seed
npm.cmd run dev
```

`env:check` がOKにならない場合は、`db:push` へ進まないでください。

## 初期データ

`npm.cmd run db:seed` で以下が入ります。

- アニメ作品
- ダミーユーザー
- レビュー
- Rating
- Comment
- Favorite

seedのダミーユーザーはレビュー表示用です。Supabase Authのログインユーザーではありません。

## Supabase AuthユーザーとDB Userの同期仕様

このMVPでは、Supabase Authでログインしたユーザーをアプリ側の `User` テーブルへ自動同期します。

- Supabase Authの `user.id` はUUID文字列です
- Prismaの `User.id` は `String @db.Uuid` です
- ログイン済みユーザーがレビュー、コメント、お気に入り、マイページ、管理画面を使う前にDB Userを確認します
- DBにUserがない場合は、Supabase Authの `user.id` と `email` から自動作成します
- `Review.userId`、`Rating.userId`、`Favorite.userId`、`Comment.userId` はDBの `User.id` に紐づきます
- `User.role` が `ADMIN` のユーザーだけ管理画面へ入れます
- `ADMIN_EMAILS` は初期昇格用です。運用中の管理者判定はDBの `User.role` を優先します
- `service_role` key は使いません

## よく使うコマンド

```bash
npm.cmd run env:check
npm.cmd run typecheck
npm.cmd run build
npm.cmd run db:generate
npm.cmd run db:push
npm.cmd run db:seed
npm.cmd run dev
```

## P1001が出る場合

`P1001 Can't reach database server` は、PrismaがSupabase PostgreSQLへ接続できない状態です。

確認してください。

1. SupabaseプロジェクトがPausedになっていないか
2. `.env` のホスト名に `...` が入っていないか
3. `DATABASE_URL` が `pooler.supabase.com:6543` になっているか
4. `DIRECT_URL` が `pooler.supabase.com:5432` になっているか
5. `[YOUR-PASSWORD]` が残っていないか
6. DBパスワードに記号がある場合、URLエンコードするか英数字だけのパスワードに変更する

## 公開前チェックリスト

本番公開前に、最低限以下を確認してください。

- 重要: ローカル検証やチャットで一度でも使ったSupabaseのDB passwordは、本番公開前に必ず変更する
- DB password変更後、`DATABASE_URL` と `DIRECT_URL` を新しい接続文字列で作り直す
- `.env` をGitに含めない。`.gitignore` に `.env` / `.env.local` / `.env.*.local` が含まれていることを確認する
- `DATABASE_URL` / `DIRECT_URL` / Supabase key / DB password をGitHubにpushしない
- `service_role` key は使わない。ブラウザに出る `NEXT_PUBLIC_` 変数にも絶対に入れない
- Vercelに必要な環境変数をすべて設定する
- Supabase Authentication の Site URL と Redirect URLs に本番URLを追加する
- `npm.cmd run env` または `npm.cmd run env:check` を実行して必須環境変数を確認する
- `npm.cmd run build` を実行して本番ビルドが通ることを確認する
- 管理者にしたいユーザーの `User.role` が `ADMIN` になっていることを確認する
- `ADMIN_EMAILS` は初期昇格用としてだけ使い、運用中の権限管理はDBの `User.role` を優先する
- 管理画面で未対応通報、削除ログ、role変更履歴を確認してから公開する

## Vercelに設定する環境変数

Vercelの Project Settings > Environment Variables に、以下をProduction環境へ設定してください。値は `.env` からコピーしてよいですが、公開前にDB passwordを変更した後の値を使ってください。

```env
DATABASE_URL="postgresql://postgres.your-project-ref:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.your-project-ref:password@aws-0-region.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
NEXT_PUBLIC_SITE_URL="https://your-vercel-project.vercel.app"
ADMIN_EMAILS="admin@example.com"
```

- `DATABASE_URL`: Prismaの通常接続用。Supabase Poolerの `:6543` を使う
- `DIRECT_URL`: Prismaのschema反映用。Supabase Poolerの `:5432` を使う
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabaseのanon public / publishable key。`service_role` keyは入れない
- `NEXT_PUBLIC_SITE_URL`: 本番URL。例: `https://your-vercel-project.vercel.app`
- `ADMIN_EMAILS`: 初回ログイン時にADMINへ昇格したいメールアドレス。複数ある場合はカンマ区切り

`NEXT_PUBLIC_SITE_URL` はローカルでは `http://localhost:3000`、本番ではVercelの公開URLに変更します。ログイン/登録のリダイレクトURLを作るための値なので、Vercelに設定した後は再デプロイしてください。Vercelの環境変数変更は過去のデプロイには反映されないため、変更後は必ず新しいデプロイを作成します。

## Supabase Auth Redirect URL設定

Supabase Dashboard > Authentication > URL Configuration を開きます。

ローカル開発を続ける場合は、以下を残します。

```text
Site URL:
http://localhost:3000

Redirect URLs:
http://localhost:3000/auth/callback
http://localhost:3000/**
```

Vercel本番公開後は、本番URLも追加します。

```text
Redirect URLs:
https://your-vercel-project.vercel.app/auth/callback
https://your-vercel-project.vercel.app/**
```

本番運用を始める場合、Site URL は本番URLに変更してください。ローカル開発も継続する場合は、Redirect URLsに `localhost` とVercel本番URLの両方を登録しておきます。本番では最低限、正確な `/auth/callback` URLを登録してください。独自ドメインを使う場合は、Vercelの初期ドメインとは別に独自ドメインの `/auth/callback` も追加します。

## PrismaとVercel build

`package.json` では `postinstall` に `prisma generate` を設定しています。Vercelの依存関係インストール後にPrisma Clientが生成されるため、通常は追加設定なしで `next build` が動きます。

VercelのBuild Commandは基本的に以下でOKです。

```bash
npm run build
```

DB schemaを本番DBへ反映する操作は、Vercelのビルド中ではなく、公開前にローカルから実行してください。

```bash
npm.cmd run env:check
npm.cmd run db:push
npm.cmd run db:seed
npm.cmd run build
```

## GitHub / Vercel 公開手順

1. `.env` がGit対象外であることを確認する
2. 秘密情報が含まれていないことを確認する
3. GitHubへpushする
4. Vercelで `Add New... > Project` からGitHubリポジトリをImportする
5. Framework Preset が Next.js になっていることを確認する
6. Environment Variables に上記6項目を設定する
7. Deployする
8. Vercelの本番URLを確認する
9. Supabase AuthのRedirect URLsに本番URLを追加する
10. `NEXT_PUBLIC_SITE_URL` を本番URLにして再デプロイする

## 本番動作確認チェックリスト

デプロイ後に、以下を本番URLで確認してください。

- トップページが表示される
- 作品一覧が表示される
- Supabase Authでログインできる
- レビュー投稿/編集/削除ができる
- コメント投稿/編集/削除ができる
- レビューいいね/解除ができる
- レビュー/コメント通報ができる
- 管理画面へADMINだけ入れる
- 管理画面で作品追加/編集ができる
- 非公開作品が一般画面に出ない
- 通報一覧、ModerationLog、RoleChangeLogが見られる
- ModerationLogのCSV出力ができる
