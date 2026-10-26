import {defineField, defineType} from 'sanity'
import {ImageIcon} from '@sanity/icons/Image'

export const galleryCard = defineType({
  name: 'galleryCard',
  title: 'Card',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Image description',
          type: 'string',
          description: 'For screen readers, e.g. "pink twin-tail remesh, front view".',
          validation: (rule) => rule.required().warning('Helps people using screen readers.'),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Optional. On desktop it shows when hovering the card.',
    }),
  ],
  preview: {
    select: {caption: 'caption', media: 'image'},
    prepare({caption, media}) {
      return {title: caption || 'No caption', media}
    },
  },
})
