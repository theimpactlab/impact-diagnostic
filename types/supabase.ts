export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          organization_name: string
          owner_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          organization_name: string
          owner_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          organization_name?: string
          owner_id?: string
        }
      }
      project_collaborators: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
      }
      assessments: {
        Row: {
          id: string
          project_id: string
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          project_id: string
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          project_id?: string
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      assessment_scores: {
        Row: {
          id: string
          assessment_id: string
          domain: string
          question_id: string
          score: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          domain: string
          question_id: string
          score: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          domain?: string
          question_id?: string
          score?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          email: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          email?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          email?: string | null
        }
      }
    }
  }
}
