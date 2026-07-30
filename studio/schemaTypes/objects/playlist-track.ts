import {defineField, defineType} from 'sanity'
import {PlayIcon} from '@sanity/icons/Play'

const TRACK_ID = /(?:open\.spotify\.com\/(?:intl-[a-z-]+\/)?track\/|spotify:track:)([a-zA-Z0-9]{22})|^([a-zA-Z0-9]{22})$/

export const playlistTrack = defineType({
  name: 'playlistTrack',
  title: 'Track',
  type: 'object',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'spotifyUrl',
      title: 'Spotify link',
      type: 'string',
      description:
        'Open the song in Spotify, hit Share, then Copy Song Link and paste it here. The title and cover art are filled in automatically.',
      validation: (rule) =>
        rule.required().custom((value) => {
          if (typeof value !== 'string' || !TRACK_ID.test(value.trim())) {
            return 'That does not look like a Spotify song link.'
          }
          return true
        }),
    }),
    defineField({
      name: 'artist',
      title: 'Artist',
      type: 'string',
      description: 'Spotify does not hand this over automatically, so type it in yourself.',
    }),
    defineField({
      name: 'title',
      title: 'Song title override',
      type: 'string',
      description: 'Optional. Leave empty to use the title from Spotify.',
    }),
  ],
  preview: {
    select: {title: 'title', artist: 'artist', url: 'spotifyUrl'},
    prepare({title, artist, url}) {
      return {
        title: title || 'From Spotify',
        subtitle: artist || url,
      }
    },
  },
})
