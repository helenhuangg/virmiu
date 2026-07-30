import {defineArrayMember, defineField, defineType} from 'sanity'
import {HomeIcon} from '@sanity/icons/Home'

export const homePage = defineType({
  name: 'homePage',
  title: 'Home page',
  type: 'document',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'taglineLines',
      title: 'Tagline',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      description:
        'The draggable pink labels around the logo. The layout is designed for three, so keep it to three short fragments.',
      validation: (rule) => rule.min(1).max(3),
    }),
  ],
  preview: {
    select: {lines: 'taglineLines'},
    prepare({lines}) {
      return {
        title: 'Home page',
        subtitle: Array.isArray(lines) ? lines.join(' ') : undefined,
      }
    },
  },
})
