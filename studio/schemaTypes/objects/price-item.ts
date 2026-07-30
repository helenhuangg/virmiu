import {defineField, defineType} from 'sanity'
import {TagIcon} from '@sanity/icons/Tag'

export const priceItem = defineType({
  name: 'priceItem',
  title: 'Price',
  type: 'object',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'What it is',
      type: 'string',
      description: 'Shown highlighted, e.g. "mini mod pack".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'string',
      description: 'Free text so ranges work too, e.g. "$20", "~$70-$120", "$5+".',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'richText',
      description: 'The line underneath the price, e.g. "fixing hue on clothes & hair files".',
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'price'},
  },
})
