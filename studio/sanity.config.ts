import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {singletonTypes, structure} from './structure'

export default defineConfig({
  name: 'default',
  title: 'virmiu',
  projectId: 'eyangq6p',
  dataset: 'production',
  plugins: [structureTool({structure}), visionTool()],
  schema: {
    types: schemaTypes,
  },
  document: {
    // Singletons only, so nothing can be created, deleted or duplicated by hand.
    newDocumentOptions: () => [],
    actions: (actions, {schemaType}) =>
      singletonTypes.has(schemaType)
        ? actions.filter(
            ({action}) => !action || !['unpublish', 'delete', 'duplicate'].includes(action),
          )
        : actions,
  },
})
