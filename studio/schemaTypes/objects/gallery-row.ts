import {defineArrayMember, defineField, defineType} from 'sanity'
import {ThLargeIcon} from '@sanity/icons/ThLarge'

export const galleryRow = defineType({
  name: 'galleryRow',
  title: 'Row',
  type: 'object',
  icon: ThLargeIcon,
  fields: [
    defineField({
      name: 'columns',
      title: 'Layout',
      type: 'number',
      options: {
        list: [
          {title: '3 columns', value: 3},
          {title: '2 columns', value: 2},
          {title: '1 column', value: 1},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'cards',
      title: 'Cards',
      type: 'array',
      of: [defineArrayMember({type: 'galleryCard'})],
      validation: (rule) =>
        rule.min(1).custom((cards, context) => {
          const columns = (context.parent as {columns?: number} | undefined)?.columns
          if (columns && Array.isArray(cards) && cards.length > columns) {
            return `This row fits ${columns} card${columns === 1 ? '' : 's'} — remove ${cards.length - columns} or pick a wider layout.`
          }
          return true
        }),
    }),
  ],
  preview: {
    select: {columns: 'columns', cards: 'cards', media: 'cards.0.image'},
    prepare({columns, cards, media}) {
      const count = Array.isArray(cards) ? cards.length : 0
      return {
        title: `${columns ?? '?'}-column row`,
        subtitle: `${count} card${count === 1 ? '' : 's'}`,
        media,
      }
    },
  },
})
