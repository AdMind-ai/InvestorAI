import { useEffect, useState } from 'react'
import AyrshareInterface from '../interfaces/ayrshareInterface'
import {
  getProfileKey,
  getProfilePosts,
  getProfiles,
  postProfiles,
} from '../api/ayrshare'
import { fetchWithAuth } from '../api/fetchWithAuth'
import formatDate from '../utils/formatDate'
import { toast } from 'react-toastify'
import PostInterface from '../interfaces/postInterface'
import ProfileInterface from '../interfaces/profileInterface'
import { Dayjs } from 'dayjs'

type PostPage = 'assistant' | 'publish'


const useAyrshareStates = (): AyrshareInterface => {
  let  loading = false
  const [submit, setSubmit] = useState<boolean>(true)
  const [aiSubmit, setAISubmit] = useState<boolean>(false)

  const [profile, setProfile] = useState<ProfileInterface | null>(null)
  const [posts, setPosts] = useState<PostInterface[]>([])
  const [profileUrl, setProfileUrl] = useState<string>('')
  const [social, setSocial] = useState<string[]>([])
  const [postText, setPostText] = useState<string>('')
  const [postPublishText, setPostPublishText] = useState<string>('')
  const [postPublishImage, setPostPublishImage] = useState<File | null>(null)
  const [postPublishSchedule, setPostPublishSchedule] = useState<Dayjs | null>(
    null
  )
  const [postFiles, setPostFiles] = useState<File[]>([])
  const [postPage, setPostPage] = useState<PostPage>('assistant')
  const [urlPostsNext, setUrlPostsNext] = useState<string | null>(null)
  const [urlPostsPrevious, setUrlPostsPrevious] = useState<string | null>(null)
  const [countPosts, setCountPosts] = useState<number>(0)

  // Fetch posts if we already have a profile and platforms
  useEffect(() => {
    if (social.length > 0 && profile !== null) {
      getPosts()
    }
  }, [profile, social]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch profile URL after picking up a profile
  useEffect(() => {
    if (profile !== null) {
      getProfileUrl()
    }
  }, [profile]) // eslint-disable-line react-hooks/exhaustive-deps

  // Load or create a profile
  const getProfile = async () => {
    if (loading) return
    loading = true
    setSubmit(true)

    try {
      const response = await getProfiles()
      if (response.type === 'success') {
        if (response.data.length > 0) {
            setProfile(response.data[0])
        } else {
          await createProfile()
        }
      } else {
        console.error('Error fetching profile:', response.data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  // Create a new profile
  const createProfile = async () => {
    try {
      const response = await postProfiles()
      if (response.type === 'success') {
        setProfile(response.data)
      } else {
        console.error('Error submitting profile:', response.data)
      }
    } catch (error) {
      console.error('Error creating profile:', error)
    }
  }

  // Retrieve posts (with or without pagination URLs)
  const getPosts = async (url: string = '') => {
    if (loading || profile === null) return
    loading = true
    setSubmit(true)

    let fetchUrl = `/ayrshare/profiles/${profile.id}/posts/`
    if (url) {
      fetchUrl = url
    }

    try {
      const result = await getProfilePosts(fetchUrl)
      if (result.type === 'success') {
        setCountPosts(result.data.count)
        setPosts(result.data.results)
        setUrlPostsNext(result.data.next)
        setUrlPostsPrevious(result.data.previous)
      } else {
        console.error('Error fetching profile:', result.data)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
        loading = false
      setSubmit(false)
    }
  }

  // Get the profile URL and social data
  const getProfileUrl = async () => {
    if (profile?.id && profile.id > 0) {
      try {
        const result = await getProfileKey(profile.id)
        if (result.type === 'success') {
          setProfileUrl(result.data.url)
          if (result.data.social) {
            setSocial(result.data.social)
          }
        } else {
          console.error('Error fetching profile:', result.data)
        }
      } catch (error) {
        console.error('Error fetching profile URL:', error)
      } finally {
        loading = false
        setSubmit(false)
      }
    }
  }

  // Generate text from AI for a Social Media post or from a provided file
  const createLinkedInPost = async () => {
    if (submit) return

    if (postText !== '') {
      await handleAIRequestFromText()
    } else if (postFiles.length > 0) {
      await handleAIRequestFromFile()
    }
  }

  const handleAIRequestFromText = async () => {
    try {
      setAISubmit(true)
      setPostPage('publish')

      const response = await fetchWithAuth('/openai/assistant/send-message/', {
        method: 'POST',
        body: JSON.stringify({ text: postText }),
      })

      if (!response.ok || !response.body) {
        console.log('Erro ao conectar.', 'ai')
        setPostPage('assistant')
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        setPostPublishText(fullText)
      }

      toast.success('Testo generato con successo!')
      setPostText('')
    } catch (error) {
      console.error('Erro ao conectar:', error)
    } finally {
      setAISubmit(false)
    }
  }

  const handleAIRequestFromFile = async () => {
    try {
      setAISubmit(true)
      setPostPage('publish')

      const formData = new FormData()
      formData.append('file', postFiles[0])

      const response = await fetchWithAuth('/openai/assistant/send-message/', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok || !response.body) {
        console.log('Erro ao conectar.', 'ai')
        setPostPage('assistant')
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        setPostPublishText(fullText)
      }

      toast.success('Testo generato con successo!')
      setPostFiles([])
    } catch (error) {
      console.error('Erro ao conectar:', error)
    } finally {
      setAISubmit(false)
    }
  }

  // Publish or schedule post
  const publishPost = async (kind: 'publish' | 'schedule' = 'publish') => {
    if (submit) return

    if (kind === 'schedule') {
      // Validate schedule date
      if (!postPublishSchedule || new Date(postPublishSchedule.toISOString()) <= new Date()) {
        toast.error('Data non valida per programmare la pubblicazione')
        return
      }
    }

    if (!postPublishText) return

    try {
      setSubmit(true)

      const formData = new FormData()
      if (postPublishImage) {
        formData.append('file', postPublishImage)
      }
      formData.append('post', postPublishText)
      formData.append('platform', 'linkedin')
      formData.append('date', formatDate(new Date()))

      if (kind === 'schedule' && postPublishSchedule) {
        formData.append('schedule', formatDate(new Date(postPublishSchedule.toISOString())))
      } else {
        // Immediate publish
        formData.append('schedule', formatDate(new Date()))
      }

      const response = await fetchWithAuth(
        `/ayrshare/profiles/${profile?.id}/posts/`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        console.log('Erro ao conectar.', 'ai')
        return
      }

      setPostPublishText('')
      setPostPublishSchedule(null)
      setPostPage('assistant')
      getPosts()
      toast.success('Post pubblicato con successo!')
    } catch (error) {
      console.error('Erro ao conectar:', error)
    } finally {
      setSubmit(false)
    }
  }

  // Delete a post
  const deletePost = async (postId: number | null) => {
    if (submit || postId === null) return

    try {
      setSubmit(true)
      const response = await fetchWithAuth(
        `/ayrshare/profiles/${profile?.id}/posts/${postId}/`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        console.log('Erro ao connettere.', 'ai')
        return
      }

      getPosts()
    } catch (error) {
      console.error('Erro ao connettere:', error)
    } finally {
      setSubmit(false)
    }
  }

  // Edit a post (again, either publish or schedule)
  const editPost = async (
    postId: number,
    kind: 'publish' | 'schedule' = 'publish'
  ) => {
    if (submit) return

    if (kind === 'schedule') {
      if (!postPublishSchedule || new Date(postPublishSchedule.toISOString()) <= new Date()) {
        toast.error('Data non valida per programmare la pubblicazione')
        return
      }
    }

    if (!postPublishText) return

    try {
      setSubmit(true)

      const formData = new FormData()
      if (postPublishImage) {
        formData.append('file', postPublishImage)
      }
      formData.append('post', postPublishText)
      formData.append('platform', 'linkedin')
      formData.append('date', formatDate(new Date()))

      if (kind === 'schedule' && postPublishSchedule) {
        formData.append('schedule', formatDate(new Date(postPublishSchedule.toISOString())))
      } else {
        formData.append('schedule', formatDate(new Date()))
      }

      const response = await fetchWithAuth(
        `/ayrshare/profiles/${profile?.id}/posts/${postId}/`,
        {
          method: 'PUT',
          body: formData,
        }
      )

      if (!response.ok) {
        console.log('Erro ao connettere.', 'ai')
        return
      }

      setPostPublishText('')
      setPostPublishSchedule(null)
      setPostPage('assistant')
      getPosts()
      toast.success('Post modificato con successo!')
    } catch (error) {
      console.error('Erro ao connettere:', error)
    } finally {
      setSubmit(false)
    }
  }

  return {
    profile: {
      value: profile,
      set: getProfile,
    },
    profileUrl: {
      value: profileUrl,
      set: getProfileUrl,
    },
    social: {
      value: social,
      set: () => 'function not implemented', // Or remove if not necessary
    },
    posts: {
      value: posts,
      set: () => 'function not implemented',
    },
    
    postText: {
      value: postText,
      set: setPostText,
    },
    postFiles: {
      value: postFiles,
      set: setPostFiles,
    },
    createLinkedlnPost: {
      value: submit,
      set: createLinkedInPost,
    },
    postPage: {
      value: postPage,
      set: setPostPage,
    },
    postPublishText: {
      value: postPublishText,
      set: setPostPublishText,
    },
    postPublishImage: {
      value: postPublishImage,
      set: setPostPublishImage,
    },
    postPublishSchedule: {
      value: postPublishSchedule,
      set: setPostPublishSchedule,
    },
    
    countPosts: {
        value: countPosts,
        set: () => 'function not implemented',
      },
    urlPostsNext: {
      value: urlPostsNext,
      set: () => getPosts(urlPostsNext ?? ''), // fallback to "" if null
    },
    urlPostsPrevious: {
      value: urlPostsPrevious,
      set: () => getPosts(urlPostsPrevious ?? ''),
    },
    publishPost: {
      value: submit,
      set: publishPost,
    },
    editPost: {
      value: submit,
      set: editPost,
    },
    deletePost: {
      value: submit,
      set: deletePost,
    },
    aiSubmit: {
        value: aiSubmit,
        set: () => 'function not implemented',
      },
    submit: {
      value: submit,
      set: () => 'function not implemented',
    },
  }
}

export default useAyrshareStates
