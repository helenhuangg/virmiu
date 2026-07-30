import {defineArrayMember, defineField, defineType} from 'sanity'
import {CogIcon} from '@sanity/icons/Cog'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'array',
      description: 'The icon row shown on the home page and the about page.',
      of: [defineArrayMember({type: 'socialLink'})],
    }),
    defineField({
      name: 'footerCredit',
      title: 'Footer credit',
      type: 'object',
      options: {collapsible: true, collapsed: true},
      fields: [
        defineField({
          name: 'text',
          title: 'Text',
          type: 'string',
          initialValue: 'designed & coded by',
        }),
        defineField({name: 'name', title: 'Name', type: 'string'}),
        defineField({
          name: 'url',
          title: 'Link',
          type: 'url',
          validation: (rule) => rule.uri({scheme: ['http', 'https']}),
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Site settings'}
    },
  },
})
