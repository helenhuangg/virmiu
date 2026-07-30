import {defineField, defineType} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'

export const aboutRow = defineType({
  name: 'aboutRow',
  title: 'Section',
  type: 'object',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'label',
      title: 'Heading',
      type: 'string',
      description: 'The handwritten heading on the left, e.g. "what i do".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Text',
      type: 'richText',
      description: 'Each paragraph becomes its own line on the right.',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {title: 'label'},
  },
})
