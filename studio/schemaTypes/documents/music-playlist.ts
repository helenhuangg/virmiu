import {defineArrayMember, defineField, defineType} from 'sanity'
import {PlayIcon} from '@sanity/icons/Play'

export const musicPlaylist = defineType({
  name: 'musicPlaylist',
  title: 'Music player',
  type: 'document',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'tracks',
      title: 'Tracks',
      type: 'array',
      description: 'Played in this order. Drag to reorder.',
      of: [defineArrayMember({type: 'playlistTrack'})],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: 'playlistId',
      title: 'Spotify playlist ID',
      type: 'string',
      description:
        'Only used as a fallback if the track list above is empty. This is the code at the end of a playlist link.',
    }),
  ],
  preview: {
    select: {tracks: 'tracks'},
    prepare({tracks}) {
      const count = Array.isArray(tracks) ? tracks.length : 0
      return {title: 'Music player', subtitle: `${count} track${count === 1 ? '' : 's'}`}
    },
  },
})
