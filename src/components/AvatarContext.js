import { createContext } from 'react'

// Maps canonical name -> { color, icon }. Provided at the App level so every
// ProfileIcon renders the same, guaranteed-unique avatar for a given player.
export const AvatarContext = createContext({})
