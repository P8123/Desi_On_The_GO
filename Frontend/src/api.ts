const API_BASE_URL = "http://127.0.0.1:8000"
// const API_BASE_URL = "https://hatless-briskness-diffuser.ngrok-free.dev"

interface BackendUser {
  id: string
  full_name: string
  email: string
  profile_photo_url: string | null
  mother_tongue: string
  current_city: string | null
  cities_lived: string[]
}

interface BackendComment {
  id: string
  text: string
  author?: string
  author_name?: string
  author_user?: BackendUser
}

interface BackendPost {
  id: string
  restaurant_name?: string
  restaurantName?: string
  description: string
  keywords?: string[]
  map_link?: string | null
  mapLink?: string | null
  photos?: string[]
  likes?: number
  likes_count?: number
  liked?: boolean
  is_liked?: boolean
  comments?: BackendComment[]
  author?: BackendUser
  author_name?: string
  authorName?: string
  author_photo?: string | null
  authorPhoto?: string | null
  mother_tongue?: string
  motherTongue?: string
  state?: string
  city?: string
}

interface BackendLoginResponse {
  access_token: string
  token_type: string
  user: BackendUser
}

export interface SignupInput {
  full_name: string
  email: string
  password: string
  current_city: string
  cities_lived: string[]
  mother_tongue: string
}

export interface CreatePostInput {
  restaurant_name: string
  state: string
  city: string
  description: string
  keywords: string[]
  map_link: string
  photos: string[]
}

export interface ApiUser {
  id: string
  name: string
  email: string
  photo: string | null
  motherTongue: string
  currentCity: string
  citiesLived: string[]
}

export interface ApiPost {
  id: string
  restaurantName: string
  description: string
  keywords: string[]
  mapLink: string
  photos: string[]
  likes: number
  liked: boolean
  comments: { id: string; text: string; author: string }[]
  authorName: string
  authorPhoto: string | null
  motherTongue?: string
  state?: string
  city?: string
}

function getToken() {
  return localStorage.getItem("access_token")
}

// async function request<T>(
//   path: string,
//   options: RequestInit = {},
// ): Promise<T> {
//   const headers = new Headers(options.headers)
//   const token = getToken()

//   if (token) headers.set("Authorization", `Bearer ${token}`)
//   if (options.body && !headers.has("Content-Type")) {
//     headers.set("Content-Type", "application/json")
//   }

//   const response = await fetch(`${API_BASE_URL}${path}`, {
//     ...options,
//     headers,
//   })

//   if (!response.ok) {
//     const body = await response.json().catch(() => null)
//     const detail = Array.isArray(body?.detail)
//       ? body.detail
//           .map((item: { msg?: string }) => item.msg)
//           .filter(Boolean)
//           .join(", ")
//       : body?.detail
//     throw new Error(
//       detail ??
//         body?.message ??
//         `Request failed with status ${response.status}`,
//     )
//   }

//   if (response.status === 204) return undefined as T
//   return response.json() as Promise<T>
// }


async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  const token = getToken()

  // Skip the ngrok browser-warning page
  // headers.set("ngrok-skip-browser-warning", "true")

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const detail = Array.isArray(body?.detail)
      ? body.detail
          .map((item: { msg?: string }) => item.msg)
          .filter(Boolean)
          .join(", ")
      : body?.detail

    throw new Error(
      detail ??
        body?.message ??
        `Request failed with status ${response.status}`,
    )
  }

  if (response.status === 204) return undefined as T

  return response.json() as Promise<T>
}


function mapUser(user: BackendUser): ApiUser {
  return {
    id: user.id,
    name: user.full_name,
    email: user.email,
    photo: user.profile_photo_url,
    motherTongue: user.mother_tongue,
    currentCity: user.current_city ?? "",
    citiesLived: user.cities_lived ?? [],
  }
}

function mapPost(post: BackendPost): ApiPost {
  const author = post.author

  return {
    id: post.id,
    restaurantName: post.restaurant_name ?? post.restaurantName ?? "",
    description: post.description,
    keywords: post.keywords ?? [],
    mapLink: post.map_link ?? post.mapLink ?? "",
    photos: post.photos ?? [],
    likes: post.likes_count ?? post.likes ?? 0,
    liked: post.is_liked ?? post.liked ?? false,
    comments: (post.comments ?? []).map((comment) => ({
      id: comment.id,
      text: comment.text,
      author:
        comment.author ??
        comment.author_name ??
        comment.author_user?.full_name ??
        "Anonymous",
    })),
    authorName:
      author?.full_name ?? post.author_name ?? post.authorName ?? "Anonymous",
    authorPhoto:
      author?.profile_photo_url ??
      post.author_photo ??
      post.authorPhoto ??
      null,
    motherTongue:
      author?.mother_tongue ?? post.mother_tongue ?? post.motherTongue,
    state: post.state,
    city: post.city,
  }
}

export async function login(email: string, password: string) {
  const form = new URLSearchParams()
  form.set("username", email)
  form.set("password", password)

  const result = await request<BackendLoginResponse>("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  })

  localStorage.setItem("access_token", result.access_token)
  return mapUser(result.user)
}

export async function signup(data: SignupInput) {
  const result = await request<BackendLoginResponse | BackendUser>(
    "/api/auth/signup",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  )

  if ("access_token" in result) {
    localStorage.setItem("access_token", result.access_token)
    return mapUser(result.user)
  }

  return login(data.email, data.password)
}

export async function getPosts() {
  const result = await request<BackendPost[] | { posts: BackendPost[] }>(
    "/api/posts",
  )
  const posts = Array.isArray(result) ? result : result.posts
  return posts.map(mapPost)
}

export async function createPost(data: CreatePostInput) {
  const result = await request<BackendPost>("/api/posts", {
    method: "POST",
    body: JSON.stringify(data),
  })
  return mapPost(result)
}

export async function likePost(postId: string) {
  return request<void>(`/api/posts/${postId}/like`, {
    method: "POST",
  })
}

export async function unlikePost(postId: string) {
  return request<void>(`/api/posts/${postId}/like`, {
    method: "DELETE",
  })
}

export async function createComment(postId: string, text: string) {
  return request<BackendComment>(`/api/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ text }),
  })
}

export function logout() {
  localStorage.removeItem("access_token")
}
