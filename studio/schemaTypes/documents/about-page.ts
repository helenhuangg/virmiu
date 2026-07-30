import {defineArrayMember, defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons/User'

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About page',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Page heading',
      type: 'string',
      initialValue: 'ABOUT ME',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'rows',
      title: 'Sections',
      type: 'array',
      of: [defineArrayMember({type: 'aboutRow'})],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: 'postscript',
      title: 'P.S. line',
      type: 'richText',
      description: 'The centred line under the dashed rule.',
    }),
  ],
  preview: {
    prepare() {
      return {title: 'About page'}
    },
  },
})
