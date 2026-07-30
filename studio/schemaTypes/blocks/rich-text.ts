import {defineArrayMember, defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons/Link'
import {HighlightDecorator, PinkDecorator} from './decorators'

/**
 * Every paragraph becomes one line of copy on the site. The decorators map to the
 * existing CSS classes, so styling stays in style.css and cannot be broken from the Studio.
 */
export const richText = defineType({
  name: 'richText',
  title: 'Text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [{title: 'Paragraph', value: 'normal'}],
      lists: [],
      marks: {
        decorators: [
          {title: 'Bold', value: 'strong'},
          {title: 'Italic', value: 'em'},
          {
            title: 'Pink highlight',
            value: 'highlight',
            component: HighlightDecorator,
          },
          {
            title: 'Pink text',
            value: 'pink',
            component: PinkDecorator,
          },
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            title: 'Link',
            type: 'object',
            icon: LinkIcon,
            fields: [
              defineField({
                name: 'href',
                title: 'URL',
                type: 'url',
                validation: (rule) =>
                  rule
                    .required()
                    .uri({scheme: ['http', 'https', 'mailto']})
                    .error('Must be a full link, e.g. https://ko-fi.com/fuanrei'),
              }),
            ],
          }),
        ],
      },
    }),
  ],
})
