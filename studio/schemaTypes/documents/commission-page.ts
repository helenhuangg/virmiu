import {defineArrayMember, defineField, defineType} from 'sanity'
import {TagIcon} from '@sanity/icons/Tag'

export const commissionPage = defineType({
  name: 'commissionPage',
  title: 'Commission page',
  type: 'document',
  icon: TagIcon,
  groups: [
    {name: 'status', title: 'Status', default: true},
    {name: 'pricing', title: 'Pricing'},
    {name: 'payment', title: 'Payment'},
  ],
  fields: [
    defineField({
      name: 'status',
      title: 'Commission status',
      type: 'string',
      group: 'status',
      options: {
        list: [
          {title: 'Open', value: 'open'},
          {title: 'Limited slots', value: 'limited'},
          {title: 'Closed', value: 'closed'},
        ],
        layout: 'radio',
      },
      initialValue: 'open',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'statusNote',
      title: 'Extra note',
      type: 'string',
      group: 'status',
      description: 'Optional. Added after the status, e.g. "2 slots left" or "back in august".',
    }),
    defineField({
      name: 'queueLabel',
      title: 'Queue link text',
      type: 'string',
      group: 'status',
      description: 'Shown under the status. Leave empty to hide the link.',
      initialValue: 'view commission queue',
    }),
    defineField({
      name: 'queueUrl',
      title: 'Queue link',
      type: 'url',
      group: 'status',
      description: 'Google Sheet (or any URL) for the current commission queue.',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'pricingTitle',
      title: 'Section heading',
      type: 'string',
      group: 'pricing',
      initialValue: 'Pricing',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'pricing',
      title: 'Prices',
      type: 'array',
      group: 'pricing',
      of: [defineArrayMember({type: 'priceItem'})],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: 'pricingFootnote',
      title: 'Small print',
      type: 'string',
      group: 'pricing',
      description: 'The little italic line under the prices.',
    }),
    defineField({
      name: 'paymentTitle',
      title: 'Section heading',
      type: 'string',
      group: 'payment',
      initialValue: 'Payment',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'paymentTerms',
      title: 'Terms',
      type: 'richText',
      group: 'payment',
      description: 'Each paragraph becomes one line in the payment list.',
    }),
  ],
  preview: {
    select: {status: 'status'},
    prepare({status}) {
      return {title: 'Commission page', subtitle: `Status: ${status ?? 'not set'}`}
    },
  },
})
