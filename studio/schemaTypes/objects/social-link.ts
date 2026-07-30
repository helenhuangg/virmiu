import {defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons/Link'

export const socialLink = defineType({
  name: 'socialLink',
  title: 'Link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'The little tooltip that follows the cursor, e.g. "view ko-fi".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: (rule) => rule.required().uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      options: {
        list: [
          {title: 'Nexus Mods', value: 'nexus'},
          {title: 'Ko-fi', value: 'kofi'},
          {title: 'Twitter / X', value: 'twitter'},
          {title: 'Upload my own', value: 'custom'},
        ],
        layout: 'radio',
      },
      initialValue: 'nexus',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'customIcon',
      title: 'Custom icon',
      type: 'image',
      description: 'A square PNG or SVG. Only used when "Upload my own" is selected.',
      hidden: ({parent}) => parent?.icon !== 'custom',
    }),
  ],
  preview: {
    select: {title: 'label', subtitle: 'url'},
  },
})
