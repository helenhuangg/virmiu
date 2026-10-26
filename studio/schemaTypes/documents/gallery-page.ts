import {defineArrayMember, defineField, defineType} from 'sanity'
import {ImagesIcon} from '@sanity/icons/Images'

/** Each category is its own filter tab with its own layout. Tab order on the site follows this list, so the gallery opens on the first one. Keep in sync with GALLERY_CATEGORIES in sanity-content.js. */
export const galleryCategories = [
  {name: 'remesh', title: 'Remesh'},
  {name: 'retexture', title: 'Retexture'},
  {name: 'customAccessory', title: 'Custom Accessory'},
  {name: 'misc', title: 'Misc.'},
]

export const galleryPage = defineType({
  name: 'galleryPage',
  title: 'Gallery page',
  type: 'document',
  icon: ImagesIcon,
  groups: galleryCategories.map(({name, title}, index) => ({name, title, default: index === 0})),
  fields: galleryCategories.map(({name, title}) =>
    defineField({
      name,
      title: `${title} rows`,
      type: 'array',
      group: name,
      description: `What the "${title}" tab shows. Each row is 3, 2 or 1 columns wide; drag rows to reorder.`,
      of: [defineArrayMember({type: 'galleryRow'})],
    }),
  ),
  preview: {
    prepare() {
      return {title: 'Gallery page'}
    },
  },
})
