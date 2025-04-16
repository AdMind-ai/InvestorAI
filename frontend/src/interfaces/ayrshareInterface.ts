import { Dispatch, SetStateAction } from 'react'
import PostInterface from './postInterface'
import ProfileInterface from './profileInterface'


type PostPageType = 'assistant' | 'publish'
type PublishPostType = (kind?: "publish" | "schedule") => Promise<void>
type EditPostType = (postId: number, kind?: "publish" | "schedule") => Promise<void>
type DeletePostType = (postId: number) => Promise<void>

interface AyrshareInterface {
  
  
  
  social: {
    value: string[]
    set: Dispatch<SetStateAction<string[]>>
  }
  posts: {
    value: PostInterface[] | []
    set: Dispatch<SetStateAction<PostInterface[]>>
  }
  postText: {
    value: string
    set: Dispatch<SetStateAction<string>>
  }
  postPublishText: {
    value: string
    set: Dispatch<SetStateAction<string>>
  }
  postPage: {
    value: string
    set: Dispatch<SetStateAction<PostPageType>>
  },

  
  urlPostsPrevious: {
    value: string | null
    set: Dispatch<SetStateAction<string>>
  }
  urlPostsNext: {
    value: string | null
    set: Dispatch<SetStateAction<string>>
  }
  
  postPublishSchedule: {
    value: Date | null
    set: Dispatch<SetStateAction<string>>
  }
  postPublishImage: {
    value: File | null
    set: Dispatch<SetStateAction<string>>
  },
  postFiles: {
    value: File[] | null
    set: Dispatch<SetStateAction<File[]>>
  },
  countPosts: {
    value: number | null
    set: Dispatch<SetStateAction<boolean>>
  }
  profile: {
    value: ProfileInterface | null
    set: () => Promise<void>
  }
  profileUrl: {
    value: string
    set: () => Promise<void>
  }
  createLinkedlnPost: {
    value: boolean
    set: Dispatch<SetStateAction<string>>
  }
  deletePost: {
    value: boolean
    set: DeletePostType
  }
  editPost: {
    value: boolean
    set: EditPostType
  }
  publishPost: {
    value: boolean
    set: PublishPostType
  }
  aiSubmit: {
    value: boolean
    set: Dispatch<SetStateAction<boolean>>
  }
  submit: {
    value: boolean
    set: Dispatch<SetStateAction<boolean>>
  }
}

export default AyrshareInterface
