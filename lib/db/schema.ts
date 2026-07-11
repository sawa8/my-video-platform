import { sql } from 'drizzle-orm'
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = sqliteTable('users', {
  id:            text('id').primaryKey(),
  name:          text('name').notNull(),
  email:         text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  image:         text('image'),
  role:          text('role', { enum: ['admin', 'user'] })
                   .notNull()
                   .default('user'),
  createdAt:     integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt:     integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// ─── BetterAuth adapter tables ────────────────────────────────────────────────
export const sessions = sqliteTable('sessions', {
  id:          text('id').primaryKey(),
  expiresAt:   integer('expires_at', { mode: 'timestamp' }).notNull(),
  token:       text('token').notNull().unique(),
  createdAt:   integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt:   integer('updated_at', { mode: 'timestamp' }).notNull(),
  ipAddress:   text('ip_address'),
  userAgent:   text('user_agent'),
  userId:      text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
})

export const accounts = sqliteTable('accounts', {
  id:                     text('id').primaryKey(),
  accountId:              text('account_id').notNull(),
  providerId:             text('provider_id').notNull(),
  userId:                 text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accessToken:            text('access_token'),
  refreshToken:           text('refresh_token'),
  idToken:                text('id_token'),
  accessTokenExpiresAt:   integer('access_token_expires_at', { mode: 'timestamp' }),
  refreshTokenExpiresAt:  integer('refresh_token_expires_at', { mode: 'timestamp' }),
  scope:                  text('scope'),
  password:               text('password'),
  createdAt:              integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt:              integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const verifications = sqliteTable('verifications', {
  id:         text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value:      text('value').notNull(),
  expiresAt:  integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt:  integer('created_at', { mode: 'timestamp' }),
  updatedAt:  integer('updated_at', { mode: 'timestamp' }),
})

// ─── Courses ──────────────────────────────────────────────────────────────────
export const courses = sqliteTable('courses', {
  id:           text('id').primaryKey(),
  title:        text('title').notNull(),
  description:  text('description').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  published:    integer('published', { mode: 'boolean' }).notNull().default(false),
  sortOrder:    integer('sort_order').notNull().default(0),
  createdAt:    integer('created_at', { mode: 'timestamp' })
                  .notNull()
                  .default(sql`(unixepoch())`),
  updatedAt:    integer('updated_at', { mode: 'timestamp' })
                  .notNull()
                  .default(sql`(unixepoch())`),
})

// ─── Sections ─────────────────────────────────────────────────────────────────
export const sections = sqliteTable('sections', {
  id:        text('id').primaryKey(),
  courseId:  text('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  title:     text('title').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' })
               .notNull()
               .default(sql`(unixepoch())`),
})

// ─── Lessons ──────────────────────────────────────────────────────────────────
export const lessons = sqliteTable('lessons', {
  id:          text('id').primaryKey(),
  sectionId:   text('section_id').notNull().references(() => sections.id, { onDelete: 'cascade' }),
  title:       text('title').notNull(),
  description: text('description'),
  youtubeUrl:  text('youtube_url').notNull(),
  sortOrder:   integer('sort_order').notNull().default(0),
  createdAt:   integer('created_at', { mode: 'timestamp' })
                 .notNull()
                 .default(sql`(unixepoch())`),
})

// ─── Progress ─────────────────────────────────────────────────────────────────
export const progress = sqliteTable(
  'progress',
  {
    id:          text('id').primaryKey(),
    userId:      text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    lessonId:    text('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
    completedAt: integer('completed_at', { mode: 'timestamp' })
                   .notNull()
                   .default(sql`(unixepoch())`),
  },
  (t) => [uniqueIndex('progress_user_lesson_idx').on(t.userId, t.lessonId)],
)
